# Vercel Deployment Guide with Vercel Postgres

## 📋 Prerequisites

1. **GitHub account** with your repository
2. **Vercel account** (free tier available)
3. **AmoCRM account** (optional, for lead sync)

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Click "Deploy"

### Step 3: Set Up Vercel Postgres
1. In your Vercel project dashboard
2. Go to "Storage" → "Connect Database"
3. Choose "PostgreSQL"
4. Click "Create"
5. Vercel automatically sets `DATABASE_URL`

### Step 4: Configure Environment Variables
In Vercel project settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Auto-set by Vercel | ✅ Yes |
| `AMOCRM_SUBDOMAIN` | Your AmoCRM subdomain | ❌ Optional |
| `AMOCRM_ACCESS_TOKEN` | AmoCRM API token | ❌ Optional |
| `AMOCRM_PIPELINE_ID` | Default pipeline ID | ❌ Optional |
| `AMOCRM_STATUS_ID` | Default status ID | ❌ Optional |
| `ADMIN_TOKEN` | Any secret string | ❌ Optional |

### Step 5: Initialize Database
After deployment, visit:
```
https://your-project.vercel.app/api/init-db
```
Or run manually (if you have access to Vercel CLI):
```bash
npx vercel env pull
npm run db:init
```

## 🔧 Testing Your Deployment

### Test 1: Frontend
Visit: `https://your-project.vercel.app`
- Should load landing page
- Navigation should work
- Forms should be visible

### Test 2: API Endpoints
1. **Content API**: `https://your-project.vercel.app/api/content`
2. **Lead Submission**: Submit a test form
3. **AmoCRM Config**: `https://your-project.vercel.app/api/amocrm/pipelines` (with auth)

### Test 3: Form Submission
1. Fill out contact form
2. Check browser console for success
3. Check Vercel logs for API calls
4. Check AmoCRM for new lead (if configured)

## 🐛 Troubleshooting

### Database Connection Issues
1. Check `DATABASE_URL` is set in Vercel
2. Verify Vercel Postgres is connected
3. Check Vercel logs for database errors

### AmoCRM Sync Issues
1. Verify AmoCRM credentials
2. Check API token permissions
3. Verify subdomain is correct

### Form Submission Issues
1. Check browser console for errors
2. Check Vercel function logs
3. Verify API routes are deployed

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: Traffic, performance
- **Logs**: Function execution logs
- **Storage**: Database usage

### AmoCRM Dashboard
- **Leads**: New submissions
- **Contacts**: Created/updated contacts
- **Pipeline**: Lead movement

## 🔄 Updates & Maintenance

### Update Code
```bash
git add .
git commit -m "Update description"
git push origin main
# Vercel auto-deploys
```

### Update Environment Variables
1. Vercel dashboard → Settings → Environment Variables
2. Add/update variables
3. Redeploy

### Database Backups
Vercel Postgres includes automatic backups:
- Daily backups retained for 7 days
- Point-in-time recovery

## 📞 Support

### Vercel Support
- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Community: [vercel.com/community](https://vercel.com/community)

### AmoCRM Support
- API Docs: [amocrm.ru/developers](https://amocrm.ru/developers)
- Support: Your AmoCRM account manager

### Project Issues
- GitHub Issues: Your repository issues page
- Email: Your contact email