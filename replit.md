# Replit.md

## Overview

This is a real-time multiplayer social deduction game (similar to Among Us) built with a modern web stack. The application features a React frontend with TypeScript, an Express.js backend with WebSocket support, and uses Drizzle ORM with PostgreSQL for data persistence. Players can create and join game rooms, participate in discussions, vote on suspects, and complete tasks in a social deduction gameplay format.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with real-time communication:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React hooks with custom game state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds
- **Real-time Communication**: WebSocket client for game state synchronization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Real-time Communication**: WebSocket Server (ws library) for live game updates
- **Session Management**: In-memory session tracking for active players
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Setup**: Vite middleware integration for seamless development

## Key Components

### Database Schema (Drizzle ORM)
- **Games Table**: Stores game sessions with room codes, host info, game state, and settings
- **Players Table**: Player information including username, color, role, position, and game progress
- **Chat Messages Table**: Real-time chat messages during gameplay
- **Votes Table**: Voting records for elimination phases

### Game State Management
- **WebSocket Communication**: Real-time bidirectional communication between client and server
- **Session Tracking**: Active player sessions mapped to game instances
- **Game Flow**: Lobby → Playing → Voting → Results cycle
- **Role Assignment**: Automatic impostor/crewmate role distribution

### UI Components
- **Game Canvas**: HTML5 canvas for player movement and task interactions
- **Chat System**: Real-time messaging with player color coding
- **Voting Panel**: Interactive voting interface with timer
- **Task Modal**: Mini-game interface for task completion
- **Lobby Management**: Room creation, joining, and game settings

### Real-time Features
- **Live Player Movement**: Canvas-based movement with WebSocket synchronization
- **Chat Messages**: Instant message broadcasting to all players
- **Game State Updates**: Automatic UI updates when game state changes
- **Vote Tracking**: Real-time vote counting and display

## Data Flow

1. **Game Creation/Joining**: Players create or join games via room codes
2. **Lobby Phase**: Host configures game settings, players see live updates
3. **Game Start**: Server assigns roles and broadcasts initial game state
4. **Gameplay Phase**: 
   - Player movements tracked and synchronized
   - Task completion updates game progress
   - Emergency meetings and voting phases
5. **Real-time Updates**: All game state changes broadcast to connected players
6. **WebSocket Messages**: Structured message types for different game events

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript support
- **Component Library**: Radix UI primitives with Shadcn/ui wrapper components
- **Styling**: Tailwind CSS with PostCSS processing
- **State Management**: TanStack Query for server state, custom hooks for game state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: Neon PostgreSQL database via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **WebSocket**: ws library for WebSocket server implementation
- **Session Storage**: In-memory storage with interface for potential database backend
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Tools**: Drizzle Kit for schema management and migrations
- **Type Safety**: TypeScript throughout with strict configuration
- **Code Quality**: ESBuild for fast bundling and builds

## Deployment Strategy

The application is configured for production deployment using Vercel (frontend), Render (backend), and Neon (database):

### Development Environment
- **Local Development**: Unified development server on port 5000 with Vite integration
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Storage**: In-memory storage for development, database storage for production
- **Database**: Neon PostgreSQL connection for persistent data

### Production Architecture
- **Frontend Hosting**: Vercel for optimized React application deployment
- **Backend Hosting**: Render for Express.js server with WebSocket support
- **Database**: Neon PostgreSQL for game state, players, votes, and chat persistence
- **Real-time Communication**: WebSocket connections between Vercel frontend and Render backend

### Environment Configuration
- **Frontend Environment Variables**:
  - `VITE_API_URL`: Backend API endpoint for HTTP requests
  - `VITE_WS_URL`: Backend WebSocket endpoint for real-time features
- **Backend Environment Variables**:
  - `DATABASE_URL`: Neon PostgreSQL connection string
  - `NODE_ENV`: Production environment flag
  - `PORT`: Server port (10000 for Render)

### Deployment Files Created
- **DEPLOYMENT.md**: Complete step-by-step deployment guide
- **deployment-scripts.md**: Quick setup scripts and troubleshooting
- **frontend-package.json**: Frontend-only dependencies for Vercel
- **backend-package.json**: Backend-only dependencies for Render
- **frontend-vite.config.ts**: Optimized Vite configuration for separate deployment

### Database Integration
- **Development**: Memory storage with database interface
- **Production**: Full PostgreSQL integration with Drizzle ORM
- **Schema Management**: Automatic schema synchronization via `npm run db:push`
- **Real-time Data**: Game sessions, player states, votes, and chat messages persisted

The architecture supports scalable multiplayer gaming with persistent data storage and real-time synchronization optimized for cross-platform deployment.