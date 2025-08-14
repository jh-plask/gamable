import { Components } from "../components";
import { Scene } from "@babylonjs/core";
import { systems } from ".";
import { IWorld } from "../core/world";
import { Archetype } from "../core/archetype";

export type System<
  K extends Array<keyof Components>,
  T extends Array<keyof typeof systems>,
> = (
  scene: Scene,
  query: K,
  deps: T
) => {
  update: (
    world: IWorld,
    entities: {
      [J in K[number]]: Components[J];
    }[]
  ) => void;
  updateArchetype?: (
    world: IWorld,
    archetype: Archetype,
    componentArrays: {
      [J in K[number]]: Components[J][];
    }
  ) => void;
  deps: K;
};

// Helper to run a system on all matching archetypes
export function runSystemOnArchetypes<
  K extends Array<keyof Components>,
>(
  world: IWorld,
  systemName: string,
  system: ReturnType<System<K, any>>
): void {
  const archetypes =
    world.getArchetypesForSystem(systemName);

  for (const archetype of archetypes) {
    if (system.updateArchetype) {
      // Use optimized archetype iteration
      const componentArrays: any = {};
      for (const dep of system.deps) {
        componentArrays[dep] =
          archetype.componentArrays[dep];
      }
      system.updateArchetype(
        world,
        archetype,
        componentArrays
      );
    } else {
      // Fallback to entity-based iteration
      const entities: any[] = [];
      for (
        let i = 0;
        i < archetype.entities.length;
        i++
      ) {
        const entity: any = {};
        for (const dep of system.deps) {
          const array =
            archetype.componentArrays[dep];
          if (array) {
            entity[dep] = array[i];
          }
        }
        entities.push(entity);
      }
      system.update(world, entities);
    }
  }
}
