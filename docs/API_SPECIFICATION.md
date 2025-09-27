# 📚 API Specification

Comprehensive API documentation for the Sustainability Intelligence Platform.

## 🌐 Base URLs

- **Local Development**: `http://localhost:8000`
- **Production**: `https://greenview-api-production.up.railway.app`

## 🔐 Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## 📊 API Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "sustainability-intelligence-platform"
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Root Information

#### GET /
Get API information and available endpoints.

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

---

## 🤖 ML Predictions API

### Forecast Predictions

#### POST /api/v1/ml-predictions/forecast
Generate ML predictions for sustainability metrics.

**Request Body:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 30,
  "models": ["xgboost", "lightgbm"]
}
```

**Parameters:**
- `metric` (string, required): Metric to predict
  - `CO2_Emissions_kg`: Carbon dioxide emissions
  - `Waste_Generated_kg`: Waste generation
  - `Sustainability_Score`: Overall sustainability score
  - `Heat_Generation_MWh`: Heat energy generation
  - `Electricity_Generation_MWh`: Electrical energy generation
- `forecast_days` (integer, optional): Number of days to forecast (default: 730)
- `models` (array, optional): ML models to use (default: ["xgboost", "lightgbm"])
  - `xgboost`: XGBoost gradient boosting
  - `lightgbm`: LightGBM gradient boosting
  - `random_forest`: Random Forest ensemble

**Response:**
```json
{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 30,
  "current_value": 3567.75,
  "sustainability_score": 64.84,
  "predictions": {
    "xgboost": [
      {
        "date": "2025-01-22T00:00:00",
        "prediction": 3189.570068359375,
        "days_ahead": 1
      },
      {
        "date": "2025-01-23T00:00:00",
        "prediction": 3189.570068359375,
        "days_ahead": 2
      }
    ],
    "lightgbm": [
      {
        "date": "2025-01-22T00:00:00",
        "prediction": 3215.944495195419,
        "days_ahead": 1
      },
      {
        "date": "2025-01-23T00:00:00",
        "prediction": 3205.1865219968954,
        "days_ahead": 2
      }
    ]
  },
  "latest_predictions": {
    "xgboost": 3416.500244140625,
    "lightgbm": 3482.008002625339
  }
}
```

**Status Codes:**
- `200 OK`: Predictions generated successfully
- `400 Bad Request`: Invalid metric or parameters
- `500 Internal Server Error`: Model training or prediction failed

---

### Sustainability Score

#### GET /api/v1/ml-predictions/sustainability-score
Get current sustainability score with gauge data.

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

**Status Codes:**
- `200 OK`: Score retrieved successfully
- `500 Internal Server Error`: Data processing failed

---

### Available Metrics

#### GET /api/v1/ml-predictions/available-metrics
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

**Status Codes:**
- `200 OK`: Metrics retrieved successfully
- `500 Internal Server Error`: Data loading failed

---

### Health Check

#### GET /api/v1/ml-predictions/health
Check ML predictions service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "ml-predictions"
}
```

---

## 💬 AI Copilot API

### Chat Interface

#### POST /api/v1/ai-copilot/chat
Process natural language questions about sustainability metrics.

**Request Body:**
```json
{
  "question": "What will be the electricity generation after 90 days using lightgbm?"
}
```

**Parameters:**
- `question` (string, required): Natural language question about sustainability metrics

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
    {"days_ahead": 18, "prediction": 1230.75},
    {"days_ahead": 24, "prediction": 1240.90},
    {"days_ahead": 30, "prediction": 1250.45}
  ]
}
```

**Status Codes:**
- `200 OK`: Question processed successfully
- `400 Bad Request`: Unsupported question format or metric
- `500 Internal Server Error`: AI processing failed

---

### Health Check

#### GET /api/v1/ai-copilot/health
Check AI copilot service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-copilot"
}
```

---

## 📊 Data Models

### Prediction Request
```typescript
interface PredictionRequest {
  metric: string;
  forecast_days: number;
  models?: string[];
}
```

### Prediction Response
```typescript
interface PredictionResponse {
  metric: string;
  forecast_days: number;
  current_value: number;
  sustainability_score: number;
  predictions: {
    [modelName: string]: PredictionData[];
  };
  latest_predictions: {
    [modelName: string]: number;
  };
}
```

### Prediction Data
```typescript
interface PredictionData {
  date: string;
  prediction: number;
  days_ahead: number;
}
```

### Chat Request
```typescript
interface ChatRequest {
  question: string;
}
```

### Chat Response
```typescript
interface ChatResponse {
  metric: string;
  model: string;
  days_ahead: number;
  prediction: number;
  current_value: number;
  change: number;
  percentage_change: number;
  change_label: string;
  forecast_data: ForecastData[];
}
```

### Forecast Data
```typescript
interface ForecastData {
  days_ahead: number;
  prediction: number;
}
```

---

## 🔧 Error Handling

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400,
  "error_type": "ValidationError"
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `400 Bad Request` | Invalid request parameters | Missing required fields, invalid metric names |
| `404 Not Found` | Endpoint not found | Incorrect URL path |
| `422 Unprocessable Entity` | Validation error | Invalid data types, constraint violations |
| `500 Internal Server Error` | Server error | Database connection failed, model training error |

### Error Examples

#### Invalid Metric
```json
{
  "detail": "Column 'InvalidMetric' not found in dataset",
  "status_code": 400
}
```

#### Model Training Failed
```json
{
  "detail": "No models could be trained",
  "status_code": 400
}
```

#### Database Connection Error
```json
{
  "detail": "Internal server error: Database connection failed",
  "status_code": 500
}
```

---

## 📈 Rate Limiting

Currently, no rate limiting is implemented. However, it's recommended to:
- Implement reasonable request intervals
- Cache responses when possible
- Use appropriate timeout values

---

## 🔄 CORS Configuration

The API is configured with permissive CORS settings for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Recommendation:**
Configure specific origins for security:
```python
allow_origins=["https://your-frontend-domain.com"]
```

---

## 📝 Examples

### cURL Examples

#### Generate Predictions
```bash
curl -X POST "https://greenview-api-production.up.railway.app/api/v1/ml-predictions/forecast" \
  -H "Content-Type: application/json" \
  -d '{
    "metric": "CO2_Emissions_kg",
    "forecast_days": 30,
    "models": ["xgboost", "lightgbm"]
  }'
```

#### AI Chat
```bash
curl -X POST "https://greenview-api-production.up.railway.app/api/v1/ai-copilot/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What will be the electricity generation after 90 days using lightgbm?"
  }'
```

#### Health Check
```bash
curl -X GET "https://greenview-api-production.up.railway.app/health"
```

### JavaScript Examples

#### Fetch API
```javascript
// Generate predictions
const response = await fetch('https://greenview-api-production.up.railway.app/api/v1/ml-predictions/forecast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    metric: 'CO2_Emissions_kg',
    forecast_days: 30,
    models: ['xgboost', 'lightgbm']
  })
});

const data = await response.json();
console.log(data);
```

#### Axios
```javascript
import axios from 'axios';

// AI Chat
const response = await axios.post('https://greenview-api-production.up.railway.app/api/v1/ai-copilot/chat', {
  question: 'What will be the electricity generation after 90 days using lightgbm?'
});

console.log(response.data);
```

### Python Examples

#### Requests
```python
import requests

# Generate predictions
response = requests.post(
    'https://greenview-api-production.up.railway.app/api/v1/ml-predictions/forecast',
    json={
        'metric': 'CO2_Emissions_kg',
        'forecast_days': 30,
        'models': ['xgboost', 'lightgbm']
    }
)

data = response.json()
print(data)
```

---

## 🔍 Interactive Documentation

### Swagger UI
Visit `https://greenview-api-production.up.railway.app/docs` for interactive API documentation.

### ReDoc
Visit `https://greenview-api-production.up.railway.app/redoc` for alternative API documentation.

---

## 📞 Support

For API support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/your-username/sustainability-intelligence-platform/issues)
- **Email**: api-support@sustainability-platform.com
- **Documentation**: [Project Wiki](https://github.com/your-username/sustainability-intelligence-platform/wiki)

---

**API Version**: 1.0.0  
**Last Updated**: January 2025