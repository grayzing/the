import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemma-4-26b-a4b-it"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    tools = [
        types.Tool(googleSearch=types.GoogleSearch(
        )),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="MINIMAL",
        ),
        tools=tools,
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if text := chunk.text:
            print(text, end="")

if __name__ == "__main__":
    generate()




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


