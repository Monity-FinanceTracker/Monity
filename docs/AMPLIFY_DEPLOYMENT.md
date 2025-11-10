# AWS Amplify Landing Page Deployment Guide

Step-by-step guide to deploying the Monity Next.js landing page on AWS Amplify.

## Why Amplify for Landing Page?

- **Zero configuration** - Amplify detects Next.js automatically
- **Git-based deployment** - Auto-deploy on push
- **Built-in CDN** - Global edge locations
- **Free SSL** - Automatic HTTPS
- **Server-side rendering** - Full Next.js support
- **Cost**: Free tier includes 1000 build minutes/month, 15 GB bandwidth

---

## Prerequisites

- ✅ Landing page code in GitHub repository
- ✅ AWS account with Amplify access
- ✅ Domain configured in Route 53

---

## Step 1: Prepare Repository

### Push Code to GitHub

```bash
cd /path/to/monity-landing-page

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Monity landing page"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/monity-landing-page.git
git branch -M main
git push -u origin main
```

### Verify Repository Structure

Your repo should have:
```
monity-landing-page/
├── app/              # Next.js 15 app directory
├── components/       # React components
├── public/           # Static assets
├── package.json      # Dependencies
├── next.config.mjs   # Next.js config
└── tsconfig.json     # TypeScript config
```

---

## Step 2: Connect Repository to Amplify

### Via AWS Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **Create new app**
3. Choose **Host web app**

#### Connect Repository

1. **Repository service**: Select **GitHub**
2. Click **Connect branch**
3. **Authorize AWS Amplify** (first time only):
   - Click **Authorize awsaccountid**
   - Sign in to GitHub
   - Grant permissions

4. **Select repository**:
   - Repository: `yourusername/monity-landing-page`
   - Branch: `main`
5. Click **Next**

#### Configure Build Settings

Amplify auto-detects Next.js. Review the settings:

**App name**: `monity-landing-page`

**Build and test settings**: (auto-generated)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Advanced settings** (optional):
- **Environment variables**: Add if your landing page needs any
- **Build image**: Use default (Auto-detected)
- **Service role**: Create and use `AmplifyServiceRole` (auto-created)

6. Click **Next**
7. Review all settings
8. Click **Save and deploy**

---

## Step 3: Wait for Build

### Monitor Build Progress

Amplify will:
1. **Provision** - Set up build environment (~1 min)
2. **Build** - Run npm install and build (~2-4 mins)
3. **Deploy** - Deploy to edge locations (~1 min)
4. **Verify** - Health check

**Total time**: 5-10 minutes

### View Build Logs

Click on the build to see detailed logs:
- Provision logs
- Build logs
- Deploy logs

### Fix Build Errors (if any)

**Common issues**:

**Error: "Module not found"**
```bash
# Add missing dependency
npm install <package-name>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**Error: "TypeScript errors"**
- Check `tsconfig.json`
- Fix type errors in code
- Or add to `next.config.mjs`:
  ```javascript
  typescript: {
    ignoreBuildErrors: true,  // Already in your config
  }
  ```

**Error: "Build failed"**
- Check build logs in Amplify console
- Test build locally: `npm run build`
- Common cause: Environment variables missing

---

## Step 4: Test Amplify Domain

After successful deployment:

### Get Amplify URL

1. In Amplify Console → Your app
2. You'll see a URL like: `https://main.d1234567890.amplifyapp.com`
3. Click the URL to test your landing page

### Verify Deployment

- ✅ Page loads correctly
- ✅ Images display properly
- ✅ Navigation works
- ✅ Links to `app.yourdomain.com` (if configured)
- ✅ HTTPS enabled automatically

---

## Step 5: Configure Custom Domain

### Add Custom Domain

1. In Amplify Console → Your app
2. Click **Domain management** in left sidebar
3. Click **Add domain**

#### Option A: Domain in Route 53 (Easiest)

1. **Domain**: Enter `yourdomain.com`
2. Amplify auto-detects Route 53 hosted zone
3. Click **Configure domain**
4. Check the subdomains:
   - ✅ `yourdomain.com` (root)
   - ✅ `www.yourdomain.com` (automatically added)
5. Click **Save**

Amplify automatically:
- Creates SSL certificate
- Adds DNS records to Route 53
- Configures CDN

**Wait 15-30 minutes** for:
- SSL certificate validation
- DNS propagation
- CDN configuration

#### Option B: Domain NOT in Route 53

1. **Domain**: Enter `yourdomain.com`
2. Amplify will show DNS records to add manually
3. **CNAME record**:
   - Name: `yourdomain.com` (or `@`)
   - Value: `<generated>.cloudfront.net`
4. Add these records in your GoDaddy DNS settings
5. Click **Update domain**

---

## Step 6: Configure Root Domain Redirect

Ensure `www.yourdomain.com` redirects to `yourdomain.com`.

### In Amplify Console

1. Domain management → Your domain
2. Under subdomains, you'll see:
   - `yourdomain.com` → Target
   - `www.yourdomain.com` → Redirect to root

This is configured automatically by Amplify.

### Verify Redirect

```bash
# Test redirect
curl -I https://www.yourdomain.com

# Should return:
# HTTP/2 301
# Location: https://yourdomain.com
```

---

## Step 7: Configure Build Settings (Optional)

### Environment Variables

If your landing page needs environment variables:

1. Amplify Console → Your app
2. **App settings** → **Environment variables**
3. Click **Manage variables**
4. Add variables:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.yourdomain.com`
5. Click **Save**

**Note**: Changes require rebuild to take effect.

### Build Notifications

Get email notifications for builds:

1. **App settings** → **Notifications**
2. Click **Add notification**
3. Choose event: **Build successful** or **Build failed**
4. Enter email address
5. Click **Save**

### Performance Mode

Enable for faster builds:

1. **App settings** → **Build settings**
2. Scroll to **Build image settings**
3. Enable **Next.js performance mode**
4. Click **Save**

---

## Step 8: Setup Automatic Deployments

Amplify automatically deploys on git push.

### Test Auto-Deploy

```bash
# Make a change to your landing page
cd /path/to/monity-landing-page
nano app/page.tsx  # Make a small change

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push

# Amplify automatically:
# 1. Detects push
# 2. Starts build
# 3. Deploys to production
# 4. Updates cache
```

### Monitor in Amplify Console

- Real-time build logs
- Build duration
- Deploy status

---

## Step 9: Configure Redirects (for App Links)

Add redirects to your app subdomain.

### Create `next.config.mjs` Redirects

If you want to redirect `/app` to your frontend:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/app',
        destination: 'https://app.yourdomain.com',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: 'https://app.yourdomain.com/dashboard',
        permanent: true,
      },
    ]
  },
  // ... other config
}

export default nextConfig
```

### Amplify Redirects (Alternative)

1. Amplify Console → Your app
2. **App settings** → **Rewrites and redirects**
3. Click **Edit**
4. Add redirect:
   - **Source**: `/app`
   - **Target**: `https://app.yourdomain.com`
   - **Type**: Permanent redirect (301)
5. Click **Save**

---

## Step 10: Performance Optimization

### Enable Compression

Already enabled by default in Amplify:
- ✅ Gzip compression
- ✅ Brotli compression (for supported browsers)

### Image Optimization

Your `next.config.mjs` already has:
```javascript
images: {
  unoptimized: true,
}
```

For better performance, consider:
1. Using Next.js Image component: `<Image src="..." />`
2. Optimize images before committing (use tools like ImageOptim)
3. Use WebP format where possible

### Caching

Amplify automatically caches:
- Static assets: 1 year
- HTML pages: 0 seconds (always fresh)
- API routes: Configurable

### CDN Edge Locations

Amplify uses CloudFront with global edge locations:
- North America
- Europe
- Asia Pacific
- South America

**Result**: Fast load times worldwide.

---

## Monitoring & Analytics

### Built-in Monitoring

View in Amplify Console → **Monitoring**:
- **Traffic**: Page views, visitors
- **Performance**: Load times, Core Web Vitals
- **Errors**: 4xx, 5xx errors
- **Data transfer**: Bandwidth usage

### Add Custom Analytics

#### Google Analytics

1. Get GA tracking ID
2. Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />  {/* Already included */}
      </body>
    </html>
  )
}
```

#### Amplify Analytics (Optional)

```bash
npm install aws-amplify
```

Add to your app for detailed user analytics.

---

## Cost Breakdown

### AWS Amplify Pricing

**Free Tier** (12 months):
- Build minutes: 1000 minutes/month
- Hosting: 15 GB served/month
- Storage: 5 GB stored

**After Free Tier**:
| Item | Rate | Your Usage | Cost |
|------|------|------------|------|
| Build minutes | $0.01/minute | ~10 builds @ 3min | $0.30 |
| Hosting (data transfer) | $0.15/GB | ~5 GB/month | $0.75 |
| Storage | $0.023/GB | ~0.5 GB | $0.01 |
| **Total** | | | **~$1-2/month** |

**Total for all 3 services** (Backend + Frontend + Landing):
- With free tier: **~$0.50-1/month**
- After free tier: **~$10-15/month**

---

## Troubleshooting

### Build Fails

**Check build logs**:
1. Amplify Console → Your app → Click on failed build
2. Review error messages
3. Common causes:
   - Missing dependencies: `npm install` locally and push
   - TypeScript errors: Fix or add `ignoreBuildErrors: true`
   - Memory issues: Increase build resources in Amplify settings

### Domain Not Working

**Check SSL certificate status**:
1. Domain management → Your domain
2. Status should be "Available"
3. If "Pending verification": Wait 15-30 minutes

**Check DNS**:
```bash
dig yourdomain.com +short
# Should return CloudFront IPs
```

### 404 Errors

- Clear browser cache
- Check file paths in code
- Verify `baseDirectory` in build settings

### Slow Build Times

- Enable Next.js performance mode
- Use Amplify Gen 2 (if available in your region)
- Cache dependencies (already configured)

### Custom Domain SSL Issues

- Ensure domain is verified in Route 53
- Check ACM certificate status in Amplify
- May take up to 48 hours for DNS propagation

---

## Security Best Practices

### 1. Enable Branch Protection

In GitHub:
1. Repository → Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews
4. Prevent force pushes

### 2. Environment Variables

- Never commit secrets to git
- Use Amplify environment variables for sensitive data
- Use `NEXT_PUBLIC_` prefix only for public values

### 3. Access Control

Limit who can deploy:
1. Amplify Console → Your app
2. **App settings** → **Access control**
3. Add password protection (if needed)

### 4. HTTPS Only

Amplify automatically:
- ✅ Enforces HTTPS
- ✅ Redirects HTTP to HTTPS
- ✅ Uses TLS 1.2+

---

## Advanced Configuration

### Multiple Branches

Deploy staging and production:

1. **Create staging branch**:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. **Connect in Amplify**:
   - Amplify Console → Your app
   - Click **Connect branch**
   - Select `staging` branch
   - Get separate URL: `https://staging.d123...amplifyapp.com`

3. **Configure custom subdomain** (optional):
   - Add `staging.yourdomain.com`

### Preview Deployments

For pull requests:
1. **App settings** → **Previews**
2. **Enable preview** for pull requests
3. Each PR gets a unique URL for testing

### Monorepo Setup

If your landing page is in a monorepo:

Edit build settings:
```yaml
version: 1
applications:
  - appRoot: monity-landing-page
    frontend:
      phases:
        preBuild:
          commands:
            - cd monity-landing-page
            - npm ci
        build:
          commands:
            - npm run build
```

---

## Deployment Workflow

### Development Flow

```bash
# 1. Make changes locally
git checkout -b feature/new-landing-page

# 2. Test locally
npm run dev

# 3. Build and test production build
npm run build
npm run start

# 4. Commit and push
git add .
git commit -m "Update landing page"
git push

# 5. Create pull request on GitHub

# 6. Amplify creates preview deployment

# 7. Review and merge PR

# 8. Amplify auto-deploys to production
```

### Rollback

If you need to rollback:

1. Amplify Console → Your app → Build history
2. Find previous successful build
3. Click **Redeploy this version**

Or revert via git:
```bash
git revert HEAD
git push
```

---

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test
npm run build

# Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Monitor Build Minutes

1. Amplify Console → **Usage**
2. View monthly build minutes used
3. Set up billing alerts if approaching limit

### Clean Up Old Builds

Amplify keeps build artifacts. No manual cleanup needed.

---

## Next Steps

✅ Landing page deployed on Amplify
✅ Custom domain configured
✅ SSL certificate active
✅ Automatic deployments enabled
✅ CDN active globally

**Continue to**: [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)

