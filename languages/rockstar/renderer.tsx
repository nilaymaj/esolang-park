import { RendererProps } from "../types";
import { RS } from "./common";

export const Renderer = ({ state }: RendererProps<RS>) => {
  return state == null ? null : <p>state.value</p>;
};
