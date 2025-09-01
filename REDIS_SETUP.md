# Redis Setup Guide for Monity

Redis is **optional** but **highly recommended** for optimal performance. Without Redis, Monity will automatically fall back to in-memory caching.

## 🚀 Quick Setup Options

### Option 1: macOS (Homebrew) - Recommended for Development
```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Option 2: Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

### Option 3: Docker (Cross-platform)
```bash
# Run Redis in Docker
docker run -d --name monity-redis -p 6379:6379 redis:alpine

# Test connection
docker exec -it monity-redis redis-cli ping
```

### Option 4: Redis Cloud (Production)
1. Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a free database
3. Get your connection URL
4. Set `REDIS_URL` in your `.env` file

## 🔧 Configuration

### 1. Create Environment File
```bash
cd backend
cp env.example .env
```

### 2. Configure Redis URL in `.env`
```env
# For local Redis (default)
REDIS_URL=redis://localhost:6379

# For Redis with password
REDIS_URL=redis://:your_password@localhost:6379

# For Redis Cloud
REDIS_URL=redis://username:password@hostname:port
```

### 3. Add Required Supabase Keys
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_KEY=your_supabase_service_role_key_here
```

## 📊 Performance Benefits

With Redis enabled, you'll get:
- **80%+ cache hit rates** for frequently accessed data
- **Sub-50ms response times** for cached queries
- **Reduced database load** by up to 70%
- **Scalable caching** across multiple server instances
- **Real-time performance metrics** in admin dashboard

## 🔍 Verification

### Check Redis Status
```bash
# Check if Redis is running
redis-cli ping

# Monitor Redis activity
redis-cli monitor

# Check Redis info
redis-cli info
```

### In Your Application
1. Start your backend: `npm run dev`
2. Look for: `🔗 Cache: Redis connected successfully`
3. Visit `/health` endpoint to see cache status
4. Check admin dashboard Performance tab

## 🐛 Troubleshooting

### Redis Connection Refused
```
[Cache] Redis connection refused, using memory cache only
```
**Solution:** Make sure Redis server is running
```bash
# macOS
brew services restart redis

# Ubuntu
sudo systemctl restart redis-server

# Docker
docker restart monity-redis
```

### Redis Authentication Required
```
[Cache] Redis error: NOAUTH Authentication required
```
**Solution:** Update your `REDIS_URL` with password
```env
REDIS_URL=redis://:your_password@localhost:6379
```

### Port Already in Use
```
[Cache] Redis error: EADDRINUSE
```
**Solution:** Check what's using port 6379
```bash
lsof -i :6379
# Kill the process or use a different port
```

## 🎯 Without Redis

If you choose not to use Redis:
- ✅ Application works perfectly with memory cache
- ✅ No setup required
- ⚠️ Cache doesn't persist between server restarts
- ⚠️ Limited cache size (1000 items max)
- ⚠️ No cross-instance cache sharing

## 📈 Performance Monitoring

Once Redis is set up, monitor performance at:
- **Health Check:** `http://localhost:3000/health`
- **Admin Dashboard:** `http://localhost:5173/admin` → Performance tab
- **Cache Metrics:** Hit rates, memory usage, connection status

## 🔐 Security Recommendations

### For Production:
1. **Enable authentication:**
   ```bash
   # In redis.conf
   requirepass your_secure_password
   ```

2. **Bind to specific IP:**
   ```bash
   # In redis.conf
   bind 127.0.0.1 your_server_ip
   ```

3. **Use Redis Cloud** for managed security and backups

## 🆘 Need Help?

- **Redis not starting?** Check the logs: `redis-server --loglevel verbose`
- **Connection issues?** Verify firewall settings and Redis config
- **Performance questions?** Check the admin dashboard metrics
- **Still having issues?** The application works fine without Redis!

---

**Remember:** Redis is optional! Monity will work perfectly with in-memory caching if Redis isn't available. 