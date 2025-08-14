import { SerializedComponents } from "../components";

export type Prefab = {
  [K in keyof SerializedComponents]?: Partial<
    SerializedComponents[K]
  >;
};
