# Database Schema

This directory contains the database schema and related files for the GreenView Sustainability Intelligence Platform.

## Files

- `supabase_schema.sql` - Complete Supabase database schema with tables, indexes, RLS policies, and functions
- `README.md` - This documentation file

## Database Overview

The database is designed for Supabase (PostgreSQL) and includes:

### Core Tables
- **datasets** - Uploaded data files and metadata
- **dataset_data** - Raw data storage (JSONB for flexibility)
- **sustainability_metrics** - Calculated KPIs and metrics
- **dashboard_data** - Cached dashboard visualizations

### AI/ML Tables
- **ai_insights** - AI-generated insights and recommendations
- **ai_recommendations** - Actionable recommendations with impact metrics
- **ml_predictions** - ML model predictions and forecasts
- **ml_training_jobs** - Training job tracking and management

### Supporting Tables
- **reports** - Generated reports and exports
- **api_keys** - External API integrations
- **system_config** - Application configuration
- **audit_log** - System audit trail

## Key Features

### Simplified Access
- No authentication required
- All data is publicly accessible
- Simplified for development and testing

### Performance Optimizations
- Comprehensive indexing strategy
- Full-text search capabilities
- JSONB for flexible data storage
- Automatic cleanup of expired data

### Data Types
- Custom ENUMs for status tracking
- UUID primary keys for security
- JSONB for flexible metadata storage
- Proper timestamp handling with timezone support

## Setup Instructions

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Initialize project
   supabase init

   # Start local development
   supabase start
   ```

2. **Apply Schema**
   ```sql
   -- Run the schema file in your Supabase SQL editor
   -- or via CLI:
   supabase db reset
   ```

3. **Configure Environment**
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Database Functions

### Utility Functions
- `update_updated_at_column()` - Auto-update timestamps
- `cleanup_expired_data()` - Remove expired cache and reports
- `get_dataset_stats(dataset_uuid)` - Get comprehensive dataset statistics

### Views
- `dashboard_summary` - Aggregated view for dashboard data

## Data Retention

- **Dashboard data**: 1 hour (configurable)
- **Reports**: 7 days (configurable)
- **Audit logs**: 1 year (configurable)
- **Raw data**: Permanent (user-controlled deletion)

## Security Considerations

- All sensitive data is encrypted at rest
- API keys are stored securely
- Audit logging for compliance
- Regular cleanup of expired data
- No user authentication (development mode)

## Monitoring

The schema includes comprehensive monitoring capabilities:
- Audit logging for all actions
- Performance indexes for common queries
- Data retention policies
- System configuration tracking

## Migration Strategy

When updating the schema:
1. Create migration files with version numbers
2. Test migrations on development database
3. Backup production data before applying
4. Use Supabase migration tools for version control

## Backup and Recovery

- Regular automated backups via Supabase
- Point-in-time recovery available
- Export capabilities for data portability
- Cross-region replication for disaster recovery