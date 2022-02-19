import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import logoImg from "../ui/assets/logo.png";
import Image from "next/image";
import { Button, Card, Colors, Icon, Text } from "@blueprintjs/core";
import Link from "next/link";
import { useDarkMode } from "../ui/providers/dark-mode-provider";
import LANGUAGES from "./languages.json";
import { GitHubIcon } from "../ui/custom-icons";

const REPO_URL = "https://github.com/nilaymaj/esolang-park";
const WIKI_URL = REPO_URL + "/wiki";
const GUIDE_URL = REPO_URL + "/wiki/LP-Getting-Started";
const ISSUE_URL = REPO_URL + "/issues/new";

const styles = {
  topPanel: {
    position: "absolute" as "absolute",
    top: 0,
    right: 0,
    padding: 10,
  },
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
  const DarkMode = useDarkMode();
  const backgroundColor = DarkMode.isDark ? Colors.DARK_GRAY3 : Colors.WHITE;

  return (
    <>
      <Head>
        <title>Esolang Park</title>
      </Head>
      {/* Buttons in the top-right */}
      <div style={styles.topPanel}>
        <Button
          minimal
          title="Toggle between dark and light mode"
          icon={<Icon icon={DarkMode.isDark ? "flash" : "moon"} />}
          onClick={DarkMode.toggleDark}
        />
        <a href={WIKI_URL} title="Visit the project's wiki">
          <Button minimal icon={<Icon icon="book" />} />
        </a>
        <a href={REPO_URL} title="Visit the GitHub repository">
          <Button minimal icon={<Icon icon={<GitHubIcon />} />} />
        </a>
      </div>
      {/* Container for center content */}
      <div style={{ ...styles.rootContainer, backgroundColor }}>
        {/* Project heading */}
        <div style={styles.headerContainer}>
          <div style={{ flexGrow: 0, marginRight: 10 }}>
            <Image src={logoImg} alt="logo" width={52} height={52} />
          </div>
          <Text tagName="div">
            <h1>Esolang Park</h1>
          </Text>
        </div>
        <Text>
          <p>An online visual debugger for esoteric languages</p>
        </Text>
        {/* Language cards */}
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
        {/* "More esolangs" section */}
        <Text>
          <p>
            Need support for your favorite esolang? Submit an{" "}
            <a href={ISSUE_URL}>issue on GitHub</a> (or{" "}
            <a href={GUIDE_URL}>implement it yourself</a>!)
          </p>
        </Text>
      </div>
    </>
  );
};

export default Index;
