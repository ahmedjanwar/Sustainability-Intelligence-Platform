from fastapi import APIRouter

router = APIRouter(prefix="/data-upload", tags=["Data Upload"])

@router.get("/health")
async def health_check():
    """Health check endpoint for data upload service"""
    return {"status": "healthy", "service": "data-upload"}
