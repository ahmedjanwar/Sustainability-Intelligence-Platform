# API Endpoints Documentation

This document describes the new API endpoints created for the Sustainability Intelligence Platform.

## Overview

The platform now includes two main endpoint groups:
- **AI Copilot** (`/api/v1/ai-copilot/`) - Natural language chatbot for sustainability queries
- **ML Predictions** (`/api/v1/ml-predictions/`) - Machine learning forecasting capabilities

## AI Copilot Endpoints

### POST `/api/v1/ai-copilot/chat`

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
- CO2 emissions (`co2`, `CO2`)
- Waste generation (`waste`)
- Sustainability score (`score`, `sustainability`)
- Heat generation (`heat`)
- Electricity generation (`electricity`, `power`)

**Supported Models:**
- XGBoost (`xgboost`)
- LightGBM (`lightgbm`)

### GET `/api/v1/ai-copilot/health`

Health check endpoint for the AI copilot service.

## ML Predictions Endpoints

### POST `/api/v1/ml-predictions/forecast`

Create forecasts for sustainability metrics using XGBoost and LightGBM models.

**Request Body:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 730,
  "models": ["xgboost", "lightgbm"]
}
```

**Response:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 730,
  "current_value": 150.25,
  "sustainability_score": 75.5,
  "predictions": {
    "xgboost": [
      {
        "date": "2024-01-15T00:00:00",
        "prediction": 152.30,
        "days_ahead": 1
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
- `CO2_Emissions_kg`
- `Waste_Generated_kg`
- `Sustainability_Score`
- `Heat_Generation_MWh`
- `Electricity_Generation_MWh`

### GET `/api/v1/ml-predictions/sustainability-score`

Get current sustainability score with gauge data for visualization.

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

### GET `/api/v1/ml-predictions/available-metrics`

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

### GET `/api/v1/ml-predictions/health`

Health check endpoint for the ML predictions service.

## General Endpoints

### GET `/`

Root endpoint with API information.

### GET `/health`

General health check endpoint.

## Running the API

1. **Install dependencies:**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## Testing the Endpoints

Run the test script to verify all endpoints are working:

```bash
python test_endpoints.py
```

## Environment Variables

The following environment variables can be configured (defaults are provided):

- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password  
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `TABLE_NAME` - Table name for sustainability data

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

Error responses include a descriptive error message:

```json
{
  "detail": "Couldn't detect the metric you're asking about. Supported metrics: CO2, waste, score, sustainability, heat, electricity, power"
}
```

## Data Requirements

The endpoints expect a Supabase table with the following columns:
- `Timestamp` - DateTime column for time series data
- `CO2_Emissions_kg` - CO2 emissions in kg
- `Energy_Consumption_kWh` - Energy consumption in kWh
- `Waste_Generated_kg` - Waste generated in kg
- `Heat_Generation_MWh` - Heat generation in MWh
- `Electricity_Generation_MWh` - Electricity generation in MWh

The system automatically calculates a `Sustainability_Score` based on the available metrics.
