import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme(); // lấy chế độ hệ thống
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

    // nếu người dùng đổi chế độ trên hệ thống, tự động cập nhật
    useEffect(() => {
        setIsDarkMode(systemScheme === "dark");
    }, [systemScheme]);

    const theme = {
        dark: isDarkMode,
        colors: {
            background: isDarkMode ? "#000" : "#fff",
            text: isDarkMode ? "#fff" : "#000",
            card: isDarkMode ? "#1c1c1e" : "#f5f5f5",
            border: isDarkMode ? "#333" : "#e0e0e0",
            primary: "#007AFF",
        },
        toggleTheme: () => setIsDarkMode((prev) => !prev),
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
