import "../styles/globals.css";
import "../styles/editor.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "react-mosaic-component/react-mosaic-component.css";
import type { AppProps } from "next/app";
import { DarkModeProvider } from "../ui/providers/dark-mode-provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DarkModeProvider>
      <Component {...pageProps} />
    </DarkModeProvider>
  );
}

export default MyApp;
