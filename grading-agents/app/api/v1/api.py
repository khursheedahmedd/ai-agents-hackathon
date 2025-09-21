from fastapi import APIRouter
from app.api.v1.endpoints import grading, coral_grading_simplified, coral_server

api_router = APIRouter()


api_router.include_router(
    coral_grading_simplified.router,
    prefix="/coral",
    tags=["coral-protocol"]
)

# Coral Server endpoints (for Coral Server integration)
api_router.include_router(
    coral_server.router,
    prefix="",
    tags=["coral-server"]
)
