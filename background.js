// background.js

function updateIcon(enabled) {
  const path = enabled ? {
    16: "icons/icon16-on.png",
    48: "icons/icon48-on.png",
    128: "icons/icon128-on.png"
  } : {
    16: "icons/icon16-off.png",
    48: "icons/icon48-off.png",
    128: "icons/icon128-off.png"
  };
  chrome.action.setIcon({ path });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ sdd_enabled: true });
  updateIcon(true);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'getEnabled') {
    chrome.storage.local.get(['sdd_enabled'], (res) => {
      sendResponse({ enabled: !!res.sdd_enabled });
    });
    return true;
  }

  if (message && message.type === 'setEnabled') {
    chrome.storage.local.set({ sdd_enabled: !!message.enabled }, () => {
      updateIcon(message.enabled);
      sendResponse({ success: true });
    });
    return true;
  }
});
