-- GreenView Sustainability Intelligence Platform
-- Supabase Database Schema
-- Version: 1.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
CREATE TYPE dataset_status AS ENUM ('uploading', 'processing', 'processed', 'failed');
CREATE TYPE prediction_type AS ENUM ('emissions', 'efficiency', 'renewable_share', 'comprehensive');
CREATE TYPE insight_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Datasets table
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_mb DECIMAL(10,2),
    file_type VARCHAR(50) DEFAULT 'csv',
    status dataset_status DEFAULT 'uploading',
    source_type VARCHAR(50) DEFAULT 'upload',
    source_url TEXT,
    rows_count INTEGER,
    columns JSONB,
    sample_data JSONB,
    summary_stats JSONB,
    upload_progress INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Raw dataset storage
CREATE TABLE dataset_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sustainability metrics
CREATE TABLE sustainability_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sustainability_score DECIMAL(5,2),
    carbon_intensity DECIMAL(10,4),
    renewable_share DECIMAL(5,2),
    energy_efficiency DECIMAL(5,4),
    emissions_reduction DECIMAL(5,2),
    co2_emissions_kg DECIMAL(12,2),
    renewable_energy_mwh DECIMAL(12,2),
    total_energy_mwh DECIMAL(12,2),
    efficiency_rating VARCHAR(10),
    carbon_footprint DECIMAL(10,4),
    additional_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard cache
CREATE TABLE dashboard_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- AI insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    priority insight_priority DEFAULT 'medium',
    confidence_score DECIMAL(3,2),
    category VARCHAR(100),
    actionable BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendations
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES ai_insights(id) ON DELETE CASCADE,
    action_title VARCHAR(255) NOT NULL,
    action_description TEXT,
    priority insight_priority DEFAULT 'medium',
    potential_savings_eur DECIMAL(12,2),
    co2_reduction_kg DECIMAL(12,2),
    implementation_effort VARCHAR(50),
    payback_period_months INTEGER,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML predictions
CREATE TABLE ml_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    prediction_type prediction_type NOT NULL,
    time_horizon VARCHAR(50) NOT NULL,
    scenario VARCHAR(50) DEFAULT 'current_trends',
    predictions JSONB NOT NULL,
    model_version VARCHAR(50),
    accuracy_score DECIMAL(3,2),
    confidence_scores JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML training jobs
CREATE TABLE ml_training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    datasets UUID[] NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    parameters JSONB,
    accuracy_score DECIMAL(3,2),
    training_duration_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT,
    file_size_mb DECIMAL(10,2),
    language VARCHAR(10) DEFAULT 'en',
    include_charts BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name VARCHAR(255) NOT NULL,
    key_value TEXT NOT NULL,
    service VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_dashboard_data_expires_at ON dashboard_data(expires_at);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();