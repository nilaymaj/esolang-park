import { DarkModeProvider } from "./dark-mode-provider";
import { ErrorBoundaryProvider } from "./error-boundary-provider";
import { FeaturesGuideProvider } from "./features-guide-provider";

type Props = {
  omitFeatureGuide?: boolean;
  children: React.ReactNode;
};

export const Providers = (props: Props) => {
  return (
    <DarkModeProvider>
      <ErrorBoundaryProvider>
        {props.omitFeatureGuide ? (
          props.children
        ) : (
          <FeaturesGuideProvider>{props.children}</FeaturesGuideProvider>
        )}
      </ErrorBoundaryProvider>
    </DarkModeProvider>
  );
};
