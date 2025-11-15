# CliqDrop - Deployment Guide

Complete guide for deploying CliqDrop to GitHub and Render.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [GitHub Setup & Push](#github-setup--push)
3. [Render Deployment](#render-deployment)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Required Changes for Render

Before deploying, ensure the following:

1. **Server listens on Render's PORT** ✅ (Already configured)
2. **Database connection uses environment variables** ✅ (Already configured)
3. **Directories are created automatically** ⚠️ (Need to add)
4. **.env.example is in repository** ✅ (Already configured)
5. **package.json has start script** ✅ (Already configured)

### 🔧 Changes Needed

We need to ensure `uploads/` and `temp/` directories are created automatically on Render. This will be handled in the deployment guide.

---

## GitHub Setup & Push

### Step 1: Initialize Git Repository (if not already done)

```bash
# Check if git is initialized
git status

# If not initialized, run:
git init
```

### Step 2: Verify .gitignore

Make sure `.gitignore` includes:
- `.env` (your local environment variables)
- `node_modules/`
- `uploads/` (uploaded files)
- `temp/` (temporary files)
- `logs/` (log files)

✅ Your `.gitignore` is already properly configured!

### Step 3: Add All Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status
```

**Expected files to be added:**
- `src/` (all source files)
- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.example`
- `README.md`
- `API_DOCUMENTATION.md`
- `TEST.md`
- `DEPLOYMENT.md`

**Files that should NOT be added (already in .gitignore):**
- `.env` (local environment variables)
- `node_modules/`
- `uploads/`
- `temp/`
- `logs/`

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: CliqDrop API - File and text sharing service"
```

### Step 5: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (or go to https://github.com/new)
3. Repository name: `cliqdrop` (or your preferred name)
4. Description: `Universal Data Transfer Bot - Share files and text with unique codes`
5. Visibility: Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Step 6: Connect Local Repository to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cliqdrop.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/cliqdrop.git

# Verify remote was added
git remote -v
```

### Step 7: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

**If you get authentication error:**
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys

**Alternative: Push using GitHub CLI**
```bash
gh repo create cliqdrop --public --source=. --remote=origin --push
```

### Step 8: Verify on GitHub

1. Go to your repository on GitHub
2. Verify all files are present
3. Check that `.env` is NOT in the repository (it should be in .gitignore)

---

## Render Deployment

### Step 1: Create Render Account

1. Go to [Render](https://render.com)
2. Sign up or log in (you can use GitHub to sign in)

### Step 2: Create PostgreSQL Database

1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name:** `cliqdrop-db` (or your preferred name)
   - **Database:** `cliqdrop` (or your preferred name)
   - **User:** `cliqdrop_user` (or your preferred name)
   - **Region:** Choose closest to your users
   - **PostgreSQL Version:** Latest (14 or 15)
   - **Plan:** Free tier (or paid if needed)
4. Click **"Create Database"**
5. **Wait for database to be created** (takes 1-2 minutes)

### Step 3: Get Database Connection Details

1. Once database is created, click on it
2. Go to **"Connections"** tab
3. Copy the following:
   - **Internal Database URL** (for Render services)
   - **External Database URL** (for local testing)
   - **Hostname**
   - **Port**
   - **Database Name**
   - **Username**
   - **Password**

**Important:** Save the password - you won't be able to see it again!

### Step 4: Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select your GitHub account
   - Choose repository: `cliqdrop` (or your repo name)
   - Click **"Connect"**

### Step 5: Configure Web Service

**Basic Settings:**
- **Name:** `cliqdrop-api` (or your preferred name)
- **Region:** Same as database (for better performance)
- **Branch:** `main` (or your default branch)
- **Root Directory:** Leave empty (project is in root)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Click **"Add Environment Variable"** and add:

```
NODE_ENV=production
PORT=10000
```

**Database Connection:**
Click **"Add Environment Variable"** and add:

```
DB_HOST=<your-db-hostname>
DB_PORT=5432
DB_USER=<your-db-username>
DB_PASS=<your-db-password>
DB_NAME=<your-db-name>
```

**OR use Internal Database URL (Recommended):**

If Render provides an **Internal Database URL**, you can use it directly:
```
DATABASE_URL=postgresql://user:password@hostname:5432/dbname
```

Then update `src/config/db.js` to use `DATABASE_URL` if provided.

**File Upload Settings:**
```
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB
BASE_URL=https://your-service-name.onrender.com
```

**Complete Environment Variables List:**
```
NODE_ENV=production
PORT=10000
DB_HOST=<from-database-connections>
DB_PORT=5432
DB_USER=<from-database-connections>
DB_PASS=<from-database-connections>
DB_NAME=<from-database-connections>
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB
BASE_URL=https://your-service-name.onrender.com
```

### Step 6: Advanced Settings (Optional)

**Auto-Deploy:**
- ✅ Enable **"Auto-Deploy"** (deploys on every push to main branch)

**Health Check Path:**
- Path: `/api/health`
- This helps Render monitor your service

**Plan:**
- Free tier: Service spins down after 15 minutes of inactivity
- Paid tier: Always on

### Step 7: Create Service

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. **Wait for deployment** (takes 3-5 minutes)

### Step 8: Monitor Deployment

1. Watch the build logs in real-time
2. Look for:
   - ✅ "Build successful"
   - ✅ "Starting service"
   - ✅ "Service is live"

**Common Issues:**
- ❌ Build fails → Check build logs
- ❌ Database connection fails → Verify environment variables
- ❌ Service crashes → Check runtime logs

---

## Post-Deployment Configuration

### Step 1: Verify Service is Running

1. Go to your service dashboard
2. Click on the service URL (e.g., `https://cliqdrop-api.onrender.com`)
3. You should see:
```json
{
  "success": true,
  "message": "Welcome to CliqDrop API",
  "version": "1.0.0",
  ...
}
```

### Step 2: Test Health Endpoint

```bash
curl https://your-service-name.onrender.com/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CliqDrop API is running",
  "timestamp": "..."
}
```

### Step 3: Test Database Connection

The service should automatically:
- Connect to database on startup
- Create tables if they don't exist
- Start cron job for cleanup

Check logs to verify:
- ✅ "Database connection established successfully"
- ✅ "Database tables synced"

### Step 4: Update BASE_URL

Make sure `BASE_URL` environment variable matches your actual service URL:
```
BASE_URL=https://your-service-name.onrender.com
```

### Step 5: Test File Upload

```bash
curl -X POST https://your-service-name.onrender.com/api/send/file \
  -F "file=@test.txt"
```

### Step 6: Test Text Share

```bash
curl -X POST https://your-service-name.onrender.com/api/send/text \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'
```

---

## Important Notes for Render

### ⚠️ Ephemeral Filesystem

**Important:** Render uses an ephemeral filesystem. This means:
- Files in `uploads/` and `temp/` will be **lost when service restarts**
- This is **OK** for CliqDrop because:
  - Files expire automatically (30 min - 24 hours)
  - Files are temporary by design
  - Cron job cleans up expired files

**If you need persistent storage:**
- Use Render Disk (paid feature)
- Or integrate with cloud storage (AWS S3, Cloudinary, etc.)

### 🔄 Auto-Deploy

- Every push to `main` branch triggers automatic deployment
- Render builds and deploys automatically
- Monitor deployments in Render dashboard

### 💤 Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Consider paid tier for production use

### 🔒 Security

- Never commit `.env` file to GitHub
- Use Render's environment variables for secrets
- Database credentials are automatically secured by Render

---

## Troubleshooting

### Issue: Build Fails

**Check:**
1. Build logs in Render dashboard
2. `package.json` has correct start script
3. All dependencies are in `package.json`
4. Node version compatibility

**Solution:**
```bash
# Test build locally
npm install
npm start
```

### Issue: Database Connection Fails

**Check:**
1. Database is created and running
2. Environment variables are set correctly
3. Using Internal Database URL (for Render services)
4. Database credentials are correct

**Solution:**
- Verify environment variables in Render dashboard
- Test connection using `test-db-connection.js` with external URL
- Check database is not paused (free tier)

### Issue: Service Crashes on Startup

**Check:**
1. Runtime logs in Render dashboard
2. Database connection
3. Port binding (should use `process.env.PORT`)
4. Directory creation

**Solution:**
- Check logs for specific error
- Verify all environment variables are set
- Test locally with same configuration

### Issue: Files Not Persisting

**This is expected behavior on Render free tier:**
- Files are stored in ephemeral filesystem
- Files are lost on service restart
- This is OK because files expire anyway

**Solution:**
- Use Render Disk (paid)
- Or integrate cloud storage

### Issue: Service Takes Long to Respond

**Free Tier:**
- Service spins down after 15 min inactivity
- First request after spin-down is slow (cold start)
- Subsequent requests are fast

**Solution:**
- Upgrade to paid tier for always-on service
- Or accept cold start delay

### Issue: Cron Job Not Running

**Check:**
1. Service logs for cron job messages
2. Service is running (not spun down)
3. Cron schedule is correct

**Solution:**
- Cron runs every 5 minutes
- Check logs for "Deleted X expired share(s)"
- On free tier, cron only runs when service is active

---

## Quick Reference Commands

### GitHub Commands

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Your commit message"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/cliqdrop.git

# Push
git push -u origin main

# Check status
git status

# View remotes
git remote -v
```

### Render Environment Variables Template

```
NODE_ENV=production
PORT=10000
DB_HOST=<your-db-host>
DB_PORT=5432
DB_USER=<your-db-user>
DB_PASS=<your-db-password>
DB_NAME=<your-db-name>
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB
BASE_URL=https://your-service-name.onrender.com
```

### Test Commands

```bash
# Health check
curl https://your-service-name.onrender.com/api/health

# Upload file
curl -X POST https://your-service-name.onrender.com/api/send/file \
  -F "file=@test.txt"

# Share text
curl -X POST https://your-service-name.onrender.com/api/send/text \
  -H "Content-Type: application/json" \
  -d '{"content":"Test"}'
```

---

## Next Steps After Deployment

1. ✅ Update API documentation with production URL
2. ✅ Test all endpoints
3. ✅ Monitor service logs
4. ✅ Set up custom domain (optional)
5. ✅ Configure SSL (automatic on Render)
6. ✅ Set up monitoring/alerts (optional)

---

## Support

- **Render Docs:** https://render.com/docs
- **GitHub Docs:** https://docs.github.com
- **Project Issues:** Create issue in GitHub repository

---

**Last Updated:** November 2025  
**Deployment Version:** 1.0.0

