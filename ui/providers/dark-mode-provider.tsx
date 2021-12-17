import React from "react";
import { Colors } from "@blueprintjs/core";

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

  return (
    <DarkModeContext.Provider
      value={{ isDark, toggleDark: () => setIsDark((d) => !d) }}
    >
      <div
        style={{
          height: "100%",
          backgroundColor: isDark ? Colors.DARK_GRAY2 : Colors.GRAY4,
        }}
        className={isDark ? "bp3-dark" : ""}
      >
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};

/** Utility hook to access dark mode state and controls */
export const useDarkMode = () => React.useContext(DarkModeContext);
