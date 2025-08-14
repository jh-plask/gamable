import { System } from "../systems/base";
import { Components } from "../components";
import {
  ArchetypeId,
  ComponentIdMap,
  createArchetypeId,
} from "./archetype";

export interface SystemQuery {
  name: string;
  components: (keyof Components)[];
  archetypeIds: ArchetypeId[];
}

export class SystemRegistry {
  private systems: Map<string, SystemQuery> =
    new Map();
  private archetypeToSystems: Map<
    ArchetypeId,
    Set<string>
  > = new Map();
  private allArchetypeIds: Set<ArchetypeId> =
    new Set();

  constructor(
    private componentIdMap: ComponentIdMap
  ) {}

  // Register a system and its query
  registerSystem(
    name: string,
    components: (keyof Components)[]
  ): void {
    const query: SystemQuery = {
      name,
      components,
      archetypeIds: [],
    };

    this.systems.set(name, query);
    this.computeArchetypesForSystem(query);
  }

  // Get all unique archetype IDs needed by all systems
  getAllArchetypeIds(): ArchetypeId[] {
    return Array.from(this.allArchetypeIds);
  }

  // Get systems that need to run on a specific archetype
  getSystemsForArchetype(
    archetypeId: ArchetypeId
  ): string[] {
    return Array.from(
      this.archetypeToSystems.get(archetypeId) ||
        []
    );
  }

  // Get archetype IDs that a system needs to iterate over
  getArchetypesForSystem(
    systemName: string
  ): ArchetypeId[] {
    const query = this.systems.get(systemName);
    return query ? query.archetypeIds : [];
  }

  // Precompute all possible archetypes based on system queries
  private computeArchetypesForSystem(
    query: SystemQuery
  ): void {
    // Generate all possible supersets of the required components
    const allComponentKeys = Object.keys(
      this.componentIdMap
    ) as (keyof Components)[];
    const requiredComponents = new Set(
      query.components
    );

    // Use bit manipulation to generate all possible combinations
    const totalCombinations =
      1 << allComponentKeys.length;

    for (
      let mask = 0;
      mask < totalCombinations;
      mask++
    ) {
      const components: (keyof Components)[] = [];

      // Build component list from bitmask
      for (
        let i = 0;
        i < allComponentKeys.length;
        i++
      ) {
        if (mask & (1 << i)) {
          const componentKey =
            allComponentKeys[i];
          if (componentKey) {
            components.push(componentKey);
          }
        }
      }

      // Check if this combination includes all required components
      if (
        query.components.every((comp) =>
          components.includes(comp)
        )
      ) {
        const archetypeId = createArchetypeId(
          components,
          this.componentIdMap
        );
        query.archetypeIds.push(archetypeId);
        this.allArchetypeIds.add(archetypeId);

        // Map archetype to system
        if (
          !this.archetypeToSystems.has(
            archetypeId
          )
        ) {
          this.archetypeToSystems.set(
            archetypeId,
            new Set()
          );
        }
        this.archetypeToSystems
          .get(archetypeId)!
          .add(query.name);
      }
    }
  }
}
