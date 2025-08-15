import { Component } from "./base";
import { FiniteStateMachine } from "../utils/fsm";
import { Scene } from "@babylonjs/core";

export type SerializedState = {
  initial: string;
  transitions: {
    from: string;
    to: string;
    event?: string;
    afterMs?: number;
  }[];
};

export type StateContext = {
  scene: Scene;
};

export type State = {
  fsm: FiniteStateMachine<
    string,
    string,
    StateContext
  >;
  current: string;
  previous: string | null;
  timeInStateMs: number;
};

export const state: Component<
  SerializedState,
  State
> = {
  create: (id, serialized, scene) => {
    const ctx: StateContext = { scene };
    const fsm = new FiniteStateMachine<
      string,
      string,
      StateContext
    >({
      initial: serialized.initial,
      transitions: serialized.transitions.map(
        (t) => ({
          from: t.from,
          to: t.to,
          event: t.event,
          afterMs: t.afterMs,
        })
      ),
    });

    return {
      fsm,
      current: fsm.state,
      previous: fsm.previous,
      timeInStateMs: fsm.timeInStateMs,
    };
  },
  update: (serialized, scene, component) => {
    // Keep component mirrors in sync (no-op by default, transitions happen via systems)
    component.current = component.fsm.state;
    component.previous = component.fsm.previous;
    component.timeInStateMs =
      component.fsm.timeInStateMs;
  },
  delete: ({}) => {},
  deps: [],
};
