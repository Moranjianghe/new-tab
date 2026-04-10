const isFirefoxApi = typeof browser !== 'undefined';
const runtimeApi = isFirefoxApi ? browser.runtime : chrome.runtime;
const tabsApi = isFirefoxApi ? browser.tabs : chrome.tabs;

runtimeApi.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.action !== 'openUrl' || typeof message.url !== 'string') {
    return false;
  }

  if (isFirefoxApi) {
    return tabsApi
      .create({ url: message.url })
      .then(() => ({ success: true }))
      .catch((error) => ({ success: false, error: error?.message || String(error) }));
  }

  tabsApi.create({ url: message.url }, () => {
    const lastError = chrome.runtime.lastError;
    if (lastError) {
      sendResponse({ success: false, error: lastError.message });
      return;
    }

    sendResponse({ success: true });
  });

  return true;
});
