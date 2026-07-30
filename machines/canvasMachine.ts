import { setup } from "xstate";

export type CanvasEvent =
  | { type: "SELECT_NODE" }
  | { type: "DESELECT_ALL" }
  | { type: "START_TRANSFORM" }
  | { type: "END_TRANSFORM" }
  | { type: "START_CONNECT" }
  | { type: "COMPLETE_CONNECT" }
  | { type: "START_PLACING_NODE" }
  | { type: "CANCEL" }
  | { type: "AI_MUTATION_START" }
  | { type: "AI_MUTATION_END" };

export const canvasMachine = setup({
  types: {
    events: {} as CanvasEvent,
  },
}).createMachine({
  id: "canvas",
  initial: "idle",
  states: {
    idle: {
      on: {
        SELECT_NODE: { target: "nodeSelected" },
        START_CONNECT: { target: "connecting" },
        START_PLACING_NODE: { target: "placingNode" },
        AI_MUTATION_START: { target: "aiGenerating" },
      },
    },
    nodeSelected: {
      on: {
        DESELECT_ALL: { target: "idle" },
        START_TRANSFORM: { target: "transforming" },
        START_CONNECT: { target: "connecting" },
        CANCEL: { target: "idle" },
        AI_MUTATION_START: { target: "aiGenerating" },
      },
    },
    transforming: {
      on: {
        END_TRANSFORM: { target: "nodeSelected" },
        // While transforming, CANCEL might revert the transform (handled elsewhere) and end transform
        CANCEL: { target: "nodeSelected" },
        AI_MUTATION_START: { target: "aiGenerating" },
      },
    },
    connecting: {
      on: {
        COMPLETE_CONNECT: { target: "idle" },
        CANCEL: { target: "idle" },
        AI_MUTATION_START: { target: "aiGenerating" },
      },
    },
    placingNode: {
      on: {
        CANCEL: { target: "idle" },
        // Placing a node could just return to idle, or we could have a COMPLETE_PLACE event.
        // Assuming we rely on CANCEL or DESELECT_ALL for now.
        DESELECT_ALL: { target: "idle" },
        AI_MUTATION_START: { target: "aiGenerating" },
      },
    },
    aiGenerating: {
      on: {
        AI_MUTATION_END: { target: "idle" },
      },
    },
  },
});
