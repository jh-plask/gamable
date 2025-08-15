import { SerializedState } from "../components/state";

export const stateSystemConfig = {
  defaultState: {
    initial: "idle",
    transitions: [
      // Movement start/stop
      {
        from: "idle",
        to: "walk",
        event: "move_start",
      },
      {
        from: "walk",
        to: "idle",
        event: "move_stop",
      },

      // Run toggle
      {
        from: "walk",
        to: "run",
        event: "run_start",
      },
      {
        from: "run",
        to: "walk",
        event: "run_stop",
      },
      {
        from: "run",
        to: "idle",
        event: "move_stop",
      },

      // Jump -> Falling -> Idle/Walk
      { from: "idle", to: "jump", event: "jump" },
      { from: "walk", to: "jump", event: "jump" },
      { from: "run", to: "jump", event: "jump" },
      {
        from: "jump",
        to: "falling",
        afterMs: 250,
      },
      {
        from: "falling",
        to: "idle",
        afterMs: 350,
      },

      // Attack from ground states
      {
        from: "idle",
        to: "attack",
        event: "attack_start",
      },
      {
        from: "walk",
        to: "attack",
        event: "attack_start",
      },
      {
        from: "run",
        to: "attack",
        event: "attack_start",
      },
      {
        from: "attack",
        to: "idle",
        afterMs: 300,
      },
    ],
  } as SerializedState,
  input: {
    moveKeys: [
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "ArrowRight",
    ],
    runKeys: ["ShiftLeft", "ShiftRight"],
    jumpKeys: ["Space"],
    attackKeys: ["KeyJ", "Mouse0"],
  } as const,
} as const;

export type StateSystemConfig =
  typeof stateSystemConfig;
