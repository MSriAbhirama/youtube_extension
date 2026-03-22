function removeOrRestorePlaylist() {
  chrome.storage.sync.get("playlistEnabled", (data) => {
    const enabled = data.playlistEnabled ?? true;
    const url = new URL(window.location.href);
    const listId = url.searchParams.get("list");
    const videoId = url.searchParams.get("v");

    if (!enabled) {
      // Toggle OFF → remove auto playlist if RD/WL
      if (listId && (listId.startsWith("RD") || listId.startsWith("WL"))) {
        chrome.storage.local.set({ lastRemovedList: listId, lastVideoId: videoId });
        url.searchParams.delete("list");
        window.location.href = url.toString(); // reload to remove playlist
      }
    } else {
      // Toggle ON → restore last removed playlist + video
      chrome.storage.local.get(["lastRemovedList", "lastVideoId"], (info) => {
        const lastList = info.lastRemovedList;
        const lastVideo = info.lastVideoId;

        if (lastList && lastVideo && (!listId || !videoId)) {
          url.searchParams.set("list", lastList);
          url.searchParams.set("v", lastVideo);
          window.location.href = url.toString(); // reload to restore playlist
        }
      });
    }
  });
}

// Run on page load
removeOrRestorePlaylist();