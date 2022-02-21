import React from "react";
import { FeaturesGuide } from "../features-guide";

/** Local storage key that stores boolean for whether guide has been closed by user */
const GUIDE_CLOSED_KEY = "guide-closed";

const FeaturesGuideContext = React.createContext<{
  show: () => void;
}>({ show: () => {} });

/** Context provider for showing the features guide dialog */
export const FeaturesGuideProvider = (props: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const hasClosedGuide = window.localStorage.getItem(GUIDE_CLOSED_KEY);
    if (hasClosedGuide == null) setIsOpen(true);
  });

  return (
    <FeaturesGuideContext.Provider value={{ show: () => setIsOpen(true) }}>
      {props.children}
      {isOpen && (
        <FeaturesGuide
          isOpen={isOpen}
          onClose={() => {
            window.localStorage.setItem(GUIDE_CLOSED_KEY, "true");
            setIsOpen(false);
          }}
        />
      )}
    </FeaturesGuideContext.Provider>
  );
};

/** Utility hook to show the features guide */
export const useFeaturesGuide = () => React.useContext(FeaturesGuideContext);
