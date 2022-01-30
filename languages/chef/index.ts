import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { ChefRS } from "./types";
import { sampleProgram, editorTokensProvider } from "./constants";

const provider: LanguageProvider<ChefRS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
