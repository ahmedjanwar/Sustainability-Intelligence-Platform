# Database - Sustainability Intelligence Platform

This directory contains the database schema, migrations, and configuration for the Sustainability Intelligence Platform using Supabase (PostgreSQL).

## Overview

The database stores sustainability data, user sessions, AI insights, ML predictions, and file processing metadata. It's designed to support real-time analytics, AI-powered insights, and machine learning predictions.

## Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy (Python backend integration)
- **Migrations**: Alembic
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for file uploads

## Database Schema

### Core Tables

#### sustainability_data
Stores raw sustainability metrics and KPIs
```sql
CREATE TABLE sustainability_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    data_source VARCHAR(100) NOT NULL, -- 'csv_upload', 'api', 'manual'
    category VARCHAR(50) NOT NULL, -- 'emissions', 'energy', 'waste', 'water'
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### calculated_scores
Stores processed sustainability scores and calculations
```sql
CREATE TABLE calculated_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    data_batch_id UUID NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    category_scores JSONB NOT NULL, -- {emissions: 85, energy: 72, waste: 90, water: 78}
    calculation_method VARCHAR(50) NOT NULL, -- 'weighted_average', 'custom'
    weights JSONB, -- Custom weightings used
    benchmark_comparison JSONB, -- Industry benchmark data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_insights
Stores AI-generated insights and recommendations
```sql
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    data_batch_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL, -- 'recommendation', 'analysis', 'trend'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    category VARCHAR(50) NOT NULL,
    suggested_actions JSONB, -- Array of actionable items
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ml_predictions
Stores ML model predictions and forecasts
```sql
CREATE TABLE ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    data_batch_id UUID NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'emissions_forecast', 'trend_analysis'
    prediction_period VARCHAR(20) NOT NULL, -- '1_month', '3_months', '1_year'
    predicted_values JSONB NOT NULL, -- Time series predictions
    confidence_interval JSONB, -- Upper and lower bounds
    model_accuracy DECIMAL(5,4), -- Model accuracy score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### file_uploads
Tracks file uploads and processing status
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'csv', 'excel', 'json'
    upload_status VARCHAR(20) NOT NULL, -- 'uploading', 'processing', 'completed', 'failed'
    processing_status VARCHAR(20), -- 'validating', 'calculating', 'ai_processing', 'completed'
    error_message TEXT,
    processing_results JSONB, -- Summary of processing results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_sessions
Stores user preferences and session data
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    preferences JSONB, -- User dashboard preferences, settings
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_sustainability_data_user_id ON sustainability_data(user_id);
CREATE INDEX idx_sustainability_data_category ON sustainability_data(category);
CREATE INDEX idx_sustainability_data_period ON sustainability_data(period_start, period_end);
CREATE INDEX idx_calculated_scores_user_id ON calculated_scores(user_id);
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ml_predictions_user_id ON ml_predictions(user_id);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
```

### Views

#### sustainability_dashboard_view
Aggregated view for dashboard data
```sql
CREATE VIEW sustainability_dashboard_view AS
SELECT 
    sd.user_id,
    sd.category,
    AVG(sd.value) as avg_value,
    MAX(sd.value) as max_value,
    MIN(sd.value) as min_value,
    COUNT(*) as data_points,
    cs.overall_score,
    cs.category_scores
FROM sustainability_data sd
LEFT JOIN calculated_scores cs ON sd.user_id = cs.user_id
GROUP BY sd.user_id, sd.category, cs.overall_score, cs.category_scores;
```

## Supabase Configuration

### Row Level Security (RLS)

Enable RLS on all tables to ensure data privacy:

```sql
-- Enable RLS
ALTER TABLE sustainability_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculated_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation
CREATE POLICY "Users can only see their own data" ON sustainability_data
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own scores" ON calculated_scores
    FOR ALL USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

### Functions and Triggers

#### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_sustainability_data_updated_at 
    BEFORE UPDATE ON sustainability_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Setup

### Supabase Project Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down project URL and anon key

2. **Database Configuration**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

3. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Initialize project
   supabase init

   # Link to remote project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

## Data Seeding

### Sample Data
The `sample_data/` directory contains:
- `sustainability_sample.csv` - Sample sustainability metrics
- `emissions_sample.csv` - Sample emissions data
- `energy_sample.csv` - Sample energy consumption data

### Seed Scripts
```bash
# Run seed scripts
python scripts/seed_sample_data.py
```

## Backup and Recovery

### Automated Backups
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Manual backup triggers via API

### Data Export
```sql
-- Export user data
COPY (
    SELECT * FROM sustainability_data 
    WHERE user_id = 'user-uuid'
) TO '/tmp/user_data.csv' WITH CSV HEADER;
```

## Performance Optimization

### Query Optimization
- Use appropriate indexes for common queries
- Implement query result caching
- Optimize complex aggregations

### Connection Pooling
- Configure connection pooling in Supabase
- Use read replicas for analytics queries
- Implement connection limits

## Monitoring and Maintenance

### Database Monitoring
- Monitor query performance
- Track storage usage
- Set up alerts for errors

### Maintenance Tasks
- Regular index maintenance
- Clean up old data
- Update statistics

## Security Considerations

### Data Protection
- All data encrypted at rest and in transit
- Row-level security for data isolation
- Regular security audits

### Access Control
- Role-based access control
- API key management
- Audit logging

## Troubleshooting

### Common Issues
1. **Connection Timeouts**: Check connection pool settings
2. **Slow Queries**: Review indexes and query plans
3. **Storage Limits**: Monitor and clean up old data

### Debug Tools
- Supabase Dashboard for query analysis
- PostgreSQL logs for detailed debugging
- Performance monitoring dashboards

## Contributing

1. **Schema Changes**: Always create migration files
2. **Testing**: Test migrations on development database
3. **Documentation**: Update this README for schema changes
4. **Backup**: Always backup before major changes

## License

This project is part of the Wärtsilä Sustainability Intelligence Platform hackathon challenge.
