# Backend - Sustainability Intelligence Platform

This directory contains the backend API and services for the Sustainability Intelligence Platform - a comprehensive Python FastAPI system that processes and analyzes sustainability data to provide actionable insights through AI-powered recommendations and ML predictions.

## Overview

The backend serves as the data processing engine that transforms raw sustainability data into meaningful insights. It handles data ingestion, processing, AI-powered analysis, and serves the processed data to the frontend through a RESTful API. Features include sustainability scoring, AI copilot integration, and ML-based future predictions.

## Technology Stack

- **Framework**: Python 3.9+ with FastAPI
- **AI/ML**: OpenAI API + LangChain + scikit-learn + Prophet
- **Database**: Supabase (PostgreSQL)
- **Data Processing**: Pandas + NumPy
- **API Documentation**: FastAPI auto-generated docs
- **Authentication**: JWT tokens + Supabase Auth
- **File Processing**: CSV parsing + data validation
- **Caching**: Redis (optional)
- **Deployment**: Docker + cloud hosting

## Getting Started

### Prerequisites

- Python 3.9+
- pip package manager
- Supabase account
- OpenAI API key
- Node.js 18+ (for optional frontend integration)

### Installation

1. Clone the repository
2. Navigate to the Backend directory
3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Development

Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
Backend/
├── app/
│   ├── api/           # FastAPI routes and endpoints
│   │   ├── v1/        # API version 1
│   │   │   ├── sustainability.py  # Sustainability endpoints
│   │   │   ├── ai_copilot.py      # AI Copilot endpoints
│   │   │   ├── ml_predictions.py  # ML prediction endpoints
│   │   │   └── data_upload.py     # File upload endpoints
│   │   └── dependencies.py        # API dependencies
│   ├── core/          # Core configuration and settings
│   │   ├── config.py  # Environment configuration
│   │   ├── security.py # Authentication and security
│   │   └── database.py # Database connection
│   ├── models/        # Pydantic models and schemas
│   │   ├── sustainability.py # Sustainability data models
│   │   ├── ai_models.py      # AI response models
│   │   └── ml_models.py      # ML prediction models
│   ├── services/      # Business logic and services
│   │   ├── sustainability_service.py # Score calculation
│   │   ├── ai_service.py            # OpenAI integration
│   │   ├── ml_service.py            # ML predictions
│   │   └── data_processing.py       # Data processing
│   ├── utils/         # Utility functions
│   │   ├── data_validation.py # Data validation
│   │   ├── file_processing.py # CSV processing
│   │   └── calculations.py    # Sustainability calculations
│   └── main.py        # FastAPI application entry point
├── data/              # Sample data and processing results
├── tests/             # Test files
├── requirements.txt   # Python dependencies
├── Dockerfile         # Docker configuration
└── .env.example       # Environment variables template
```

## API Endpoints

### Core Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/sustainability/score` - Get sustainability score
- `POST /api/v1/sustainability/calculate` - Calculate sustainability score
- `GET /api/v1/sustainability/metrics` - Get sustainability metrics
- `GET /api/v1/sustainability/dashboard` - Get dashboard data

### AI Copilot Endpoints

- `POST /api/v1/ai/chat` - Chat with AI Copilot
- `POST /api/v1/ai/insights` - Get AI-generated insights
- `POST /api/v1/ai/recommendations` - Get AI recommendations
- `POST /api/v1/ai/what-if` - Run what-if simulations

### Data Processing

- `POST /api/v1/upload/csv` - Upload CSV file
- `GET /api/v1/upload/status/{id}` - Get upload processing status
- `GET /api/v1/upload/results/{id}` - Get processing results
- `POST /api/v1/upload/validate` - Validate uploaded data

### ML Predictions

- `POST /api/v1/ml/predict/emissions` - Predict future emissions
- `POST /api/v1/ml/predict/trends` - Predict sustainability trends
- `GET /api/v1/ml/models/status` - Get ML model status

## Data Models

### Sustainability Metrics
- **Carbon Footprint**: CO2 emissions by category and source
- **Energy Consumption**: Electricity, gas, renewable energy usage
- **Waste Generation**: Waste by type, recycling rates, disposal methods
- **Water Usage**: Water consumption, efficiency metrics
- **Supply Chain**: Supplier sustainability scores, transportation emissions

### AI/ML Models
- **Sustainability Score**: Weighted index (0-100) calculation
- **Emission Predictions**: Time series forecasting using Prophet
- **Trend Analysis**: Pattern recognition and anomaly detection
- **Recommendation Engine**: AI-powered improvement suggestions

### API Response Models
- **SustainabilityResponse**: Score, metrics, and recommendations
- **AIInsightResponse**: Natural language insights and charts
- **MLPredictionResponse**: Future trends and predictions
- **UploadResponse**: File processing status and results

## Database

The backend uses **Supabase (PostgreSQL)** to store:
- **Sustainability Data**: Raw and processed sustainability metrics
- **User Sessions**: Authentication and user preferences
- **Processing Results**: Calculated scores and AI insights
- **Historical Trends**: Time-series data for ML predictions
- **File Metadata**: Upload history and processing status

### Database Schema
- **sustainability_data**: Raw sustainability metrics
- **calculated_scores**: Processed sustainability scores
- **ai_insights**: AI-generated recommendations
- **ml_predictions**: ML model predictions
- **user_sessions**: User authentication and preferences

## Environment Variables

Create a `.env` file in the root of the Backend directory:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string

# AI/ML
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo

# Application
DEBUG=True
PORT=8000
HOST=0.0.0.0

# Security
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optional
REDIS_URL=your_redis_url
```

## Data Processing Pipeline

1. **Data Ingestion**: Receive CSV files or API data
2. **Validation**: Validate data format, completeness, and quality
3. **Sustainability Calculation**: Compute weighted sustainability score (0-100)
4. **AI Processing**: Generate insights using OpenAI API + LangChain
5. **ML Analysis**: Run predictions using scikit-learn + Prophet
6. **Storage**: Store results in Supabase database
7. **API Response**: Serve processed data to frontend

### Key Services

#### Sustainability Service
- **Score Calculation**: Weighted algorithm for sustainability index
- **Metrics Processing**: Energy, emissions, waste, water analysis
- **Benchmarking**: Compare against industry standards

#### AI Service
- **Natural Language Processing**: Convert data insights to readable text
- **Recommendation Engine**: Suggest improvement actions
- **What-If Simulations**: Model scenario changes and score updates

#### ML Service
- **Time Series Forecasting**: Predict future emissions trends
- **Anomaly Detection**: Identify unusual patterns in data
- **Trend Analysis**: Long-term sustainability trajectory

## Testing

Run tests:
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_sustainability_service.py

# Run with verbose output
pytest -v
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Development Guidelines

1. **Code Style**: Follow PEP 8 and use Black for formatting
2. **Type Hints**: Use Python type hints throughout
3. **Testing**: Write unit tests for all services and endpoints
4. **Documentation**: Update API docs and README as needed
5. **Error Handling**: Implement proper error handling and logging

## Docker Deployment

Build and run with Docker:
```bash
# Build image
docker build -t sustainability-backend .

# Run container
docker run -p 8000:8000 --env-file .env sustainability-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow development guidelines
4. Write comprehensive tests
5. Update documentation
6. Submit a pull request

## License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.
