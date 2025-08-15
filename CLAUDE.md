# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pnpm monorepo setup for a game using PartyKit with client and server applications that share an Entity Component System (ECS) library. The monorepo is based on shadcn/ui template with Turbo for build orchestration.

## Architecture

### Monorepo Structure
- **apps/web**: Next.js game client web application with shadcn/ui components and PartyKit integration
- **apps/server**: PartyKit game server with ECS integration for authoritative game state
- **packages/ecs**: Custom ECS library shared between client and server (uses Babylon.js)
- **packages/ui**: Shared UI components built with shadcn/ui
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configuration

### ECS Library Architecture
The ECS system in `packages/ecs` follows these principles:
- **Pure Systems**: Systems are pure functions that operate on component data
- **Prebuilt Archetypes**: Entity archetypes are precomputed based on system dependencies for performance
- **Component CRUD**: Components have create/update/delete lifecycle methods
- **Prefab Sharing**: Entity prefabs are designed to be shared between client and server
- **World API**: The World class exposes minimal interface: `spawn`, `kill`, `query`, `registerSystem`, `getArchetypesForSystem`

Key ECS files:
- `src/core/world.ts`: Main World class implementation
- `src/core/archetype.ts`: Archetype system for entity organization
- `src/components/`: Component definitions
- `src/systems/`: System implementations
- `src/prefabs/`: Entity prefab definitions

## Common Development Commands

### Root Level Commands
- `pnpm dev`: Start development servers for all apps
- `pnpm build`: Build all packages and apps
- `pnpm lint`: Run linting across all workspaces
- `pnpm typecheck`: Run TypeScript checking across all workspaces
- `pnpm format`: Format code with Prettier

### Web App Commands (from root)
- `pnpm --filter web dev`: Start Next.js dev server with Turbopack
- `pnpm --filter web build`: Build the web application
- `pnpm --filter web lint`: Lint the web application
- `pnpm --filter web typecheck`: Run TypeScript type checking

### Server App Commands (from root)
- `pnpm --filter server dev`: Start PartyKit development server
- `pnpm --filter server deploy`: Deploy PartyKit server to production
- `pnpm --filter server typecheck`: Run TypeScript type checking

### Adding shadcn/ui Components
Add components to the shared UI package:
```bash
pnpm dlx shadcn@latest add [component-name] -c apps/web
```

### Package Dependencies
- Use `workspace:*` for internal package dependencies
- The ECS package depends on `@babylonjs/core` for 3D functionality
- UI components use `@workspace/ui` namespace
- PartyKit integration uses `partysocket` for client connections and `partykit` for server runtime

## Turbo Configuration
The project uses Turbo for:
- **build**: Dependency-aware building with caching
- **lint**: Parallel linting across workspaces  
- **typecheck**: TypeScript checking across workspaces
- **dev**: Development mode (cache disabled, persistent)
- **deploy**: PartyKit server deployment (cache disabled)

## PartyKit Integration

### Server (`apps/server`)
- Built with PartyKit server runtime
- Integrates with ECS system for authoritative game state
- Handles real-time multiplayer communication
- Runs game loop at 20 FPS for server-side updates
- Configuration in `partykit.json`

### Client (`apps/web`) 
- Uses `usePartySocket` hook from `partysocket/react` for WebSocket connections
- Custom `useGameClient` hook abstracts game-specific messaging
- Real-time input handling with WASD movement
- Displays player positions and game state
- Connects to PartyKit server for multiplayer functionality

### Key Files
- `apps/server/src/server.ts`: Main PartyKit server implementation
- `apps/server/src/game-world.ts`: Server-side ECS game world without Babylon.js
- `apps/web/hooks/use-game-client.ts`: Client-side PartyKit integration hook
- `apps/web/components/game.tsx`: Main game UI component