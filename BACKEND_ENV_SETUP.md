
# Backend .env Setup Guide

## Quick Setup (Required)

Create a `.env` file in the `backend` folder with these **3 essential variables**:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_KEY=your_supabase_service_role_key
```

## Where to find your Supabase keys:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_KEY`

## Optional: Enable Redis (for better performance)

If you want to use Redis for caching, add this line:

```env
REDIS_URL=redis://localhost:6379
```

**Note:** Redis is optional. Without it, the app uses memory caching and works perfectly fine.

## Complete .env file example:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Redis for better caching
REDIS_URL=redis://localhost:6379
```

## That's it!

The app will work with just the 3 Supabase variables. Everything else has sensible defaults.

## To install Redis (optional):

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
```

**Don't want Redis?** No problem! Just skip it and the app will use memory caching. 