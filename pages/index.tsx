import React from "react";
import { NextPage } from "next";
import { Mainframe } from "../ui/Mainframe";
import Head from "next/head";

const Index: NextPage = () => {
  return (
    <>
      <Head>
        <title>Esolang Park</title>
      </Head>
      <Mainframe />
    </>
  );
};

export default Index;
