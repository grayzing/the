let lastGoodTabId = null;

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

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  await handleTab(tab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    await handleTab(tab);
  }
});

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
    return;
  }

  console.log("Uncertain tab:", tab.url);
}

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

async function redirectToGoodTab(currentTabId) {
  if (lastGoodTabId && lastGoodTabId !== currentTabId) {
    try {
      await chrome.tabs.update(lastGoodTabId, { active: true });
      return;
    } catch (err) {
      console.log("Could not switch to last good tab:", err);
    }
  }

  await chrome.tabs.update(currentTabId, {
    url: "https://docs.google.com"
  });
}