import { Component } from "./base";

export type SerializedControl = {};

export type Control = {};

export const control: Component<
  SerializedControl,
  Control,
  ["state"]
> = {
  create: (serialized, scene) => {
    return {};
  },
  update: (serialized, scene, {}) => {},
  delete: ({}) => {},
  deps: ["state"],
};
