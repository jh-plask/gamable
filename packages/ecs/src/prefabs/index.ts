import { player } from "./player";

export const prefabs = {
  player,
} as const;

export type Prefabs = typeof prefabs;
export type PrefabName = keyof Prefabs;
