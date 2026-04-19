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
    const data = await chrome.storage.local.get("mission");
    if (!data.mission) return;
    try {
      const objective = data.mission.objective;
      const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      // Extract base64 string from data URL (remove "data:image/png;base64," prefix)
      console.log("Determining relevance...")
      const base64String = screenshot.split(',')[1];
      await determine_relevance(base64String, objective)
        .then((result) => {
          if (result === "true") {
            console.log("Looks good")
          } else if (result === "false") {
            const mission = data.mission;
            const distractions_blocked_o = mission.distractions_blocked + 1;
            chrome.storage.local.set({ mission: { ...mission, distractions_blocked: distractions_blocked_o } });
            chrome.tabs.sendMessage(tabId, { action: "populate_block" });
          } else if (result === "mismatch") {
            // ?
          }
        })

    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }
});


