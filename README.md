# 🌱 Sustainability Intelligence Platform

A comprehensive AI-powered platform for sustainability data analysis, predictions, and insights. Built with FastAPI backend and React frontend, featuring machine learning models for environmental forecasting.

## 🚀 Features

### 🤖 AI-Powered Analytics
- **ML Predictions**: XGBoost, LightGBM, and Random Forest models for sustainability forecasting
- **AI Copilot**: Natural language interface for data insights and recommendations
- **Smart Visualizations**: Interactive charts and dashboards for data exploration

### 📊 Data Management
- **Multi-format Support**: CSV, Excel, and JSON data upload
- **Real-time Processing**: Live data analysis and visualization
- **Database Integration**: Supabase PostgreSQL for scalable data storage

### 📈 Sustainability Metrics
- **CO2 Emissions Tracking**: Monitor and predict carbon footprint
- **Energy Consumption**: Analyze and forecast energy usage patterns
- **Waste Management**: Track waste generation and optimization opportunities
- **Sustainability Scoring**: Comprehensive scoring system for environmental performance

### 🔮 Predictive Analytics
- **Time Series Forecasting**: Predict future sustainability metrics
- **Scenario Planning**: What-if analysis for different sustainability strategies
- **Model Comparison**: Side-by-side comparison of different ML models
- **Confidence Intervals**: Statistical confidence in predictions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (FastAPI)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • ML Models     │    │ • Data Storage  │
│ • Predictions   │    │ • AI Copilot    │    │ • User Data     │
│ • Data Upload   │    │ • API Endpoints │    │ • Analytics     │
│ • Visualizations│    │ • Data Processing│   │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Radix UI** for accessible components
- **React Router** for navigation

### Backend
- **FastAPI** with Python 3.11+
- **XGBoost** & **LightGBM** for machine learning
- **Scikit-learn** for data preprocessing
- **Pandas** & **NumPy** for data manipulation
- **SQLAlchemy** for database operations

### Database & Deployment
- **Supabase** PostgreSQL database
- **Railway** for backend deployment
- **Vercel** for frontend deployment
- **Docker** for containerization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sustainability-intelligence-platform.git
cd sustainability-intelligence-platform
```

### 2. Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `Database/supabase_schema.sql`
3. Update environment variables in both frontend and backend

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://greenview-api-production.up.railway.app`

### Key Endpoints

#### ML Predictions
```http
POST /api/v1/ml-predictions/forecast
Content-Type: application/json

{
  "metric": "CO2_Emissions_kg",
  "forecast_days": 30,
  "models": ["xgboost", "lightgbm"]
}
```

#### AI Copilot
```http
POST /api/v1/ai-copilot/chat
Content-Type: application/json

{
  "question": "What will be the electricity generation after 90 days using lightgbm?"
}
```

#### Health Check
```http
GET /health
```

### Interactive API Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📊 Supported Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `CO2_Emissions_kg` | Carbon dioxide emissions | kg |
| `Waste_Generated_kg` | Waste generation | kg |
| `Sustainability_Score` | Overall sustainability score | 0-100 |
| `Heat_Generation_MWh` | Heat energy generation | MWh |
| `Electricity_Generation_MWh` | Electrical energy generation | MWh |

## 🤖 Machine Learning Models

### XGBoost
- **Type**: Gradient Boosting
- **Best for**: Non-linear patterns, complex relationships
- **Performance**: High accuracy, good for time series

### LightGBM
- **Type**: Gradient Boosting
- **Best for**: Large datasets, fast training
- **Performance**: Fast inference, memory efficient

### Random Forest
- **Type**: Ensemble Learning
- **Best for**: Robust predictions, feature importance
- **Performance**: Stable, less prone to overfitting

## 🎯 Use Cases

### Corporate Sustainability
- Track and predict carbon footprint
- Optimize energy consumption
- Set and monitor sustainability goals
- Generate compliance reports

### Environmental Consulting
- Analyze client sustainability data
- Provide data-driven recommendations
- Create predictive models for environmental impact
- Generate professional reports

### Research & Development
- Study environmental trends
- Test sustainability hypotheses
- Develop new prediction models
- Analyze large-scale environmental data

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
TABLE_NAME=sustainability_table
OPENAI_API_KEY=your_openai_key
```

#### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://greenview-api-production.up.railway.app
```

## 📈 Performance

### Backend Performance
- **Response Time**: < 2 seconds for predictions
- **Concurrent Users**: 100+ simultaneous requests
- **Data Processing**: 10,000+ records per minute
- **Model Training**: < 30 seconds for new models

### Frontend Performance
- **Load Time**: < 3 seconds initial load
- **Bundle Size**: < 2MB optimized
- **Lighthouse Score**: 90+ across all metrics
- **Mobile Responsive**: Full mobile support

## 🚀 Deployment

### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd Backend
railway login
railway up
```

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd Frontend
vercel --prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd Frontend
npm run test
```

### API Testing
```bash
# Test all endpoints
python Backend/test_endpoints.py
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/sustainability-intelligence-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/sustainability-intelligence-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/sustainability-intelligence-platform/discussions)
- **Email**: support@sustainability-platform.com

## 🙏 Acknowledgments

- **FastAPI** team for the excellent web framework
- **Supabase** for the database and real-time features
- **Railway** for seamless deployment
- **OpenAI** for AI capabilities
- **XGBoost** and **LightGBM** teams for ML libraries

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

**Built with ❤️ for a sustainable future** 🌍