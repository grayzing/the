const objectiveEl = document.getElementById("objective");
const topicsEl = document.getElementById("topics");
const minutesEl = document.getElementById("minutes");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");

function updateSaveButton() {
  const filled =
    objectiveEl.value.trim() !== "" &&
    topicsEl.value.trim() !== "" &&
    minutesEl.value.trim() !== "";
  saveBtn.disabled = !filled;
}

objectiveEl.addEventListener("input", updateSaveButton);
topicsEl.addEventListener("input", updateSaveButton);
minutesEl.addEventListener("input", updateSaveButton);

async function loadMission() {
  const data = await chrome.storage.local.get("mission");
  const mission = data.mission;

  if (!mission) {
    objectiveEl.value = "";
    topicsEl.value = "";
    minutesEl.value = "";
    updateSaveButton();
    return;
  }

  objectiveEl.value = mission.objective || "";
  topicsEl.value = (mission.topics || []).join(", ");
  minutesEl.value = mission.minutes || "";
  updateSaveButton();
}

saveBtn.addEventListener("click", async () => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const durationSeconds = Number(minutesEl.value || 0) * 60;

  const mission = {
    objective: objectiveEl.value.trim(),
    topics: topicsEl.value
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean),
    minutes: nowSeconds + durationSeconds,
    distractions_blocked: Number(0),
    active: true
  };

  await chrome.storage.local.set({ mission, objectives: [mission] });
  statusEl.textContent = "Objective saved.";
  window.location.href = "main_dash.html";
});

loadMission();