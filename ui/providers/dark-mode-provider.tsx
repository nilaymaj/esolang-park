import React from "react";
import { Classes, Colors } from "@blueprintjs/core";

const DarkModeContext = React.createContext<{
  isDark: boolean;
  toggleDark: () => void;
}>({ isDark: true, toggleDark: () => {} });

/** Context provider for managing dark mode state */
export const DarkModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDark, setIsDark] = React.useState(true);

  // Set body element class according to dark mode
  React.useEffect(() => {
    if (isDark) document.body.classList.add(Classes.DARK);
    else document.body.classList.remove(Classes.DARK);
  }, [isDark]);

  // Set dark theme according to system preference
  React.useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: light)").matches)
      setIsDark(false);
  }, []);

  return (
    <DarkModeContext.Provider
      value={{ isDark, toggleDark: () => setIsDark((d) => !d) }}
    >
      <div
        style={{
          height: "100%",
          backgroundColor: isDark ? Colors.DARK_GRAY2 : Colors.GRAY4,
        }}
      >
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};

/** Utility hook to access dark mode state and controls */
export const useDarkMode = () => React.useContext(DarkModeContext);
