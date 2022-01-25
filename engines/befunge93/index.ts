import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { Bfg93RS, sampleProgram, editorTokensProvider } from "./constants";

const provider: LanguageProvider<Bfg93RS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
