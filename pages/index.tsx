import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import logoImg from "../ui/assets/logo.png";
import Image from "next/image";
import { Card, Colors, Text } from "@blueprintjs/core";
import Link from "next/link";
import { useDarkMode } from "../ui/providers/dark-mode-provider";

const LANGUAGES = [
  { display: "Befunge-93", id: "befunge93" },
  { display: "Brainf*ck", id: "brainfuck" },
  { display: "Chef", id: "chef" },
  { display: "Deadfish", id: "deadfish" },
];

const styles = {
  rootContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10%",
    textAlign: "center" as "center",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
  },
  langsContainer: {
    marginTop: 30,
    width: "100%",
    display: "flex",
    flexWrap: "wrap" as "wrap",
    alignContent: "flex-start",
    justifyContent: "center",
  },
  langCard: {
    minWidth: 200,
    textAlign: "center" as "center",
    margin: 20,
    padding: "30px 0",
  },
};

const Index: NextPage = () => {
  const { isDark } = useDarkMode();
  const backgroundColor = isDark ? Colors.DARK_GRAY3 : Colors.WHITE;

  return (
    <>
      <Head>
        <title>Esolang Park</title>
      </Head>
      <div style={{ ...styles.rootContainer, backgroundColor }}>
        <div style={styles.headerContainer}>
          <div style={{ flexGrow: 0, marginRight: 10 }}>
            <Image src={logoImg} width={52} height={52} />
          </div>
          <Text tagName="div">
            <h1>Esolang Park</h1>
          </Text>
        </div>
        <Text>
          <p>An online visual debugger for esoteric languages</p>
        </Text>
        <div style={styles.langsContainer}>
          {LANGUAGES.map(({ display, id }) => (
            <Link href={`/ide/${id}`} key={id}>
              <a style={{ all: "unset" }}>
                <Card interactive style={styles.langCard}>
                  <Text style={{ fontWeight: "bold" }}>{display}</Text>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Index;
