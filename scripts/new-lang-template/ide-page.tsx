// @ts-nocheck
import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import { Mainframe } from "../../ui/Mainframe";
import { Header } from "../../ui/header";
import LangProvider from "../../engines/$LANG_ID";
const LANG_ID = "$LANG_ID";
const LANG_NAME = "$LANG_NAME";

const IDE: NextPage = () => {
  return (
    <>
      <Head>
        <title>{LANG_NAME} | Esolang Park</title>
      </Head>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header langName={LANG_NAME} />
        <div style={{ flexGrow: 1 }}>
          <Mainframe langName={LANG_ID} provider={LangProvider} />
        </div>
      </div>
    </>
  );
};

export default IDE;
