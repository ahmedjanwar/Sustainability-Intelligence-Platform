# Sustainability Intelligence Platform API

A comprehensive FastAPI-based platform for sustainability data analysis, predictions, and AI-powered insights.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
./venv/bin/pip install -r requirements.txt
```

### 2. Start the Server
```bash
./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API
- **API Documentation**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## 📊 Features

### AI Copilot (`/api/v1/ai-copilot/`)
- **Natural Language Processing**: Ask questions in plain English
- **Multiple ML Models**: XGBoost, LightGBM, RandomForest with automatic fallback
- **Real-time Predictions**: Get forecasts with change analysis

**Example Questions:**
- "What will be the electricity generation after 90 days using lightgbm?"
- "Predict CO2 emissions for the next 30 days"
- "What's the sustainability score in 60 days?"

### ML Predictions (`/api/v1/ml-predictions/`)
- **Comprehensive Forecasting**: Multi-model predictions
- **Sustainability Score**: Real-time scoring with visualization data
- **Available Metrics**: Dynamic metric discovery

**Supported Metrics:**
- CO2_Emissions_kg
- Waste_Generated_kg
- Sustainability_Score
- Heat_Generation_MWh
- Electricity_Generation_MWh

## 🔧 Data Sources

The platform uses a robust fallback system:

1. **Primary**: Supabase Database (if available)
2. **Fallback**: CSV file (`sustainability_dataset.csv`)
3. **Last Resort**: Generated sample data

## 🧪 Testing

Run the comprehensive test suite:
```bash
./venv/bin/python test_endpoints.py
```

## 📁 Project Structure

```
Backend/
├── app/
│   ├── main.py                    # Main FastAPI application
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

## 🔌 API Endpoints

### Health Checks
- `GET /` - Root endpoint with API info
- `GET /health` - General health check
- `GET /api/v1/ai-copilot/health` - AI Copilot health
- `GET /api/v1/ml-predictions/health` - ML Predictions health

### AI Copilot
- `POST /api/v1/ai-copilot/chat` - Process natural language questions

### ML Predictions
- `POST /api/v1/ml-predictions/forecast` - Create forecasts
- `GET /api/v1/ml-predictions/sustainability-score` - Get sustainability score
- `GET /api/v1/ml-predictions/available-metrics` - List available metrics

## 🛠️ Configuration

Environment variables (optional):
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `TABLE_NAME` - Table name

## 📈 Example Usage

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

## ✅ Status

- ✅ AI Copilot API - Working
- ✅ ML Predictions API - Working
- ✅ Database fallback system - Working
- ✅ Multiple ML models - Working
- ✅ Natural language processing - Working
- ✅ Comprehensive testing - Working

## 🎯 Ready for Production

The platform is fully functional and ready for integration with frontend applications or direct API usage.
