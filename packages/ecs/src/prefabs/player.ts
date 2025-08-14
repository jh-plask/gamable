import { Prefab } from "./base";

export const player: Prefab = {
  transform: {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  physics: {
    shape: {
      type: "capsule",
      start: [0, 0, 0],
      end: [0, 0, 0],
      radius: 0.5,
    },
  },
};
