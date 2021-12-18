import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { DFRS, sampleProgram, editorTokensProvider } from "./constants";

const provider: LanguageProvider<DFRS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
