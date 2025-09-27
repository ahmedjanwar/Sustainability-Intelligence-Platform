#!/usr/bin/env python3
"""
Test script for the hybrid AI Copilot and ML Predictions endpoints.
This version works with both database and CSV fallback.
"""

import requests
import json
import time

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_health_checks():
    """Test health check endpoints"""
    print("🏥 Testing Health Check endpoints...")
    
    endpoints = [
        "/",
        "/health",
        "/api/v1/ai-copilot/health",
        "/api/v1/ml-predictions/health"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint}: {response.json()}")
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_ai_copilot():
    """Test the AI Copilot chatbot endpoint"""
    print("\n🤖 Testing AI Copilot endpoint...")
    
    # Test questions
    test_questions = [
        "What will be the electricity generation after 90 days using lightgbm?",
        "Predict CO2 emissions for the next 30 days",
        "What's the sustainability score in 60 days using xgboost?",
        "How much waste will be generated in 45 days?"
    ]
    
    for question in test_questions:
        print(f"\n📝 Question: {question}")
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/ai-copilot/chat",
                json={"question": question},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Answer: {data['metric']} prediction after {data['days_ahead']} days")
                print(f"   Model: {data['model']}")
                print(f"   Prediction: {data['prediction']}")
                print(f"   Change: {data['change']} ({data['percentage_change']}%)")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def test_ml_predictions():
    """Test the ML Predictions endpoint"""
    print("\n🔮 Testing ML Predictions endpoint...")
    
    # Test forecast
    forecast_request = {
        "metric": "CO2_Emissions_kg",
        "forecast_days": 30,
        "models": ["xgboost", "lightgbm"]
    }
    
    print(f"📊 Forecast request: {forecast_request}")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/ml-predictions/forecast",
            json=forecast_request,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Forecast created for {data['metric']}")
            print(f"   Current value: {data['current_value']}")
            print(f"   Sustainability score: {data['sustainability_score']}")
            print(f"   Latest predictions: {data['latest_predictions']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_sustainability_score():
    """Test the sustainability score endpoint"""
    print("\n🌱 Testing Sustainability Score endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/ml-predictions/sustainability-score", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Current sustainability score: {data['current_score']}%")
            print(f"   Gauge data: {data['gauge_data']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_available_metrics():
    """Test the available metrics endpoint"""
    print("\n📋 Testing Available Metrics endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/ml-predictions/available-metrics", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Available metrics: {data['available_metrics']}")
            print(f"   Total metrics: {data['total_metrics']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_data_source():
    """Test which data source is being used"""
    print("\n📊 Testing Data Source...")
    
    try:
        # Test a simple prediction to see data source info
        response = requests.post(
            f"{BASE_URL}/api/v1/ai-copilot/chat",
            json={"question": "What's the current CO2 emissions?"},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Data source test completed - check server logs for data source info")
        else:
            print(f"❌ Data source test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Data source test exception: {e}")

if __name__ == "__main__":
    print("🚀 Starting hybrid endpoint tests...")
    print("Make sure the FastAPI server is running on http://localhost:8000")
    print("=" * 60)
    
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(3)
    
    test_health_checks()
    test_available_metrics()
    test_sustainability_score()
    test_data_source()
    test_ml_predictions()
    test_ai_copilot()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\nTo start the server, run:")
    print("cd Backend && ./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\nAPI Documentation available at:")
    print("http://localhost:8000/docs")
