# Quick GitHub Push Commands

Copy and paste these commands in order to push your project to GitHub.

## Step 1: Initialize Git (if not already done)

```bash
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Check What Will Be Committed

```bash
git status
```

**Verify these files are included:**
- ✅ `src/` folder
- ✅ `package.json`
- ✅ `.gitignore`
- ✅ `.env.example`
- ✅ `README.md`
- ✅ `API_DOCUMENTATION.md`
- ✅ `TEST.md`
- ✅ `DEPLOYMENT.md`

**Verify these files are NOT included (should be ignored):**
- ❌ `.env`
- ❌ `node_modules/`
- ❌ `uploads/`
- ❌ `temp/`
- ❌ `logs/`

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: CliqDrop API - File and text sharing service"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cliqdrop`
3. Description: `Universal Data Transfer Bot - Share files and text with unique codes`
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

## Step 6: Add Remote and Push

**Replace `YOUR_USERNAME` with your GitHub username:**

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/cliqdrop.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create cliqdrop --public --source=. --remote=origin --push
```

## Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/cliqdrop
2. Check all files are present
3. Verify `.env` is NOT in the repository

---

## If You Get Authentication Error

### Option 1: Use Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy token
5. Use token as password when pushing

### Option 2: Use SSH

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub
# Copy public key: cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Use SSH URL instead
git remote set-url origin git@github.com:YOUR_USERNAME/cliqdrop.git
git push -u origin main
```

---

## Future Updates

After making changes:

```bash
# Add changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push
```

---

**That's it! Your project is now on GitHub and ready for Render deployment.**

