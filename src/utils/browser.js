const FIREFOX_INTERNAL_URL_MAP = {
  'chrome://history/': 'about:history',
  'chrome://bookmarks/': 'about:bookmarks',
  'chrome://downloads/': 'about:downloads',
  'chrome://settings/': 'about:preferences',
};

const isFirefox = () => typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

const normalizeBrowserInternalUrl = (url) => {
  if (!isFirefox()) return url;

  const key = url.toLowerCase();
  return FIREFOX_INTERNAL_URL_MAP[key] || url;
};

const isPrivilegedUrl = (url) => url.startsWith('chrome://') || url.startsWith('about:');

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

  const normalizedUrl = normalizeBrowserInternalUrl(rawUrl.trim());
  if (!normalizedUrl) return;

  if (!isPrivilegedUrl(normalizedUrl)) {
    openWithWindow(normalizedUrl);
    return;
  }

  try {
    await sendOpenMessage(normalizedUrl);
  } catch (error) {
    console.warn('Falling back to window.open for privileged URL:', error);
    openWithWindow(normalizedUrl);
  }
};
