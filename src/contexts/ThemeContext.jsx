import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync with user profile theme when it changes
  useEffect(() => {
    if (userProfile?.theme) {
      const profileTheme = userProfile.theme === "dark";
      if (profileTheme !== isDarkMode) {
        setIsDarkMode(profileTheme);
      }
    }
  }, [userProfile?.theme, isDarkMode]);

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update document class for Tailwind dark mode
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Update user profile if user is logged in
    if (userProfile) {
      try {
        await updateUserProfile({ theme: newTheme ? "dark" : "light" });
      } catch (error) {
        console.error("Error updating theme in profile:", error);
      }
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? "dark" : "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
