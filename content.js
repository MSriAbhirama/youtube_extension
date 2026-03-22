function removeOrRestorePlaylist() {
  chrome.storage.sync.get("playlistEnabled", (data) => {
    const enabled = data.playlistEnabled ?? true; // default ON
    const url = new URL(window.location.href);
    const listId = url.searchParams.get("list");
    const videoId = url.searchParams.get("v");

    if (!enabled) {
      // Toggle OFF → remove auto playlist if it's RD or WL
      if (listId && (listId.startsWith("RD") || listId.startsWith("WL"))) {
        // Save both playlist ID and current video ID
        chrome.storage.local.set({ lastRemovedList: listId, lastVideoId: videoId });
        // Remove playlist without reloading page
        url.searchParams.delete("list");
        history.replaceState(null, "", url.toString());
      }
    } else {
      // Toggle ON → restore last removed playlist and video
      chrome.storage.local.get(["lastRemovedList", "lastVideoId"], (info) => {
        const lastList = info.lastRemovedList;
        const lastVideo = info.lastVideoId;

        // Only restore if the URL doesn't already have a playlist
        if (lastList && lastVideo && !listId) {
          url.searchParams.set("list", lastList);
          url.searchParams.set("v", lastVideo);
          window.location.href = url.toString(); // reload once to resume playlist
        }
      });
    }
  });
}

// Run once on page load
removeOrRestorePlaylist();

// Observe SPA navigation (YouTube single-page app)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    removeOrRestorePlaylist();
  }
}).observe(document, { subtree: true, childList: true });