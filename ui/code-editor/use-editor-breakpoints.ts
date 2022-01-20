import React from "react";
import {
  createBreakpointRange,
  EditorInstance,
  MonacoInstance,
  MonacoMouseEvent,
  MonacoMouseLeaveEvent,
} from "./monaco-utils";

type BreakpointsMap = { [k: number]: string[] };
type HoverBreakpoint = {
  lineNum: number;
  decorRanges: string[];
};

type Args = {
  editor: EditorInstance | null;
  monaco: MonacoInstance | null;
  onUpdateBreakpoints: (newBreakpoints: number[]) => void;
};

export const useEditorBreakpoints = ({
  editor,
  monaco,
  onUpdateBreakpoints,
}: Args) => {
  const breakpoints = React.useRef<BreakpointsMap>({});
  const hoverBreakpoint = React.useRef<HoverBreakpoint | null>(null);

  // Mouse clicks -> add or remove breakpoint
  React.useEffect(() => {
    if (!editor || !monaco) return;
    const disposer = editor.onMouseDown((e: MonacoMouseEvent) => {
      // Check if click is in glyph display channel
      const glyphMarginType = monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN;
      const isGlyphMargin = e.target.type === glyphMarginType;
      if (!isGlyphMargin) return;

      const lineNum = e.target.position!.lineNumber;
      const existingRange = breakpoints.current[lineNum];
      if (existingRange) {
        // Already has breakpoint - remove it
        editor.deltaDecorations(existingRange, []);
        delete breakpoints.current[lineNum];
      } else {
        // Add breakpoint to this line
        const range = createBreakpointRange(monaco, lineNum);
        const newRangeStr = editor.deltaDecorations([], [range]);
        breakpoints.current[lineNum] = newRangeStr;
      }

      // Update breakpoints to parent
      const bpLineNumStrs = Object.keys(breakpoints.current);
      const bpLineNums = bpLineNumStrs.map(
        (numStr) => parseInt(numStr, 10) - 1
      );
      onUpdateBreakpoints(bpLineNums);
    });
    return () => disposer.dispose();
  }, [editor, monaco]);

  // Mouse enter -> show semi-transparent breakpoint icon
  React.useEffect(() => {
    if (!editor || !monaco) return;
    const disposer = editor.onMouseMove((e: MonacoMouseEvent) => {
      // Check if click is in glyph display channel
      const glyphMarginType = monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN;
      const isGlyphMargin = e.target.type === glyphMarginType;

      // If mouse goes out of glyph channel...
      if (!isGlyphMargin) {
        if (hoverBreakpoint.current) {
          editor.deltaDecorations(hoverBreakpoint.current.decorRanges, []);
          hoverBreakpoint.current = null;
        }
        return;
      }

      // Check if hover is in already hinted line
      const hoverLineNum = e.target.position!.lineNumber;
      if (hoverLineNum === hoverBreakpoint.current?.lineNum) return;

      // Add hover decoration to newly hovered line
      const range = createBreakpointRange(monaco, hoverLineNum, true);
      const newHoverRangeStr = editor.deltaDecorations([], [range]);

      // Remove existing breakpoint hover
      if (hoverBreakpoint.current)
        editor.deltaDecorations(hoverBreakpoint.current.decorRanges, []);

      // Set hover breakpoint state to new one
      hoverBreakpoint.current = {
        lineNum: hoverLineNum,
        decorRanges: newHoverRangeStr,
      };

      // If breakpoint already on line, ignore
      const lineNum = e.target.position!.lineNumber;
      const existingRange = breakpoints.current[lineNum];
      if (existingRange) return;
    });
    return () => disposer.dispose();
  }, [editor, monaco]);

  // Mouse leaves editor -> remove hover breakpoint hint
  React.useEffect(() => {
    if (!editor) return;
    const disposer = editor.onMouseLeave((_: MonacoMouseLeaveEvent) => {
      if (!hoverBreakpoint.current) return;
      editor.deltaDecorations(hoverBreakpoint.current.decorRanges, []);
      hoverBreakpoint.current = null;
    });
    return () => disposer.dispose();
  }, [editor]);

  return breakpoints;
};
