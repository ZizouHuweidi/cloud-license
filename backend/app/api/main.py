from fastapi import APIRouter

from app.api.routes import login, private, users, utils, devices, licenses, notifications
from app.core.config import settings

api_router = APIRouter()

# Authentication and user management endpoints.
api_router.include_router(login.router)
api_router.include_router(users.router)

# Utility endpoints.
api_router.include_router(utils.router)

# New endpoints for license management.
api_router.include_router(devices.router)
api_router.include_router(licenses.router)
api_router.include_router(notifications.router)

# Include private routes only in the local environment.
if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
