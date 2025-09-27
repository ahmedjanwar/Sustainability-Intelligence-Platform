# Sustainability Intelligence Platform API

A production-ready FastAPI backend for sustainability data analysis, AI-powered insights, and machine learning predictions.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API
- **API Documentation**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## 📊 Core Features

### 🤖 AI Copilot (`/api/v1/ai-copilot/`)
**Natural Language Processing** for sustainability queries with multi-model predictions.

**Example Questions:**
- "What will be the electricity generation after 90 days using lightgbm?"
- "Predict CO2 emissions for the next 30 days"
- "What's the sustainability score in 60 days?"

**Supported Metrics:**
- CO2 emissions, Waste generation, Sustainability score
- Heat generation, Electricity generation

**Supported Models:**
- XGBoost, LightGBM, RandomForest (with automatic fallback)

### 🔮 ML Predictions (`/api/v1/ml-predictions/`)
**Comprehensive Forecasting** with multi-model predictions and sustainability scoring.

**Key Endpoints:**
- `POST /forecast` - Create multi-model forecasts
- `GET /sustainability-score` - Get current sustainability score
- `GET /available-metrics` - List available metrics

**Supported Metrics:**
- `CO2_Emissions_kg`, `Waste_Generated_kg`, `Sustainability_Score`
- `Heat_Generation_MWh`, `Electricity_Generation_MWh`

## 🗄️ Data Sources

**Robust Multi-Tier System:**
1. **Primary**: Supabase PostgreSQL Database
2. **Fallback**: Local CSV file (`sustainability_dataset.csv`)
3. **Last Resort**: Generated sample data

## 🧪 Testing

**Comprehensive Test Suite:**
```bash
python test_endpoints.py
```

**Test Coverage:**
- ✅ AI Copilot natural language processing
- ✅ ML Predictions forecasting accuracy
- ✅ Database connectivity and fallback
- ✅ Error handling and edge cases
- ✅ API response validation

## 📁 Project Structure

```
Backend/
├── app/
│   ├── main.py                    # FastAPI application
│   └── api/v1/
│       ├── ai_copilot.py         # AI Copilot endpoints
│       ├── ml_predictions.py     # ML Predictions endpoints
│       ├── sustainability.py     # Sustainability endpoints
│       └── data_upload.py        # Data upload endpoints
├── sustainability_dataset.csv     # Sample data
├── requirements.txt              # Dependencies
├── test_endpoints.py            # Test suite
└── README_FINAL.md              # This file
```

## 🔌 Key API Endpoints

### Core
- `GET /` - API information and status
- `GET /health` - Health check

### AI Copilot
- `POST /api/v1/ai-copilot/chat` - Process natural language questions

### ML Predictions
- `POST /api/v1/ml-predictions/forecast` - Create forecasts
- `GET /api/v1/ml-predictions/sustainability-score` - Get sustainability score
- `GET /api/v1/ml-predictions/available-metrics` - List available metrics

## ⚙️ Configuration

**Environment Variables (with defaults):**
```env
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=GreenView1234
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table
```

## 📈 Usage Examples

### AI Copilot
```bash
curl -X POST "http://localhost:8000/api/v1/ai-copilot/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What will be the CO2 emissions after 30 days?"}'
```

### ML Predictions
```bash
curl -X POST "http://localhost:8000/api/v1/ml-predictions/forecast" \
  -H "Content-Type: application/json" \
  -d '{"metric": "CO2_Emissions_kg", "forecast_days": 30, "models": ["xgboost", "lightgbm"]}'
```

## 🐳 Docker Deployment

```bash
# Build and run
docker build -t sustainability-backend .
docker run -p 8000:8000 sustainability-backend
```

## 🚀 Cloud Deployment

**Railway:**
```bash
railway login
railway init
railway up
```

**Vercel:**
```bash
vercel --prod
```

## 🏗️ Architecture

**Technology Stack:**
- **Framework**: FastAPI with auto-generated docs
- **AI/ML**: XGBoost, LightGBM, scikit-learn, RandomForest
- **Database**: PostgreSQL with Supabase integration
- **Data Processing**: Pandas, NumPy
- **Deployment**: Docker-ready with cloud support

## 📊 Performance Features

- **Model Caching**: ML models cached for faster predictions
- **Data Fallback**: Multiple data sources ensure reliability
- **Async Processing**: Non-blocking API operations
- **Memory Efficient**: Optimized data processing pipelines

## 🔧 Development

**Code Quality:**
- Full Python type annotations
- Comprehensive error handling
- Structured logging
- Complete test coverage

**Adding Features:**
1. Create new modules in `app/api/v1/`
2. Add Pydantic models for validation
3. Implement business logic with error handling
4. Add tests to `test_endpoints.py`
5. Update documentation

## 📚 Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **API Reference**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## ✅ Production Status

- ✅ AI Copilot API - Fully functional
- ✅ ML Predictions API - Fully functional
- ✅ Database integration - Working with fallback
- ✅ Multiple ML models - XGBoost, LightGBM, RandomForest
- ✅ Natural language processing - Working
- ✅ Comprehensive testing - Complete
- ✅ Docker deployment - Ready
- ✅ Cloud deployment - Railway & Vercel ready

## 🎯 Ready for Production

The platform is fully functional and ready for production deployment with comprehensive error handling, fallback mechanisms, and monitoring capabilities.

## 📞 Support

- Check API documentation at `/docs`
- Review test suite for usage examples
- Check health endpoints for service status
- Review error messages for troubleshooting

## 📄 License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.