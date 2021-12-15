import React from "react";
import { CodeEditor, CodeEditorRef } from "../ui/code-editor";
import { InputEditor, InputEditorRef } from "../ui/input-editor";
import { MainLayout } from "../ui/MainLayout";
import { useExecController } from "../ui/use-exec-controller";
import { DocumentRange, LanguageProvider } from "../engines/types";
import BrainfuckProvider from "../engines/brainfuck";
import { OutputViewer } from "../ui/output-viewer";
import { ExecutionControls } from "./execution-controls";

export const Mainframe = () => {
  const codeEditorRef = React.useRef<CodeEditorRef>(null);
  const inputEditorRef = React.useRef<InputEditorRef>(null);
  const providerRef = React.useRef<LanguageProvider<any>>(BrainfuckProvider);
  const execController = useExecController();

  // UI states used in execution time
  const [rendererState, setRendererState] = React.useState<any>(null);
  const [output, setOutput] = React.useState<string | null>(null);
  const [codeHighlights, setCodeHighlights] = React.useState<
    DocumentRange | undefined
  >();

  /** Reset and begin a new execution */
  const runProgram = async () => {
    // Check if controller is free for execution
    const readyStates = ["empty", "done"];
    if (!readyStates.includes(execController.state)) {
      console.error(`Controller not ready: state is ${execController.state}`);
      return;
    }

    // Reset any existing execution state
    setOutput("");
    setRendererState(null);
    await execController.resetState();
    await execController.prepare(
      codeEditorRef.current!.getValue(),
      inputEditorRef.current!.getValue()
    );

    // Begin execution
    await execController.execute((result) => {
      setRendererState(result.rendererState);
      setCodeHighlights(result.nextStepLocation || undefined);
      setOutput((o) => (o || "") + (result.output || ""));
    }, 1000);
  };

  /** Pause the ongoing execution */
  const pauseExecution = async () => {
    // Check if controller is indeed executing code
    if (execController.state !== "processing") {
      console.error("Controller not processing any code");
      return;
    }
    await execController.pauseExecution();
  };

  /** Resume the currently paused execution */
  const resumeExecution = async () => {
    // Check if controller is indeed paused
    if (execController.state !== "paused") {
      console.error("Controller is not paused");
      return;
    }

    // Begin execution
    await execController.execute((result) => {
      setRendererState(result.rendererState);
      setCodeHighlights(result.nextStepLocation || undefined);
      setOutput((o) => (o || "") + (result.output || ""));
    }, 1000);
  };

  /** Stop the currently active execution */
  const stopExecution = async () => {
    // Check if controller has execution
    if (!["paused", "processing"].includes(execController.state)) {
      console.error("No active execution in controller");
      return;
    }

    // If currently processing, pause execution loop first
    if (execController.state === "processing")
      await execController.pauseExecution();

    // Reset all execution states
    await execController.resetState();
    setOutput(null);
    setRendererState(null);
    setCodeHighlights(undefined);
  };

  /** Translate execution controller state to debug controls state */
  const getDebugState = () => {
    const currState = execController.state;
    if (currState === "processing") return "running";
    else if (currState === "paused") return "paused";
    else return "off";
  };

  return (
    <MainLayout
      renderEditor={() => (
        <CodeEditor
          ref={codeEditorRef}
          languageId="brainfuck"
          highlights={codeHighlights}
          defaultValue={providerRef.current.sampleProgram}
          tokensProvider={providerRef.current.editorTokensProvider}
          onUpdateBreakpoints={(newPoints) =>
            execController.updateBreakpoints(newPoints)
          }
        />
      )}
      renderRenderer={() => (
        <providerRef.current.Renderer state={rendererState} />
      )}
      renderInput={() => <InputEditor ref={inputEditorRef} />}
      renderOutput={() => <OutputViewer value={output} />}
      renderExecControls={() => (
        <ExecutionControls
          state={getDebugState()}
          onRun={runProgram}
          onPause={pauseExecution}
          onResume={resumeExecution}
          onStop={stopExecution}
        />
      )}
    />
  );
};
