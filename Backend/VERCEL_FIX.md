# Vercel Deployment Fix

## Problem
The original deployment failed because:
1. **Python Version**: Vercel uses Python 3.12, but some packages in `requirements.txt` are incompatible
2. **Heavy Dependencies**: Packages like `torch`, `transformers`, `prophet` are too large for Vercel's serverless functions
3. **Entry Point**: Wrong entry point configuration

## Solution

### 1. Use the New Requirements File
- **File**: `requirements-vercel.txt` (Python 3.12 compatible)
- **Removed**: Heavy ML packages that aren't essential for basic functionality
- **Kept**: Core FastAPI, database, and essential ML packages

### 2. Updated Vercel Configuration
- **File**: `vercel.json`
- **Entry Point**: `api/index.py` (instead of `app/main.py`)
- **Max Size**: 50MB for serverless functions
- **Timeout**: 30 seconds

### 3. New Entry Point
- **File**: `api/index.py`
- **Purpose**: Vercel-compatible FastAPI app
- **Features**: Proper CORS, all your existing routes

## Deploy Steps

### Option 1: Vercel CLI
```bash
cd Backend
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Set **Root Directory** to `Backend`
4. Vercel will automatically detect the `vercel.json` configuration

## Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

```
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=GreenView1234
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table
```

## What's Different

### Removed Heavy Packages:
- `torch` (too large for serverless)
- `transformers` (too large for serverless)
- `prophet` (too large for serverless)
- `matplotlib`, `seaborn`, `plotly` (not needed for API)
- `redis`, `celery` (not needed for basic API)
- `pytest` and dev tools (not needed in production)

### Kept Essential Packages:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pandas`, `numpy` - Data processing
- `scikit-learn` - ML algorithms
- `xgboost`, `lightgbm` - ML models
- `openai` - AI integration
- `sqlalchemy`, `psycopg2` - Database
- `pydantic` - Data validation

## API Endpoints
After deployment, your API will be available at:
- `https://your-app.vercel.app/` - Root endpoint
- `https://your-app.vercel.app/health` - Health check
- `https://your-app.vercel.app/docs` - API documentation
- `https://your-app.vercel.app/api/v1/ai-copilot/` - AI endpoints
- `https://your-app.vercel.app/api/v1/ml-predictions/` - ML endpoints
- `https://your-app.vercel.app/api/v1/sustainability/` - Sustainability endpoints
- `https://your-app.vercel.app/api/v1/data-upload/` - Data upload endpoints

## Troubleshooting

### If you still get errors:
1. **Check Vercel logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with `vercel dev` command
4. **Check database connection** from your Supabase dashboard

### If you need heavy ML packages:
Consider using:
- **Vercel Pro** (higher limits)
- **Railway** or **Render** (better for heavy ML workloads)
- **AWS Lambda** with custom layers
- **Google Cloud Functions**

## Next Steps
1. Deploy with the new configuration
2. Test all endpoints
3. Update your frontend to use the new API URL
4. Monitor performance and usage
