# 🚀 Deployment Guide

Comprehensive guide for deploying the Sustainability Intelligence Platform.

## 📋 Prerequisites

### Required Accounts
- **GitHub**: For code repository
- **Railway**: For backend deployment
- **Vercel**: For frontend deployment
- **Supabase**: For database

### Required Tools
- **Git**: Version control
- **Node.js 18+**: Frontend development
- **Python 3.11+**: Backend development
- **Docker** (optional): Containerization

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • React App     │    │ • FastAPI       │    │ • PostgreSQL    │
│ • Static Files  │    │ • ML Models     │    │ • Real-time     │
│ • CDN           │    │ • API Endpoints │    │ • Auth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Set database password
5. Select region closest to your users

### 2. Database Schema
Run the SQL schema from `Database/supabase_schema.sql`:

```sql
-- Create sustainability table
CREATE TABLE sustainability_table (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    co2_emissions_kg FLOAT,
    energy_consumption_kwh FLOAT,
    waste_generated_kg FLOAT,
    heat_generation_mwh FLOAT,
    electricity_generation_mwh FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create datasets table
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_size INTEGER,
    rows_count INTEGER,
    columns TEXT[],
    uploaded_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE sustainability_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
```

### 3. Environment Variables
Get your Supabase credentials:
- **Project URL**: `https://your-project.supabase.co`
- **Anon Key**: Public anonymous key
- **Service Role Key**: For server-side operations

## 🚀 Backend Deployment (Railway)

### 1. Prepare Repository
```bash
# Ensure your code is in GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy with Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Set **Root Directory** to `Backend`
6. Click "Deploy"

### 3. Configure Environment Variables
In Railway dashboard → Project → Variables:

```env
# Database Configuration
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=your_supabase_password
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table

# API Configuration
OPENAI_API_KEY=your_openai_api_key
DEBUG=false
ENVIRONMENT=production

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### 4. Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from Backend directory
cd Backend
railway up

# Set environment variables
railway variables set DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
railway variables set DB_PASSWORD=your_password
# ... set other variables
```

### 5. Verify Deployment
```bash
# Check deployment status
railway status

# View logs
railway logs

# Test API
curl https://your-app.railway.app/health
```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
# Ensure environment variables are set
cd Frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Deploy with Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `Frontend`
5. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variables
7. Click "Deploy"

### 3. Deploy with Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from Frontend directory
cd Frontend
vercel

# Set environment variables
vercel env add VITE_API_BASE_URL
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### 4. Configure Custom Domain (Optional)
1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL certificate

## 🐳 Docker Deployment (Alternative)

### 1. Backend Dockerfile
```dockerfile
# Backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Frontend Dockerfile
```dockerfile
# Frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./Backend
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=db
      - DB_NAME=sustainability
      - DB_USER=postgres
      - DB_PASSWORD=password
    depends_on:
      - db

  frontend:
    build: ./Frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=sustainability
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables Reference

#### Backend (Railway)
```env
# Database
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=your_supabase_password
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table

# API Keys
OPENAI_API_KEY=sk-your-openai-key

# Server
PORT=8000
HOST=0.0.0.0
DEBUG=false
ENVIRONMENT=production
```

#### Frontend (Vercel)
```env
# API
VITE_API_BASE_URL=https://your-backend.railway.app

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development
VITE_DEBUG=false
VITE_LOG_LEVEL=info
```

## 📊 Monitoring & Logging

### Railway Monitoring
1. **Logs**: View real-time logs in Railway dashboard
2. **Metrics**: Monitor CPU, memory, and network usage
3. **Alerts**: Set up alerts for errors and performance issues

### Vercel Analytics
1. **Performance**: Monitor Core Web Vitals
2. **Usage**: Track page views and user interactions
3. **Errors**: Monitor JavaScript errors and API failures

### Supabase Monitoring
1. **Database**: Monitor query performance and connections
2. **Auth**: Track user authentication and sessions
3. **Storage**: Monitor file uploads and storage usage

## 🔒 Security Configuration

### Backend Security
```python
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate Limiting (optional)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/ml-predictions/forecast")
@limiter.limit("10/minute")
async def create_forecast(request: Request, ...):
    # Your endpoint logic
```

### Frontend Security
```typescript
// Content Security Policy
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://your-backend.railway.app"]
};
```

## 🧪 Testing Deployment

### Backend Tests
```bash
# Test API endpoints
curl https://your-backend.railway.app/health
curl https://your-backend.railway.app/api/v1/ml-predictions/available-metrics

# Test prediction endpoint
curl -X POST https://your-backend.railway.app/api/v1/ml-predictions/forecast \
  -H "Content-Type: application/json" \
  -d '{"metric": "CO2_Emissions_kg", "forecast_days": 7}'
```

### Frontend Tests
```bash
# Test frontend deployment
curl https://your-frontend.vercel.app

# Test API integration
# Open browser and check network tab for API calls
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Backend)
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['Backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

### GitHub Actions (Frontend)
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['Frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./Frontend
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Deployment Failed
```
Error: Build failed
Solution: Check Python version compatibility and dependencies
```

#### 2. Database Connection Failed
```
Error: Database connection failed
Solution: Verify Supabase credentials and network connectivity
```

#### 3. Frontend Build Failed
```
Error: Build failed
Solution: Check Node.js version and npm dependencies
```

#### 4. CORS Errors
```
Error: CORS policy blocked
Solution: Update CORS configuration in backend
```

### Debug Commands
```bash
# Check Railway logs
railway logs --follow

# Check Vercel logs
vercel logs

# Test database connection
psql -h your-host -U your-user -d your-db

# Test API locally
curl http://localhost:8000/health
```

## 📈 Performance Optimization

### Backend Optimization
- **Caching**: Implement Redis for model caching
- **Database**: Use connection pooling
- **Monitoring**: Set up APM tools
- **Scaling**: Configure auto-scaling

### Frontend Optimization
- **CDN**: Use Vercel's global CDN
- **Caching**: Implement service worker
- **Bundle**: Optimize bundle size
- **Images**: Use WebP format

## 🔄 Updates & Maintenance

### Updating Backend
```bash
# Update code
git add .
git commit -m "Update backend"
git push origin main

# Railway will auto-deploy
# Or manually trigger:
railway up
```

### Updating Frontend
```bash
# Update code
git add .
git commit -m "Update frontend"
git push origin main

# Vercel will auto-deploy
# Or manually trigger:
vercel --prod
```

### Database Migrations
```sql
-- Run migrations in Supabase SQL editor
-- Or use Supabase CLI:
supabase db push
```

## 📞 Support

For deployment issues:
- **Railway**: [Railway Support](https://railway.app/help)
- **Vercel**: [Vercel Support](https://vercel.com/help)
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/sustainability-intelligence-platform/issues)

---

**Deployment Status**: ✅ Production Ready  
**Last Updated**: January 2025
