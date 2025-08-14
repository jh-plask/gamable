import { Components } from "../components";
import { ArchetypeId } from "./archetype";

// Entity metadata
export interface EntityData {
  id: number;
  archetypeId: ArchetypeId;
  components: Set<keyof Components>;
}

// Entity registry to track all entities
export class EntityRegistry {
  private entities: Map<number, EntityData> =
    new Map();
  private nextEntityId: number = 0;

  createEntity(): number {
    const id = this.nextEntityId++;
    this.entities.set(id, {
      id,
      archetypeId: 0,
      components: new Set(),
    });
    return id;
  }

  deleteEntity(id: number): void {
    this.entities.delete(id);
  }

  getEntity(id: number): EntityData | undefined {
    return this.entities.get(id);
  }

  setEntityArchetype(
    id: number,
    archetypeId: ArchetypeId,
    components: (keyof Components)[]
  ): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.archetypeId = archetypeId;
      entity.components = new Set(components);
    }
  }

  hasEntity(id: number): boolean {
    return this.entities.has(id);
  }
}
