import { Classes } from "@blueprintjs/core";
import React from "react";

const DarkModeContext = React.createContext<{
  isDark: boolean;
  toggleDark: () => void;
}>({ isDark: false, toggleDark: () => {} });

/** Context provider for managing dark mode state */
export const DarkModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDark, setIsDark] = React.useState(false);

  const toggleDark = () => {
    document.body.classList.toggle(Classes.DARK);
    setIsDark((d) => !d);
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
};

/** Utility hook to access dark mode state and controls */
export const useDarkMode = () => React.useContext(DarkModeContext);
