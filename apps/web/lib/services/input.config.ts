import { SerializedState } from "ecs/src/components/state";

export const inputConfig = {
  defaultState: {
    locomotion: {
      initial: "idle",
      transitions: [
        // Movement start/stop (disabled when falling via system guards)
        { from: "idle", to: "walk" },
        { from: "walk", to: "idle" },

        // Run toggle
        { from: "walk", to: "run" },
        { from: "run", to: "walk" },
        { from: "run", to: "idle" },

        // Jump -> Falling -> Idle
        { from: "idle", to: "jump" },
        { from: "walk", to: "jump" },
        { from: "run", to: "jump" },
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
      ],
    },
    action: {
      initial: "none",
      transitions: [
        // attack is allowed during jump/falling (composite)
        { from: "none", to: "attack" },
        {
          from: "attack",
          to: "none",
          afterMs: 300,
        },
      ],
    },
    cooldowns: {
      attack: 500,
    },
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

export type InputConfig = typeof inputConfig;
