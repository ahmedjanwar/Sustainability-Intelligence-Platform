# 🎨 Sustainability Intelligence Platform - Frontend

Modern React-based frontend application for sustainability data visualization, ML predictions, and AI-powered insights. Built with Vite, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

```
Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── charts/             # Data visualization components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── MLPredictions.tsx   # ML predictions interface
│   │   ├── AICopilot.tsx       # AI chat interface
│   │   └── DataPreview.tsx     # Data preview component
│   ├── hooks/              # Custom React hooks
│   │   ├── usePredictions.ts   # ML predictions hook
│   │   ├── useFileUpload.ts    # File upload hook
│   │   └── useSustainabilityData.ts # Data management hook
│   ├── services/           # API services
│   │   └── greenviewApi.ts     # Backend API client
│   ├── integrations/       # External integrations
│   │   └── supabase/           # Supabase client
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── package.json           # Dependencies
└── vite.config.ts         # Vite configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (see Backend README)

### Installation

1. **Clone and navigate to frontend**
```bash
git clone https://github.com/your-username/sustainability-intelligence-platform.git
cd sustainability-intelligence-platform/Frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set environment variables**
```bash
# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🎯 Features

### 📊 Dashboard
- **Real-time Metrics**: Live sustainability data visualization
- **Interactive Charts**: Dynamic charts with Recharts
- **Responsive Design**: Mobile-first responsive layout
- **Data Export**: Export charts and data as images/CSV

### 🤖 ML Predictions
- **Model Selection**: Choose between XGBoost, LightGBM, Random Forest
- **Metric Selection**: Predict CO2, waste, energy, sustainability score
- **Forecast Periods**: 7 days to 2 years prediction horizon
- **Model Comparison**: Side-by-side model performance comparison
- **Interactive Charts**: Time series and comparison visualizations

### 💬 AI Copilot
- **Natural Language Interface**: Ask questions in plain English
- **Contextual Responses**: AI understands your data context
- **Smart Suggestions**: Proactive recommendations and insights
- **Conversation History**: Maintains conversation context

### 📁 Data Management
- **File Upload**: Support for CSV, Excel, JSON files
- **Data Preview**: Real-time data preview and validation
- **Data Processing**: Automatic data cleaning and formatting
- **Progress Tracking**: Upload progress and status indicators

## 🛠️ Tech Stack

### Core Technologies
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack Query** for data fetching and caching

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent iconography
- **Recharts** for data visualization

### State Management
- **React Hooks** for local state management
- **Custom Hooks** for shared logic
- **Context API** for global state (if needed)

### Data & API
- **Axios/Fetch** for HTTP requests
- **Supabase** for database and real-time features
- **TypeScript** for type safety

## 📱 Components

### Core Components

#### Dashboard (`Dashboard.tsx`)
Main application dashboard with metrics overview and navigation.

```tsx
<Dashboard>
  <MetricsOverview />
  <QuickActions />
  <RecentActivity />
</Dashboard>
```

#### ML Predictions (`MLPredictions.tsx`)
Machine learning predictions interface with model selection and visualization.

```tsx
<MLPredictions>
  <PredictionControls />
  <ModelComparison />
  <PredictionChart />
</MLPredictions>
```

#### AI Copilot (`AICopilot.tsx`)
AI-powered chat interface for natural language queries.

```tsx
<AICopilot>
  <ChatInterface />
  <MessageHistory />
  <SuggestionButtons />
</AICopilot>
```

### UI Components (`components/ui/`)
Reusable UI components built with Radix UI and Tailwind CSS.

- **Button**: Customizable button component
- **Card**: Content container with header and content
- **Input**: Form input with validation
- **Select**: Dropdown selection component
- **Table**: Data table with sorting and filtering
- **Toast**: Notification system

### Chart Components (`components/charts/`)
Data visualization components using Recharts.

- **EmissionsChart**: CO2 emissions visualization
- **EnergyChart**: Energy consumption trends
- **SupplierChart**: Supplier performance metrics
- **PredictionChart**: ML prediction visualizations

## 🎣 Custom Hooks

### usePredictions
Manages ML prediction state and API calls.

```tsx
const { predictions, loading, error, generatePredictions } = usePredictions();

// Generate predictions
generatePredictions({
  metric: 'CO2_Emissions_kg',
  forecast_days: 30,
  models: ['xgboost', 'lightgbm']
});
```

### useFileUpload
Handles file upload functionality with progress tracking.

```tsx
const { uploadFile, progress, isUploading } = useFileUpload();

// Upload file
uploadFile(file, {
  onProgress: (progress) => console.log(progress),
  onSuccess: (data) => console.log('Upload complete', data)
});
```

### useSustainabilityData
Manages sustainability data state and real-time updates.

```tsx
const { data, loading, error, refresh } = useSustainabilityData();

// Refresh data
refresh();
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=https://greenview-api-production.up.railway.app

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

## 🎨 Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

### Design System
- **Colors**: Consistent color palette for sustainability theme
- **Typography**: Inter font family for readability
- **Spacing**: 4px base unit for consistent spacing
- **Components**: Reusable component library

## 📊 Data Visualization

### Chart Types
- **Line Charts**: Time series data and trends
- **Bar Charts**: Comparative data and metrics
- **Area Charts**: Cumulative data visualization
- **Scatter Plots**: Correlation analysis
- **Gauge Charts**: Performance indicators

### Interactive Features
- **Zoom & Pan**: Detailed data exploration
- **Tooltips**: Contextual information on hover
- **Legends**: Toggle data series visibility
- **Responsive**: Adaptive to screen size

## 🧪 Testing

### Test Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Test Examples
```tsx
// Component test
import { render, screen } from '@testing-library/react';
import { MLPredictions } from './MLPredictions';

test('renders prediction controls', () => {
  render(<MLPredictions />);
  expect(screen.getByText('Generate Predictions')).toBeInTheDocument();
});

// Hook test
import { renderHook } from '@testing-library/react';
import { usePredictions } from './usePredictions';

test('initializes with empty predictions', () => {
  const { result } = renderHook(() => usePredictions());
  expect(result.current.predictions).toBeNull();
});
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Build for Production
```bash
# Build application
npm run build

# Preview production build
npm run preview
```

### Environment Setup
1. **Production**: Set all environment variables
2. **API**: Ensure backend API is accessible
3. **CDN**: Configure static asset delivery
4. **Monitoring**: Set up error tracking and analytics

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: WebP format and lazy loading
- **Caching**: Service worker for offline functionality

### Performance Metrics
- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: < 2MB optimized
- **Load Time**: < 3 seconds initial load
- **Time to Interactive**: < 5 seconds

## 🔒 Security

### Security Features
- **Input Validation**: Client-side validation
- **XSS Protection**: Sanitized user input
- **CSRF Protection**: Token-based protection
- **Content Security Policy**: Restricted resource loading

### Best Practices
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement proper error handling

## 🐛 Troubleshooting

### Common Issues

#### 1. API Connection Failed
```
Error: Failed to fetch
Solution: Check API URL and network connectivity
```

#### 2. Build Errors
```
Error: Module not found
Solution: Run npm install and check import paths
```

#### 3. Styling Issues
```
Error: Tailwind classes not working
Solution: Check Tailwind configuration and class names
```

### Debug Mode
```bash
# Enable debug mode
VITE_DEBUG=true npm run dev
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Component Structure
```tsx
// Component template
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Hooks
  // Event handlers
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### File Naming
- **Components**: PascalCase (e.g., `MLPredictions.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePredictions.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `PredictionTypes.ts`)

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Pull Request Guidelines
- Include tests for new features
- Update documentation
- Follow code style guidelines
- Add screenshots for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for sustainable development** 🌱