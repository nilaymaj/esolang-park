import React from "react";
import { useMonaco } from "@monaco-editor/react";
import { MonacoTokensProvider } from "../../engines/types";

type ConfigParams = {
  languageId: string;
  tokensProvider?: MonacoTokensProvider;
};

/** Add custom language and relevant providers to Monaco */
export const useEditorLanguageConfig = (params: ConfigParams) => {
  const monaco = useMonaco();

  React.useEffect(() => {
    if (!monaco) return;

    // Register language
    monaco.languages.register({ id: params.languageId });

    // If provided, register token provider for language
    if (params.tokensProvider) {
      monaco.languages.setMonarchTokensProvider(
        params.languageId,
        params.tokensProvider
      );
    }
  }, [monaco]);
};
