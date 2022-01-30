import React from "react";
import { LanguageProvider } from "../languages/types";

export interface RendererRef<RS> {
  /** Update runtime state to renderer */
  updateState: (state: RS | null) => void;
}

/**
 * React component that acts as an imperatively controller wrapper
 * around the actual language renderer. This is to pull renderer state updates
 * outside of Mainframe for performance reasons.
 */
const RendererWrapperComponent = <RS extends {}>(
  { renderer }: { renderer: LanguageProvider<RS>["Renderer"] },
  ref: React.Ref<RendererRef<RS>>
) => {
  const [state, setState] = React.useState<RS | null>(null);

  React.useImperativeHandle(ref, () => ({
    updateState: setState,
  }));

  return renderer({ state });
};

export const RendererWrapper = React.forwardRef(RendererWrapperComponent);
