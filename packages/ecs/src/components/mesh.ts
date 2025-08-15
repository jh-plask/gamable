import {
  MeshBuilder,
  Mesh,
} from "@babylonjs/core";
import { Component } from "./base";

// Backward-compatible simple variants + full MeshBuilder coverage via options typed from method signatures
type BoxOptions = Parameters<
  typeof MeshBuilder.CreateBox
>[1];
type SphereOptions = Parameters<
  typeof MeshBuilder.CreateSphere
>[1];
type CylinderOptions = Parameters<
  typeof MeshBuilder.CreateCylinder
>[1];
type PlaneOptions = Parameters<
  typeof MeshBuilder.CreatePlane
>[1];
type TiledPlaneOptions = Parameters<
  typeof MeshBuilder.CreateTiledPlane
>[1];
type GroundOptions = Parameters<
  typeof MeshBuilder.CreateGround
>[1];
// CreateGroundFromHeightMap signature: (name, url, options, scene?)
type GroundFromHeightMapOptions = Parameters<
  typeof MeshBuilder.CreateGroundFromHeightMap
>[2];
type TiledGroundOptions = Parameters<
  typeof MeshBuilder.CreateTiledGround
>[1];
type DiscOptions = Parameters<
  typeof MeshBuilder.CreateDisc
>[1];
type IcoSphereOptions = Parameters<
  typeof MeshBuilder.CreateIcoSphere
>[1];
type PolyhedronOptions = Parameters<
  typeof MeshBuilder.CreatePolyhedron
>[1];
type TorusOptions = Parameters<
  typeof MeshBuilder.CreateTorus
>[1];
type TorusKnotOptions = Parameters<
  typeof MeshBuilder.CreateTorusKnot
>[1];
type TubeOptions = Parameters<
  typeof MeshBuilder.CreateTube
>[1];
type RibbonOptions = Parameters<
  typeof MeshBuilder.CreateRibbon
>[1];
type LinesOptions = Parameters<
  typeof MeshBuilder.CreateLines
>[1];
type DashedLinesOptions = Parameters<
  typeof MeshBuilder.CreateDashedLines
>[1];
type LineSystemOptions = Parameters<
  typeof MeshBuilder.CreateLineSystem
>[1];
type LatheOptions = Parameters<
  typeof MeshBuilder.CreateLathe
>[1];
type PolygonOptions = Parameters<
  typeof MeshBuilder.CreatePolygon
>[1];
type ExtrudePolygonOptions = Parameters<
  typeof MeshBuilder.ExtrudePolygon
>[1];
type ExtrudeShapeOptions = Parameters<
  typeof MeshBuilder.ExtrudeShape
>[1];
type ExtrudeShapeCustomOptions = Parameters<
  typeof MeshBuilder.ExtrudeShapeCustom
>[1];
// Capsule exists in recent BabylonJS
type CapsuleOptions = Parameters<
  typeof MeshBuilder.CreateCapsule
>[1];

export type SerializedMesh =
  | { type: "box"; options: BoxOptions }
  | { type: "sphere"; options: SphereOptions }
  | { type: "cylinder"; options: CylinderOptions }
  | { type: "plane"; options: PlaneOptions }
  | {
      type: "tiledPlane";
      options: TiledPlaneOptions;
    }
  | { type: "ground"; options: GroundOptions }
  | {
      type: "groundFromHeightMap";
      url: string;
      options: GroundFromHeightMapOptions;
    }
  | {
      type: "tiledGround";
      options: TiledGroundOptions;
    }
  | { type: "disc"; options: DiscOptions }
  | {
      type: "icoSphere";
      options: IcoSphereOptions;
    }
  | {
      type: "polyhedron";
      options: PolyhedronOptions;
    }
  | { type: "torus"; options: TorusOptions }
  | {
      type: "torusKnot";
      options: TorusKnotOptions;
    }
  | { type: "tube"; options: TubeOptions }
  | { type: "ribbon"; options: RibbonOptions }
  | { type: "lines"; options: LinesOptions }
  | {
      type: "dashedLines";
      options: DashedLinesOptions;
    }
  | {
      type: "lineSystem";
      options: LineSystemOptions;
    }
  | { type: "lathe"; options: LatheOptions }
  | { type: "polygon"; options: PolygonOptions }
  | {
      type: "extrudePolygon";
      options: ExtrudePolygonOptions;
    }
  | {
      type: "extrudeShape";
      options: ExtrudeShapeOptions;
    }
  | {
      type: "extrudeShapeCustom";
      options: ExtrudeShapeCustomOptions;
    }
  | { type: "capsule"; options: CapsuleOptions };

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
    switch (serialized.type) {
      case "box": {
        created = MeshBuilder.CreateBox(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      }
      case "sphere": {
        created = MeshBuilder.CreateSphere(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      }
      case "cylinder":
        created = MeshBuilder.CreateCylinder(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "plane":
        created = MeshBuilder.CreatePlane(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "tiledPlane":
        created = MeshBuilder.CreateTiledPlane(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "ground":
        created = MeshBuilder.CreateGround(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "groundFromHeightMap":
        created =
          MeshBuilder.CreateGroundFromHeightMap(
            `mesh-${id}`,
            serialized.url,
            serialized.options,
            scene
          );
        break;
      case "tiledGround":
        created = MeshBuilder.CreateTiledGround(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "disc":
        created = MeshBuilder.CreateDisc(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "icoSphere":
        created = MeshBuilder.CreateIcoSphere(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "polyhedron":
        created = MeshBuilder.CreatePolyhedron(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "torus":
        created = MeshBuilder.CreateTorus(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "torusKnot":
        created = MeshBuilder.CreateTorusKnot(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "tube":
        created = MeshBuilder.CreateTube(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "ribbon":
        created = MeshBuilder.CreateRibbon(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "lines":
        created = MeshBuilder.CreateLines(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "dashedLines":
        created = MeshBuilder.CreateDashedLines(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "lineSystem":
        created = MeshBuilder.CreateLineSystem(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "lathe":
        created = MeshBuilder.CreateLathe(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "polygon":
        created = MeshBuilder.CreatePolygon(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "extrudePolygon":
        created = MeshBuilder.ExtrudePolygon(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "extrudeShape":
        created = MeshBuilder.ExtrudeShape(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "extrudeShapeCustom":
        created = MeshBuilder.ExtrudeShapeCustom(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      case "capsule":
        created = MeshBuilder.CreateCapsule(
          `mesh-${id}`,
          serialized.options,
          scene
        );
        break;
      default:
        throw new Error(
          `Unsupported mesh type: ${(serialized as any).type}`
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
