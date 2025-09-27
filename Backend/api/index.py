from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.api.v1 import ai_copilot, ml_predictions, sustainability, data_upload

app = FastAPI(
    title="Sustainability Intelligence Platform API",
    description="API for sustainability data analysis, predictions, and AI-powered insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://*.vercel.app",  # Vercel deployments
        "https://sustainability-intelligence-platform.vercel.app",  # Replace with your actual domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_copilot.router, prefix="/api/v1")
app.include_router(ml_predictions.router, prefix="/api/v1")
app.include_router(sustainability.router, prefix="/api/v1")
app.include_router(data_upload.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Sustainability Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "ai_copilot": "/api/v1/ai-copilot/",
            "ml_predictions": "/api/v1/ml-predictions/",
            "sustainability": "/api/v1/sustainability/",
            "data_upload": "/api/v1/data-upload/"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "sustainability-intelligence-platform"}

# Vercel requires this for serverless functions
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
