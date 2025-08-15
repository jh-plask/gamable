import {
  Scene,
  PhysicsBody,
  PhysicsMotionType,
} from "@babylonjs/core";
import { Component } from "./base";

export type SerializedPhysics = {
  motionType?: "dynamic" | "static" | "animated";
  mass?: number;
};

export type Physics = {
  body: PhysicsBody;
};

export const physics: Component<
  SerializedPhysics,
  Physics,
  ["mesh"]
> = {
  create: (
    id,
    { motionType, mass },
    scene,
    { mesh }
  ) => {
    const body = new PhysicsBody(
      mesh.mesh,
      motionType === "static"
        ? PhysicsMotionType.STATIC
        : motionType === "animated"
          ? PhysicsMotionType.ANIMATED
          : PhysicsMotionType.DYNAMIC,
      false,
      scene
    );

    if (typeof mass === "number") {
      (body as any).setMassProperties?.({ mass });
    }

    return { body };
  },
  update: (serialized, scene, component) => {
    console.warn(
      "Physics body cannot be updated at runtime"
    );
  },
  delete: ({ body }) => {
    try {
      body.dispose();
    } catch {}
  },
  deps: ["mesh"],
};
