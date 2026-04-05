import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/translations';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // ഡിഫോൾട്ട് ഭാഷ 'en' (English) ആക്കി മാറ്റി
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      const lang = await AsyncStorage.getItem('language');
      if (theme) setIsDarkMode(theme === 'dark');
      if (lang) setLanguage(lang);
    } catch (e) { console.log(e); }
  };

  const toggleTheme = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
  };

  const changeLanguage = async (value) => {
    setLanguage(value);
    await AsyncStorage.setItem('language', value);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ isDarkMode, toggleTheme, language, changeLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};
