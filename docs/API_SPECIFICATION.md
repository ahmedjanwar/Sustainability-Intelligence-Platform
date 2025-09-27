# GreenView API Specification

## Overview
This document outlines the REST API endpoints for the GreenView Sustainability Intelligence Platform backend, built with FastAPI and integrated with AI/ML capabilities.

## Base URL
```
http://localhost:8000/api/v1
```

---

## 1. Data Ingestion / Upload

### Upload CSV Dataset
**POST** `/upload/csv`

Upload a CSV dataset for sustainability analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: CSV file

**Response:**
```json
{
  "status": "success",
  "dataset_id": "uuid-string",
  "filename": "original_filename.csv",
  "rows_processed": 1500,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

### Fetch External Data
**POST** `/fetch/api`

Fetch external data via API (e.g., Fingrid, weather services).

**Request:**
```json
{
  "api_url": "https://api.fingrid.fi/v1/",
  "auth_token": "your-api-key",
  "endpoint": "production",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "dataset_id": "uuid-string",
  "source": "fingrid",
  "records_fetched": 744,
  "fetched_at": "2024-01-15T10:30:00Z"
}
```

---

## 2. Data Management

### List Datasets
**GET** `/datasets`

Retrieve all uploaded datasets with metadata.

**Response:**
```json
[
  {
    "dataset_id": "uuid-string",
    "filename": "energy_data.csv",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "size_mb": 2.5,
    "status": "processed",
    "rows": 1500
  }
]
```

### Get Dataset Details
**GET** `/datasets/{dataset_id}`

Get detailed information about a specific dataset.

**Response:**
```json
{
  "dataset_id": "uuid-string",
  "filename": "energy_data.csv",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "columns": ["timestamp", "energy_consumption", "renewable_share"],
  "sample_data": [
    ["2024-01-01T00:00:00Z", 150.5, 0.45],
    ["2024-01-01T01:00:00Z", 142.3, 0.48]
  ],
  "summary_stats": {
    "total_rows": 1500,
    "date_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:00:00Z"
    },
    "missing_values": 0
  }
}
```

### Delete Dataset
**DELETE** `/datasets/{dataset_id}`

Remove a dataset and all associated analysis results.

**Response:**
```json
{
  "status": "deleted",
  "dataset_id": "uuid-string",
  "deleted_at": "2024-01-15T11:00:00Z"
}
```

---

## 3. Sustainability Metrics / Dashboard

### Get Sustainability KPIs
**GET** `/metrics/{dataset_id}`

Compute comprehensive sustainability metrics for a dataset.

**Response:**
```json
{
  "sustainability_score": 82,
  "carbon_intensity": 0.35,
  "renewable_share": 48,
  "energy_efficiency": 0.78,
  "emissions_reduction": 12.5,
  "metrics": {
    "co2_emissions_kg": 1250.5,
    "renewable_energy_mwh": 450.2,
    "total_energy_mwh": 937.8,
    "efficiency_rating": "B+",
    "carbon_footprint": 0.35
  },
  "calculated_at": "2024-01-15T10:30:00Z"
}
```

### Get Dashboard Data
**GET** `/dashboard/{dataset_id}`

Return structured data for interactive dashboard charts.

**Response:**
```json
{
  "energy_mix": [
    {"source": "solar", "percentage": 35, "mwh": 328.2},
    {"source": "wind", "percentage": 25, "mwh": 234.5},
    {"source": "hydro", "percentage": 20, "mwh": 187.6},
    {"source": "fossil", "percentage": 20, "mwh": 187.5}
  ],
  "emissions_timeline": [
    {"date": "2024-01-01", "co2_kg": 45.2},
    {"date": "2024-01-02", "co2_kg": 42.8}
  ],
  "efficiency_trends": [
    {"date": "2024-01-01", "efficiency": 0.75},
    {"date": "2024-01-02", "efficiency": 0.78}
  ],
  "kpi_summary": {
    "sustainability_score": 82,
    "carbon_intensity": 0.35,
    "renewable_share": 48
  }
}
```

---

## 4. AI Insights

### Generate AI Insights
**GET** `/ai/insights/{dataset_id}`

Generate natural language insights and recommendations using AI analysis.

**Response:**
```json
{
  "insights": [
    "Switching to supplier B could reduce emissions by 12% based on historical data",
    "Your renewable energy share is 15% below industry average of 63%",
    "Peak energy consumption occurs at 2-4 PM; consider load shifting strategies",
    "Solar panel installation could increase renewable share to 65%"
  ],
  "recommendations": [
    {
      "priority": "high",
      "action": "Switch to renewable energy supplier",
      "potential_savings": "€2,400/year",
      "co2_reduction": "8.5 tons/year"
    },
    {
      "priority": "medium",
      "action": "Implement smart grid optimization",
      "potential_savings": "€1,200/year",
      "co2_reduction": "3.2 tons/year"
    }
  ],
  "generated_at": "2024-01-15T10:30:00Z",
  "confidence_score": 0.87
}
```

---

## 5. ML Predictions

### Predict Future Metrics
**POST** `/ml/predict/{dataset_id}`

Generate ML-based predictions for future sustainability metrics.

**Request:**
```json
{
  "time_horizon": "6_months",
  "prediction_type": "emissions_and_efficiency",
  "scenario": "current_trends"
}
```

**Response:**
```json
{
  "predictions": {
    "future_emissions": [
      {"date": "2024-02-01", "co2_kg": 38.5, "confidence": 0.85},
      {"date": "2024-03-01", "co2_kg": 36.2, "confidence": 0.82}
    ],
    "efficiency_forecast": [
      {"date": "2024-02-01", "efficiency": 0.80, "confidence": 0.88},
      {"date": "2024-03-01", "efficiency": 0.82, "confidence": 0.85}
    ],
    "renewable_share_forecast": [
      {"date": "2024-02-01", "percentage": 52, "confidence": 0.90},
      {"date": "2024-03-01", "percentage": 55, "confidence": 0.87}
    ]
  },
  "model_info": {
    "model_version": "v1.2",
    "training_date": "2024-01-10T00:00:00Z",
    "accuracy_score": 0.89
  },
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### Train ML Models
**POST** `/ml/train`

Retrain ML models using stored datasets.

**Request:**
```json
{
  "datasets": ["uuid-1", "uuid-2"],
  "model_type": "sustainability_forecast",
  "parameters": {
    "test_size": 0.2,
    "random_state": 42
  }
}
```

**Response:**
```json
{
  "status": "training_started",
  "job_id": "training-job-uuid",
  "estimated_duration": "15 minutes",
  "started_at": "2024-01-15T10:30:00Z"
}
```

---

## 6. Reports & Export

### Generate PDF Report
**GET** `/export/pdf/{dataset_id}`

Generate a comprehensive PDF sustainability report.

**Query Parameters:**
- `include_charts` (boolean): Include visualizations in PDF
- `language` (string): Report language (en, fi, sv)

**Response:**
- Content-Type: `application/pdf`
- Body: PDF file download

### Export JSON Data
**GET** `/export/json/{dataset_id}`

Download processed data and metrics as JSON.

**Response:**
```json
{
  "dataset_info": {
    "dataset_id": "uuid-string",
    "exported_at": "2024-01-15T10:30:00Z"
  },
  "raw_data": [...],
  "processed_metrics": {...},
  "ai_insights": {...},
  "ml_predictions": {...}
}
```

---

## 7. Health & Monitoring

### Health Check
**GET** `/health`

Check API health and status.

**Response:**
```json
{
  "status": "ok",
  "uptime": "2h34m",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "ml_engine": "healthy",
    "ai_service": "healthy"
  }
}
```

### Version Information
**GET** `/version`

Return backend and AI/ML module versions.

**Response:**
```json
{
  "api_version": "1.0.0",
  "ml_model_version": "v1.2.3",
  "ai_service_version": "v2.1.0",
  "build_date": "2024-01-15T08:00:00Z",
  "git_commit": "abc123def456"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid input parameters",
  "details": {...}
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Dataset not found",
  "dataset_id": "uuid-string"
}
```

### 422 Validation Error
```json
{
  "error": "validation_error",
  "message": "Invalid file format",
  "details": {
    "field": "file",
    "issue": "Expected CSV format"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "request_id": "req-uuid"
}
```

---

## Authentication

All endpoints require authentication via API key in the header:

```
Authorization: Bearer your-api-key-here
```

## Rate Limiting

- Upload endpoints: 10 requests per minute
- Analysis endpoints: 30 requests per minute
- Health endpoints: 100 requests per minute

---

*This specification will be updated as the API evolves during development.*
