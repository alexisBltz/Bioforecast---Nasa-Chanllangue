import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<string>(localStorage.getItem('bf_lang') || i18n.language || 'es');

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bf_lang', lang);
  }, [lang, i18n]);

  return (
    <div className="language-switcher">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Select language"
        title="Select language"
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
