import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';

const normalizeLocale = (value) => {
  const locale = String(value || '').toLowerCase();

  if (locale.startsWith('zh-tw') || locale.startsWith('zh-hk') || locale.startsWith('zh-mo')) {
    return 'zh-TW';
  }
  if (locale.startsWith('zh')) {
    return 'zh-CN';
  }
  if (locale.startsWith('en')) {
    return 'en-US';
  }

  return 'zh-CN';
};

const initialLocale = normalizeLocale(typeof navigator !== 'undefined' ? navigator.language : 'zh-CN');

export default createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
  },
});
