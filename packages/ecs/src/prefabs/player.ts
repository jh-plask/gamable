import { Prefab } from "./base";
import { stateSystemConfig } from "../systems/state.config";

export const player: Prefab = {
  transform: {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  mesh: { type: "box", size: 1 },
  state: {
    ...stateSystemConfig.defaultState,
  },
  physics: { motionType: "dynamic", mass: 1 },
};
