import React from "react";
import "../styles/globals.css";
import "../styles/editor.css";
import "../styles/mosaic.scss";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "react-mosaic-component/react-mosaic-component.css";
import type { AppProps } from "next/app";
import { Providers } from "../ui/providers";
import { NextPage } from "next";

/** Type for pages that use a custom layout */
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

/** AppProps type but extended for custom layouts */
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout ?? ((page) => <Providers>{page}</Providers>);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
