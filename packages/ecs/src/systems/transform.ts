import { System } from "./base";
import { Archetype } from "../core/archetype";

export const transform: System<
  ["transform", "state", "look"],
  []
> = (scene, query, deps) => {
  return {
    update: (world, entities) => {
      for (const {
        transform,
        state,
        look,
      } of entities) {
        const { transformNode } = transform;
        const {} = state;
        const { camera } = look;

        // Example: Update transform based on state
        // transformNode.position = ...;
      }
    },
    updateArchetype: (
      world,
      archetype,
      componentArrays
    ) => {
      const transforms =
        componentArrays.transform;
      const states = componentArrays.state;
      const looks = componentArrays.look;

      if (!transforms || !states || !looks)
        return;

      // Efficient iteration over arrays
      for (
        let i = 0;
        i < archetype.entities.length;
        i++
      ) {
        const transform = transforms[i];
        const state = states[i];
        const look = looks[i];

        if (!transform || !state || !look)
          continue;

        const { transformNode } = transform;
        const {} = state;
        const { camera } = look;

        // Example: Update transform based on state
        // transformNode.position = ...;
      }
    },
    deps: ["transform", "state", "look"],
  };
};
