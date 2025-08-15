import type { Service } from "ecs/src/services/types";
import { networkConfig } from "./network.config";

export const network: Service<
  ["state"],
  typeof networkConfig
> = (scene, config) => {
  const handlers = new Map<
    string,
    (payload: unknown) => void
  >();

  config.ws.addEventListener("message", (e) => {
    try {
      const { event, payload } = JSON.parse(
        e.data as any
      );
      const h = handlers.get(event);
      if (h) h(payload);
    } catch {}
  });

  return {
    deps: ["state"],
    update(entities) {
      entities.forEach(({ state }) => {
        state.timeInActionMs =
          state.action.timeInStateMs;
      });
    },
  };
};
