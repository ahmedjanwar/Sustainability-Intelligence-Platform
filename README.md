# Sustainability-Intelligence-Platform

🌱 **GreenView Copilot** - Making the Invisible Visible

A web application + AI copilot that ingests sustainability data and transforms complex datasets into actionable insights through interactive dashboards and AI-powered recommendations.

## 🎯 Project Overview

**Challenge**: Reveal Hidden Sustainability Insights from large, complex datasets.

**Solution**: A comprehensive platform that computes a single Sustainability Index (0-100), displays interactive dashboards, and provides AI-powered insights in natural language.

## ✨ Key Features

- **Sustainability Score**: Single index calculation (0-100) from complex datasets
- **Interactive Dashboards**: Energy use, emissions, and supplier impact visualizations
- **AI Copilot**: Natural language insights and recommendations
- **What-If Simulations**: Real-time score updates based on scenario changes
- **Predictive Analytics**: ML-powered future emissions trend forecasting
- **Instant Analysis**: Upload dataset → instant dashboard + AI insights

## 🏗️ Project Structure

```
Sustainability-Intelligence-Platform/
├── backend/     # Python FastAPI + AI/ML components
├── frontend/    # React + Next.js + Recharts/Plotly
├── database/    # Supabase schema and migrations
└── docs/        # Pitch deck + project documentation
```

## 🛠️ Tech Stack

| Component | Technology | Owner |
|-----------|------------|-------|
| **Backend** | Python (FastAPI) | Zeeshan |
| **Frontend** | React + Next.js + Recharts/Plotly | Ahlam |
| **Database** | Supabase | - |
| **AI Component** | OpenAI API + LangChain | - |
| **ML Component** | Python ML libraries (scikit-learn, Prophet) | - |
| **Version Control** | GitHub | Ahmed |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Sustainability-Intelligence-Platform.git
   cd Sustainability-Intelligence-Platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Database Setup**
   - Set up Supabase project
   - Run database migrations
   - Configure environment variables

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📊 MVP Features

### Core Scope
- [x] File upload (CSV or API fetch)
- [x] Sustainability Score calculation
- [x] Dashboard with emissions + energy charts
- [x] AI Insight Panel (Copilot) – text recommendations

### Bonus Features
- [ ] What-if simulations
- [ ] ML-based future predictions
- [ ] Advanced filtering and drill-down
- [ ] Real-time data streams
- [ ] Mobile-responsive design
- [ ] PDF report generation

## 🎯 Demo Flow

1. **Upload Dataset** → Instant dashboard generation
2. **View Sustainability Score** + Visual KPIs
3. **Ask Copilot**: "Where are my highest emissions?"
4. **AI Response** with text + chart recommendations
5. **Run What-If**: "Switch 30% Fleet to EVs" → Score updates
6. **Future Prediction** chart (bonus feature)

## 👥 Team

- **Zeeshan**: Backend (Python FastAPI)
- **Ahlam**: Frontend (React + Next.js)
- **Ahmed**: Version Control & CI/CD
- **All Members**: Pitch/Presentation

## 📈 Development Timeline

### Day 1 (12h)
- Backend: Parse dataset + compute KPIs
- Frontend: Build Sustainability score + charts
- Repository setup + CI

### Day 2 (6h)
- Integrate AI Copilot (Q&A + insights)
- Add Sustainability Index
- ML-based future prediction (bonus)
- Prepare pitch deck + demo flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.

## 🔗 Links

- [Live Demo](https://your-demo-url.com)
- [Pitch Deck](docs/pitch-deck.pdf)
- [API Documentation](http://localhost:8000/docs)



