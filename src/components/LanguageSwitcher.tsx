import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState<string>(localStorage.getItem('bf_lang') || i18n.language || 'es');

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bf_lang', lang);
  }, [lang, i18n]);

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="language-label">
        🌐
      </label>
      <select
        id="language-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t('language.select_language', 'Select language')}
        title={t('language.select_language', 'Select language')}
        className="language-select"
      >
        <option value="es">{t('language.spanish', 'Español')}</option>
        <option value="en">{t('language.english', 'English')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
