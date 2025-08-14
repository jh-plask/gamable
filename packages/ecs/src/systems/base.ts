import { Components } from "../components";
import { Scene } from "@babylonjs/core";
import { systems } from ".";

export type System<
  K extends Array<keyof Components>,
  T extends Array<keyof typeof systems>,
> = (
  scene: Scene,
  query: K,
  deps: T
) => {
  update: (
    entities: {
      [J in K[number]]: Components[J];
    }[]
  ) => void;
  deps: K;
};
