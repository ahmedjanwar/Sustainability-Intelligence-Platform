# Frontend - Sustainability Intelligence Platform

This directory contains the frontend application for the Sustainability Intelligence Platform - a React + Next.js application that transforms massive amounts of sustainability data into actionable insights through interactive dashboards and AI-powered recommendations.

## Overview

The frontend is designed to make the invisible visible by providing intuitive data visualization and analytics interfaces that help organizations understand their sustainability impact. It features an AI Copilot chat interface and real-time sustainability scoring.

## Technology Stack

- **Framework**: React 18+ with Next.js 13+
- **Visualization**: Recharts + Plotly.js
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context + useReducer
- **API Client**: Axios + React Query
- **UI Components**: Custom components + Headless UI
- **Build Tool**: Next.js built-in bundler

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Backend API running on port 8000

### Installation

1. Clone the repository
2. Navigate to the Frontend directory
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

Start production server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   ├── charts/     # Chart and visualization components
│   │   ├── copilot/    # AI Copilot chat interface
│   │   └── common/     # Shared UI components
│   ├── pages/         # Next.js pages and API routes
│   │   ├── api/        # API routes
│   │   ├── dashboard/  # Dashboard pages
│   │   └── index.tsx   # Home page
│   ├── services/      # API services and data fetching
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── styles/        # Global styles and Tailwind config
│   ├── types/         # TypeScript type definitions
│   └── assets/        # Static assets
├── public/            # Public assets
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json       # Dependencies and scripts
```

## Features

### MVP Features
- [x] **Sustainability Score Display** - Real-time score (0-100) with visual indicators
- [x] **Interactive Dashboards** - Energy use, emissions, and supplier impact charts
- [x] **AI Copilot Chat** - Natural language interface for insights and recommendations
- [x] **File Upload Interface** - CSV upload with drag-and-drop functionality
- [x] **What-If Simulations** - Real-time score updates based on scenario changes

### Bonus Features
- [ ] **Advanced Filtering** - Drill-down capabilities and custom views
- [ ] **Mobile Responsive** - Mobile-friendly interface
- [ ] **Real-time Updates** - Live data streaming
- [ ] **Export Functionality** - PDF report generation
- [ ] **White-label Options** - Customizable branding

## API Integration

The frontend communicates with the Backend API to fetch and display sustainability data. See the Backend README for API documentation.

## Contributing

1. Follow the established code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## Environment Variables

Create a `.env.local` file in the root of the Frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

## Key Components

### Dashboard Components
- **SustainabilityScore**: Displays the main sustainability index (0-100)
- **EmissionsChart**: Interactive emissions visualization using Recharts
- **EnergyUsageChart**: Energy consumption trends and patterns
- **SupplierImpactChart**: Supply chain sustainability impact

### AI Copilot
- **CopilotChat**: Chat interface for natural language queries
- **InsightPanel**: AI-generated recommendations and insights
- **WhatIfSimulator**: Scenario modeling and score predictions

### Data Management
- **FileUpload**: Drag-and-drop CSV upload with validation
- **DataPreview**: Preview uploaded data before processing
- **ExportTools**: PDF report generation and data export

## Development Guidelines

1. **Component Structure**: Use functional components with TypeScript
2. **State Management**: Prefer React Context for global state, local state for component-specific data
3. **Styling**: Use Tailwind CSS classes with custom CSS modules when needed
4. **API Calls**: Use React Query for data fetching and caching
5. **Testing**: Write unit tests for components and integration tests for user flows

## License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.
