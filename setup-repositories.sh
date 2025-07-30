#!/bin/bash

echo "🚀 Setting up deployment repositories..."

# Frontend Repository Setup
echo "📱 Setting up frontend repository..."
cd frontend-deploy
git init
git add .
git commit -m "Initial frontend setup for Vercel deployment"
git branch -M main
echo "Frontend repository initialized. Push to GitHub:"
echo "git remote add origin https://github.com/YOUR_USERNAME/among-us-frontend.git"
echo "git push -u origin main"
cd ..

# Backend Repository Setup  
echo "⚙️ Setting up backend repository..."
cd backend-deploy
git init
git add .
git commit -m "Initial backend setup for Render deployment"
git branch -M main
echo "Backend repository initialized. Push to GitHub:"
echo "git remote add origin https://github.com/YOUR_USERNAME/among-us-backend.git"
echo "git push -u origin main"
cd ..

echo "✅ Repositories ready! Follow DEPLOY_STEPS.md for the next steps."