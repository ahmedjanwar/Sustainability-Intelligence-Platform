# Sustainability Intelligence Platform - Backend API

A comprehensive FastAPI-based backend system for sustainability data analysis, AI-powered insights, and machine learning predictions. This platform processes sustainability data to provide actionable insights through natural language AI interactions and advanced ML forecasting.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- pip package manager
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd Backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API:**
   - **API Documentation**: http://localhost:8000/docs
   - **Alternative docs**: http://localhost:8000/redoc
   - **Health check**: http://localhost:8000/health

## 📊 Features

### 🤖 AI Copilot (`/api/v1/ai-copilot/`)
- **Natural Language Processing**: Ask questions in plain English about sustainability metrics
- **Multi-Model Predictions**: XGBoost, LightGBM, and RandomForest with automatic fallback
- **Real-time Forecasting**: Get predictions with change analysis and trend data
- **Intelligent Parsing**: Automatically detects metrics, timeframes, and preferred models from natural language

**Example Questions:**
- "What will be the electricity generation after 90 days using lightgbm?"
- "Predict CO2 emissions for the next 30 days"
- "What's the sustainability score in 60 days?"
- "How much waste will be generated in 45 days using xgboost?"

### 🔮 ML Predictions (`/api/v1/ml-predictions/`)
- **Comprehensive Forecasting**: Multi-model predictions with confidence intervals
- **Sustainability Scoring**: Real-time sustainability score calculation with visualization data
- **Dynamic Metric Discovery**: Automatically discover available metrics from your data
- **Advanced Models**: XGBoost, LightGBM, and RandomForest ensemble methods

**Supported Metrics:**
- `CO2_Emissions_kg` - Carbon dioxide emissions
- `Waste_Generated_kg` - Waste generation
- `Sustainability_Score` - Calculated sustainability index
- `Heat_Generation_MWh` - Heat generation capacity
- `Electricity_Generation_MWh` - Electricity generation

### 📈 Sustainability Analytics (`/api/v1/sustainability/`)
- **Health Monitoring**: Service health checks and status monitoring
- **Score Calculation**: Advanced sustainability scoring algorithms
- **Trend Analysis**: Historical data analysis and pattern recognition

### 📁 Data Management (`/api/v1/data-upload/`)
- **File Processing**: CSV upload and processing capabilities
- **Data Validation**: Comprehensive data quality checks
- **Status Monitoring**: Real-time processing status updates

## 🏗️ Architecture

### Technology Stack
- **Framework**: FastAPI with automatic API documentation
- **AI/ML**: XGBoost, LightGBM, scikit-learn, RandomForest
- **Database**: PostgreSQL with Supabase integration
- **Data Processing**: Pandas, NumPy for data manipulation
- **API Documentation**: Swagger UI and ReDoc
- **Deployment**: Docker-ready with cloud deployment support

### Project Structure
```
Backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   └── api/v1/                    # API version 1 endpoints
│       ├── ai_copilot.py         # AI Copilot natural language processing
│       ├── ml_predictions.py     # Machine learning forecasting
│       ├── sustainability.py     # Sustainability analytics
│       └── data_upload.py        # Data upload and processing
├── sustainability_dataset.csv     # Sample data for testing
├── requirements.txt              # Python dependencies
├── test_endpoints.py            # Comprehensive test suite
├── Dockerfile                    # Docker configuration
├── railway.json                 # Railway deployment config
├── Procfile                     # Process configuration
└── README.md                    # This documentation
```

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - Root endpoint with API information and status
- `GET /health` - General health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

### AI Copilot Endpoints
- `POST /api/v1/ai-copilot/chat` - Process natural language questions
- `GET /api/v1/ai-copilot/health` - AI Copilot service health check

### ML Predictions Endpoints
- `POST /api/v1/ml-predictions/forecast` - Create multi-model forecasts
- `GET /api/v1/ml-predictions/sustainability-score` - Get current sustainability score
- `GET /api/v1/ml-predictions/available-metrics` - List available metrics
- `GET /api/v1/ml-predictions/health` - ML service health check

### Service Health Endpoints
- `GET /api/v1/sustainability/health` - Sustainability service health
- `GET /api/v1/data-upload/health` - Data upload service health

## 🗄️ Data Sources

The platform uses a robust multi-tier data system:

1. **Primary**: Supabase PostgreSQL Database
2. **Fallback**: Local CSV file (`sustainability_dataset.csv`)
3. **Last Resort**: Generated sample data for testing

### Database Schema
The system expects a table with the following structure:
- `Timestamp` - DateTime column for time series data
- `CO2_Emissions_kg` - CO2 emissions in kilograms
- `Energy_Consumption_kWh` - Energy consumption in kWh
- `Waste_Generated_kg` - Waste generated in kilograms
- `Heat_Generation_MWh` - Heat generation in MWh
- `Electricity_Generation_MWh` - Electricity generation in MWh

The system automatically calculates a `Sustainability_Score` based on available metrics.

## ⚙️ Configuration

### Environment Variables
Configure the following environment variables (defaults provided):

```env
# Database Configuration
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=GreenView1234
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table

# Application Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True
```

### Database Connection
The system automatically handles database connectivity with fallback mechanisms:
- Primary: Supabase PostgreSQL connection
- Fallback: Local CSV file processing
- Testing: Generated sample data

## 🧪 Testing

### Run Test Suite
```bash
# Run comprehensive endpoint tests
python test_endpoints.py

# Run with verbose output
python -m pytest test_endpoints.py -v
```

### Test Coverage
The test suite covers:
- ✅ AI Copilot natural language processing
- ✅ ML Predictions forecasting accuracy
- ✅ Database connectivity and fallback
- ✅ Error handling and edge cases
- ✅ API response validation

## 📈 Usage Examples

### AI Copilot - Natural Language Queries
```bash
curl -X POST "http://localhost:8000/api/v1/ai-copilot/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What will be the CO2 emissions after 30 days using xgboost?"}'
```

**Response:**
```json
{
  "metric": "CO2 Emissions kg",
  "model": "XGBOOST",
  "days_ahead": 30,
  "prediction": 1250.45,
  "current_value": 1200.30,
  "change": 50.15,
  "percentage_change": 4.2,
  "change_label": "increase",
  "forecast_data": [...]
}
```

### ML Predictions - Multi-Model Forecasting
```bash
curl -X POST "http://localhost:8000/api/v1/ml-predictions/forecast" \
  -H "Content-Type: application/json" \
  -d '{
    "metric": "CO2_Emissions_kg",
    "forecast_days": 30,
    "models": ["xgboost", "lightgbm"]
  }'
```

### Sustainability Score
```bash
curl -X GET "http://localhost:8000/api/v1/ml-predictions/sustainability-score"
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build Docker image
docker build -t sustainability-backend .

# Run container
docker run -p 8000:8000 --env-file .env sustainability-backend
```

### Docker Compose (if available)
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - TABLE_NAME=${TABLE_NAME}
```

## 🚀 Deployment Options

### Railway Deployment
The project includes `railway.json` and `Procfile` for Railway deployment:
```bash
# Deploy to Railway
railway login
railway init
railway up
```

### Vercel Deployment
Configured with `vercel.json` for serverless deployment:
```bash
# Deploy to Vercel
vercel --prod
```

## 🔧 Development

### Code Structure
- **Modular Design**: Each API endpoint group is in its own module
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Type Safety**: Full Pydantic model validation
- **Documentation**: Auto-generated API documentation

### Adding New Features
1. Create new endpoint modules in `app/api/v1/`
2. Add request/response models using Pydantic
3. Implement business logic with proper error handling
4. Add tests to `test_endpoints.py`
5. Update this README with new endpoints

### Code Quality
- **Type Hints**: Full Python type annotations
- **Error Handling**: Comprehensive exception handling
- **Logging**: Structured logging for debugging
- **Testing**: Comprehensive test coverage

## 📊 Performance

### Optimization Features
- **Model Caching**: ML models are cached for faster predictions
- **Data Fallback**: Multiple data sources ensure reliability
- **Async Processing**: Non-blocking API operations
- **Memory Efficient**: Optimized data processing pipelines

### Monitoring
- **Health Checks**: All services have health check endpoints
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Metrics**: Built-in performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the test suite for usage examples
- Check the health endpoints for service status
- Review error messages for troubleshooting guidance

## ✅ Status

- ✅ AI Copilot API - Fully functional
- ✅ ML Predictions API - Fully functional
- ✅ Database integration - Working with fallback
- ✅ Multiple ML models - XGBoost, LightGBM, RandomForest
- ✅ Natural language processing - Working
- ✅ Comprehensive testing - Complete
- ✅ Docker deployment - Ready
- ✅ Cloud deployment - Railway & Vercel ready

## 🎯 Production Ready

The platform is fully functional and ready for production deployment with comprehensive error handling, fallback mechanisms, and monitoring capabilities.