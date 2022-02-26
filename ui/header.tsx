import * as React from "react";
import Image from "next/image";
import logoImg from "./assets/logo.png";
import { GitHubIcon } from "./custom-icons";
import { useDarkMode } from "./providers/dark-mode-provider";
import { Button, Card, Colors, Icon, Tag } from "@blueprintjs/core";
import { useFeaturesGuide } from "./providers/features-guide-provider";

/** Link to the project's GitHub repository */
const REPO_LINK = "https://github.com/nilaymaj/esolang-park";

/** Link to the language's README.md page on GitHub */
const NOTES_LINK = (id: string) =>
  `https://github.com/nilaymaj/esolang-park/blob/main/languages/${id}/README.md`;

/** Hint text for the language notes button */
const LangNotesHint = (props: { show: boolean }) => {
  const { isDark } = useDarkMode();
  const color = isDark ? Colors.GRAY3 : Colors.GRAY2;

  return (
    <span
      className={"esolang-notes-hint " + (props.show ? "" : "hide")}
      style={{ color, marginRight: 10 }}
    >
      <span style={{ marginRight: 5 }}>Read the esolang notes</span>
      <Icon icon="arrow-right"></Icon>
    </span>
  );
};

type Props = {
  langId: string;
  langName: string;
  renderExecControls: () => React.ReactNode;
};

export const Header = (props: Props) => {
  const DarkMode = useDarkMode();
  const featuresGuide = useFeaturesGuide();
  const [showNotesHint, setShowNotesHint] = React.useState(true);

  const brandSection = (
    <div
      style={{
        flex: 1,
        textAlign: "left",
        display: "flex",
        alignItems: "center",
      }}
    >
      <a href="/" title="Return to home page">
        <Button minimal large>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image src={logoImg} alt="logo" width={20} height={20} />
            <span style={{ marginLeft: 10 }}>Esolang Park</span>
          </div>
        </Button>
      </a>
      <Tag large minimal style={{ marginLeft: 10 }}>
        {props.langName}
      </Tag>
    </div>
  );

  const controlsSection = (
    <div style={{ textAlign: "center" }}>{props.renderExecControls()}</div>
  );

  const infoSection = (
    <div
      style={{
        flex: 1,
        textAlign: "right",
        paddingRight: 8,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <LangNotesHint show={showNotesHint} />
      <a
        href={NOTES_LINK(props.langId)}
        onMouseEnter={() => setShowNotesHint(false)}
        title="View the notes for this esolang"
      >
        <Button minimal icon={<Icon icon="document" />} />
      </a>
      <Button
        minimal
        title="View the features guide"
        icon={<Icon icon="help" />}
        onClick={featuresGuide.show}
      />
      <Button
        minimal
        title="Toggle between dark and light mode"
        icon={<Icon icon={DarkMode.isDark ? "flash" : "moon"} />}
        onClick={DarkMode.toggleDark}
      />
      <a href={REPO_LINK} title="GitHub repository">
        <Button minimal icon={<Icon icon={<GitHubIcon />} />} />
      </a>
    </div>
  );

  return (
    <div style={{ padding: 5 }}>
      <Card
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
        }}
      >
        {brandSection}
        {controlsSection}
        {infoSection}
      </Card>
    </div>
  );
};
