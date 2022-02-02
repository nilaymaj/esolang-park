import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { RS } from "./common/types";
import { sampleProgram, editorTokensProvider } from "./common/misc";

const provider: LanguageProvider<RS> = {
  Renderer,
  sampleProgram,
  editorTokensProvider,
};

export default provider;
