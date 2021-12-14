import React from "react";
import { CodeEditor, CodeEditorRef } from "../ui/code-editor";
import { InputEditor, InputEditorRef } from "../ui/input-editor";
import { MainLayout } from "../ui/MainLayout";
import { useExecController } from "../ui/use-exec-controller";
import { DocumentRange, LanguageProvider } from "../engines/types";
import SampleLangProvider from "../engines/sample-lang";
import BrainfuckProvider from "../engines/brainfuck";
import { OutputViewer } from "../ui/output-viewer";

export const Mainframe = () => {
  const codeEditorRef = React.useRef<CodeEditorRef>(null);
  const inputEditorRef = React.useRef<InputEditorRef>(null);
  // const providerRef = React.useRef<LanguageProvider<any>>(SampleLangProvider);
  const providerRef = React.useRef<LanguageProvider<any>>(BrainfuckProvider);
  const execController = useExecController();

  // UI states used in execution time
  const [rendererState, setRendererState] = React.useState<any>(null);
  const [output, setOutput] = React.useState<string | null>(null);
  const [codeHighlights, setCodeHighlights] = React.useState<
    DocumentRange | undefined
  >();

  const testDrive = React.useCallback(async () => {
    console.info("=== RUNNING TEST DRIVE ===");

    // Check that controller is ready to execute
    const readyStates = ["empty", "ready", "done"];
    if (!readyStates.includes(execController.state)) {
      console.error(`Controller not ready: state is ${execController.state}`);
      return;
    }

    // Prepare for execution
    setOutput("");
    await execController.resetState();
    await execController.prepare(
      codeEditorRef.current!.getValue(),
      inputEditorRef.current!.getValue()
    );

    // Begin execution
    await execController.executeAll((result) => {
      setRendererState(result.rendererState);
      setCodeHighlights(result.nextStepLocation || undefined);
      setOutput((o) => (o || "") + (result.output || ""));
    }, 20);
  }, [execController.state]);

  React.useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (!(ev.ctrlKey && ev.code === "KeyY")) return;
      testDrive();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [testDrive]);

  return (
    <MainLayout
      renderEditor={() => (
        <CodeEditor
          ref={codeEditorRef}
          languageId="brainfuck"
          highlights={codeHighlights}
          defaultValue={providerRef.current.sampleProgram}
          tokensProvider={providerRef.current.editorTokensProvider}
        />
      )}
      renderRenderer={() => (
        <providerRef.current.Renderer state={rendererState} />
      )}
      renderInput={() => <InputEditor ref={inputEditorRef} />}
      renderOutput={() => <OutputViewer value={output} />}
    />
  );
};
