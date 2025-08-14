import {
  transform,
  Transform,
  SerializedTransform,
} from "./transform";
import {
  physics,
  Physics,
  SerializedPhysics,
} from "./physics";
import {
  state,
  State,
  SerializedState,
} from "./state";
import {
  control,
  Control,
  SerializedControl,
} from "./control";
import {
  look,
  Look,
  SerializedLook,
} from "./look";

export const components = {
  transform,
  physics,
  state,
  control,
  look,
} as const;

export type Components = {
  transform: Transform;
  physics: Physics;
  state: State;
  control: Control;
  look: Look;
};

export type SerializedComponents = {
  transform: SerializedTransform;
  physics: SerializedPhysics;
  state: SerializedState;
  control: SerializedControl;
  look: SerializedLook;
};
