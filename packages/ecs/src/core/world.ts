import { PrefabName, prefabs } from "../prefabs";
import {
  Components,
  components,
} from "../components";
import { Scene } from "@babylonjs/core";
import {
  Archetype,
  ArchetypeId,
  ComponentIdMap,
  createArchetype,
  createArchetypeId,
  addEntityToArchetype,
  removeEntityFromArchetype,
  archetypeMatches,
} from "./archetype";
import { EntityRegistry } from "./entity";
import { SystemRegistry } from "./system-registry";
import { System } from "../systems/base";

export type IWorld = {
  spawn: (prefab: PrefabName) => number;
  kill: (entity: number) => void;
  query: <K extends Array<keyof Components>>(
    components: K
  ) => {
    [J in K[number]]: Components[J];
  }[];
  registerSystem: (
    name: string,
    components: (keyof Components)[]
  ) => void;
  getArchetypesForSystem: (
    systemName: string
  ) => Archetype[];
};

export class World implements IWorld {
  private entityRegistry = new EntityRegistry();
  private archetypes = new Map<
    ArchetypeId,
    Archetype
  >();
  private systemRegistry: SystemRegistry;
  private componentIdMap: ComponentIdMap;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;

    // Create component ID mapping
    this.componentIdMap = {} as ComponentIdMap;
    let index = 0;
    for (const key of Object.keys(
      components
    ) as (keyof Components)[]) {
      this.componentIdMap[key] = index++;
    }

    this.systemRegistry = new SystemRegistry(
      this.componentIdMap
    );
  }

  spawn(prefabName: PrefabName): number {
    const prefab = prefabs[prefabName];
    const entityId =
      this.entityRegistry.createEntity();

    // Get components from prefab
    const prefabComponents = Object.keys(
      prefab
    ) as (keyof Components)[];
    const archetypeId = createArchetypeId(
      prefabComponents,
      this.componentIdMap
    );

    // Get or create archetype
    let archetype =
      this.archetypes.get(archetypeId);
    if (!archetype) {
      archetype = createArchetype(
        archetypeId,
        prefabComponents
      );
      this.archetypes.set(archetypeId, archetype);
    }

    // Create component instances
    const componentInstances: Partial<Components> =
      {};
    for (const componentName of prefabComponents) {
      const componentDef =
        components[componentName];
      const serialized = prefab[componentName];
      if (serialized && componentDef) {
        // Get dependencies
        const deps: any = {};
        for (const dep of componentDef.deps ||
          []) {
          if (componentInstances[dep]) {
            deps[dep] = componentInstances[dep];
          }
        }

        componentInstances[componentName] =
          componentDef.create(
            entityId,
            serialized as any,
            this.scene,
            deps
          ) as any;
      }
    }

    // Add entity to archetype
    addEntityToArchetype(
      archetype,
      entityId,
      componentInstances
    );
    this.entityRegistry.setEntityArchetype(
      entityId,
      archetypeId,
      prefabComponents
    );

    return entityId;
  }

  kill(entityId: number): void {
    const entity =
      this.entityRegistry.getEntity(entityId);
    if (!entity) return;

    const archetype = this.archetypes.get(
      entity.archetypeId
    );
    if (archetype) {
      // Call delete on components
      const index =
        archetype.entityToIndex.get(entityId);
      if (index !== undefined) {
        for (const [
          componentName,
          array,
        ] of Object.entries(
          archetype.componentArrays
        )) {
          if (array && array[index]) {
            const componentDef =
              components[
                componentName as keyof Components
              ];
            if (
              componentDef &&
              componentDef.delete
            ) {
              // Get dependencies
              const deps: any = {};
              for (const dep of componentDef.deps ||
                []) {
                const depArray =
                  archetype.componentArrays[dep];
                if (depArray && depArray[index]) {
                  deps[dep] = depArray[index];
                }
              }

              componentDef.delete(
                array[index] as any,
                deps
              );
            }
          }
        }
      }

      removeEntityFromArchetype(
        archetype,
        entityId
      );
    }

    this.entityRegistry.deleteEntity(entityId);
  }

  query<K extends Array<keyof Components>>(
    requiredComponents: K
  ): {
    [J in K[number]]: Components[J];
  }[] {
    const results: any[] = [];

    // Check all archetypes
    for (const archetype of this.archetypes.values()) {
      if (
        archetypeMatches(
          archetype,
          requiredComponents
        )
      ) {
        // Create result objects for this archetype
        for (
          let i = 0;
          i < archetype.entities.length;
          i++
        ) {
          const entity: any = {};

          for (const component of requiredComponents) {
            const array =
              archetype.componentArrays[
                component
              ];
            if (array) {
              entity[component] = array[i];
            }
          }

          results.push(entity);
        }
      }
    }

    return results;
  }

  registerSystem(
    name: string,
    components: (keyof Components)[]
  ): void {
    this.systemRegistry.registerSystem(
      name,
      components
    );

    // Precompute archetypes based on system requirements
    const archetypeIds =
      this.systemRegistry.getAllArchetypeIds();
    for (const id of archetypeIds) {
      if (!this.archetypes.has(id)) {
        // Determine which components this archetype should have
        const componentList: (keyof Components)[] =
          [];
        for (const [
          compName,
          bitIndex,
        ] of Object.entries(
          this.componentIdMap
        )) {
          if (id & (1 << bitIndex)) {
            componentList.push(
              compName as keyof Components
            );
          }
        }

        const archetype = createArchetype(
          id,
          componentList
        );
        this.archetypes.set(id, archetype);
      }
    }
  }

  getArchetypesForSystem(
    systemName: string
  ): Archetype[] {
    const archetypeIds =
      this.systemRegistry.getArchetypesForSystem(
        systemName
      );
    return archetypeIds
      .map((id) => this.archetypes.get(id))
      .filter(
        (arch): arch is Archetype =>
          arch !== undefined
      );
  }
}
