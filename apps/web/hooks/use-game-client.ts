import { useState, useCallback } from "react";
import usePartySocket from "partysocket/react";
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

interface PlayerEntity {
  playerId: string;
  entityId: number;
  components: Partial<SerializedComponents>;
}

interface GameMessage {
  type: string;
  [key: string]: any;
}

interface UseGameClientOptions {
  host?: string;
  room?: string;
  onConnected?: (playerId: string) => void;
  onPlayerSpawned?: (playerId: string, entityId: number) => void;
  onGameUpdate?: (entities: PlayerEntity[]) => void;
  onPlayerDisconnected?: (playerId: string) => void;
}

export function useGameClient({
  host = "localhost:1999",
  room = "game",
  onConnected,
  onPlayerSpawned,
  onGameUpdate,
  onPlayerDisconnected,
}: UseGameClientOptions = {}) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerEntities, setPlayerEntities] = useState<PlayerEntity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: GameMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case "connected":
          console.log(`Connected as player: ${message.playerId}`);
          setPlayerId(message.playerId);
          setGameState(message.gameState);
          onConnected?.(message.playerId);
          break;

        case "player_spawned":
          console.log(`Player ${message.playerId} spawned as entity ${message.entityId}`);
          onPlayerSpawned?.(message.playerId, message.entityId);
          break;

        case "game_update":
          if (message.entities) {
            setPlayerEntities(message.entities);
            onGameUpdate?.(message.entities);
          }
          break;

        case "player_disconnected":
          console.log(`Player ${message.playerId} disconnected`);
          onPlayerDisconnected?.(message.playerId);
          break;

        default:
          console.log("Unknown message type:", message.type, message);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }, [onConnected, onPlayerSpawned, onGameUpdate, onPlayerDisconnected]);

  const socket = usePartySocket({
    host,
    room,
    onOpen() {
      console.log("Connected to game server");
      setIsConnected(true);
    },
    onMessage: handleMessage,
    onClose() {
      console.log("Disconnected from game server");
      setIsConnected(false);
      setPlayerId(null);
      setGameState(null);
      setPlayerEntities([]);
    },
    onError(error) {
      console.error("WebSocket error:", error);
    },
  });

  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("Cannot send message: not connected");
    }
  }, [socket]);

  const joinGame = useCallback((spawnData?: any) => {
    sendMessage({
      type: "join",
      data: spawnData,
    });
  }, [sendMessage]);

  const sendInput = useCallback((inputData: any) => {
    sendMessage({
      type: "input",
      data: inputData,
    });
  }, [sendMessage]);

  const updateState = useCallback((stateData: any) => {
    sendMessage({
      type: "state_update",
      data: stateData,
    });
  }, [sendMessage]);

  return {
    isConnected,
    playerId,
    gameState,
    playerEntities,
    joinGame,
    sendInput,
    updateState,
  };
}