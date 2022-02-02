import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import { Mainframe } from "../../ui/Mainframe";
import LangProvider from "../../languages/deadfish";
const LANG_ID = "deadfish";
const LANG_NAME = "Deadfish";

const IDE: NextPage = () => {
  return (
    <>
      <Head>
        <title>{LANG_NAME} | Esolang Park</title>
      </Head>
      <Mainframe
        langId={LANG_ID}
        langName={LANG_NAME}
        provider={LangProvider}
      />
    </>
  );
};

export default IDE;
