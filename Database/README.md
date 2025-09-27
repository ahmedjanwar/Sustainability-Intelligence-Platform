# 🗄️ Database Documentation

Database schema and configuration for the Sustainability Intelligence Platform.

## 🏗️ Architecture

The platform uses **Supabase PostgreSQL** as the primary database, providing:
- **PostgreSQL**: Robust relational database
- **Real-time**: Live data synchronization
- **Authentication**: Built-in user management
- **Storage**: File upload capabilities
- **API**: Auto-generated REST API

## 📊 Database Schema

### Core Tables

#### 1. sustainability_table
Stores sustainability metrics and time series data.

```sql
CREATE TABLE sustainability_table (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    co2_emissions_kg FLOAT,
    energy_consumption_kwh FLOAT,
    waste_generated_kg FLOAT,
    heat_generation_mwh FLOAT,
    electricity_generation_mwh FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**
- `id`: Primary key (auto-increment)
- `timestamp`: Data timestamp (required)
- `co2_emissions_kg`: CO2 emissions in kilograms
- `energy_consumption_kwh`: Energy consumption in kWh
- `waste_generated_kg`: Waste generation in kilograms
- `heat_generation_mwh`: Heat generation in MWh
- `electricity_generation_mwh`: Electricity generation in MWh
- `created_at`: Record creation timestamp

#### 2. datasets
Stores uploaded dataset metadata.

```sql
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_size INTEGER,
    rows_count INTEGER,
    columns TEXT[],
    uploaded_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);
```

**Columns:**
- `id`: Primary key (UUID)
- `filename`: Original filename
- `file_size`: File size in bytes
- `rows_count`: Number of data rows
- `columns`: Array of column names
- `uploaded_at`: Upload timestamp
- `user_id`: Reference to user (if authenticated)

#### 3. system_config
Stores system configuration and settings.

```sql
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**
- `id`: Primary key (auto-increment)
- `config_key`: Configuration key (unique)
- `config_value`: Configuration value (JSON)
- `description`: Configuration description
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## 🔧 Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and enter project details
4. Set database password
5. Select region closest to your users

### 2. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase_schema.sql`
3. Click "Run" to execute the schema

### 3. Configure Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE sustainability_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public read access" ON sustainability_table
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON sustainability_table
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON datasets
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON datasets
    FOR INSERT WITH CHECK (true);
```

## 📊 Sample Data

### Insert Sample Data
```sql
-- Insert sample sustainability data
INSERT INTO sustainability_table (timestamp, co2_emissions_kg, energy_consumption_kwh, waste_generated_kg, heat_generation_mwh, electricity_generation_mwh)
VALUES 
  ('2024-01-01', 150.5, 1000.0, 50.0, 200.0, 1200.0),
  ('2024-01-02', 152.3, 1050.0, 52.0, 205.0, 1250.0),
  ('2024-01-03', 148.7, 980.0, 48.0, 195.0, 1180.0),
  ('2024-01-04', 155.2, 1100.0, 55.0, 210.0, 1300.0),
  ('2024-01-05', 149.8, 1020.0, 49.0, 198.0, 1220.0);
```

### Generate More Sample Data
```sql
-- Generate 365 days of sample data
INSERT INTO sustainability_table (timestamp, co2_emissions_kg, energy_consumption_kwh, waste_generated_kg, heat_generation_mwh, electricity_generation_mwh)
SELECT 
    generate_series('2024-01-01'::date, '2024-12-31'::date, '1 day'::interval) as timestamp,
    (150 + random() * 20)::float as co2_emissions_kg,
    (1000 + random() * 200)::float as energy_consumption_kwh,
    (50 + random() * 10)::float as waste_generated_kg,
    (200 + random() * 30)::float as heat_generation_mwh,
    (1200 + random() * 150)::float as electricity_generation_mwh;
```

## 🔍 Data Types

### Numeric Types
- **FLOAT**: Floating-point numbers for metrics
- **INTEGER**: Whole numbers for counts and IDs
- **SERIAL**: Auto-incrementing integer primary key

### Text Types
- **TEXT**: Variable-length text for descriptions
- **TEXT[]**: Array of text for column names

### Date/Time Types
- **TIMESTAMP**: Date and time with timezone
- **DATE**: Date only (if needed)

### UUID Types
- **UUID**: Universally unique identifier for datasets

## 📈 Indexes and Performance

### Recommended Indexes
```sql
-- Index on timestamp for time series queries
CREATE INDEX idx_sustainability_timestamp ON sustainability_table(timestamp);

-- Index on created_at for sorting
CREATE INDEX idx_sustainability_created_at ON sustainability_table(created_at);

-- Index on filename for dataset lookups
CREATE INDEX idx_datasets_filename ON datasets(filename);

-- Index on uploaded_at for dataset sorting
CREATE INDEX idx_datasets_uploaded_at ON datasets(uploaded_at);
```

### Query Optimization
```sql
-- Optimize time series queries
EXPLAIN ANALYZE 
SELECT * FROM sustainability_table 
WHERE timestamp >= '2024-01-01' 
ORDER BY timestamp DESC 
LIMIT 100;

-- Optimize aggregation queries
EXPLAIN ANALYZE
SELECT 
    DATE_TRUNC('month', timestamp) as month,
    AVG(co2_emissions_kg) as avg_co2
FROM sustainability_table 
GROUP BY month 
ORDER BY month;
```

## 🔒 Security

### Row Level Security (RLS)
```sql
-- Example RLS policies
CREATE POLICY "Users can view their own data" ON sustainability_table
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON sustainability_table
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON sustainability_table
    FOR UPDATE USING (auth.uid() = user_id);
```

### Data Validation
```sql
-- Add constraints for data validation
ALTER TABLE sustainability_table 
ADD CONSTRAINT check_positive_co2 
CHECK (co2_emissions_kg >= 0);

ALTER TABLE sustainability_table 
ADD CONSTRAINT check_positive_energy 
CHECK (energy_consumption_kwh >= 0);

ALTER TABLE sustainability_table 
ADD CONSTRAINT check_positive_waste 
CHECK (waste_generated_kg >= 0);
```

## 🔄 Data Migration

### Backup Data
```sql
-- Create backup table
CREATE TABLE sustainability_table_backup AS 
SELECT * FROM sustainability_table;

-- Export to CSV
COPY sustainability_table TO '/path/to/backup.csv' 
WITH CSV HEADER;
```

### Restore Data
```sql
-- Restore from backup table
INSERT INTO sustainability_table 
SELECT * FROM sustainability_table_backup;

-- Import from CSV
COPY sustainability_table FROM '/path/to/backup.csv' 
WITH CSV HEADER;
```

## 📊 Analytics and Reporting

### Common Queries

#### 1. Daily Averages
```sql
SELECT 
    DATE(timestamp) as date,
    AVG(co2_emissions_kg) as avg_co2,
    AVG(energy_consumption_kwh) as avg_energy,
    AVG(waste_generated_kg) as avg_waste
FROM sustainability_table 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;
```

#### 2. Monthly Trends
```sql
SELECT 
    DATE_TRUNC('month', timestamp) as month,
    AVG(co2_emissions_kg) as avg_co2,
    SUM(energy_consumption_kwh) as total_energy,
    AVG(waste_generated_kg) as avg_waste
FROM sustainability_table 
GROUP BY month 
ORDER BY month DESC;
```

#### 3. Year-over-Year Comparison
```sql
SELECT 
    EXTRACT(YEAR FROM timestamp) as year,
    AVG(co2_emissions_kg) as avg_co2,
    AVG(energy_consumption_kwh) as avg_energy
FROM sustainability_table 
GROUP BY year 
ORDER BY year;
```

## 🔧 Maintenance

### Regular Maintenance Tasks
1. **Vacuum**: Clean up dead tuples
2. **Analyze**: Update statistics
3. **Reindex**: Rebuild indexes
4. **Backup**: Create regular backups

### Maintenance Commands
```sql
-- Vacuum and analyze
VACUUM ANALYZE sustainability_table;

-- Reindex
REINDEX TABLE sustainability_table;

-- Check table size
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Issues
```
Error: Connection refused
Solution: Check Supabase credentials and network connectivity
```

#### 2. Permission Issues
```
Error: Permission denied
Solution: Check RLS policies and user permissions
```

#### 3. Performance Issues
```
Error: Query timeout
Solution: Add indexes and optimize queries
```

### Debug Commands
```sql
-- Check table statistics
SELECT * FROM pg_stat_user_tables WHERE relname = 'sustainability_table';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'sustainability_table';

-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## 📚 Additional Resources

### Supabase Documentation
- **Database**: [supabase.com/docs/guides/database](https://supabase.com/docs/guides/database)
- **SQL Editor**: [supabase.com/docs/guides/database/sql-editor](https://supabase.com/docs/guides/database/sql-editor)
- **Row Level Security**: [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

### PostgreSQL Documentation
- **Official Docs**: [postgresql.org/docs](https://postgresql.org/docs/)
- **SQL Reference**: [postgresql.org/docs/current/sql](https://postgresql.org/docs/current/sql)

### Tools
- **pgAdmin**: [pgadmin.org](https://pgadmin.org/)
- **DBeaver**: [dbeaver.io](https://dbeaver.io/)
- **Supabase CLI**: [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

## 📞 Support

For database issues:
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/sustainability-intelligence-platform/issues)
- **Community**: [Supabase Discord](https://discord.supabase.com/)

---

**Database Status**: ✅ Production Ready  
**Last Updated**: January 2025