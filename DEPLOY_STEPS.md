# 🚀 Step-by-Step Deployment Guide

## Step 1: Setup GitHub Repositories

### Frontend Repository
1. Go to GitHub and create a new repository called `among-us-frontend`
2. Copy everything from the `frontend-deploy/` folder into this repository
3. Push to GitHub:
```bash
cd frontend-deploy
git init
git add .
git commit -m "Initial frontend setup for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/among-us-frontend.git
git push -u origin main
```

### Backend Repository  
1. Create another repository called `among-us-backend`
2. Copy everything from the `backend-deploy/` folder into this repository
3. Push to GitHub:
```bash
cd backend-deploy
git init
git add .
git commit -m "Initial backend setup for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/among-us-backend.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login with GitHub
2. Click "New +" → "Web Service"
3. Connect your `among-us-backend` repository
4. Configure:
   - **Name**: `among-us-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (for testing) or Starter ($7/month for production)

5. **Add Environment Variables** in Render dashboard:
   - `DATABASE_URL`: Your Neon database connection string
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

6. Deploy and wait for build to complete
7. Copy your Render backend URL (e.g., `https://among-us-backend-xyz.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click "New Project"
3. Import your `among-us-frontend` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables** in Vercel dashboard:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://among-us-backend-xyz.onrender.com`)
   - `VITE_WS_URL`: Your Render WebSocket URL (e.g., `wss://among-us-backend-xyz.onrender.com`)

6. Deploy and wait for build to complete
7. Copy your Vercel frontend URL (e.g., `https://among-us-frontend-xyz.vercel.app`)

## Step 4: Update CORS Configuration

1. In your backend repository, update `server/index.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://among-us-frontend-xyz.vercel.app' // ADD YOUR ACTUAL VERCEL URL HERE
];
```

2. Commit and push the change - Render will automatically redeploy

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try creating a game room
3. Open another browser/tab and join the room
4. Test:
   - Player movement
   - Chat functionality  
   - Task completion
   - Voting system
   - Real-time synchronization

## 🔧 Troubleshooting

**If WebSocket connection fails:**
- Check that backend URL in Vercel environment variables is correct
- Verify CORS settings include your Vercel domain
- Check Render logs for connection errors

**If API calls fail:**
- Verify environment variables in Vercel dashboard
- Check Render backend is running (logs tab)
- Test backend health: `https://your-backend.onrender.com/health`

**If database errors occur:**
- Verify DATABASE_URL in Render environment variables
- Check Neon database is active
- Run database migration if needed

## 🎮 You're Ready!

Once all steps are complete, your Among Us clone will be:
- ✅ Accessible worldwide via Vercel CDN
- ✅ Running real-time multiplayer on Render
- ✅ Persisting game data in Neon PostgreSQL
- ✅ Scalable for multiple concurrent games

Share your Vercel URL with friends to test multiplayer gameplay!