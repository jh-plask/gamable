import { System } from "./base";

export const transform: System<
  ["transform", "state", "look"],
  []
> = (scene, query, deps) => {
  return {
    update: (entities) => {
      for (const {
        transform,
        state,
        look,
      } of entities) {
        const { transformNode } = transform;
        const {} = state;
        const { camera } = look;
      }
    },
    deps: ["transform", "state", "look"],
  };
};
