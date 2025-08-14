import {
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Component } from "./base";

export type SerializedTransform = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    rx: number;
    ry: number;
    rz: number;
    rw: number;
  };
  scale: {
    sx: number;
    sy: number;
    sz: number;
  };
};

export type Transform = {
  transformNode: TransformNode;
};

export const transform: Component<
  SerializedTransform,
  Transform
> = {
  create: (
    id,
    { position, rotation, scale },
    scene
  ) => {
    const transformNode = new TransformNode(
      "transform",
      scene
    );

    const { x, y, z } = position;
    const { rx, ry, rz, rw } = rotation;
    const { sx, sy, sz } = scale;

    transformNode.position = new Vector3(x, y, z);
    transformNode.rotationQuaternion =
      new Quaternion(rx, ry, rz, rw);
    transformNode.scaling = new Vector3(
      sx,
      sy,
      sz
    );
    return {
      transformNode,
    };
  },
  update: (
    { position, rotation, scale },
    scene,
    { transformNode }
  ) => {
    const { x, y, z } = position;
    const { rx, ry, rz, rw } = rotation;
    const { sx, sy, sz } = scale;

    transformNode.position = new Vector3(x, y, z);
    transformNode.rotationQuaternion =
      new Quaternion(rx, ry, rz, rw);
    transformNode.scaling = new Vector3(
      sx,
      sy,
      sz
    );
  },
  delete: ({ transformNode }) => {
    transformNode.dispose();
  },
  deps: [],
};
