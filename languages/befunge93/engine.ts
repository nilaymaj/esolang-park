import { setupWorker } from "../setup-worker";
import Befunge93LanguageEngine from "./runtime";

setupWorker(new Befunge93LanguageEngine());
