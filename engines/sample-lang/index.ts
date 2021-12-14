import { Renderer } from "./renderer";
import { LanguageProvider } from "../types";
import { RS, sampleProgram } from "./constants";

const provider: LanguageProvider<RS> = {
  Renderer,
  sampleProgram,
};

export default provider;
