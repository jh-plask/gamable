import { Components } from "../components";
import { Scene } from "@babylonjs/core";
import { Services } from "../services/types";

export type System<
  K extends Array<keyof Components>,
> = (
  scene: Scene,
  query: K
) => {
  update: (
    entities: {
      [J in K[number]]: Components[J];
    }[],
    services: Partial<Services>
  ) => void;
  deps: K;
};
