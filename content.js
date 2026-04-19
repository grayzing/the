function populate_block() {
  // Avoid adding duplicate overlays
  if (document.getElementById("stealth-mission-overlay")) return;

  // Create the overlay element
  const overlay = document.createElement("div");
  overlay.id = "stealth-mission-overlay";
  overlay.innerHTML = `
    <div id="stealth-mission-card">
      <div id="stealth-mission-title">MISSION COMPROMISED</div>
      <div id="stealth-mission-subtitle">This tab is not part of your current objective.</div>
    </div>
  `;

  // Add styles for the overlay
  const style = document.createElement("style");
  style.textContent = `
    #stealth-mission-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 14, 18, 0.72);
      backdrop-filter: blur(4px);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    }

    #stealth-mission-card {
      width: min(420px, 90vw);
      background: #11161b;
      color: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.45);
      border: 1px solid rgba(255,255,255,0.08);
      text-align: center;
    }

    #stealth-mission-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ff6b6b;
      margin-bottom: 12px;
    }

    #stealth-mission-subtitle {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    #stealth-mission-body {
      font-size: 14px;
      opacity: 0.86;
    }
  `;

  document.documentElement.appendChild(style);
  document.documentElement.appendChild(overlay);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "populate_block") {
    populate_block();
  }
});