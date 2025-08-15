"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameClient } from "../hooks/use-game-client";
import { Button } from "@workspace/ui/components/button";

interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function Game() {
  const [hasJoined, setHasJoined] = useState(false);
  const [inputState, setInputState] = useState<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const {
    isConnected,
    playerId,
    playerEntities,
    joinGame,
    sendInput,
  } = useGameClient({
    onConnected: (id) => {
      console.log(`Game client connected as ${id}`);
    },
    onPlayerSpawned: (id, entityId) => {
      console.log(`Player ${id} spawned as entity ${entityId}`);
    },
    onGameUpdate: (entities) => {
      // Handle real-time game updates
      console.log(`Game update: ${entities.length} entities`);
    },
  });

  const handleJoinGame = useCallback(() => {
    if (!hasJoined) {
      joinGame({ name: `Player-${playerId?.slice(-4)}` });
      setHasJoined(true);
    }
  }, [hasJoined, joinGame, playerId]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newInputState = { ...inputState };
      let changed = false;

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          if (!newInputState.forward) {
            newInputState.forward = true;
            changed = true;
          }
          break;
        case "KeyS":
        case "ArrowDown":
          if (!newInputState.backward) {
            newInputState.backward = true;
            changed = true;
          }
          break;
        case "KeyA":
        case "ArrowLeft":
          if (!newInputState.left) {
            newInputState.left = true;
            changed = true;
          }
          break;
        case "KeyD":
        case "ArrowRight":
          if (!newInputState.right) {
            newInputState.right = true;
            changed = true;
          }
          break;
      }

      if (changed) {
        setInputState(newInputState);
        sendMovementInput(newInputState);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const newInputState = { ...inputState };
      let changed = false;

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          if (newInputState.forward) {
            newInputState.forward = false;
            changed = true;
          }
          break;
        case "KeyS":
        case "ArrowDown":
          if (newInputState.backward) {
            newInputState.backward = false;
            changed = true;
          }
          break;
        case "KeyA":
        case "ArrowLeft":
          if (newInputState.left) {
            newInputState.left = false;
            changed = true;
          }
          break;
        case "KeyD":
        case "ArrowRight":
          if (newInputState.right) {
            newInputState.right = false;
            changed = true;
          }
          break;
      }

      if (changed) {
        setInputState(newInputState);
        sendMovementInput(newInputState);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  const sendMovementInput = useCallback((input: InputState) => {
    if (!hasJoined) return;

    const direction = {
      x: (input.left ? -1 : 0) + (input.right ? 1 : 0),
      y: 0,
      z: (input.backward ? -1 : 0) + (input.forward ? 1 : 0),
    };

    sendInput({
      type: "move",
      direction,
      timestamp: Date.now(),
    });
  }, [hasJoined, sendInput]);

  const myEntity = playerEntities.find(entity => entity.playerId === playerId);
  const otherPlayers = playerEntities.filter(entity => entity.playerId !== playerId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Game Client</h1>
        
        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
          <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
          <div>Player ID: {playerId || "N/A"}</div>
          <div>Joined Game: {hasJoined ? "Yes" : "No"}</div>
        </div>

        {isConnected && !hasJoined && (
          <Button 
            onClick={handleJoinGame}
            className="w-full"
          >
            Join Game
          </Button>
        )}

        {hasJoined && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Controls</h3>
              <div className="text-sm text-gray-300">
                Use WASD or Arrow Keys to move
              </div>
              <div className="mt-2 flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${inputState.forward ? 'bg-green-600' : 'bg-gray-700'}`}>W</span>
                <span className={`px-2 py-1 rounded text-xs ${inputState.left ? 'bg-green-600' : 'bg-gray-700'}`}>A</span>
                <span className={`px-2 py-1 rounded text-xs ${inputState.backward ? 'bg-green-600' : 'bg-gray-700'}`}>S</span>
                <span className={`px-2 py-1 rounded text-xs ${inputState.right ? 'bg-green-600' : 'bg-gray-700'}`}>D</span>
              </div>
            </div>

            {myEntity && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">My Position</h3>
                <div className="text-sm">
                  <div>Entity ID: {myEntity.entityId}</div>
                  {myEntity.components.transform && (
                    <div>
                      Position: (
                      {myEntity.components.transform.position.x.toFixed(2)}, 
                      {myEntity.components.transform.position.y.toFixed(2)}, 
                      {myEntity.components.transform.position.z.toFixed(2)})
                    </div>
                  )}
                </div>
              </div>
            )}

            {otherPlayers.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Other Players ({otherPlayers.length})</h3>
                <div className="space-y-1 text-sm">
                  {otherPlayers.map((player) => (
                    <div key={player.playerId}>
                      {player.playerId.slice(-8)}: Entity {player.entityId}
                      {player.components.transform && (
                        <span className="text-gray-400 ml-2">
                          ({player.components.transform.position.x.toFixed(1)}, 
                          {player.components.transform.position.y.toFixed(1)}, 
                          {player.components.transform.position.z.toFixed(1)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}