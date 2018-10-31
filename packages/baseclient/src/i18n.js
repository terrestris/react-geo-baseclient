import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import XHR from 'i18next-xhr-backend';
import config from './config/config';

i18n
  .use(LanguageDetector)
  .use(XHR)
  .use(reactI18nextModule)
  .init({
    backend: {
      loadPath: config.locale
    },
    fallbackLng: 'de',
    debug: true,

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
