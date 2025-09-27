-- Clean up existing datasets and related data
-- Delete all dataset data first
DELETE FROM dataset_data;

-- Delete all sustainability metrics
DELETE FROM sustainability_metrics;

-- Delete all datasets
DELETE FROM datasets;