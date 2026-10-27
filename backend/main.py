import os
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import sub-routers
from .routes.stocks import router as stocks_router
from .routes.portfolio import router as portfolio_router
from .routes.orders import router as orders_router
from .routes.prediction import router as prediction_router
from .routes.auth import router as auth_router
from .routes.market_data_routes import router as market_data_router

app = FastAPI(
    title="StockSense AI API",
    description="Backend API for AI-powered Indian stock market analysis & paper trading platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allow all for development & testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for clean error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "path": request.url.path,
            "timestamp": datetime.now().isoformat()
        }
    )

# Health Check Endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Service health check endpoint returning server status, MongoDB persistence, and uptime info.
    """
    from database.mongo import mongo_watchlist
    return {
        "status": "healthy",
        "service": "StockSense-AI Backend",
        "version": "1.0.0",
        "environment": os.getenv("ENV", "development"),
        "mongodb": "connected" if mongo_watchlist.is_connected else "resilient_cache_mirror_active",
        "timestamp": datetime.now().isoformat(),
        "market_status": "SIMULATED_SESSION_OPEN"
    }

# Register API Routers
app.include_router(stocks_router)
app.include_router(portfolio_router)
app.include_router(orders_router)
app.include_router(prediction_router)
app.include_router(auth_router)
app.include_router(market_data_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
