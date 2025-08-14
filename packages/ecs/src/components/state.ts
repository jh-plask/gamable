import { Component } from "./base";

export type SerializedState = {};

export type State = {};

export const state: Component<
  SerializedState,
  State
> = {
  create: (serialized, scene) => {
    return {};
  },
  update: (serialized, scene, {}) => {},
  delete: ({}) => {},
  deps: [],
};
