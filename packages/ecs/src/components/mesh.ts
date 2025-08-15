import {
  MeshBuilder,
  Mesh,
} from "@babylonjs/core";
import { Component } from "./base";

export type SerializedMesh =
  | { type: "box"; size: number }
  | { type: "sphere"; diameter: number };

export type MeshComponent = {
  mesh: Mesh;
};

export const mesh: Component<
  SerializedMesh,
  MeshComponent,
  ["transform"]
> = {
  create: (
    id,
    serialized,
    scene,
    { transform }
  ) => {
    let created: Mesh;
    if (serialized.type === "box") {
      created = MeshBuilder.CreateBox(
        `mesh-${id}`,
        { size: serialized.size },
        scene
      );
    } else {
      created = MeshBuilder.CreateSphere(
        `mesh-${id}`,
        { diameter: serialized.diameter },
        scene
      );
    }

    created.parent = transform.transformNode;
    return { mesh: created };
  },
  update: (serialized, scene, { mesh }) => {
    // No runtime updates yet
  },
  delete: ({ mesh }) => {
    mesh.dispose();
  },
  deps: ["transform"],
};
