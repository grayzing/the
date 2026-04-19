const timerDisplay = document.getElementById("timerDisplay");
const blockedCount = document.getElementById("blockedCount");
const missionTitle = document.getElementById("missionTitle");
const missionTopics = document.getElementById("missionTopics");
const newObjectiveBtn = document.getElementById("newObjectiveBtn");

function formatCountdown(seconds) {
  if (seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const padded = (n) => String(n).padStart(2, "0");
  return hrs > 0
    ? `${hrs}:${padded(mins)}:${padded(secs)}`
    : `${padded(mins)}:${padded(secs)}`;
}

function displayMission(mission) {
  missionTitle.textContent = mission.objective || "Unknown mission";
  missionTopics.textContent = `Intel: ${(mission.topics || []).join(", ") || "No topics set"}`;
  blockedCount.textContent = mission.distractions_blocked != null ? mission.distractions_blocked : "0";

  function updateTimer() {
    const now = Math.floor(Date.now() / 1000);
    const remaining = mission.minutes - now;
    timerDisplay.textContent = formatCountdown(remaining);
    if (remaining <= 0) {
      clearInterval(intervalId);
      document.body.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #e6f9ef; font-family: 'Istok Web', sans-serif;">
          <h1 style="font-family: 'Intel One Mono', monospace; font-size: 32px; color: #4CAF50; margin-bottom: 20px;">MISSION ACCOMPLISHED!</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">Congratulations, Agent! You have successfully completed your focus mission.</p>
          <button id="newMissionBtn" style="padding: 14px 28px; background: #4CAF50; border: none; border-radius: 8px; color: white; font-size: 16px; cursor: pointer;">Start New Mission</button>
        </div>
      `;
      document.getElementById("newMissionBtn").addEventListener("click", () => {
        chrome.storage.local.remove(["mission", "objectives"], () => {
          window.location.href = "popup.html";
        });
      });
    }
  }

  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);
}

chrome.storage.local.get(["mission"], (result) => {
  if (result && result.mission) {
    displayMission(result.mission);
  } else {
    missionTitle.textContent = "No active mission";
    missionTopics.textContent = "Start a new mission from the popup.";
    timerDisplay.textContent = "00:00";
    blockedCount.textContent = "0";
  }
});

newObjectiveBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});
