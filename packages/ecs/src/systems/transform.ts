import { System } from "./base";
import { Vector3 } from "@babylonjs/core";

export const transform: System<
  ["transform", "state", "look"],
  []
> = (scene, query, deps) => {
  return {
    update: (entities) => {
      const now = scene
        .getEngine()
        .getDeltaTime();
      for (const {
        transform,
        state,
        look,
      } of entities) {
        const { transformNode } = transform;
        const { current, timeInStateMs } = state;
        const { camera } = look;

        // Example: small bobbing effect when walking or running
        if (
          current === "walk" ||
          current === "run"
        ) {
          const bob =
            Math.sin(timeInStateMs / 150) * 0.03;
          const base = transformNode.position;
          transformNode.position = new Vector3(
            base.x,
            base.y + bob,
            base.z
          );
        }
      }
    },
    deps: ["transform", "state", "look"],
  };
};
