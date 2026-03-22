function removeOrRestorePlaylist() {
  chrome.storage.sync.get("playlistEnabled", (data) => {
    const enabled = data.playlistEnabled ?? true; // default ON
    const url = new URL(window.location.href);

    if (!enabled) {
      // Toggle OFF → remove auto playlist if it's RD or WL
      if (url.searchParams.has("list")) {
        const listId = url.searchParams.get("list");
        if (listId.startsWith("RD") || listId.startsWith("WL")) {
          // Save the removed playlist to restore later
          chrome.storage.local.set({ lastRemovedList: listId });
          url.searchParams.delete("list");
          window.location.href = url.toString();
        }
      }
    } else {
      // Toggle ON → restore last removed playlist
      chrome.storage.local.get("lastRemovedList", (info) => {
        const lastList = info.lastRemovedList;
        if (lastList && !url.searchParams.has("list")) {
          url.searchParams.set("list", lastList);
          window.location.href = url.toString();
        }
      });
    }
  });
}

// Run once
removeOrRestorePlaylist();

// Watch for SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    removeOrRestorePlaylist();
  }
}).observe(document, { subtree: true, childList: true });