import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { RS, sampleProgram, editorTokensProvider } from "./common";

const provider: LanguageProvider<RS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
