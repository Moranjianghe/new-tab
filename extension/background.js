chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openUrl') {
    chrome.tabs.create({ url: message.url });
    sendResponse({ success: true });
  }
  return true;
});