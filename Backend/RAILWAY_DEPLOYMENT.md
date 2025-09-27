# Railway Deployment Guide

## 🚀 Deploy Backend API to Railway

Railway is perfect for your full-featured API with ML dependencies since it has much higher limits than Vercel.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in GitHub
3. **Database**: You'll need an external database (Railway supports PostgreSQL)

## Step 1: Deploy via Railway Dashboard

### Option A: Connect GitHub Repository
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `ahmedjanwar/Sustainability-Intelligence-Platform`
5. Set **Root Directory** to `Backend`
6. Click **"Deploy"**

### Option B: Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from Backend directory
cd Backend
railway up
```

## Step 2: Configure Environment Variables

In Railway dashboard → Project → Variables, add:

```
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=GreenView1234
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table
OPENAI_API_KEY=your_openai_api_key
DEBUG=false
ENVIRONMENT=production
```

## Step 3: Database Setup

### Option A: Use Existing Supabase Database
- Keep using your current Supabase database
- No changes needed

### Option B: Create Railway PostgreSQL Database
1. In Railway dashboard, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a new database
4. Update environment variables with new database credentials

## Step 4: Test Your API

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

Test these endpoints:
- `https://your-app-name.railway.app/` - Root endpoint
- `https://your-app-name.railway.app/health` - Health check
- `https://your-app-name.railway.app/docs` - API documentation
- `https://your-app-name.railway.app/api/v1/ai-copilot/` - AI endpoints
- `https://your-app-name.railway.app/api/v1/ml-predictions/` - ML endpoints

## Railway Advantages

### ✅ **Perfect for ML APIs:**
- **No size limits** - Supports heavy ML dependencies
- **Persistent storage** - Built-in PostgreSQL support
- **Auto-scaling** - Handles traffic spikes
- **Custom domains** - Easy to set up
- **Environment variables** - Easy configuration

### ✅ **Full ML Support:**
- `torch` - PyTorch for deep learning
- `transformers` - Hugging Face transformers
- `xgboost`, `lightgbm` - Gradient boosting
- `scikit-learn` - Machine learning algorithms
- `prophet` - Time series forecasting

## Configuration Files

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `Procfile`
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Python version compatibility
   - Verify all dependencies in requirements.txt

2. **Database Connection Issues**
   - Verify environment variables
   - Check database credentials

3. **Memory Issues**
   - Railway provides generous memory limits
   - Monitor usage in dashboard

### Debugging:
- Check logs in Railway dashboard
- Use `/health` endpoint to verify basic functionality
- Test locally with same environment variables

## Next Steps

1. **Deploy to Railway** using the dashboard
2. **Configure environment variables**
3. **Test all endpoints**
4. **Set up custom domain** (optional)
5. **Monitor performance** in Railway dashboard

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Community](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)
