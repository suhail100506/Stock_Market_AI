import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state: default to 'light' as specified in design system
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('stocksense_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('stocksense_font_size') || 'medium';
  });

  const [accessibilityMode, setAccessibilityMode] = useState(() => {
    return localStorage.getItem('stocksense_accessibility') === 'true';
  });

  const [reConfirmOrder, setReConfirmOrder] = useState(() => {
    const saved = localStorage.getItem('stocksense_reconfirm_order');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('stocksense_theme', theme);
  }, [theme]);

  // Apply font size adjustments
  useEffect(() => {
    localStorage.setItem('stocksense_font_size', fontSize);
    const root = document.documentElement;
    if (fontSize === 'small') {
      root.style.fontSize = '13.5px';
    } else if (fontSize === 'large') {
      root.style.fontSize = '15.5px';
    } else {
      root.style.fontSize = '14px';
    }
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('stocksense_accessibility', String(accessibilityMode));
  }, [accessibilityMode]);

  useEffect(() => {
    localStorage.setItem('stocksense_reconfirm_order', String(reConfirmOrder));
  }, [reConfirmOrder]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    } else {
      setThemeState(newTheme === 'dark' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        fontSize,
        setFontSize,
        accessibilityMode,
        setAccessibilityMode,
        reConfirmOrder,
        setReConfirmOrder,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
