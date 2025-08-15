import type { Service } from "ecs/src/services/types";
import type { World } from "ecs/src/core/world";
import type { Scene } from "@babylonjs/core";
import { inputConfig } from "./input.config";
import { State } from "ecs/src/components/state";

export const input: Service<
  ["state"],
  typeof inputConfig
> = (scene, config) => {
  const pressedKeys = new Set<string>();
  const justPressedKeys = new Set<string>();

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if (!pressedKeys.has(e.code))
        justPressedKeys.add(e.code);
      pressedKeys.add(e.code);
    });
    window.addEventListener("keyup", (e) => {
      pressedKeys.delete(e.code);
      justPressedKeys.delete(e.code);
    });
  }

  return {
    deps: ["state"],
    update(entities) {
      const now = performance.now();
      const {
        moveKeys,
        runKeys,
        jumpKeys,
        attackKeys,
      } = config.input;

      entities.forEach(({ state }) => {
        const isFalling =
          state.currentLocomotion === "falling";
        const isOnGround = !isFalling;

        const wantsMove = moveKeys.some((k) =>
          pressedKeys.has(k)
        );
        const wantsRun = runKeys.some((k) =>
          pressedKeys.has(k)
        );
        const wantsJump = jumpKeys.some((k) =>
          justPressedKeys.has(k)
        );

        // advance timers
        state.locomotion.update(now, {
          scene,
        });
        state.action.update(now, { scene });

        if (isOnGround) {
          if (wantsJump) {
            state.locomotion.tryTransition(
              "jump",
              { scene }
            );
          } else if (wantsMove) {
            if (
              wantsRun &&
              state.locomotion.canTransition(
                "run",
                { scene }
              )
            ) {
              state.locomotion.tryTransition(
                "run",
                { scene }
              );
            } else if (
              state.locomotion.canTransition(
                "walk",
                { scene }
              )
            ) {
              state.locomotion.tryTransition(
                "walk",
                { scene }
              );
            }
          } else {
            if (
              state.locomotion.canTransition(
                "idle",
                { scene }
              )
            ) {
              state.locomotion.tryTransition(
                "idle",
                { scene }
              );
            }
          }
        }

        const wantAttack = attackKeys.some((k) =>
          justPressedKeys.has(k)
        );
        if (
          wantAttack &&
          state.action.state === "none"
        ) {
          const cdMs =
            config.defaultState.cooldowns
              ?.attack ?? 0;
          const until =
            state.cooldownUntilMs["attack"] ?? 0;
          if (now >= until) {
            if (
              state.action.tryTransition(
                "attack",
                { scene }
              )
            ) {
              if (cdMs > 0) {
                state.cooldownUntilMs["attack"] =
                  now + cdMs;
              }
            }
          }
        }

        state.currentLocomotion =
          state.locomotion.state;
        state.previousLocomotion =
          state.locomotion.previous;
        state.timeInLocomotionMs =
          state.locomotion.timeInStateMs;
        state.currentAction = state.action.state;
        state.previousAction =
          state.action.previous;
        state.timeInActionMs =
          state.action.timeInStateMs;
      });

      justPressedKeys.clear();
    },
  };
};
