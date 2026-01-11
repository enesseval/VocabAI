import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import tr from './tr.json';
import en from './en.json';
import de from './de.json'; // <--- EKLENDİ

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'tr';

i18n.use(initReactI18next).init({
    resources: {
        tr: { translation: tr },
        en: { translation: en },
        de: { translation: de }, // <--- EKLENDİ
    },
    lng: deviceLanguage,
    fallbackLng: 'tr',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;