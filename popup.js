// Get toggle element
const toggle = document.getElementById("playlistToggle");

// Load saved state
chrome.storage.sync.get("playlistEnabled", (data) => {
  toggle.checked = data.playlistEnabled ?? true; // default ON
});

// Save state when toggled
toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ playlistEnabled: toggle.checked });
});


