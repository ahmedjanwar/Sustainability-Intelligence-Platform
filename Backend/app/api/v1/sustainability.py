from fastapi import APIRouter

router = APIRouter(prefix="/sustainability", tags=["Sustainability"])

@router.get("/health")
async def health_check():
    """Health check endpoint for sustainability service"""
    return {"status": "healthy", "service": "sustainability"}
