-- Enable Row Level Security on all public tables
-- This fixes the critical security vulnerability where RLS was disabled

-- 1. Enable RLS on all tables
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co2_emissions_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- 2. Create security policies

-- HIGHLY SENSITIVE TABLES - Admin only access
-- API Keys: Extremely sensitive, no public access
CREATE POLICY "api_keys_admin_only" ON public.api_keys
  FOR ALL TO authenticated
  USING (false); -- No access for now, requires admin role system

-- Audit Log: Admin only access
CREATE POLICY "audit_log_admin_only" ON public.audit_log
  FOR ALL TO authenticated
  USING (false); -- No access for now, requires admin role system

-- System Config: Admin only access
CREATE POLICY "system_config_admin_only" ON public.system_config
  FOR ALL TO authenticated
  USING (false); -- No access for now, requires admin role system

-- REFERENCE DATA TABLES - Public read access
-- CO2 Emissions: Public reference data, read-only
CREATE POLICY "co2_emissions_public_read" ON public.co2_emissions_table
  FOR SELECT TO public
  USING (true);

-- Sustainability Table: Public reference data, read-only
CREATE POLICY "sustainability_table_public_read" ON public.sustainability_table
  FOR SELECT TO public
  USING (true);

-- USER DATA TABLES - Currently public access (to be restricted when auth is implemented)
-- Note: These policies are permissive now to avoid breaking existing functionality
-- They should be restricted to specific users once authentication is implemented

-- Datasets: User uploads their own data
CREATE POLICY "datasets_public_access" ON public.datasets
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Dataset Data: Related to user datasets
CREATE POLICY "dataset_data_public_access" ON public.dataset_data
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- AI Insights: Generated from user data
CREATE POLICY "ai_insights_public_access" ON public.ai_insights
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- AI Recommendations: Generated from user data
CREATE POLICY "ai_recommendations_public_access" ON public.ai_recommendations
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Dashboard Data: User-specific dashboard information
CREATE POLICY "dashboard_data_public_access" ON public.dashboard_data
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- ML Predictions: User-specific predictions
CREATE POLICY "ml_predictions_public_access" ON public.ml_predictions
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- ML Training Jobs: User-specific training jobs
CREATE POLICY "ml_training_jobs_public_access" ON public.ml_training_jobs
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Reports: User-specific reports
CREATE POLICY "reports_public_access" ON public.reports
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Sustainability Metrics: User-specific metrics
CREATE POLICY "sustainability_metrics_public_access" ON public.sustainability_metrics
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);