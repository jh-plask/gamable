import { Prefab } from "./base";
import { stateSystemConfig } from "../../../../apps/web/lib/services/input.config";

export const player: Prefab = {
  transform: {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  mesh: { type: "box" },
  state: {
    ...stateSystemConfig.defaultState,
  },
  physics: { motionType: "dynamic", mass: 1 },
};
