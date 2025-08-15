import { PrefabName } from "ecs/src/prefabs";
import { SerializedComponents } from "ecs/src/components";

interface GameState {
  entities: Record<number, {
    id: number;
    components: Partial<SerializedComponents>;
  }>;
  players: Record<string, {
    playerId: string;
    entityId?: number;
  }>;
}

export class GameWorld {
  private state: GameState;
  private nextEntityId = 1;

  constructor() {
    this.state = {
      entities: {},
      players: {},
    };
  }

  spawnPlayer(playerId: string, spawnData?: any): number {
    const entityId = this.nextEntityId++;
    
    // Create player entity with basic components
    this.state.entities[entityId] = {
      id: entityId,
      components: {
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        state: {
          health: 100,
          score: 0,
          isAlive: true,
        },
        control: {
          playerId: playerId,
          inputBuffer: [],
        },
        look: {
          direction: { x: 0, y: 0, z: 1 },
          target: null,
        },
        physics: {
          velocity: { x: 0, y: 0, z: 0 },
          acceleration: { x: 0, y: 0, z: 0 },
          mass: 1,
        },
      },
    };

    // Track player
    this.state.players[playerId] = {
      playerId,
      entityId,
    };

    console.log(`Player ${playerId} spawned as entity ${entityId}`);
    return entityId;
  }

  removePlayer(entityId: number): void {
    // Find and remove player record
    for (const [playerId, player] of Object.entries(this.state.players)) {
      if (player.entityId === entityId) {
        delete this.state.players[playerId];
        break;
      }
    }

    // Remove entity
    delete this.state.entities[entityId];
    console.log(`Entity ${entityId} removed`);
  }

  handlePlayerInput(entityId: number, inputData: any): void {
    const entity = this.state.entities[entityId];
    if (!entity || !entity.components.control) {
      return;
    }

    // Add input to buffer
    entity.components.control.inputBuffer.push({
      ...inputData,
      timestamp: Date.now(),
    });

    // Keep only recent inputs (last 100ms)
    const now = Date.now();
    entity.components.control.inputBuffer = entity.components.control.inputBuffer.filter(
      (input: any) => now - input.timestamp < 100
    );
  }

  updatePlayerState(entityId: number, stateData: any): void {
    const entity = this.state.entities[entityId];
    if (!entity) {
      return;
    }

    // Update specific components based on state data
    if (stateData.transform && entity.components.transform) {
      Object.assign(entity.components.transform, stateData.transform);
    }

    if (stateData.look && entity.components.look) {
      Object.assign(entity.components.look, stateData.look);
    }
  }

  update(): void {
    // Process game logic
    for (const entity of Object.values(this.state.entities)) {
      this.processEntity(entity);
    }
  }

  private processEntity(entity: GameState["entities"][number]): void {
    const { components } = entity;
    
    // Process control inputs
    if (components.control && components.transform && components.physics) {
      const inputs = components.control.inputBuffer || [];
      
      for (const input of inputs) {
        switch (input.type) {
          case "move":
            if (components.physics.velocity) {
              components.physics.velocity.x += input.direction.x * 0.1;
              components.physics.velocity.z += input.direction.z * 0.1;
            }
            break;
          case "look":
            if (components.look) {
              components.look.direction = input.direction;
            }
            break;
        }
      }

      // Clear processed inputs
      components.control.inputBuffer = [];
    }

    // Apply physics
    if (components.physics && components.transform) {
      const vel = components.physics.velocity;
      const pos = components.transform.position;
      
      if (vel && pos) {
        pos.x += vel.x;
        pos.y += vel.y;
        pos.z += vel.z;

        // Apply friction
        vel.x *= 0.9;
        vel.y *= 0.9;
        vel.z *= 0.9;
      }
    }
  }

  getSerializableState(): GameState {
    return {
      entities: { ...this.state.entities },
      players: { ...this.state.players },
    };
  }

  getPlayerEntities(): Array<{ playerId: string; entityId: number; components: Partial<SerializedComponents> }> {
    return Object.values(this.state.players)
      .filter(player => player.entityId !== undefined)
      .map(player => ({
        playerId: player.playerId,
        entityId: player.entityId!,
        components: this.state.entities[player.entityId!]?.components || {},
      }));
  }
}