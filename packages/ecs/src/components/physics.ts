import {
  Quaternion,
  Vector3,
  Scene,
  Mesh,
  PhysicsShape,
  PhysicsShapeBox,
  PhysicsShapeSphere,
  PhysicsShapeCapsule,
  PhysicsShapeConvexHull,
  PhysicsShapeMesh,
} from "@babylonjs/core";
import { Component } from "./base";

export type SerializedPhysics = {
  shape:
    | {
        type: "box";
        center: number[];
        rotation: number[];
        dimensions: number[];
      }
    | {
        type: "sphere";
        center: number[];
        radius: number;
      }
    | {
        type: "capsule";
        start: number[];
        end: number[];
        radius: number;
      }
    | {
        type: "convex";
        meshId: string;
      }
    | {
        type: "mesh";
        meshId: string;
      };
};

export type Physics = {
  shape: PhysicsShape;
};

type ShapeType =
  SerializedPhysics["shape"]["type"];
type ShapeByType<T extends ShapeType> = Extract<
  SerializedPhysics["shape"],
  { type: T }
>;
type Factory = {
  [T in ShapeType]: (
    s: ShapeByType<T>,
    scene: Scene
  ) => PhysicsShape;
};

const factory: Factory = {
  box: (
    s: {
      type: "box";
      center: number[];
      rotation: number[];
      dimensions: number[];
    },
    scene: Scene
  ) =>
    new PhysicsShapeBox(
      Vector3.FromArray(s.center),
      Quaternion.FromArray(s.rotation),
      Vector3.FromArray(s.dimensions),
      scene
    ),
  sphere: (
    s: {
      type: "sphere";
      center: number[];
      radius: number;
    },
    scene: Scene
  ) =>
    new PhysicsShapeSphere(
      Vector3.FromArray(s.center),
      s.radius,
      scene
    ),
  capsule: (
    s: {
      type: "capsule";
      start: number[];
      end: number[];
      radius: number;
    },
    scene: Scene
  ) =>
    new PhysicsShapeCapsule(
      Vector3.FromArray(s.start),
      Vector3.FromArray(s.end),
      s.radius,
      scene
    ),
  convex: (
    s: { type: "convex"; meshId: string },
    scene: Scene
  ) => {
    const mesh = scene.getMeshById(s.meshId);
    if (!mesh || !(mesh instanceof Mesh)) {
      throw new Error(
        `Mesh with id "${s.meshId}" not found for convex shape`
      );
    }
    return new PhysicsShapeConvexHull(
      mesh,
      scene
    );
  },
  mesh: (
    s: { type: "mesh"; meshId: string },
    scene: Scene
  ) => {
    const mesh = scene.getMeshById(s.meshId);
    if (!mesh || !(mesh instanceof Mesh)) {
      throw new Error(
        `Mesh with id "${s.meshId}" not found for mesh shape`
      );
    }
    return new PhysicsShapeMesh(mesh, scene);
  },
};

function makeShape(
  s: SerializedPhysics["shape"],
  scene: Scene
): PhysicsShape {
  return factory[s.type](s as any, scene);
}

export const physics: Component<
  SerializedPhysics,
  Physics
> = {
  create: (id, { shape: s }, scene) => {
    const shape = makeShape(s, scene);
    return {
      shape,
    };
  },
  update: (serialized, scene, component) => {
    console.warn(
      "Physics shape cannot be updated"
    );
  },
  delete: ({ shape }) => {
    shape.dispose();
  },
  deps: [],
};
