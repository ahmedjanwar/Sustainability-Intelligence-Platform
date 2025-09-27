# 🚀 Sustainability Intelligence Platform - Backend

FastAPI-based backend service providing machine learning predictions, AI copilot functionality, and data processing for sustainability analytics.

## 🏗️ Architecture

```
Backend/
├── app/
│   ├── api/v1/           # API endpoints
│   │   ├── ai_copilot.py     # AI chat interface
│   │   ├── ml_predictions.py # ML forecasting
│   │   ├── sustainability.py # Sustainability metrics
│   │   └── data_upload.py    # Data upload handling
│   ├── main.py           # FastAPI application
│   └── dependencies.py   # Shared dependencies
├── requirements.txt      # Python dependencies
├── railway.json         # Railway deployment config
├── Procfile            # Process configuration
└── test_endpoints.py   # API testing script
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip or conda
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone and navigate to backend**
```bash
git clone https://github.com/your-username/sustainability-intelligence-platform.git
cd sustainability-intelligence-platform/Backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set environment variables**
```bash
# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

5. **Run the application**
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Endpoints

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://greenview-api-production.up.railway.app`

### Core Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "sustainability-intelligence-platform"
}
```

#### 2. ML Predictions
```http
POST /api/v1/ml-predictions/forecast
Content-Type: application/json

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
  "current_value": 3567.75,
  "sustainability_score": 64.84,
  "predictions": {
    "xgboost": [
      {
        "date": "2025-01-22T00:00:00",
        "prediction": 3189.57,
        "days_ahead": 1
      }
    ],
    "lightgbm": [
      {
        "date": "2025-01-22T00:00:00",
        "prediction": 3215.94,
        "days_ahead": 1
      }
    ]
  },
  "latest_predictions": {
    "xgboost": 3416.50,
    "lightgbm": 3482.01
  }
}
```

#### 3. AI Copilot Chat
```http
POST /api/v1/ai-copilot/chat
Content-Type: application/json

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
    {"days_ahead": 6, "prediction": 1210.45}
  ]
}
```

#### 4. Sustainability Score
```http
GET /api/v1/ml-predictions/sustainability-score
```

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

#### 5. Available Metrics
```http
GET /api/v1/ml-predictions/available-metrics
```

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

## 🤖 Machine Learning Models

### Supported Models

| Model | Type | Best For | Performance |
|-------|------|----------|-------------|
| **XGBoost** | Gradient Boosting | Complex patterns, time series | High accuracy |
| **LightGBM** | Gradient Boosting | Large datasets, fast training | Fast inference |
| **Random Forest** | Ensemble | Robust predictions | Stable, interpretable |

### Model Training Process

1. **Data Loading**: Load from database or CSV fallback
2. **Feature Engineering**: Time-based features (month, day, elapsed days)
3. **Data Splitting**: 80/20 train/test split
4. **Model Training**: Train selected models
5. **Prediction Generation**: Generate future predictions
6. **Response Formatting**: Return structured predictions

### Features Used for Training
- `Energy_Consumption_kWh`: Energy consumption data
- `Elapsed_Days`: Days since start of dataset
- `Month`: Month of the year (1-12)
- `DayOfYear`: Day of the year (1-365)

## 📊 Data Processing

### Data Sources
1. **Primary**: Supabase PostgreSQL database
2. **Fallback**: CSV file (`sustainability_dataset.csv`)
3. **Emergency**: Generated sample data

### Data Pipeline
```
Raw Data → Validation → Feature Engineering → Model Training → Predictions
```

### Supported Data Formats
- **Database**: PostgreSQL with `sustainability_table`
- **CSV**: Comma-separated values with timestamp column
- **JSON**: Structured data format

## 🔧 Configuration

### Environment Variables

```env
# Database Configuration
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=your_password
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table

# API Configuration
OPENAI_API_KEY=your_openai_key
DEBUG=false
ENVIRONMENT=production

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### Database Schema

```sql
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
```

## 🧪 Testing

### Run Tests
```bash
# Test all endpoints
python test_endpoints.py

# Test specific functionality
python -m pytest tests/

# Test with coverage
python -m pytest --cov=app tests/
```

### Test Data
The API includes sample data generation for testing:
- 365 days of synthetic sustainability data
- Realistic patterns and trends
- Multiple metrics for comprehensive testing

## 🚀 Deployment

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Docker Deployment
```bash
# Build image
docker build -t sustainability-backend .

# Run container
docker run -p 8000:8000 sustainability-backend
```

### Environment Setup
1. **Production**: Set all environment variables
2. **Database**: Ensure PostgreSQL is accessible
3. **Monitoring**: Set up logging and error tracking
4. **Security**: Configure CORS and rate limiting

## 📈 Performance

### Optimization Features
- **Caching**: Model caching for faster predictions
- **Async Processing**: Non-blocking API operations
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Graceful fallbacks and error recovery

### Monitoring
- **Health Checks**: `/health` endpoint for monitoring
- **Logging**: Structured logging for debugging
- **Metrics**: Performance metrics and usage statistics

## 🔒 Security

### Security Features
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Pydantic models for data validation
- **Error Handling**: Secure error messages
- **Rate Limiting**: Built-in rate limiting (configurable)

### Best Practices
- Use environment variables for secrets
- Validate all input data
- Implement proper error handling
- Monitor API usage and performance

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Database connection failed
Solution: Check database credentials and network connectivity
```

#### 2. Model Training Failed
```
Error: No models could be trained
Solution: Verify data quality and feature availability
```

#### 3. Import Errors
```
Error: Module not found
Solution: Install dependencies with pip install -r requirements.txt
```

### Debug Mode
```bash
# Enable debug mode
export DEBUG=true
python -m uvicorn app.main:app --reload --log-level debug
```

## 📝 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### OpenAPI Schema
The API follows OpenAPI 3.0 specification and can be imported into tools like Postman or Insomnia.

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Style
- Follow PEP 8 for Python code
- Use type hints for all functions
- Write docstrings for all public methods
- Add tests for new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for sustainable development** 🌱