# 👨‍💻 Developer Setup Guide

Complete guide for setting up the Sustainability Intelligence Platform for local development.

## 📋 Prerequisites

### Required Software
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Python 3.11+**: [Download](https://python.org/)
- **Git**: [Download](https://git-scm.com/)
- **VS Code** (recommended): [Download](https://code.visualstudio.com/)

### Required Accounts
- **GitHub**: For code repository
- **Supabase**: For database (free tier available)
- **OpenAI**: For AI features (optional for basic development)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/sustainability-intelligence-platform.git
cd sustainability-intelligence-platform
```

### 2. Backend Setup
```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the backend
python -m uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Set database password
5. Select region closest to you

### 2. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `Database/supabase_schema.sql`
3. Click "Run" to execute the schema

### 3. Get Database Credentials
From Supabase Dashboard → Settings → Database:
- **Host**: `aws-1-eu-west-3.pooler.supabase.com`
- **Database**: `postgres`
- **Username**: `postgres.bmwsulkktotsdxrhxlwp`
- **Password**: Your database password
- **Port**: `5432`

### 4. Configure Environment Variables

#### Backend (.env)
```env
# Database Configuration
DB_USERNAME=postgres.bmwsulkktotsdxrhxlwp
DB_PASSWORD=your_supabase_password
DB_HOST=aws-1-eu-west-3.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
TABLE_NAME=sustainability_table

# API Configuration
OPENAI_API_KEY=your_openai_api_key
DEBUG=true
ENVIRONMENT=development

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

#### Frontend (.env.local)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## 🛠️ Development Tools

### VS Code Extensions
Install these recommended extensions:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.pylint",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

### Python Development
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run linting
pylint app/

# Format code
black app/

# Run tests
pytest tests/
```

### Frontend Development
```bash
# Install development dependencies
npm install --save-dev

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

## 📊 Sample Data

### 1. Generate Sample Data
The backend automatically generates sample data if no database connection is available. To add your own data:

1. **Via Supabase Dashboard**:
   - Go to Table Editor
   - Select `sustainability_table`
   - Click "Insert" → "Insert row"
   - Add your data

2. **Via SQL**:
```sql
INSERT INTO sustainability_table (timestamp, co2_emissions_kg, energy_consumption_kwh, waste_generated_kg, heat_generation_mwh, electricity_generation_mwh)
VALUES 
  ('2024-01-01', 150.5, 1000.0, 50.0, 200.0, 1200.0),
  ('2024-01-02', 152.3, 1050.0, 52.0, 205.0, 1250.0),
  ('2024-01-03', 148.7, 980.0, 48.0, 195.0, 1180.0);
```

3. **Via CSV Upload**:
   - Use the frontend data upload feature
   - Upload a CSV file with the required columns

### 2. CSV Format
Your CSV should have these columns:
```csv
timestamp,co2_emissions_kg,energy_consumption_kwh,waste_generated_kg,heat_generation_mwh,electricity_generation_mwh
2024-01-01,150.5,1000.0,50.0,200.0,1200.0
2024-01-02,152.3,1050.0,52.0,205.0,1250.0
```

## 🧪 Testing

### Backend Testing
```bash
cd Backend

# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_ml_predictions.py

# Run with coverage
python -m pytest --cov=app tests/

# Test API endpoints
python test_endpoints.py
```

### Frontend Testing
```bash
cd Frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Manual Testing
1. **Backend API**: Visit `http://localhost:8000/docs`
2. **Frontend**: Visit `http://localhost:5173`
3. **Database**: Check Supabase Dashboard

## 🔧 Configuration

### Backend Configuration

#### Database Connection
```python
# app/api/v1/ml_predictions.py
DB_USERNAME = os.getenv('DB_USERNAME', 'postgres.bmwsulkktotsdxrhxlwp')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password')
DB_HOST = os.getenv('DB_HOST', 'aws-1-eu-west-3.pooler.supabase.com')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'postgres')
TABLE_NAME = os.getenv('TABLE_NAME', 'sustainability_table')
```

#### CORS Configuration
```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Configuration

#### API Configuration
```typescript
// src/services/greenviewApi.ts
const BACKEND_API_BASE = 'http://localhost:8000';
```

#### Supabase Configuration
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

## 🐛 Debugging

### Backend Debugging
```bash
# Enable debug mode
export DEBUG=true
python -m uvicorn app.main:app --reload --log-level debug

# Check logs
tail -f logs/app.log

# Debug specific endpoint
import pdb; pdb.set_trace()  # Add breakpoint
```

### Frontend Debugging
```bash
# Enable debug mode
VITE_DEBUG=true npm run dev

# Check browser console
# Open DevTools → Console

# Debug API calls
# Open DevTools → Network tab
```

### Database Debugging
1. **Supabase Dashboard**: Check logs and metrics
2. **SQL Editor**: Run queries directly
3. **Table Editor**: View and edit data

## 📝 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... your code changes ...

# Test changes
npm run test
python -m pytest

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push changes
git push origin feature/new-feature

# Create pull request
```

### 2. Code Review Process
1. Create pull request
2. Request review from team members
3. Address feedback
4. Merge to main branch

### 3. Release Process
1. Update version numbers
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production

## 🔍 Troubleshooting

### Common Issues

#### 1. Backend Won't Start
```
Error: Module not found
Solution: Check virtual environment and dependencies
```

#### 2. Database Connection Failed
```
Error: Database connection failed
Solution: Check Supabase credentials and network
```

#### 3. Frontend Build Failed
```
Error: Build failed
Solution: Check Node.js version and dependencies
```

#### 4. API Calls Failing
```
Error: Failed to fetch
Solution: Check CORS configuration and API URL
```

### Debug Commands
```bash
# Check Python version
python --version

# Check Node.js version
node --version

# Check installed packages
pip list
npm list

# Check environment variables
echo $DB_USERNAME
echo $VITE_API_BASE_URL

# Test database connection
psql -h your-host -U your-user -d your-db

# Test API
curl http://localhost:8000/health
```

## 📚 Additional Resources

### Documentation
- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- **React**: [react.dev](https://react.dev/)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

### Tools
- **API Testing**: [Postman](https://postman.com/)
- **Database Management**: [DBeaver](https://dbeaver.io/)
- **Code Editor**: [VS Code](https://code.visualstudio.com/)

### Community
- **GitHub Discussions**: [Project Discussions](https://github.com/your-username/sustainability-intelligence-platform/discussions)
- **Discord**: [Join our Discord](https://discord.gg/your-invite)
- **Stack Overflow**: Tag questions with `sustainability-intelligence-platform`

## 🤝 Contributing

### Code Style
- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commit messages

### Pull Request Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### Issue Reporting
1. Check existing issues
2. Use the issue template
3. Provide detailed information
4. Include steps to reproduce

## 📞 Support

For development support:
- **GitHub Issues**: [Create an issue](https://github.com/your-username/sustainability-intelligence-platform/issues)
- **Email**: dev-support@sustainability-platform.com
- **Discord**: [Join our Discord](https://discord.gg/your-invite)

---

**Happy Coding!** 🚀
