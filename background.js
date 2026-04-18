let lastGoodTabId = null;

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

// Core logic to classify tabs and redirect if necessary

async function handleTab(tab) {
  if (!tab || !tab.url) return;

  const { mission } = await chrome.storage.local.get("mission");
  if (!mission?.active) return;

  const result = classifyTab(tab, mission);

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

function classifyTab(tab, mission) {
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

  return "UNCERTAIN";
}

// Redirect the user to a good site if they are on a bad one

async function showBlockedOverlay(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Failed to inject overlay:", err);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}