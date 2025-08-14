# Archetype-based Entity Component System (ECS)

This package implements an efficient archetype-based ECS architecture optimized for performance through:

## Key Features

### 1. **Prebuilt Archetypes**
- Archetypes are precomputed based on system dependencies
- No dynamic archetype creation during entity spawning
- Systems declare their component requirements upfront

### 2. **Cache-Friendly Iteration**
- Components are stored in contiguous arrays within archetypes
- Systems iterate over dense arrays instead of sparse entity maps
- No component existence checks during iteration

### 3. **Efficient Entity Management**
- O(1) entity addition/removal within archetypes
- Swap-and-pop removal strategy to maintain array density
- Entity-to-index mapping for fast lookups

## Usage Example

```typescript
import { World } from "./core/world";
import { Scene } from "@babylonjs/core";

// Create world
const world = new World(scene);

// Register systems - this precomputes archetypes
world.registerSystem("transform", ["transform", "state", "look"]);

// Spawn entities
const player = world.spawn("player");

// Query entities
const entities = world.query(["transform", "physics"]);

// Kill entities
world.kill(player);
```

## Architecture

### Archetypes
Groups entities with the same component composition. Each archetype contains:
- Bitmask ID representing component types
- Dense arrays for each component type
- Entity ID list and index mapping

### System Registry
- Analyzes system dependencies at startup
- Precomputes all possible archetypes
- Maps archetypes to systems for efficient updates

### World
- Central manager for entities and archetypes
- Handles entity spawning/despawning
- Provides query API for custom logic

## Performance Benefits

1. **Memory Locality**: Components stored contiguously in arrays
2. **No Runtime Checks**: Component existence verified at archetype level
3. **Efficient Iteration**: Systems process entire arrays without conditionals
4. **Predictable Performance**: No dynamic allocations during gameplay
