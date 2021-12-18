import React from "react";
import { NextPage } from "next";
import { Mainframe } from "../ui/Mainframe";
import Head from "next/head";
import { Header } from "../ui/header";
import BrainfuckProvider from "../engines/brainfuck";

const Index: NextPage = () => {
  return (
    <>
      <Head>
        <title>Esolang Park</title>
      </Head>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flexGrow: 1 }}>
          <Mainframe langName="brainfuck" provider={BrainfuckProvider} />
        </div>
      </div>
    </>
  );
};

export default Index;
