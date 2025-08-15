import { Component } from "./base";
import { FiniteStateMachine } from "../utils/fsm";
import { Scene } from "@babylonjs/core";

export type SerializedState = {
  // locomotion fsm (grounded/falling/jumping/walking)
  locomotion: {
    initial: string;
    transitions: {
      from: string;
      to: string;
      afterMs?: number;
      guard?: string; // name of guard to resolve in system config
    }[];
  };
  // action fsm (idle/attack)
  action: {
    initial: string;
    transitions: {
      from: string;
      to: string;
      afterMs?: number;
      guard?: string;
    }[];
  };
  // cooldowns by action name in ms
  cooldowns?: Record<string, number>;
};

export type StateContext = {
  scene: Scene;
};

export type State = {
  locomotion: FiniteStateMachine<
    string,
    StateContext
  >;
  action: FiniteStateMachine<
    string,
    StateContext
  >;
  // mirrors for convenience
  currentLocomotion: string;
  previousLocomotion: string | null;
  timeInLocomotionMs: number;

  currentAction: string;
  previousAction: string | null;
  timeInActionMs: number;

  // runtime cooldown tracking
  cooldownUntilMs: Record<string, number>;
};

export const state: Component<
  SerializedState,
  State
> = {
  create: (id, serialized, scene) => {
    const ctx: StateContext = { scene };
    const locomotion = new FiniteStateMachine<
      string,
      StateContext
    >({
      initial: serialized.locomotion.initial,
      transitions:
        serialized.locomotion.transitions.map(
          (t) => ({
            from: t.from,
            to: t.to,
            afterMs: t.afterMs,
          })
        ),
    });
    const action = new FiniteStateMachine<
      string,
      StateContext
    >({
      initial: serialized.action.initial,
      transitions:
        serialized.action.transitions.map(
          (t) => ({
            from: t.from,
            to: t.to,
            afterMs: t.afterMs,
          })
        ),
    });

    return {
      locomotion,
      action,
      currentLocomotion: locomotion.state,
      previousLocomotion: locomotion.previous,
      timeInLocomotionMs:
        locomotion.timeInStateMs,
      currentAction: action.state,
      previousAction: action.previous,
      timeInActionMs: action.timeInStateMs,
      cooldownUntilMs: {},
    };
  },
  update: (serialized, scene, component) => {
    component.currentLocomotion =
      component.locomotion.state;
    component.previousLocomotion =
      component.locomotion.previous;
    component.timeInLocomotionMs =
      component.locomotion.timeInStateMs;

    component.currentAction =
      component.action.state;
    component.previousAction =
      component.action.previous;
    component.timeInActionMs =
      component.action.timeInStateMs;
  },
  delete: ({}) => {},
  deps: [],
};
