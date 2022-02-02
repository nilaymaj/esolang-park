import React from "react";
import { CodeEditor, CodeEditorRef } from "../ui/code-editor";
import { InputEditor, InputEditorRef } from "../ui/input-editor";
import { MainLayout } from "../ui/MainLayout";
import { useExecController } from "../ui/use-exec-controller";
import { LanguageProvider, StepExecutionResult } from "../languages/types";
import { OutputViewer, OutputViewerRef } from "../ui/output-viewer";
import { ExecutionControls } from "./execution-controls";
import { RendererRef, RendererWrapper } from "./renderer-wrapper";
import { WorkerRuntimeError } from "../languages/worker-errors";

type Props<RS> = {
  langId: string;
  langName: string;
  provider: LanguageProvider<RS>;
};

/**
 * React component that contains and controls the entire IDE.
 *
 * For performance reasons, Mainframe makes spare use of state hooks. This
 * component is rather expensive to render, and will block the main thread on
 * small execution intervals if rendered on every execution. All state management
 * is delegated to imperatively controlled child components.
 */
export const Mainframe = <RS extends {}>(props: Props<RS>) => {
  // Language provider and engine
  const providerRef = React.useRef(props.provider);
  const execController = useExecController(props.langId);

  // Refs for controlling UI components
  const codeEditorRef = React.useRef<CodeEditorRef>(null);
  const inputEditorRef = React.useRef<InputEditorRef>(null);
  const outputEditorRef = React.useRef<OutputViewerRef>(null);
  const rendererRef = React.useRef<RendererRef<any>>(null);

  // Interval of execution
  const [execInterval, setExecInterval] = React.useState(20);

  /** Utility that updates UI with the provided execution result */
  const updateWithResult = (
    result: StepExecutionResult<any>,
    error?: WorkerRuntimeError
  ) => {
    rendererRef.current!.updateState(result.rendererState);
    codeEditorRef.current!.updateHighlights(result.nextStepLocation);
    outputEditorRef.current!.append(result.output);

    // Self-modifying programs: update code
    if (result.codeEdits != null)
      codeEditorRef.current!.editCode(result.codeEdits);

    // End of program: reset code to original version
    if (!result.nextStepLocation) codeEditorRef.current!.endExecutionMode();

    // RuntimeError: print error to output
    if (error) outputEditorRef.current!.setError(error);
  };

  /** Reset and begin a new execution */
  const runProgram = async () => {
    // Check if controller is free for execution
    const readyStates = ["empty", "done"];
    if (!readyStates.includes(execController.state)) {
      console.error(`Controller not ready: state is ${execController.state}`);
      return;
    }

    // Reset any existing execution state
    outputEditorRef.current!.reset();
    await execController.resetState();
    const error = await execController.prepare(
      codeEditorRef.current!.getCode(),
      inputEditorRef.current!.getValue()
    );

    // Check for ParseError, else begin execution
    if (error) outputEditorRef.current!.setError(error);
    else {
      codeEditorRef.current!.startExecutionMode();
      await execController.execute(updateWithResult, execInterval);
    }
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

  /** Run a single step of execution */
  const executeStep = async () => {
    // Check if controller is paused
    if (execController.state !== "paused") {
      console.error("Controller not paused");
      return;
    }

    // Run and update execution states
    const response = await execController.executeStep();
    updateWithResult(response.result, response.error);
  };

  /** Resume the currently paused execution */
  const resumeExecution = async () => {
    // Check if controller is indeed paused
    if (execController.state !== "paused") {
      console.error("Controller is not paused");
      return;
    }

    // Begin execution
    await execController.execute(updateWithResult, execInterval);
  };

  /** Stop the currently active execution */
  const stopExecution = async () => {
    // Check if controller has execution
    if (!["paused", "processing", "error"].includes(execController.state)) {
      console.error("No active execution in controller");
      return;
    }

    // If currently processing, pause execution loop first
    if (execController.state === "processing")
      await execController.pauseExecution();

    // Reset all execution states
    await execController.resetState();
    rendererRef.current!.updateState(null);
    codeEditorRef.current!.updateHighlights(null);
    codeEditorRef.current!.endExecutionMode();
  };

  /** Translate execution controller state to debug controls state */
  const getDebugState = () => {
    const currState = execController.state;
    if (currState === "processing") return "running";
    else if (currState === "paused") return "paused";
    else if (currState === "error") return "error";
    else return "off";
  };

  return (
    <MainLayout
      langId={props.langId}
      langName={props.langName}
      renderEditor={() => (
        <CodeEditor
          ref={codeEditorRef}
          languageId={props.langName}
          defaultValue={providerRef.current.sampleProgram}
          tokensProvider={providerRef.current.editorTokensProvider}
          onValidateCode={execController.validateCode}
          onUpdateBreakpoints={(newPoints) =>
            execController.updateBreakpoints(newPoints)
          }
        />
      )}
      renderRenderer={() => (
        <RendererWrapper
          ref={rendererRef}
          renderer={providerRef.current.Renderer as any}
        />
      )}
      renderInput={() => (
        <InputEditor
          ref={inputEditorRef}
          readOnly={execController.state === "processing"}
        />
      )}
      renderOutput={() => <OutputViewer ref={outputEditorRef} />}
      renderExecControls={() => (
        <ExecutionControls
          state={getDebugState()}
          onRun={runProgram}
          onPause={pauseExecution}
          onResume={resumeExecution}
          onStep={executeStep}
          onStop={stopExecution}
          onChangeInterval={setExecInterval}
        />
      )}
    />
  );
};
