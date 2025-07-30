# Spaceship Impostor - Among Us Clone

A real-time multiplayer social deduction game built with React, TypeScript, Express.js, and WebSockets.

## Features

- **Real-time Multiplayer**: WebSocket-based communication for instant game updates
- **Complete Game Flow**: Home → Lobby → Game → Results
- **Interactive Gameplay**: 
  - Player movement with WASD/arrow keys
  - Task completion mini-games
  - Emergency meetings and voting system
  - Real-time chat during discussions
  - Role assignment (Crewmates vs Impostors)
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Wouter** for routing
- **TanStack Query** for state management
- **Shadcn/ui** component library
- **Tailwind CSS** for styling

### Backend
- **Express.js** with TypeScript
- **WebSocket Server** for real-time communication
- **In-memory storage** for game state
- **Drizzle ORM** with PostgreSQL schema (ready for database integration)

## Deployment

This application is configured for deployment on two platforms:

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Frontend to Vercel

1. **Fork/Clone the repository**

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Set the build settings:
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/dist`
     - Install Command: `cd client && npm install`

3. **Environment Variables:**
   - Set `VITE_BACKEND_URL` to your Render backend URL (e.g., `your-backend.onrender.com`)

#### Deploy Backend to Render

1. **Create a new Web Service on Render**

2. **Configure the service:**
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment: `Node`

3. **Environment Variables:**
   - Set `NODE_ENV` to `production`
   - Add any database URLs if using external database

### Option 2: All-in-One Deployment

#### Render Web Service (Full Stack)

1. **Create a new Web Service on Render**

2. **Configure:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Environment Variables:**
   - Set `NODE_ENV` to `production`

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open http://localhost:5000 in your browser
   - The development server serves both frontend and backend

## Game Rules

### Crewmates
- Complete all tasks to win
- Find and vote out impostors
- Call emergency meetings when suspicious
- Report dead bodies

### Impostors
- Eliminate crewmates without being caught
- Sabotage the ship systems
- Blend in during discussions
- Avoid being voted out

### Controls
- **Movement**: WASD or Arrow keys
- **Interact**: Spacebar (for tasks, use buttons, etc.)
- **Actions**: Use the action buttons in the side panel

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Route components
│   │   └── lib/           # Utilities and configurations
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                 # Backend Express application
│   ├── routes.ts          # WebSocket and API routes
│   ├── storage.ts         # In-memory data storage
│   ├── package.json       # Backend dependencies
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Game data models and types
├── vercel.json            # Vercel deployment config
├── render.yaml            # Render deployment config
└── package.json           # Root project configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or building your own games!