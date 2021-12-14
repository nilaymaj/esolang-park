import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { BFRS, sampleProgram, editorTokensProvider } from "./constants";

const provider: LanguageProvider<BFRS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
