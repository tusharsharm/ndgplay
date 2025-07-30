# Deployment Guide: Among Us Clone

This guide covers deploying your Among Us clone using:
- **Vercel** (Frontend hosting)
- **Render** (Backend hosting) 
- **Neon** (PostgreSQL database)

## 📋 Prerequisites

- GitHub account for code repositories
- Vercel account (free tier available)
- Render account (free tier available)
- Neon account (free tier available)

## 🏗️ Architecture Overview

```
Frontend (Vercel) ←→ Backend (Render) ←→ Database (Neon)
```

- **Frontend**: React app served by Vercel's CDN
- **Backend**: Express.js server with WebSocket support on Render
- **Database**: PostgreSQL database hosted on Neon

## 🗄️ Step 1: Setup Neon Database

### 1.1 Create Neon Project
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click "Create Project"
3. Choose your region (closest to your users)
4. Name your project (e.g., "among-us-clone")
5. Wait for database creation

### 1.2 Get Database Connection String
1. In your Neon dashboard, go to "Connection Details"
2. Copy the connection string (starts with `postgresql://`)
3. Save this for later - you'll need it for both local development and production

### 1.3 Setup Database Schema
1. In your local project, create a `.env` file:
```bash
DATABASE_URL="your_neon_connection_string_here"
```

2. Push the database schema:
```bash
npm run db:push
```

## 🖥️ Step 2: Prepare Code for Deployment

### 2.1 Create Separate Repositories
You need to split your code into two repositories:

#### Frontend Repository
Create a new repository with these files:
```
frontend/
├── client/
├── shared/
├── components.json
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts (modified for frontend-only)
└── vercel.json
```

#### Backend Repository  
Create a new repository with these files:
```
backend/
├── server/
├── shared/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── render.yaml
```

### 2.2 Update Frontend Configuration

Create `client/vite.config.ts` for frontend-only build:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
})
```

### 2.3 Update WebSocket Connection

Update `client/src/hooks/use-websocket.tsx` to connect to your Render backend:
```typescript
// In production, connect to your Render backend
const getWebSocketUrl = () => {
  if (import.meta.env.PROD) {
    return 'wss://your-backend-app.onrender.com/ws'
  }
  // For development
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/ws`
}

export function useWebSocket() {
  // ... rest of your code
  useEffect(() => {
    const wsUrl = getWebSocketUrl()
    const ws = new WebSocket(wsUrl)
    // ... rest of connection logic
  }, [])
}
```

### 2.4 Update API Calls

Update `client/src/lib/queryClient.ts` to point to your backend:
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com/api'
  : '/api'

// Update the default fetch function
const defaultQueryFn = async ({ queryKey }: QueryFunctionContext) => {
  const url = Array.isArray(queryKey) ? queryKey.join('') : queryKey as string
  const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url.slice(4)}` : `${API_BASE_URL}${url}`
  
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}
```

## 🚀 Step 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 3.2 Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your backend repository
3. Configure the service:
   - **Name**: `among-us-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for production)

### 3.3 Add Environment Variables
In your Render dashboard, add:
- `DATABASE_URL`: Your Neon connection string
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render's default)

### 3.4 Update Backend Package.json
Ensure your backend `package.json` has these scripts:
```json
{
  "scripts": {
    "build": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:ws",
    "start": "node dist/index.js",
    "dev": "tsx server/index.ts"
  }
}
```

### 3.5 Enable CORS for Frontend
Update `server/index.ts` to allow your Vercel domain:
```typescript
import cors from 'cors'

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-app.vercel.app'
  ],
  credentials: true
}))
```

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 4.2 Deploy Frontend
1. Click "New Project"
2. Import your frontend repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (if your React app is in a subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
- `VITE_API_URL`: `https://your-backend-app.onrender.com`
- `VITE_WS_URL`: `wss://your-backend-app.onrender.com`

### 4.4 Update Frontend URLs
After deployment, update your backend CORS settings with your actual Vercel URL.

## 🔗 Step 5: Connect Everything

### 5.1 Update Backend CORS
In your backend `server/index.ts`, update CORS to include your Vercel URL:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-actual-vercel-url.vercel.app'
  ],
  credentials: true
}))
```

### 5.2 Update Frontend API URLs
In your frontend, update the API URLs to your actual Render backend URL.

### 5.3 Test the Connection
1. Visit your Vercel frontend URL
2. Try creating a game room
3. Check Render logs for backend activity
4. Verify database connections in Neon dashboard

## 🔧 Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
```

### Backend (Render)
```
DATABASE_URL=postgresql://username:password@host/database
NODE_ENV=production
PORT=10000
```

### Local Development
```
DATABASE_URL=your_neon_connection_string
NODE_ENV=development
```

## 🚨 Troubleshooting

### Common Issues

**1. WebSocket Connection Fails**
- Check that your backend WebSocket server is running on `/ws` path
- Verify CORS settings include your frontend domain
- Ensure Render service is using `wss://` (secure WebSocket)

**2. API Calls Fail**
- Verify environment variables are set correctly
- Check Render logs for backend errors
- Ensure CORS is properly configured

**3. Database Connection Issues**
- Verify DATABASE_URL is correctly set in Render
- Check Neon database is active and accessible
- Run `npm run db:push` to ensure schema is up to date

**4. Build Failures**
- Check that all dependencies are in `package.json`
- Verify build commands are correct
- Review build logs in Vercel/Render dashboards

### Monitoring and Logs

**Vercel Logs**
- Go to your project dashboard → Functions tab
- View real-time logs during deployment and runtime

**Render Logs**
- Go to your service dashboard → Logs tab  
- Monitor backend server logs and errors

**Neon Monitoring**
- Check connection count and query performance
- Monitor database storage usage

## 🔄 Deployment Workflow

### For Updates

**Frontend Updates:**
1. Push changes to frontend repository
2. Vercel automatically rebuilds and deploys

**Backend Updates:**
1. Push changes to backend repository  
2. Render automatically rebuilds and deploys

**Database Schema Changes:**
1. Update `shared/schema.ts`
2. Run `npm run db:push` locally to test
3. Deploy backend changes
4. Schema is automatically applied in production

## 📈 Scaling Considerations

### Free Tier Limitations
- **Vercel**: 100GB bandwidth/month
- **Render**: 750 hours/month (sleeps after 15min inactivity)  
- **Neon**: 0.5GB storage, 1 database

### Upgrading for Production
- **Render**: Upgrade to Starter ($7/month) for always-on service
- **Neon**: Upgrade for more storage and better performance
- **Vercel**: Pro plan for higher bandwidth and better performance

## ✅ Final Checklist

- [ ] Neon database created and schema deployed
- [ ] Backend deployed to Render with correct environment variables
- [ ] Frontend deployed to Vercel with correct API URLs
- [ ] CORS configured to allow frontend domain
- [ ] WebSocket connections working
- [ ] Game creation and joining functional
- [ ] Real-time features (movement, chat) working
- [ ] Database persistence verified

Your Among Us clone is now fully deployed and ready for multiplayer gaming!