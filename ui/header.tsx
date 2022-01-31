import { Button, Card, Icon } from "@blueprintjs/core";
import Image from "next/image";
import logoImg from "./assets/logo.png";
import { GitHubIcon } from "./custom-icons";
import { useDarkMode } from "./providers/dark-mode-provider";

/** Link to the project's GitHub repository */
const REPO_LINK = "https://github.com/nilaymaj/esolang-park";

/** Link to the language's README.md page on GitHub */
const NOTES_LINK = (id: string) =>
  `https://github.com/nilaymaj/esolang-park/blob/main/languages/${id}/README.md`;

export const Header = (props: { langId: string; langName: string }) => {
  const DarkMode = useDarkMode();

  const brandSection = (
    <div style={{ flex: 1, textAlign: "left" }}>
      <Button minimal large>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image src={logoImg} alt="logo" width={20} height={20} />
          <span style={{ marginLeft: 10 }}>Esolang Park</span>
        </div>
      </Button>
    </div>
  );

  const langSection = (
    <div style={{ flex: 0, textAlign: "center" }}>{props.langName}</div>
  );

  const infoSection = (
    <div style={{ flex: 1, textAlign: "right", paddingRight: 8 }}>
      <a
        href={NOTES_LINK(props.langId)}
        title="View implementatio notes for this esolang"
      >
        <Button minimal icon={<Icon icon="info-sign" />} />
      </a>
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
        {langSection}
        {infoSection}
      </Card>
    </div>
  );
};
