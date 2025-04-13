import { translations } from '@shared/i18n/translations';

export type Language = 'en' | 'hi';
export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: Language): string => {
  try {
    return translations[language][key];
  } catch (error) {
    console.error(`Translation missing for key: ${key} in language ${language}`);
    return translations.en[key] || key;
  }
};
