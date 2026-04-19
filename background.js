let lastGoodTabId = null;
const SESSION_ALARM = "session-stopwatch";
const SESSION_COMPLETE_FILE = "sessionComplete.js";

// Basic lists of good and bad sites - can be expanded or made more sophisticated
const BAD_SITES = [
  "tiktok.com",
  "instagram.com",
  "netflix.com",
  "x.com",
  "twitter.com"
];

const GOOD_SITES = [
  "docs.google.com",
  "notion.so",
  "canvas",
  "leetcode.com",
  "wikipedia.org",
  "coursera.org",
  "khanacademy.org"
];

// Listen for tab activation and updates to classify the current tab

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  await handleTab(tab);
});

// Also check when a tab is updated (e.g. URL changes)

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    await handleTab(tab);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await restoreSessionAlarm();
});

chrome.runtime.onInstalled.addListener(async () => {
  await restoreSessionAlarm();
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== SESSION_ALARM) return;
  await syncSessionTimer();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "MISSION_STARTED") return;

  initializeSession()
    .then(() => sendResponse({ ok: true }))
    .catch(err => {
      console.error("Failed to initialize mission session:", err);
      sendResponse({ ok: false });
    });

  return true;
});

// Core logic to classify tabs and redirect if necessary

async function handleTab(tab) {
  if (!tab || !tab.url) return;

  const { mission } = await chrome.storage.local.get("mission");
  if (!mission?.active) return;

  const result = await classifyTab(tab, mission);
  await syncSessionTimer(result);

  if (result === "GOOD") {
    lastGoodTabId = tab.id;
    console.log("Good tab:", tab.url);
    return;
  }

  if (result === "BAD") {
    console.log("Bad tab detected:", tab.url);
    await redirectToGoodTab(tab.id);
    await delay(1500); // Wait for the redirect to complete
    await redirectToGoodTab(tab.id); // Ensure we end up on a good tab
    return;
  }

  console.log("Uncertain tab:", tab.url);
}

// Classify a tab based on its URL and title against the mission criteria

async function classifyTab(tab, mission) {
  const url = (tab.url || "").toLowerCase();
  const title = (tab.title || "").toLowerCase();

  if (BAD_SITES.some(site => url.includes(site))) {
    return "BAD";
  }

  if (GOOD_SITES.some(site => url.includes(site))) {
    return "GOOD";
  }

  if ((mission.topics || []).some(topic => url.includes(topic) || title.includes(topic))) {
    return "GOOD";
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: tab.url || "",
        title: tab.title || "",
        objective: mission.objective || "",
        topics: mission.topics || []
      })
    });

    if (!response.ok) {
      throw new Error(`Flask classifier returned ${response.status}`);
    }

    const data = await response.json();
    return data.classification || "UNCERTAIN";
  } catch (err) {
    console.error("Flask classification failed:", err);
    return "UNCERTAIN";
  }
// Function to convert PNG file to UTF-8 base64
function convertPngToBase64(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error('Error converting PNG to base64:', error);
        return null;
    }
}

async function determine_relevance(screenshot_url, objective) {
  const data = {
    screenshot: screenshot_url,
    objective: objective
  };

  try {
    const response = await fetch('http://127.0.0.1:5000/check_relevance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log('Response:', result["relevance"]);
    return result["relevance"];
  } catch (error) {
    console.error('Error:', error);
  }
}

// Listener for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isGood = GOOD_SITES.some(site => tab.url.includes(site));
    if (!isGood) {
      console.log("bad");
      return;
    }

    try {
      const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      // Extract base64 string from data URL (remove "data:image/png;base64," prefix)
      console.log("Determining relevance...")
      const base64String = screenshot.split(',')[1];
      await determine_relevance(base64String, 'calculus');
      
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }
});


  await chrome.tabs.update(currentTabId, {
    url: "https://docs.google.com"
  });
}

async function initializeSession() {
  await chrome.alarms.clear(SESSION_ALARM);
  chrome.alarms.create(SESSION_ALARM, { periodInMinutes: 1 });
  await syncSessionTimer(null, true);
}

async function syncSessionTimer(classification = null, resetClock = false) {
  const { mission, session } = await chrome.storage.local.get(["mission", "session"]);
  if (!mission?.active || !session || session.completed) {
    await chrome.alarms.clear(SESSION_ALARM);
    return;
  }

  const now = Date.now();
  let elapsedMs = Number(session.elapsedMs || 0);
  const lastTickAt = Number(session.lastTickAt || now);
  const wasOnGoodTab = Boolean(session.isOnGoodTab);

  if (!resetClock && wasOnGoodTab) {
    elapsedMs += Math.max(0, now - lastTickAt);
  }

  const currentClassification = classification ?? await classifyActiveTab(mission);
  const nextSession = {
    ...session,
    elapsedMs,
    isOnGoodTab: currentClassification === "GOOD",
    lastTickAt: now
  };

  const targetMs = Number(session.targetMs || mission.minutes * 60 * 1000 || 0);
  if (targetMs > 0 && elapsedMs >= targetMs) {
    nextSession.elapsedMs = targetMs;
    nextSession.isOnGoodTab = false;
    nextSession.completed = true;
    await chrome.storage.local.set({
      mission: { ...mission, active: false },
      session: nextSession
    });
    await chrome.alarms.clear(SESSION_ALARM);
    await showSessionCompletePopup();
    return;
  }

  await chrome.storage.local.set({ session: nextSession });
}

async function classifyActiveTab(mission) {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [tab] = tabs;
  if (!tab?.url) return "UNCERTAIN";
  return classifyTab(tab, mission);
}

async function showSessionCompletePopup() {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const [tab] = tabs;
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [SESSION_COMPLETE_FILE]
    });
  } catch (err) {
    console.error(`Failed to inject ${SESSION_COMPLETE_FILE}:`, err);
  }
}

async function restoreSessionAlarm() {
  const { mission, session } = await chrome.storage.local.get(["mission", "session"]);
  if (!mission?.active || !session || session.completed) {
    await chrome.alarms.clear(SESSION_ALARM);
    return;
  }

  chrome.alarms.create(SESSION_ALARM, { periodInMinutes: 1 });
}
