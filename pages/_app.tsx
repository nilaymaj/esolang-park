import "../styles/globals.css";
import "../styles/editor.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "react-mosaic-component/react-mosaic-component.css";
import type { AppProps } from "next/app";
import { DarkModeProvider } from "../ui/providers/dark-mode-provider";
import { ErrorBoundaryProvider } from "../ui/providers/error-boundary-provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundaryProvider>
      <DarkModeProvider>
        <Component {...pageProps} />
      </DarkModeProvider>
    </ErrorBoundaryProvider>
  );
}

export default MyApp;
