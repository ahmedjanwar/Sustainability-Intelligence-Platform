from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta
import os

router = APIRouter(prefix="/ml-predictions", tags=["ML Predictions"])

# Database configuration
DB_USERNAME = os.getenv('DB_USERNAME', 'postgres.bmwsulkktotsdxrhxlwp')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'GreenView1234')
DB_HOST = os.getenv('DB_HOST', 'aws-1-eu-west-3.pooler.supabase.com')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'postgres')
TABLE_NAME = os.getenv('TABLE_NAME', 'sustainability_table')

# Request/Response models
class PredictionRequest(BaseModel):
    metric: str
    forecast_days: int = 730
    models: Optional[List[str]] = ["xgboost", "lightgbm"]

class PredictionResponse(BaseModel):
    metric: str
    forecast_days: int
    current_value: float
    sustainability_score: float
    predictions: Dict[str, List[Dict[str, Any]]]
    latest_predictions: Dict[str, float]

class SustainabilityScoreResponse(BaseModel):
    current_score: float
    score_percentage: float
    gauge_data: Dict[str, Any]

def load_data():
    """Load data from database or CSV fallback"""
    try:
        # Try database first
        from sqlalchemy import create_engine
        db_url = f'postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
        engine = create_engine(db_url)
        df = pd.read_sql(f"SELECT * FROM {TABLE_NAME}", engine)
        print("✅ Data loaded from database")
        return df
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("📁 Falling back to CSV data...")
        try:
            # Fallback to CSV
            csv_path = os.path.join(os.path.dirname(__file__), "../../../sustainability_dataset.csv")
            df = pd.read_csv(csv_path)
            print("✅ Data loaded from CSV file")
            return df
        except Exception as csv_error:
            print(f"⚠️ CSV loading failed: {csv_error}")
            print("🔧 Generating sample data...")
            # Generate sample data as last resort
            np.random.seed(42)
            dates = pd.date_range(start='2023-01-01', end='2024-01-01', freq='D')
            n = len(dates)
            
            df = pd.DataFrame({
                'Timestamp': dates,
                'CO2_Emissions_kg': np.random.normal(150, 20, n),
                'Energy_Consumption_kWh': np.random.normal(1000, 100, n),
                'Waste_Generated_kg': np.random.normal(50, 10, n),
                'Heat_Generation_MWh': np.random.normal(200, 30, n),
                'Electricity_Generation_MWh': np.random.normal(1200, 150, n)
            })
            print("✅ Sample data generated")
            return df

def calculate_sustainability_score(row):
    """Calculate sustainability score for a row"""
    weights = {
        'CO2_Emissions_kg': -0.5,
        'Energy_Consumption_kWh': -0.3,
        'Waste_Generated_kg': -0.2
    }
    score = 0
    for feature, weight in weights.items():
        if feature in row:
            score += weight * row[feature]
    return score

def prepare_data(df):
    """Prepare data with time features and sustainability score"""
    if 'Timestamp' not in df.columns:
        raise HTTPException(status_code=400, detail="'Timestamp' column missing in dataset")
    
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df['Year'] = df['Timestamp'].dt.year
    df['Month'] = df['Timestamp'].dt.month
    df['DayOfYear'] = df['Timestamp'].dt.dayofyear
    df['Elapsed_Days'] = (df['Timestamp'] - df['Timestamp'].min()).dt.days
    
    # Calculate sustainability score
    df['Sustainability_Score'] = df.apply(calculate_sustainability_score, axis=1)
    scaler = MinMaxScaler()
    df['Sustainability_Score'] = scaler.fit_transform(df[['Sustainability_Score']])
    
    return df

def train_models(df, metric, feature_cols, models_to_use):
    """Train models with fallback"""
    data = df.dropna(subset=feature_cols + [metric])
    X = data[feature_cols]
    y = data[metric]
    
    if len(X) == 0:
        raise HTTPException(status_code=400, detail="No valid data for training")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    trained_models = {}
    
    for model_name in models_to_use:
        try:
            if model_name == "xgboost":
                model = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
            elif model_name == "lightgbm":
                model = LGBMRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
            else:
                model = RandomForestRegressor(n_estimators=100, random_state=42)
            
            model.fit(X_train, y_train)
            trained_models[model_name] = model
            print(f"✅ {model_name} trained successfully")
            
        except Exception as e:
            print(f"⚠️ {model_name} failed: {e}")
            # Fallback to RandomForest
            fallback_model = RandomForestRegressor(n_estimators=100, random_state=42)
            fallback_model.fit(X_train, y_train)
            trained_models[f"{model_name}_fallback"] = fallback_model
            print(f"✅ {model_name} fallback (RandomForest) trained")
    
    return trained_models

def generate_predictions(df, models, metric, forecast_days, feature_cols):
    """Generate predictions for future dates"""
    future_dates = [df['Timestamp'].max() + timedelta(days=i) for i in range(1, forecast_days + 1)]
    future_df = pd.DataFrame({
        'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
        'Elapsed_Days': range(df['Elapsed_Days'].max() + 1, df['Elapsed_Days'].max() + forecast_days + 1),
        'Month': [(df['Month'].iloc[-1] + (i // 30)) % 12 or 12 for i in range(forecast_days)],
        'DayOfYear': [(df['DayOfYear'].iloc[-1] + i) % 365 or 365 for i in range(forecast_days)]
    })
    future_df['Date'] = future_dates
    
    predictions = {}
    latest_predictions = {}
    
    for model_name, model in models.items():
        pred = model.predict(future_df[feature_cols])
        
        # Scale predictions for sustainability score
        if metric == 'Sustainability_Score':
            pred = pred * 100
        
        predictions[model_name] = [
            {
                "date": future_dates[i].isoformat(),
                "prediction": float(pred[i]),
                "days_ahead": i + 1
            }
            for i in range(len(pred))
        ]
        latest_predictions[model_name] = float(pred[-1])
    
    return predictions, latest_predictions

@router.post("/forecast", response_model=PredictionResponse)
async def create_forecast(request: PredictionRequest):
    """
    Create forecasts for sustainability metrics using XGBoost and LightGBM models.
    
    Supported metrics:
    - CO2_Emissions_kg
    - Waste_Generated_kg
    - Sustainability_Score
    - Heat_Generation_MWh
    - Electricity_Generation_MWh
    """
    try:
        # Load and prepare data
        df = load_data()
        df = prepare_data(df)
        
        metric = request.metric
        forecast_days = request.forecast_days
        models_to_use = request.models or ["xgboost", "lightgbm"]
        
        if metric not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{metric}' not found in dataset")
        
        # Prepare features
        feature_cols = ['Energy_Consumption_kWh', 'Elapsed_Days', 'Month', 'DayOfYear']
        
        # Train models
        models = train_models(df, metric, feature_cols, models_to_use)
        
        if not models:
            raise HTTPException(status_code=400, detail="No models could be trained")
        
        # Generate predictions
        predictions, latest_predictions = generate_predictions(df, models, metric, forecast_days, feature_cols)
        
        # Get current value
        current_value = df[metric].iloc[-1]
        if metric == 'Sustainability_Score':
            current_value *= 100
        
        # Get current sustainability score
        sustainability_score = df['Sustainability_Score'].iloc[-1] * 100
        
        return PredictionResponse(
            metric=metric,
            forecast_days=forecast_days,
            current_value=round(current_value, 2),
            sustainability_score=round(sustainability_score, 2),
            predictions=predictions,
            latest_predictions=latest_predictions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/sustainability-score", response_model=SustainabilityScoreResponse)
async def get_sustainability_score():
    """Get current sustainability score with gauge data for visualization"""
    try:
        # Load and prepare data
        df = load_data()
        df = prepare_data(df)
        
        # Get latest sustainability score
        latest_score = df['Sustainability_Score'].iloc[-1] * 100
        
        # Prepare gauge data for visualization
        gauge_data = {
            "value": latest_score,
            "axis_range": [0, 100],
            "steps": [
                {"range": [0, 40], "color": "red"},
                {"range": [40, 70], "color": "orange"},
                {"range": [70, 100], "color": "lightgreen"}
            ]
        }
        
        return SustainabilityScoreResponse(
            current_score=round(latest_score, 2),
            score_percentage=round(latest_score, 2),
            gauge_data=gauge_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/available-metrics")
async def get_available_metrics():
    """Get list of available metrics for prediction"""
    try:
        df = load_data()
        available_metrics = [
            'CO2_Emissions_kg',
            'Waste_Generated_kg',
            'Sustainability_Score',
            'Heat_Generation_MWh',
            'Electricity_Generation_MWh'
        ]
        
        # Filter to only include metrics that exist in the dataset
        existing_metrics = [metric for metric in available_metrics if metric in df.columns]
        
        return {
            "available_metrics": existing_metrics,
            "total_metrics": len(existing_metrics)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for the ML predictions service"""
    return {"status": "healthy", "service": "ml-predictions"}
