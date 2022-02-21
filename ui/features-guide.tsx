import * as React from "react";
import Image from "next/image";
import { Text, Classes, Drawer, TextProps, Divider } from "@blueprintjs/core";
import breakpointsImg from "./assets/guide-breakpoints.png";
import execControlsImg from "./assets/guide-exec-controls.png";
import infoBtnImg from "./assets/guide-info-btn.png";
import syntaxCheckImg from "./assets/guide-syntax-check.png";

const BigText = (props: TextProps & { children: React.ReactNode }) => {
  const { children, ...rest } = props;
  return (
    <Text className={Classes.RUNNING_TEXT} {...rest}>
      {children}
    </Text>
  );
};

const SideBySideSection = (props: {
  title: string;
  children: React.ReactNode;
  image: JSX.Element;
}) => {
  return (
    <div>
      <Text>
        <h3>{props.title}</h3>
      </Text>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexShrink: 0, width: "30%", marginRight: 20 }}>
          <div style={{ borderRadius: 10, overflowY: "hidden" }}>
            {props.image}
          </div>
        </div>
        <BigText>{props.children}</BigText>
      </div>
    </div>
  );
};

const SyntaxCheckSection = () => {
  return (
    <SideBySideSection
      title="Live syntax checking"
      image={<Image src={syntaxCheckImg} alt="syntax checking" />}
    >
      <p>
        Esolang Park checks the syntax of your source code{" "}
        <b>while you're typing</b>. Any errors in the syntax of your program are
        marked in the editor with a (mostly) useful error message, without
        needing to run the program.
      </p>
    </SideBySideSection>
  );
};

const BreakpointsSection = () => {
  return (
    <SideBySideSection
      title="Set breakpoints in your code"
      image={<Image src={breakpointsImg} alt="breakpoints" />}
    >
      <p>
        Esolang Park allows you to <b>set debugging breakpoints in your code</b>
        . When you run your program and execution reaches a line with
        breakpoint, the program will pause and you can inspect the state of the
        program.
      </p>
      <p>
        Click on the left of any line number to set a breakpoint on that line.
        Click on the red circle to remove the breakpoint.
      </p>
    </SideBySideSection>
  );
};

const ExecControlsSection = () => {
  return (
    <div>
      <Text>
        <h3>Pause, inspect and step through execution</h3>
      </Text>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "60%",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 10,
            overflowY: "hidden",
          }}
        >
          <Image src={execControlsImg} alt="execution controls" />
        </div>
      </div>
      <BigText>
        <p>
          When your run a program, the "Run code" button changes to the
          execution controls. Pause execution to{" "}
          <b>
            inspect the runtime state, start stepping through execution, change
            the execution interval or stop execution entirely
          </b>
          .
        </p>
        <p>
          The execution interval dictates how fast your program should be run by
          Esolang Park. The smallest execution interval currently supported is
          5ms.
        </p>
      </BigText>
    </div>
  );
};

const InfoSection = () => {
  return (
    <SideBySideSection
      title={""}
      image={<Image src={infoBtnImg} alt="info buttons" />}
    >
      <p>
        Click the document button to read a short introduction and view
        reference links for the esolang. This also contains{" "}
        <b>notes about the implementation of this esolang</b>, including any
        incompatibilities and quirks you should take care of while debugging
        your code.
      </p>
      <p>
        Click the question mark button to <b>view this guide</b> at any point.
      </p>
    </SideBySideSection>
  );
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const FeaturesGuide = (props: Props) => {
  return (
    <Drawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Esolang Park"
      style={{ overflowY: "auto" }}
    >
      <div className={Classes.DIALOG_BODY}>
        <BigText>
          <p>
            Esolang Park is an online <b>interpreter and debugger interface</b>{" "}
            for esoteric programming languages. Think Repl.it, but a simpler
            version for esoteric languages, with a visual debugger catered to
            each language, that runs in your browser.
          </p>
          <p>
            The goal of Esolang Park is to be a platform for esolang enthusiasts
            to test and debug their code more easily, as well as for other
            people to discover and play around with esoteric languages without
            leaving the browser.
          </p>
          <p>
            Esolang Park is <b>very early in development</b>, things are by no
            means optimal, and there are most certainly bugs hanging around in
            the source code. If you catch one, please create an issue on GitHub!
          </p>
        </BigText>
        <Divider style={{ margin: 20 }} />
        <SyntaxCheckSection />
        <Divider style={{ margin: 20 }} />
        <BreakpointsSection />
        <Divider style={{ margin: 20 }} />
        <ExecControlsSection />
        <Divider style={{ margin: 20 }} />
        <InfoSection />
      </div>
    </Drawer>
  );
};
