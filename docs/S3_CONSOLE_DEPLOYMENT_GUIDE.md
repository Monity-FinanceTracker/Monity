# 📚 Frontend S3 Deployment Guide (AWS Console)

Step-by-step guide to deploy your Monity React frontend to S3 using the AWS Console web interface.

---

## 📋 Prerequisites

- AWS account with S3 access
- S3 bucket created (or we'll create one)
- Domain name (optional, for custom domain)
- Backend API deployed and accessible

---

## 🔧 Step 1: Prepare Production Build Locally

### 1.1 Create Production Environment File

In your `frontend` directory, create `.env.production`:

```env
VITE_API_URL=https://api.monity-finance.com/api/v1
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important:** Replace the placeholder values with your actual:
- Backend API URL (your EC2 domain)
- Supabase project URL
- Supabase anonymous key

### 1.2 Install Dependencies & Build

Open terminal in your `frontend` directory:

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

After building, you'll have a `dist` folder with all production files.

---

## 🪣 Step 2: Configure S3 Bucket

### 2.1 Access S3 Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click on your existing bucket (or create a new one)

### 2.2 Enable Static Website Hosting

1. Click on your bucket name
2. Go to the **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit**
5. Enable **Static website hosting**
6. Configure:
   - **Hosting type:** Static website hosting
   - **Index document:** `index.html`
   - **Error document:** `index.html` (for SPA routing)
7. Click **Save changes**

### 2.3 Set Bucket Policy (Make Files Public)

1. Go to the **Permissions** tab
2. Scroll down to **Bucket policy**
3. Click **Edit**
4. Add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click **Save changes**

### 2.4 Block Public Access Settings

1. Still in the **Permissions** tab
2. Find **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck** all 4 boxes:
   - ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies
   - ✅ Block public access to buckets and objects granted through any public bucket or access point policies
5. Confirm by typing `confirm` in the confirmation field
6. Click **Save changes**

---

## 📤 Step 3: Upload Files to S3

### 3.1 Upload Build Files

1. Go to the **Objects** tab in your bucket
2. Click **Upload**
3. Click **Add files** or **Add folder**
4. Navigate to your `frontend/dist` folder
5. **Select all files and folders** from the `dist` directory:
   - `index.html`
   - `assets/` folder
   - `css/` folder (if exists)
   - `js/` folder (if exists)
   - All other files
6. Click **Add files**

### 3.2 Configure Upload Settings

1. In the upload dialog, scroll down to **Permissions**
2. Under **Predefined ACLs**, select **Grant public-read access**
3. Scroll down to **Properties**
4. Click **Set metadata**
5. For **HTML files** (index.html and any .html files):
   - Click **Add metadata**
   - **Key:** `Cache-Control`
   - **Value:** `public, max-age=0, must-revalidate`
6. For **other files** (JS, CSS, images):
   - **Key:** `Cache-Control`
   - **Value:** `public, max-age=31536000, immutable`

**Note:** You'll need to set metadata separately for HTML files vs other files. You can upload in batches:
- First batch: All HTML files with cache-control: `public, max-age=0, must-revalidate`
- Second batch: All other files with cache-control: `public, max-age=31536000, immutable`

### 3.3 Complete Upload

1. Click **Upload** at the bottom
2. Wait for upload to complete
3. Verify all files are in the bucket

---

## 🌐 Step 4: Test Your Deployment

### 4.1 Get Website URL

1. Go to **Properties** tab
2. Scroll to **Static website hosting**
3. Copy the **Bucket website endpoint** URL
   - Format: `http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com`

### 4.2 Test in Browser

1. Open the URL in your browser
2. Your app should load!
3. Test navigation (should work for SPA routing)

---

## 🚀 Step 5: Set Up CloudFront (Recommended)

CloudFront adds HTTPS, CDN, and custom domain support.

### 5.1 Create CloudFront Distribution

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click **Create distribution**
3. Configure:

   **Origin settings:**
   - **Origin domain:** Select your S3 bucket (or enter `YOUR-BUCKET-NAME.s3.amazonaws.com`)
   - **Origin path:** Leave empty
   - **Name:** Auto-filled
   - **Origin access:** Select **S3 bucket access** → **Use website endpoint**
     - Then select your bucket website endpoint: `YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com`

   **Default cache behavior:**
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP methods:** GET, HEAD, OPTIONS
   - **Cache policy:** CachingOptimized (or CachingDisabled for development)

   **Settings:**
   - **Price class:** Use all edge locations (or select cheaper option)
   - **Alternate domain names (CNAMEs):** `app.monity-finance.com` (your frontend domain)
   - **SSL certificate:** Request or select a certificate for your domain
   - **Default root object:** `index.html`

4. Click **Create distribution**

### 5.2 Wait for Deployment

- Status will show **Deploying** (takes 10-15 minutes)
- Once **Enabled**, note the **Distribution domain name**

---

## 🔐 Step 6: Set Up SSL Certificate (For Custom Domain)

### 6.1 Request Certificate

1. Go to [Certificate Manager](https://console.aws.amazon.com/acm/)
2. Make sure you're in **us-east-1** region (required for CloudFront)
3. Click **Request certificate**
4. Select **Request a public certificate**
5. Enter domain:
   - **Domain name:** `app.monity-finance.com`
   - **Additional names:** `*.monity-finance.com` (optional, for subdomains)
6. Select **DNS validation**
7. Click **Request**
8. Expand the certificate and click **Create record in Route 53**
9. Wait for validation (usually 5-10 minutes)

### 6.2 Attach Certificate to CloudFront

1. Go back to CloudFront
2. Click on your distribution
3. Go to **General** tab → Click **Edit**
4. Under **Alternate domain names (CNAMEs):**
   - Add: `app.monity-finance.com`
5. Under **Custom SSL certificate:**
   - Select your certificate
6. Click **Save changes**

---

## 📍 Step 7: Configure DNS (Route 53)

### 7.1 Create DNS Record

1. Go to [Route 53](https://console.aws.amazon.com/route53/)
2. Click **Hosted zones**
3. Select `monity-finance.com`
4. Click **Create record**
5. Configure:
   - **Record name:** `app`
   - **Record type:** `A`
   - **Alias:** Enable
   - **Route traffic to:** Alias to CloudFront distribution
   - **CloudFront distribution:** Select your distribution
6. Click **Create records**

### 7.2 Wait for DNS Propagation

- Usually takes 2-5 minutes
- Test: `dig app.monity-finance.com` should return CloudFront IPs

---

## ✅ Step 8: Verify Deployment

### 8.1 Test Endpoints

```bash
# Test S3 direct URL
curl http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com

# Test CloudFront URL
curl https://DISTRIBUTION-ID.cloudfront.net

# Test custom domain
curl https://app.monity-finance.com
```

### 8.2 Test in Browser

1. Visit `https://app.monity-finance.com`
2. Verify the app loads
3. Test login/authentication
4. Verify API calls work (check browser console)

---

## 🔄 Step 9: Future Deployments

When you update your frontend:

### Quick Update Steps:

1. **Rebuild locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3:**
   - Go to S3 Console → Your bucket
   - Delete old files (or use Replace option)
   - Upload new `dist` folder contents
   - Apply same cache-control settings

3. **Invalidate CloudFront Cache:**
   - Go to CloudFront Console
   - Select your distribution
   - Go to **Invalidations** tab
   - Click **Create invalidation**
   - Enter: `/*`
   - Click **Create invalidation**
   - Wait 2-5 minutes for propagation

---

## 🐛 Troubleshooting

### Issue: 403 Forbidden

**Solution:** Check bucket policy and public access settings

### Issue: SPA Routing Doesn't Work

**Solution:** 
- Ensure Error document is set to `index.html` in static website hosting
- For CloudFront, create a custom error response:
  - Go to CloudFront → Distribution → Error pages
  - Create custom error response:
    - HTTP error code: `403: Forbidden`
    - Customize error response: `Yes`
    - Response page path: `/index.html`
    - HTTP response code: `200: OK`
  - Repeat for `404: Not Found`

### Issue: CORS Errors

**Solution:** Verify your backend CORS configuration includes your frontend domain

### Issue: Environment Variables Not Working

**Solution:** Vite requires rebuild when environment variables change. They're baked into the build at build time.

---

## 📊 Cost Estimation

- **S3 Storage:** ~$0.023 per GB/month (first 50GB free tier)
- **S3 Requests:** ~$0.005 per 1,000 requests (first 2,000 free tier)
- **CloudFront:** ~$0.085 per GB data transfer (first 1TB free tier)
- **Route 53:** ~$0.50 per hosted zone/month

**Total (typical):** $1-5/month for small-medium traffic

---

## ✅ Deployment Checklist

- [ ] Created `.env.production` with correct values
- [ ] Built frontend (`npm run build`)
- [ ] Enabled static website hosting in S3
- [ ] Set bucket policy for public access
- [ ] Unblocked public access
- [ ] Uploaded all files from `dist/` folder
- [ ] Set cache-control headers correctly
- [ ] Tested S3 website endpoint
- [ ] Created CloudFront distribution
- [ ] Requested SSL certificate
- [ ] Attached certificate to CloudFront
- [ ] Created DNS record in Route 53
- [ ] Tested custom domain
- [ ] Verified API connections work

---

## 🎉 You're Done!

Your frontend is now live at:
- **S3 Direct:** `http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com`
- **CloudFront:** `https://DISTRIBUTION-ID.cloudfront.net`
- **Custom Domain:** `https://app.monity-finance.com`

Next: Deploy your landing page (Next.js) to AWS Amplify! 🚀
