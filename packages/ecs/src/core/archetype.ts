import { Components } from "../components";

// Archetype ID is a bitmask representing which components are present
export type ArchetypeId = number;

// Component ID to bit position mapping
export type ComponentIdMap = Record<
  keyof Components,
  number
>;

// Single archetype containing entities with the same component composition
export interface Archetype {
  id: ArchetypeId;
  componentMask: Set<keyof Components>;
  entities: number[]; // Entity IDs
  componentArrays: Partial<{
    [K in keyof Components]: Components[K][];
  }>;
  entityToIndex: Map<number, number>; // Entity ID to index in arrays
}

// Creates a bitmask from component names
export function createArchetypeId(
  components: (keyof Components)[],
  componentIdMap: ComponentIdMap
): ArchetypeId {
  let mask = 0;
  for (const component of components) {
    mask |= 1 << componentIdMap[component];
  }
  return mask;
}

// Checks if an archetype contains all required components
export function archetypeMatches(
  archetype: Archetype,
  requiredComponents: (keyof Components)[]
): boolean {
  return requiredComponents.every((comp) =>
    archetype.componentMask.has(comp)
  );
}

// Creates a new empty archetype
export function createArchetype(
  id: ArchetypeId,
  components: (keyof Components)[]
): Archetype {
  const componentArrays: Partial<{
    [K in keyof Components]: Components[K][];
  }> = {};

  // Initialize empty arrays for each component
  for (const component of components) {
    componentArrays[component] = [];
  }

  return {
    id,
    componentMask: new Set(components),
    entities: [],
    componentArrays,
    entityToIndex: new Map(),
  };
}

// Adds an entity to an archetype
export function addEntityToArchetype(
  archetype: Archetype,
  entityId: number,
  components: Partial<Components>
): void {
  const index = archetype.entities.length;
  archetype.entities.push(entityId);
  archetype.entityToIndex.set(entityId, index);

  // Add component data to arrays
  for (const [key, value] of Object.entries(
    components
  )) {
    const componentKey = key as keyof Components;
    if (
      archetype.componentArrays[componentKey] &&
      value
    ) {
      (
        archetype.componentArrays[
          componentKey
        ] as any[]
      ).push(value);
    }
  }
}

// Removes an entity from an archetype
export function removeEntityFromArchetype(
  archetype: Archetype,
  entityId: number
): void {
  const index =
    archetype.entityToIndex.get(entityId);
  if (index === undefined) return;

  const lastIndex = archetype.entities.length - 1;
  const lastEntityId =
    archetype.entities[lastIndex];

  // Swap with last element and pop
  if (
    index !== lastIndex &&
    lastEntityId !== undefined
  ) {
    archetype.entities[index] = lastEntityId;
    archetype.entityToIndex.set(
      lastEntityId,
      index
    );

    // Swap component data
    for (const [key, array] of Object.entries(
      archetype.componentArrays
    )) {
      if (
        array &&
        array.length > 0 &&
        index < array.length &&
        lastIndex < array.length
      ) {
        (array as any[])[index] =
          array[lastIndex];
      }
    }
  }

  // Remove last element
  archetype.entities.pop();
  archetype.entityToIndex.delete(entityId);

  // Pop from component arrays
  for (const array of Object.values(
    archetype.componentArrays
  )) {
    if (array && array.length > 0) {
      array.pop();
    }
  }
}
