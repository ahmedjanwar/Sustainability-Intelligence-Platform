from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

app = FastAPI(
    title="Sustainability Intelligence Platform API",
    description="API for sustainability data analysis and insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://sustainability-intelligence-platform.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Sustainability Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "deployed",
        "endpoints": {
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "sustainability-intelligence-platform"}

# Simple data endpoints without heavy ML dependencies
@app.get("/api/v1/sustainability/score")
async def get_sustainability_score():
    """Get sustainability score (simplified)"""
    return {
        "score": 85.5,
        "status": "good",
        "message": "Sustainability score calculated successfully"
    }

@app.get("/api/v1/sustainability/metrics")
async def get_sustainability_metrics():
    """Get sustainability metrics (simplified)"""
    return {
        "co2_emissions": 1250.5,
        "energy_consumption": 3200.8,
        "waste_generated": 450.2,
        "sustainability_score": 85.5
    }

@app.post("/api/v1/ai-copilot/chat")
async def ai_copilot_chat(question: dict):
    """AI Copilot chat endpoint (simplified)"""
    return {
        "question": question.get("question", ""),
        "response": "This is a simplified AI response. Full AI functionality requires additional setup.",
        "status": "success"
    }

@app.get("/api/v1/ml-predictions/forecast")
async def get_ml_predictions():
    """ML predictions endpoint (simplified)"""
    return {
        "message": "ML predictions require additional setup",
        "status": "simplified",
        "note": "Full ML functionality requires heavy dependencies"
    }

# Vercel requires this for serverless functions
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
