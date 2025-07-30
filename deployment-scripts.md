# Quick Deployment Scripts

## Split Codebase for Deployment

### 1. Create Frontend Repository
```bash
# Create new directory for frontend
mkdir among-us-frontend
cd among-us-frontend

# Copy frontend files
cp -r ../client ./
cp -r ../shared ./
cp ../components.json ./
cp ../tailwind.config.ts ./
cp ../postcss.config.js ./
cp ../frontend-package.json ./package.json
cp ../frontend-vite.config.ts ./vite.config.ts

# Create proper vite config for frontend
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  root: './client',
  build: {
    outDir: '../dist',
  },
})
EOF

# Initialize git and deploy to Vercel
git init
git add .
git commit -m "Initial frontend deployment"
# Push to GitHub repository
# Connect to Vercel
```

### 2. Create Backend Repository
```bash
# Create new directory for backend
mkdir among-us-backend
cd among-us-backend

# Copy backend files
cp -r ../server ./
cp -r ../shared ./
cp ../drizzle.config.ts ./
cp ../backend-package.json ./package.json
cp ../render.yaml ./

# Create TypeScript config for backend
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Initialize git and deploy to Render
git init
git add .
git commit -m "Initial backend deployment"
# Push to GitHub repository
# Connect to Render
```

## Environment Variables Setup

### Vercel Environment Variables
```bash
# Add these in Vercel dashboard
VITE_API_URL=https://your-backend-name.onrender.com
VITE_WS_URL=wss://your-backend-name.onrender.com
```

### Render Environment Variables
```bash
# Add these in Render dashboard
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
NODE_ENV=production
PORT=10000
```

### Neon Database Setup
```bash
# Run locally to setup schema
npm run db:push
```

## CORS Configuration Update

Update your backend `server/index.ts`:
```typescript
import cors from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'https://your-frontend-name.vercel.app'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## WebSocket Connection Update

Update `client/src/hooks/use-websocket.tsx`:
```typescript
const getWebSocketUrl = () => {
  // Production environment
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_WS_URL || 'wss://your-backend-name.onrender.com/ws'
  }
  
  // Development environment
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/ws`
}
```

## API Client Update

Update `client/src/lib/queryClient.ts`:
```typescript
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-name.onrender.com'
  }
  return '' // Empty string for development (proxy)
}

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl()
  const fullUrl = `${baseUrl}${url}`
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
```

## Build Commands Summary

### Frontend (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Backend (Render)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Node.js

## Quick Verification Checklist

After deployment:
- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Render URL/health
- [ ] Database connection works (check Render logs)
- [ ] WebSocket connects (check browser dev tools)
- [ ] Game creation works
- [ ] Real-time features work (movement, chat)
- [ ] Cross-device multiplayer works

## Troubleshooting Commands

### Check Backend Logs
```bash
# In Render dashboard, go to Logs tab
# Look for connection errors, database issues, or WebSocket problems
```

### Test Backend Health
```bash
curl https://your-backend-name.onrender.com/health
```

### Test WebSocket Connection
```javascript
// In browser console on frontend
const ws = new WebSocket('wss://your-backend-name.onrender.com/ws')
ws.onopen = () => console.log('WebSocket connected')
ws.onerror = (error) => console.error('WebSocket error:', error)
```