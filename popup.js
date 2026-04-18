const objectiveEl = document.getElementById("objective");
const topicsEl = document.getElementById("topics");
const minutesEl = document.getElementById("minutes");
const statusEl = document.getElementById("status");

async function loadMission() {
  const data = await chrome.storage.local.get("mission");
  const mission = data.mission;

  if (!mission) return;

  objectiveEl.value = mission.objective || "";
  topicsEl.value = (mission.topics || []).join(", ");
  minutesEl.value = mission.minutes || "";
}

document.getElementById("saveBtn").addEventListener("click", async () => {
  const mission = {
    objective: objectiveEl.value.trim(),
    topics: topicsEl.value
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean),
    minutes: Number(minutesEl.value || 0),
    active: true
  };

  await chrome.storage.local.set({ mission });
  statusEl.textContent = "Mission saved.";
});

loadMission();