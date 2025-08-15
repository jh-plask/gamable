import type * as Party from "partykit/server";
import { GameWorld } from "./game-world";

interface GameMessage {
  type: "join" | "input" | "state_update";
  data?: any;
}

interface PlayerInfo {
  id: string;
  entityId?: number;
  lastSeen: number;
}

export default class Server implements Party.Server {
  private gameWorld: GameWorld;
  private players = new Map<string, PlayerInfo>();
  private gameLoopInterval?: number;

  constructor(readonly room: Party.Room) {
    this.gameWorld = new GameWorld();
    this.startGameLoop();
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const playerId = conn.id;
    console.log(
      `Player connected:
  id: ${playerId}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // Track player
    this.players.set(playerId, {
      id: playerId,
      lastSeen: Date.now(),
    });

    // Send welcome message with current game state
    conn.send(JSON.stringify({
      type: "connected",
      playerId,
      gameState: this.gameWorld.getSerializableState(),
    }));

    // Notify other players
    this.broadcastExcept(playerId, {
      type: "player_connected",
      playerId,
    });
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data: GameMessage = JSON.parse(message);
      const playerId = sender.id;
      const player = this.players.get(playerId);

      if (!player) {
        console.warn(`Message from unknown player: ${playerId}`);
        return;
      }

      // Update last seen
      player.lastSeen = Date.now();

      switch (data.type) {
        case "join":
          this.handlePlayerJoin(player, data.data);
          break;
        case "input":
          this.handlePlayerInput(player, data.data);
          break;
        case "state_update":
          this.handleStateUpdate(player, data.data);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  onClose(conn: Party.Connection) {
    const playerId = conn.id;
    const player = this.players.get(playerId);

    if (player) {
      console.log(`Player disconnected: ${playerId}`);

      // Remove player entity from game world
      if (player.entityId !== undefined) {
        this.gameWorld.removePlayer(player.entityId);
      }

      this.players.delete(playerId);

      // Notify other players
      this.broadcastExcept(playerId, {
        type: "player_disconnected",
        playerId,
      });
    }
  }

  private handlePlayerJoin(player: PlayerInfo, data: any) {
    if (player.entityId !== undefined) {
      console.warn(`Player ${player.id} already joined`);
      return;
    }

    // Spawn player in game world
    const entityId = this.gameWorld.spawnPlayer(player.id, data);
    player.entityId = entityId;

    console.log(`Player ${player.id} joined as entity ${entityId}`);

    // Broadcast player spawn
    this.broadcast({
      type: "player_spawned",
      playerId: player.id,
      entityId,
    });
  }

  private handlePlayerInput(player: PlayerInfo, inputData: any) {
    if (player.entityId !== undefined) {
      this.gameWorld.handlePlayerInput(player.entityId, inputData);
    }
  }

  private handleStateUpdate(player: PlayerInfo, stateData: any) {
    if (player.entityId !== undefined) {
      this.gameWorld.updatePlayerState(player.entityId, stateData);
    }
  }

  private startGameLoop() {
    // Run game loop at 20 FPS (server-side, less intensive than client)
    this.gameLoopInterval = setInterval(() => {
      this.gameWorld.update();
      
      // Send game state updates to all connected players
      const playerEntities = this.gameWorld.getPlayerEntities();
      if (playerEntities.length > 0) {
        this.broadcast({
          type: "game_update",
          entities: playerEntities,
          timestamp: Date.now(),
        });
      }
    }, 1000 / 20) as unknown as number;
  }

  private broadcast(data: any) {
    this.room.broadcast(JSON.stringify(data));
  }

  private broadcastExcept(excludeId: string, data: any) {
    const message = JSON.stringify(data);
    for (const [id, conn] of this.room.connections) {
      if (id !== excludeId) {
        conn.send(message);
      }
    }
  }

  onError(connection: Party.Connection, error: Error) {
    console.error("Connection error:", error);
  }
}

Server satisfies Party.Worker;
