# API Endpoints Documentation

This document provides comprehensive documentation for all API endpoints in the Sustainability Intelligence Platform.

## 🌐 Base URL
- **Local Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## 📋 Overview

The API is organized into four main service groups:
- **AI Copilot** (`/api/v1/ai-copilot/`) - Natural language processing for sustainability queries
- **ML Predictions** (`/api/v1/ml-predictions/`) - Machine learning forecasting capabilities
- **Sustainability** (`/api/v1/sustainability/`) - Sustainability analytics and scoring
- **Data Upload** (`/api/v1/data-upload/`) - File processing and data management

## 🔗 Core Endpoints

### Root Endpoint
**GET** `/`

Returns API information and service status.

**Response:**
```json
{
  "message": "Sustainability Intelligence Platform API",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "healthy",
  "routers_loaded": true,
  "endpoints": {
    "ai_copilot": "/api/v1/ai-copilot/",
    "ml_predictions": "/api/v1/ml-predictions/",
    "sustainability": "/api/v1/sustainability/",
    "data_upload": "/api/v1/data-upload/"
  }
}
```

### Health Check
**GET** `/health`

General health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "sustainability-intelligence-platform"
}
```

## 🤖 AI Copilot Endpoints

### Chat with AI Copilot
**POST** `/api/v1/ai-copilot/chat`

Process natural language questions about sustainability metrics and return predictions.

**Request Body:**
```json
{
  "question": "What will be the electricity generation after 90 days using lightgbm?"
}
```

**Response:**
```json
{
  "metric": "Electricity Generation MWh",
  "model": "LIGHTGBM",
  "days_ahead": 90,
  "prediction": 1250.45,
  "current_value": 1200.30,
  "change": 50.15,
  "percentage_change": 4.2,
  "change_label": "increase",
  "forecast_data": [
    {"days_ahead": 0, "prediction": 1200.30},
    {"days_ahead": 6, "prediction": 1210.45},
    {"days_ahead": 12, "prediction": 1220.60},
    // ... more forecast points
  ]
}
```

**Supported Question Formats:**
- "What will be the electricity generation after 90 days using lightgbm?"
- "Predict CO2 emissions for the next 30 days"
- "What's the sustainability score in 60 days?"
- "How much waste will be generated in 45 days using xgboost?"

**Supported Metrics:**
- `co2`, `CO2` → CO2_Emissions_kg
- `waste` → Waste_Generated_kg
- `score`, `sustainability` → Sustainability_Score
- `heat` → Heat_Generation_MWh
- `electricity`, `power` → Electricity_Generation_MWh

**Supported Models:**
- `xgboost` → XGBoost Regressor
- `lightgbm` → LightGBM Regressor
- `randomforest` → Random Forest Regressor (fallback)

**Error Responses:**
```json
{
  "detail": "Couldn't detect the metric you're asking about. Supported metrics: CO2, waste, score, sustainability, heat, electricity, power"
}
```

### AI Copilot Health Check
**GET** `/api/v1/ai-copilot/health`

Health check for AI Copilot service.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-copilot"
}
```

## 🔮 ML Predictions Endpoints

### Create Forecasts
**POST** `/api/v1/ml-predictions/forecast`

Create multi-model forecasts for sustainability metrics.

**Request Body:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 30,
  "models": ["xgboost", "lightgbm"]
}
```

**Response:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 30,
  "current_value": 150.25,
  "sustainability_score": 75.5,
  "predictions": {
    "xgboost": [
      {
        "date": "2024-01-15T00:00:00",
        "prediction": 152.30,
        "days_ahead": 1
      },
      {
        "date": "2024-01-16T00:00:00",
        "prediction": 153.45,
        "days_ahead": 2
      }
      // ... more predictions
    ],
    "lightgbm": [
      // ... similar structure
    ]
  },
  "latest_predictions": {
    "xgboost": 180.45,
    "lightgbm": 175.20
  }
}
```

**Supported Metrics:**
- `CO2_Emissions_kg` - Carbon dioxide emissions
- `Waste_Generated_kg` - Waste generation
- `Sustainability_Score` - Calculated sustainability index
- `Heat_Generation_MWh` - Heat generation capacity
- `Electricity_Generation_MWh` - Electricity generation

**Supported Models:**
- `xgboost` - XGBoost Regressor
- `lightgbm` - LightGBM Regressor
- `randomforest` - Random Forest Regressor

### Get Sustainability Score
**GET** `/api/v1/ml-predictions/sustainability-score`

Get current sustainability score with visualization data.

**Response:**
```json
{
  "current_score": 75.5,
  "score_percentage": 75.5,
  "gauge_data": {
    "value": 75.5,
    "axis_range": [0, 100],
    "steps": [
      {"range": [0, 40], "color": "red"},
      {"range": [40, 70], "color": "orange"},
      {"range": [70, 100], "color": "lightgreen"}
    ]
  }
}
```

### Get Available Metrics
**GET** `/api/v1/ml-predictions/available-metrics`

Get list of available metrics for prediction.

**Response:**
```json
{
  "available_metrics": [
    "CO2_Emissions_kg",
    "Waste_Generated_kg",
    "Sustainability_Score",
    "Heat_Generation_MWh",
    "Electricity_Generation_MWh"
  ],
  "total_metrics": 5
}
```

### ML Predictions Health Check
**GET** `/api/v1/ml-predictions/health`

Health check for ML Predictions service.

**Response:**
```json
{
  "status": "healthy",
  "service": "ml-predictions"
}
```

## 📊 Sustainability Endpoints

### Sustainability Health Check
**GET** `/api/v1/sustainability/health`

Health check for Sustainability service.

**Response:**
```json
{
  "status": "healthy",
  "service": "sustainability"
}
```

## 📁 Data Upload Endpoints

### Data Upload Health Check
**GET** `/api/v1/data-upload/health`

Health check for Data Upload service.

**Response:**
```json
{
  "status": "healthy",
  "service": "data-upload"
}
```

## 🔧 Configuration

### Environment Variables
The following environment variables can be configured:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USERNAME` | `postgres.bmwsulkktotsdxrhxlwp` | Database username |
| `DB_PASSWORD` | `GreenView1234` | Database password |
| `DB_HOST` | `aws-1-eu-west-3.pooler.supabase.com` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `postgres` | Database name |
| `TABLE_NAME` | `sustainability_table` | Table name for sustainability data |
| `PORT` | `8000` | API server port |
| `HOST` | `0.0.0.0` | API server host |

## 📊 Data Requirements

### Database Schema
The system expects a PostgreSQL table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `Timestamp` | DateTime | Time series timestamp |
| `CO2_Emissions_kg` | Float | CO2 emissions in kilograms |
| `Energy_Consumption_kWh` | Float | Energy consumption in kWh |
| `Waste_Generated_kg` | Float | Waste generated in kilograms |
| `Heat_Generation_MWh` | Float | Heat generation in MWh |
| `Electricity_Generation_MWh` | Float | Electricity generation in MWh |

The system automatically calculates a `Sustainability_Score` based on available metrics.

## 🚨 Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `422` - Validation Error (invalid request body)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Messages
- `"Couldn't detect the metric you're asking about. Supported metrics: CO2, waste, score, sustainability, heat, electricity, power"`
- `"Invalid model specified. Supported models: xgboost, lightgbm, randomforest"`
- `"Database connection failed. Using fallback data source."`
- `"No data available for the specified metric."`

## 🧪 Testing

### Test the API
Run the comprehensive test suite:
```bash
python test_endpoints.py
```

### Manual Testing with cURL

**AI Copilot:**
```bash
curl -X POST "http://localhost:8000/api/v1/ai-copilot/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What will be the CO2 emissions after 30 days?"}'
```

**ML Predictions:**
```bash
curl -X POST "http://localhost:8000/api/v1/ml-predictions/forecast" \
  -H "Content-Type: application/json" \
  -d '{"metric": "CO2_Emissions_kg", "forecast_days": 30, "models": ["xgboost", "lightgbm"]}'
```

**Health Checks:**
```bash
curl -X GET "http://localhost:8000/health"
curl -X GET "http://localhost:8000/api/v1/ai-copilot/health"
curl -X GET "http://localhost:8000/api/v1/ml-predictions/health"
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Rate Limiting
Currently no rate limiting is implemented. For production deployment, consider implementing rate limiting based on your requirements.

### CORS
CORS is configured to allow all origins (`*`) for development. For production, configure specific allowed origins.

## 🔄 Data Flow

1. **Data Ingestion**: Data is loaded from database or CSV fallback
2. **Model Training**: ML models are trained on historical data
3. **Prediction**: Models generate forecasts for specified timeframes
4. **Response**: Results are formatted and returned to client

## 🎯 Best Practices

### Request Optimization
- Use specific metrics when possible
- Limit forecast_days to reasonable ranges (1-365 days)
- Use appropriate models for your data characteristics

### Error Handling
- Always check HTTP status codes
- Handle network errors gracefully
- Implement retry logic for transient failures

### Performance
- Cache predictions when possible
- Use appropriate batch sizes for large datasets
- Monitor API response times

## 📈 Monitoring

### Health Checks
All services provide health check endpoints for monitoring:
- General health: `/health`
- Service-specific: `/api/v1/{service}/health`

### Logging
The API logs important events and errors. Check application logs for debugging information.

## 🚀 Deployment

### Local Development
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker
```bash
docker build -t sustainability-backend .
docker run -p 8000:8000 sustainability-backend
```

## 📞 Support

For API support and questions:
1. Check the interactive documentation at `/docs`
2. Review error messages and status codes
3. Test with the provided test suite
4. Check service health endpoints
5. Review application logs for detailed error information