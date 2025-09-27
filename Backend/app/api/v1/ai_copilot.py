from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
import re
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import os
from datetime import datetime

router = APIRouter(prefix="/ai-copilot", tags=["AI Copilot"])

# Database configuration
DB_USERNAME = os.getenv('DB_USERNAME', 'postgres.bmwsulkktotsdxrhxlwp')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'GreenView1234')
DB_HOST = os.getenv('DB_HOST', 'aws-1-eu-west-3.pooler.supabase.com')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'postgres')
TABLE_NAME = os.getenv('TABLE_NAME', 'sustainability_table')

# Request/Response models
class ChatbotRequest(BaseModel):
    question: str

class ChatbotResponse(BaseModel):
    metric: str
    model: str
    days_ahead: int
    prediction: float
    current_value: float
    change: float
    percentage_change: float
    change_label: str
    forecast_data: list

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None

# Supported metrics and aliases
METRIC_MAP = {
    "co2": "CO2_Emissions_kg",
    "waste": "Waste_Generated_kg",
    "score": "Sustainability_Score",
    "sustainability": "Sustainability_Score",
    "heat": "Heat_Generation_MWh",
    "electricity": "Electricity_Generation_MWh",
    "power": "Electricity_Generation_MWh"
}

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
    return sum(row.get(k, 0) * w for k, w in weights.items())

def prepare_data(df):
    """Prepare data with time features and sustainability score"""
    if 'Timestamp' not in df.columns:
        raise HTTPException(status_code=400, detail="Missing 'Timestamp' column in dataset")
    
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df['Year'] = df['Timestamp'].dt.year
    df['Month'] = df['Timestamp'].dt.month
    df['DayOfYear'] = df['Timestamp'].dt.dayofyear
    df['Elapsed_Days'] = (df['Timestamp'] - df['Timestamp'].min()).dt.days
    
    # Calculate sustainability score
    df['Sustainability_Score'] = df.apply(calculate_sustainability_score, axis=1)
    df['Sustainability_Score'] = MinMaxScaler().fit_transform(df[['Sustainability_Score']])
    
    return df

def parse_question(question: str) -> tuple[str, int, str]:
    """Parse natural language question to extract metric, days, and model"""
    question_lower = question.lower()
    
    # Extract days
    days_match = re.search(r"(\d+)\s*(day|days|din)", question_lower)
    days_ahead = int(days_match.group(1)) if days_match else 30
    
    # Extract model
    model_name = "lightgbm" if "lightgbm" in question_lower else "xgboost" if "xgboost" in question_lower else "random_forest"
    
    # Extract target metric
    target = None
    for key, col in METRIC_MAP.items():
        if key in question_lower:
            target = col
            break
    
    if not target:
        raise HTTPException(
            status_code=400, 
            detail="Couldn't detect the metric you're asking about. Supported metrics: CO2, waste, score, sustainability, heat, electricity, power"
        )
    
    return target, days_ahead, model_name

def train_model_and_predict(df, target, days_ahead, model_name):
    """Train model and make prediction"""
    feature_cols = ['Energy_Consumption_kWh', 'Elapsed_Days', 'Month', 'DayOfYear']
    
    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"'{target}' column not found in dataset")
    
    # Prepare data
    data = df.dropna(subset=feature_cols + [target])
    X = data[feature_cols]
    y = data[target]
    
    if len(X) == 0:
        raise HTTPException(status_code=400, detail="No valid data for training")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model based on selection
    try:
        if model_name == "xgboost":
            model = XGBRegressor(n_estimators=100, random_state=42)
        elif model_name == "lightgbm":
            model = LGBMRegressor(n_estimators=100, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        
        model.fit(X_train, y_train)
    except Exception as e:
        print(f"⚠️ {model_name} failed, falling back to RandomForest: {e}")
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        model_name = "random_forest"
    
    # Make prediction
    future_day = df['Elapsed_Days'].max() + days_ahead
    future_month = (df['Month'].iloc[-1] + (days_ahead // 30)) % 12 or 12
    future_doy = (df['DayOfYear'].iloc[-1] + days_ahead) % 365 or 365
    
    future_input = pd.DataFrame([{
        'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
        'Elapsed_Days': future_day,
        'Month': future_month,
        'DayOfYear': future_doy
    }])
    
    prediction = model.predict(future_input)[0]
    
    # Generate forecast data for chart
    forecast_data = []
    for d in range(0, days_ahead + 1, max(1, days_ahead // 15)):
        ed = df['Elapsed_Days'].max() + d
        m = (df['Month'].iloc[-1] + (d // 30)) % 12 or 12
        doy = (df['DayOfYear'].iloc[-1] + d) % 365 or 365
        row = pd.DataFrame([{
            'Energy_Consumption_kWh': df['Energy_Consumption_kWh'].iloc[-1],
            'Elapsed_Days': ed,
            'Month': m,
            'DayOfYear': doy
        }])
        pred = model.predict(row)[0]
        forecast_data.append({"days_ahead": d, "prediction": float(pred)})
    
    return prediction, forecast_data, model_name

@router.post("/chat", response_model=ChatbotResponse)
async def chatbot_query(request: ChatbotRequest):
    """
    Process natural language questions about sustainability metrics and return predictions.
    
    Example questions:
    - "What will be the electricity generation after 90 days using lightgbm?"
    - "Predict CO2 emissions for the next 30 days"
    - "What's the sustainability score in 60 days?"
    """
    try:
        # Load and prepare data
        df = load_data()
        df = prepare_data(df)
        
        # Parse question
        target, days_ahead, model_name = parse_question(request.question)
        
        # Train model and predict
        prediction, forecast_data, actual_model = train_model_and_predict(df, target, days_ahead, model_name)
        
        # Calculate current value and changes
        current_value = df[target].iloc[-1]
        
        # Handle sustainability score scaling
        if target == "Sustainability_Score":
            prediction *= 100
            current_value *= 100
        
        change = prediction - current_value
        pct_change = (change / current_value) * 100 if current_value else 0
        change_label = "increase" if change > 0 else "decrease"
        
        # Scale forecast data if needed
        if target == "Sustainability_Score":
            for item in forecast_data:
                item["prediction"] *= 100
        
        return ChatbotResponse(
            metric=target.replace('_', ' '),
            model=actual_model.upper(),
            days_ahead=days_ahead,
            prediction=round(prediction, 2),
            current_value=round(current_value, 2),
            change=round(change, 2),
            percentage_change=round(pct_change, 1),
            change_label=change_label,
            forecast_data=forecast_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for the AI copilot service"""
    return {"status": "healthy", "service": "ai-copilot"}
