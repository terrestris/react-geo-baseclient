import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import XHR from 'i18next-xhr-backend';
import config from './config/config';

const env = process.env.NODE_ENV;

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: config.locale
    },
    fallbackLng: 'de',
    debug: env === 'development' ? true : false,

    interpolation: {
      escapeValue: false // not needed for react!!
    },

    // react i18next special options (optional)
    react: {
      wait: false, // set to true if you like to wait for loaded in every translated hoc
      nsMode: 'fallback' // set it to fallback to let passed namespaces to translated hoc act as fallbacks
    },

    whitelist: ['de', 'en']
  });

export default i18n;
