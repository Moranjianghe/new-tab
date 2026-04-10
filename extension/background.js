const chromeApi = typeof chrome !== 'undefined' ? chrome : null;
const browserApi = typeof browser !== 'undefined' ? browser : null;
const runtimeApi = chromeApi?.runtime || browserApi?.runtime;
const tabsApi = chromeApi?.tabs || browserApi?.tabs;

const isFirefoxApi = Boolean(runtimeApi?.getURL && runtimeApi.getURL('').startsWith('moz-extension://'));

const FIREFOX_INTERNAL_URL_CANDIDATES = {
  'chrome://history/': ['__EXT__/firefox/history.html'],
  'chrome://bookmarks/': ['__EXT__/firefox/bookmarks.html'],
  'chrome://downloads/': ['about:downloads'],
  'chrome://settings/': ['about:preferences'],
  'chrome://extensions/': ['about:addons'],
};

const normalizeChromeInternalKey = (url) => {
  const key = String(url).trim().toLowerCase();
  return key.endsWith('/') ? key : `${key}/`;
};

const getFirefoxCandidateUrls = (rawUrl) => {
  const url = String(rawUrl || '').trim();
  if (!url) return [];
  if (!url.toLowerCase().startsWith('chrome://')) return [url];

  const key = normalizeChromeInternalKey(url);
  const mapped = FIREFOX_INTERNAL_URL_CANDIDATES[key];
  if (!Array.isArray(mapped) || mapped.length === 0) return [url];

  return mapped.map((item) => {
    if (item.startsWith('__EXT__/')) {
      return runtimeApi.getURL(item.slice(8));
    }
    return item;
  });
};

runtimeApi.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.action !== 'openUrl' || typeof message.url !== 'string') {
    return false;
  }

  if (isFirefoxApi) {
    const candidates = getFirefoxCandidateUrls(message.url);
    const tryOpenCandidate = (index) => {
      if (index >= candidates.length) {
        return Promise.resolve({ success: false, error: 'All Firefox URL candidates failed to open' });
      }

      return tabsApi
        .create({ url: candidates[index] })
        .then(() => ({ success: true }))
        .catch(() => tryOpenCandidate(index + 1));
    };

    return tryOpenCandidate(0);
  }

  tabsApi.create({ url: message.url }, () => {
    const lastError = chromeApi?.runtime?.lastError;
    if (lastError) {
      sendResponse({ success: false, error: lastError.message });
      return;
    }

    sendResponse({ success: true });
  });

  return true;
});
