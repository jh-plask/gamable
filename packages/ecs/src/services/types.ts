import type { Scene } from "@babylonjs/core";
import type { World } from "../core/world";
import { Components } from "../components";
import { DeepPartial } from "../utils/deep";

export type Service<
  K extends Array<keyof Components>,
  T extends object,
> = (
  scene: Scene,
  config: T
) => {
  update: (
    entities: {
      [J in K[number]]: Components[J];
    }[]
  ) => void;
  deps: K;
};

export type Services = Record<
  string,
  ReturnType<Service<any, any>>
>;
