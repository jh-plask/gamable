import { Scene } from "@babylonjs/core";
import { Components } from "./index";

export type Component<
  K extends object,
  T extends object,
  U extends Array<keyof Components> = [],
> = {
  create: (
    id: number,
    serialized: K,
    scene: Scene,
    deps: {
      [J in U[number]]: Components[J];
    }
  ) => T;
  update: (
    serialized: K,
    scene: Scene,
    component: T,
    deps: {
      [J in U[number]]: Components[J];
    }
  ) => void;
  delete: (
    component: T,
    deps: {
      [J in U[number]]: Components[J];
    }
  ) => void;
  deps: U;
};
