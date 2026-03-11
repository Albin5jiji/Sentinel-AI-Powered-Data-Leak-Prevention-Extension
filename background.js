let stats = {
  detections: 0,
  blocked: 0
};

// Initialize stats when extension installs
chrome.runtime.onInstalled.addListener(() => {

  chrome.storage.local.get(["stats"], (data) => {

    if (data.stats) {
      stats = data.stats;
    } else {
      chrome.storage.local.set({
        stats: { detections: 0, blocked: 0 }
      });
    }

  });

});


// Listen for detection messages
chrome.runtime.onMessage.addListener((msg) => {

  if (msg.type === "sensitiveDetected") {

    stats.detections++;

    if (msg.probability > 80) {
      stats.blocked++;
    }

    chrome.storage.local.set({ stats });

  }

});