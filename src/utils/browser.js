const FIREFOX_INTERNAL_URL_CANDIDATES = {
  'chrome://history/': ['__EXT__/firefox/history.html'],
  'chrome://bookmarks/': ['__EXT__/firefox/bookmarks.html'],
  'chrome://downloads/': ['about:downloads'],
  'chrome://settings/': ['about:preferences'],
  'chrome://extensions/': ['about:addons'],
};

const isFirefox = () => typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

const normalizeChromeInternalKey = (url) => {
  const key = String(url).trim().toLowerCase();
  return key.endsWith('/') ? key : `${key}/`;
};

const getCandidateUrls = (url) => {
  const trimmed = String(url).trim();
  if (!trimmed) return [];

  if (!isFirefox()) return [trimmed];
  if (!trimmed.toLowerCase().startsWith('chrome://')) return [trimmed];

  const key = normalizeChromeInternalKey(trimmed);
  const mapped = FIREFOX_INTERNAL_URL_CANDIDATES[key];
  if (!Array.isArray(mapped) || mapped.length === 0) return [trimmed];

  const runtimeApi = typeof browser !== 'undefined' ? browser.runtime : typeof chrome !== 'undefined' ? chrome.runtime : null;
  return mapped.map((item) => {
    if (item.startsWith('__EXT__/')) {
      return runtimeApi?.getURL ? runtimeApi.getURL(item.slice(8)) : item.slice(8);
    }
    return item;
  });
};

const isPrivilegedUrl = (url) => url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('moz-extension://');

const openWithWindow = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const sendOpenMessage = async (url) => {
  if (typeof browser !== 'undefined' && browser.runtime?.sendMessage) {
    const response = await browser.runtime.sendMessage({ action: 'openUrl', url });
    if (response?.success === false) {
      throw new Error(response.error || 'Failed to open url');
    }
    return;
  }

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'openUrl', url }, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }

        if (response?.success === false) {
          reject(new Error(response.error || 'Failed to open url'));
          return;
        }

        resolve(response);
      });
    });
    return;
  }

  throw new Error('Extension runtime API is unavailable');
};

export const openBookmarkTarget = async (rawUrl) => {
  if (typeof rawUrl !== 'string') return;

  const candidates = getCandidateUrls(rawUrl);
  if (candidates.length === 0) return;

  if (!isPrivilegedUrl(candidates[0])) {
    openWithWindow(candidates[0]);
    return;
  }

  for (const candidate of candidates) {
    try {
      await sendOpenMessage(candidate);
      return;
    } catch (error) {
      console.warn('Failed to open privileged URL candidate:', candidate, error);
    }
  }

  const fallback = candidates[candidates.length - 1];
  if (fallback.startsWith('http://') || fallback.startsWith('https://')) {
    openWithWindow(fallback);
  }
};
