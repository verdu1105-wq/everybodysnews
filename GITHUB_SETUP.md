# GitHub + Cloud Run Setup Guide

## 🚀 Automatic Deployment from GitHub

Every time you push to GitHub, your site auto-deploys to Cloud Run!

## Step 1: Create GitHub Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Everybody's News"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/everybodys-news.git
git push -u origin main
```

## Step 2: Set Up GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deploy"

# Get project ID
PROJECT_ID=$(gcloud config get-value project)

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 3: Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

1. **GCP_PROJECT_ID**: Your GCP project ID
2. **GCP_SA_KEY**: Content of `key.json` file (entire JSON)

```bash
# Get your project ID
gcloud config get-value project

# Display key.json content (copy this to GitHub)
cat key.json
```

⚠️ **Important**: Delete `key.json` after copying:
```bash
rm key.json
```

## Step 4: Push to Deploy!

```bash
git add .
git commit -m "Set up auto-deployment"
git push origin main
```

Your site deploys automatically! 🎉

## 🔄 Workflow Triggers

Automatic deployment on:
- ✅ Push to `main` branch
- ✅ Push to `production` branch
- ✅ Manual trigger (Actions tab → Run workflow)

## 📊 View Deployment Status

1. Go to GitHub repo → Actions tab
2. See real-time deployment logs
3. Get live URL after deployment

## 🌳 Branch Strategy

### Recommended Setup:
```
main (development) → Auto-deploy to staging
production → Auto-deploy to production
```

### Create Production Branch:
```bash
git checkout -b production
git push origin production
```

### Update Workflow for Staging:
Edit `.github/workflows/deploy.yml` to deploy different branches to different services:

```yaml
- name: Set service name
  run: |
    if [ "${{ github.ref }}" = "refs/heads/production" ]; then
      echo "SERVICE_NAME=everybodys-news-prod" >> $GITHUB_ENV
    else
      echo "SERVICE_NAME=everybodys-news-staging" >> $GITHUB_ENV
    fi
```

## 🔐 Security Best Practices

✅ Never commit `key.json` to Git
✅ Use GitHub Secrets for credentials
✅ Rotate service account keys regularly
✅ Use branch protection rules
✅ Require PR reviews for production

## 🎯 Testing Before Deploy

Add this to your workflow (before deploy step):

```yaml
- name: Run tests
  run: |
    npm install
    npm test

- name: Test Docker build
  run: docker build -t test-build .
```

## 📈 Advanced: Multi-Environment Setup

```yaml
name: Deploy to Multiple Environments

on:
  push:
    branches: [main, staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - branch: main
            service: everybodys-news-dev
            region: us-central1
          - branch: staging
            service: everybodys-news-staging
            region: us-central1
          - branch: production
            service: everybodys-news-prod
            region: us-central1
            min-instances: 1  # Always warm
```

## 🚨 Rollback

If deployment fails:

```bash
# List revisions
gcloud run revisions list --service everybodys-news --region us-central1

# Rollback to previous
gcloud run services update-traffic everybodys-news \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1
```

Or trigger rollback in GitHub Actions.

## ⚡ Speed Optimizations

### 1. Keep Warm (No Cold Starts)
```yaml
--min-instances 1  # Always keep 1 instance warm
```
**Cost**: ~$5/month for always-warm

### 2. Use Artifact Registry (Faster than Container Registry)
```bash
gcloud artifacts repositories create everybodys-news \
  --repository-format=docker \
  --location=us-central1
```

### 3. Multi-Region Deployment
Deploy to multiple regions for global speed:
```yaml
strategy:
  matrix:
    region: [us-central1, europe-west1, asia-northeast1]
```

## 📊 Monitoring Deployments

Add notifications:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to Cloud Run: ${{ job.status }}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 💡 Pro Tips

1. **Cache Docker layers** for faster builds
2. **Use build triggers** in Cloud Build for even faster deployments
3. **Enable Cloud CDN** for static assets
4. **Use Cloud Armor** for DDoS protection

## 🆚 Comparison Table

| Feature | GitHub + Cloud Run | VM + Apache2 |
|---------|-------------------|--------------|
| Setup Time | 5 minutes | 30+ minutes |
| Deploy Time | 2-3 minutes | 5-10 minutes |
| Cost (low traffic) | FREE | $5-10/month |
| Auto-scaling | ✅ Yes | ❌ No |
| HTTPS | ✅ Auto | ⚠️ Manual (Let's Encrypt) |
| Global CDN | ✅ Built-in | ❌ Extra setup |
| Zero downtime | ✅ Yes | ⚠️ Need config |
| Rollback | ✅ 1-click | ❌ Manual |

## 🎯 Bottom Line

**GitHub + Cloud Run = FASTEST & EASIEST**

- Push code → Auto-deploy in 3 minutes
- Zero maintenance
- Scales to millions
- Costs $0 for most sites

**VM + Apache2 = Only if you need:**
- Always-warm responses (<30ms)
- Custom kernel modules
- Legacy applications

For a modern news site, **Cloud Run wins** every time! 🏆
