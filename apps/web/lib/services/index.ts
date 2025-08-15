import type { Services } from "ecs/src/services/types";
import { input } from "./input";
import { inputConfig } from "./input.config";
import { network } from "./network";
import { networkConfig } from "./network.config";
import { Scene } from "@babylonjs/core";
import {
  deepMerge,
  DeepPartial,
} from "ecs/src/utils/deep";

type ServiceConfigs = DeepPartial<{
  input: typeof inputConfig;
  network: typeof networkConfig;
}>;

export const setServices = (
  scene: Scene,
  configs: ServiceConfigs
) => {
  return {
    input: input(
      scene,
      deepMerge(inputConfig, configs.input ?? {})
    ),
    network: network(
      scene,
      deepMerge(
        networkConfig,
        configs.network ?? {}
      )
    ),
  };
};
