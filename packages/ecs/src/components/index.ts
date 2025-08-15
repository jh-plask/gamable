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
import {
  mesh,
  MeshComponent,
  SerializedMesh,
} from "./mesh";

export const components = {
  transform,
  physics,
  state,
  control,
  look,
  mesh,
} as const;

export type Components = {
  transform: Transform;
  physics: Physics;
  state: State;
  control: Control;
  look: Look;
  mesh: MeshComponent;
};

export type SerializedComponents = {
  transform: SerializedTransform;
  physics: SerializedPhysics;
  state: SerializedState;
  control: SerializedControl;
  look: SerializedLook;
  mesh: SerializedMesh;
};
