import { createI18n } from 'vue-i18n';
import zhTW from './locales/zh-TW';
import enUS from './locales/en-US';

export default createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': zhTW,
    'en-US': enUS
  }
});
