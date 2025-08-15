import { Scene } from "@babylonjs/core";
import { systems } from "../systems";
import { components as componentRegistry } from "../components";
import type {
  Components,
  SerializedComponents,
} from "../components";
import type { Services } from "../services/types";

type EntityId = number;

type EntityRecord = {
  id: EntityId;
  components: Partial<Components>;
};

export class World {
  private nextEntityId: number = 0;
  private entities = new Map<
    EntityId,
    EntityRecord
  >();
  private systemInstances: Array<
    ReturnType<
      (typeof systems)[keyof typeof systems]
    >
  > = [];

  constructor(
    private readonly scene: Scene,
    private services: Services = {}
  ) {
    // Instantiate all systems
    for (const factory of Object.values(
      systems
    )) {
      // query param is not used by our systems; they'll declare deps in the returned object
      const instance = (factory as any)(
        scene,
        []
      );
      this.systemInstances.push(instance);
    }
  }

  spawn(
    serialized: Partial<SerializedComponents>
  ): EntityId {
    const id = this.nextEntityId++;
    const created: Partial<Components> = {};

    // Create components honoring dependencies by iterating until all resolvable are created
    const pending = new Set<
      keyof SerializedComponents
    >(
      Object.keys(
        serialized
      ) as (keyof SerializedComponents)[]
    );

    let progressed = true;
    while (pending.size && progressed) {
      progressed = false;
      for (const key of Array.from(pending)) {
        const factory = (
          componentRegistry as any
        )[key];
        if (!factory) {
          pending.delete(key);
          continue;
        }
        const deps: (keyof Components)[] =
          factory.deps ?? [];
        const hasAllDeps = deps.every(
          (d) => created[d] !== undefined
        );
        if (!hasAllDeps) continue;
        const depObjects: any = {};
        for (const d of deps)
          depObjects[d] = created[d]!;
        const instance = factory.create(
          id,
          (serialized as any)[key],
          this.scene,
          depObjects
        );
        (created as any)[key] = instance;
        pending.delete(key);
        progressed = true;
      }
    }

    if (pending.size) {
      throw new Error(
        `Unresolved component dependencies for entity ${id}: ${Array.from(pending).join(", ")}`
      );
    }

    this.entities.set(id, {
      id,
      components: created,
    });
    return id;
  }

  update(): void {
    const deltaMs = this.scene
      .getEngine()
      .getDeltaTime();

    for (const service of Object.values(
      this.services
    )) {
      service.update(this.entities);
    }

    // Build per-system entity views based on declared deps
    for (const system of this.systemInstances) {
      const deps =
        system.deps as (keyof Components)[];
      const view: any[] = [];
      for (const {
        components,
      } of this.entities.values()) {
        let ok = true;
        for (const d of deps)
          if (!(d in components)) {
            ok = false;
            break;
          }
        if (!ok) continue;
        const row: any = {};
        for (const d of deps)
          row[d] = (components as any)[d];
        view.push(row);
      }
      system.update(view, this.services);
    }
  }

  destroyEntity(id: EntityId): void {
    const record = this.entities.get(id);
    if (!record) return;
    // Call delete hooks in reverse dep order best-effort
    const keys = Object.keys(
      record.components
    ) as (keyof Components)[];
    for (const key of keys) {
      const factory = (componentRegistry as any)[
        key
      ];
      if (factory?.delete) {
        factory.delete(
          (record.components as any)[key],
          record.components
        );
      }
    }
    this.entities.delete(id);
  }

  // Allow external services to iterate entities with specific components
  forEach<K extends Array<keyof Components>>(
    deps: K,
    cb: (row: {
      [J in K[number]]: Components[J];
    }) => void
  ): void {
    const required = new Set<keyof Components>(
      deps
    );
    for (const {
      components,
    } of this.entities.values()) {
      let ok = true;
      for (const d of required)
        if (!(d in components)) {
          ok = false;
          break;
        }
      if (!ok) continue;
      const row: any = {};
      for (const d of required)
        row[d] = (components as any)[d];
      cb(row);
    }
  }
}
