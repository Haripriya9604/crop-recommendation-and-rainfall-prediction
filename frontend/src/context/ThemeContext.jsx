// frontend/src/context/ThemeContext.jsx
import React, { createContext, useContext } from "react";

export const ThemeContext = createContext({ isDark: true });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ isDark, children }) {
  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
