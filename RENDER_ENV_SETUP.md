# Render Environment Variables Setup

## Quick Setup for Render Deployment

Copy and paste these environment variables into your Render Web Service settings.

---

## Step-by-Step Instructions

1. Go to your Render Dashboard
2. Click on your Web Service (e.g., `cliqdrop-api`)
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"** for each variable below
5. Copy and paste the values

---

## Environment Variables to Add

### 1. Server Configuration

```
NODE_ENV
```
**Value:**
```
production
```

---

```
PORT
```
**Value:**
```
10000
```

---

### 2. Database Configuration

```
DB_HOST
```
**Value:**
```
dpg-d4dbfcqdbo4c73dnssr0-a
```

---

```
DB_PORT
```
**Value:**
```
5432
```

---

```
DB_USER
```
**Value:**
```
cliqdrop_user
```

---

```
DB_PASS
```
**Value:**
```
GUUH7CHiQaPpaYpJMhkLRzZzvGyS3jhd
```

---

```
DB_NAME
```
**Value:**
```
cliqdrop
```

---

### 3. File Upload Configuration

```
UPLOAD_DIR
```
**Value:**
```
uploads
```

---

```
MAX_FILE_SIZE
```
**Value:**
```
100MB
```

---

### 4. Application URL

```
BASE_URL
```
**Value:**
```
https://your-service-name.onrender.com
```
**Note:** Replace `your-service-name` with your actual Render service name after deployment.

---

## Complete Environment Variables List

Add all these variables in Render Dashboard:

| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `API_SECRETS` | `frontendSecret1,frontendSecret2` *(comma separated list)* |
| `DB_HOST` | `dpg-d4dbfcqdbo4c73dnssr0-a` |
| `DB_PORT` | `5432` |
| `DB_USER` | `cliqdrop_user` |
| `DB_PASS` | `GUUH7CHiQaPpaYpJMhkLRzZzvGyS3jhd` |
| `DB_NAME` | `cliqdrop` |
| `UPLOAD_DIR` | `uploads` |
| `MAX_FILE_SIZE` | `100MB` |
| `BASE_URL` | `https://your-service-name.onrender.com` |

---

## After Deployment

1. **Update BASE_URL:**
   - After your service is deployed, get the actual URL
   - It will be something like: `https://cliqdrop-api.onrender.com`
   - Update the `BASE_URL` environment variable with the actual URL

2. **Verify Connection:**
   - Check service logs to ensure database connection is successful
   - Look for: "✅ Database connection established successfully"

3. **Test Endpoints:**
   ```bash
   # Health check
   curl https://your-service-name.onrender.com/api/health
   
   # Test file upload
   curl -X POST https://your-service-name.onrender.com/api/send/file \
     -F "file=@test.txt"
   ```

---

## Important Notes

- ✅ Use **Internal Database URL** for Render services (already configured)
- ✅ Database hostname is internal: `dpg-d4dbfcqdbo4c73dnssr0-a`
- ✅ Port is always `5432` for PostgreSQL
- ⚠️ Keep database password secure (never commit to GitHub)
- ⚠️ Update `BASE_URL` after deployment with your actual service URL

---

## Database Connection Details

**Internal Database URL (for Render services):**
```
postgresql://cliqdrop_user:GUUH7CHiQaPpaYpJMhkLRzZzvGyS3jhd@dpg-d4dbfcqdbo4c73dnssr0-a/cliqdrop
```

**External Database URL (for local testing):**
```
postgresql://cliqdrop_user:GUUH7CHiQaPpaYpJMhkLRzZzvGyS3jhd@dpg-d4dbfcqdbo4c73dnssr0-a.oregon-postgres.render.com/cliqdrop
```

---

## Troubleshooting

### Database Connection Fails

1. Verify all environment variables are set correctly
2. Check that database is running (not paused)
3. Verify you're using the **internal hostname** (not external)
4. Check service logs for specific error messages

### Service Won't Start

1. Check `PORT` is set to `10000`
2. Verify `NODE_ENV` is set to `production`
3. Check build logs for errors
4. Ensure all environment variables are added

---

**Last Updated:** November 2025

