import {
  Quaternion,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";
import { Component } from "./base";

export type SerializedLook = {
  position: number[];
  rotation: number[];
};

export type Look = {
  camera: UniversalCamera;
};

export const look: Component<
  SerializedLook,
  Look,
  ["transform"]
> = {
  create: (
    id,
    { position, rotation },
    scene,
    { transform }
  ) => {
    const camera = new UniversalCamera(
      `camera-${id}`,
      Vector3.FromArray(position),
      scene
    );

    camera.rotationQuaternion =
      Quaternion.FromArray(rotation);
    camera.parent = transform.transformNode;

    return {
      camera,
    };
  },
  update: (
    serialized,
    scene,
    { camera },
    { transform }
  ) => {
    camera.position = Vector3.FromArray(
      serialized.position
    );
    camera.rotationQuaternion =
      Quaternion.FromArray(serialized.rotation);
    camera.parent = transform.transformNode;
  },
  delete: ({ camera }) => {
    camera.dispose();
    return {};
  },
  deps: ["transform"],
};
