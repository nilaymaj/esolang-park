import React from "react";
import { LanguageProvider } from "../languages/types";

const RENDER_INTERVAL_MS = 50;

export interface RendererRef<RS> {
  /** Update runtime state to renderer */
  updateState: (state: RS | null) => void;
}

/**
 * React component that acts as an imperatively controller wrapper
 * around the actual language renderer. This is to pull renderer state updates
 * outside of Mainframe and debouncing rerenders for performance reasons.
 */
const RendererWrapperComponent = <RS extends {}>(
  { renderer }: { renderer: LanguageProvider<RS>["Renderer"] },
  ref: React.Ref<RendererRef<RS>>
) => {
  const [renderedState, setRenderedState] = React.useState<RS | null>(null);

  /**
   * Re-rendering on each state update becomes a bottleneck for running code at high speed.
   * The main browser thread will take too much time handling each message and the message queue
   * will pile up, leading to very visible delay in actions like pause and stop.
   *
   * To avoid this, we do some debouncing here. We only truly re-render at every X ms: on
   * other updates we just store the latest state in a ref.
   */

  // Timer for re-rendering with the latest state
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  // Ref to store the very latest state, that may be rendered upto X ms later
  const latestState = React.useRef<RS | null>(null);

  /**
   * Update the current renderer state. Debounces re-render by default,
   * pass `immediate` as true to immediately re-render with the given state.
   */
  const updateState = (state: RS | null) => {
    latestState.current = state;
    if (debounceTimerRef.current) return; // Timeout will automatically render liveState

    // Set a timer to re-render with the latest result after X ms
    debounceTimerRef.current = setTimeout(() => {
      setRenderedState(latestState.current);
      debounceTimerRef.current = null;
    }, RENDER_INTERVAL_MS);
  };

  React.useImperativeHandle(ref, () => ({ updateState }));

  return renderer({ state: renderedState });
};

export const RendererWrapper = React.forwardRef(RendererWrapperComponent);
