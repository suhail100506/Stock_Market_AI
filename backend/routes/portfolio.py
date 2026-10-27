from fastapi import APIRouter
from ..models.portfolio import PortfolioSummaryResponse
from ..services.portfolio_service import get_portfolio, reset_virtual_portfolio

router = APIRouter(prefix="/api", tags=["Portfolio"])

@router.get("/portfolio", response_model=PortfolioSummaryResponse, summary="Get paper trading portfolio")
def get_user_portfolio():
    """
    Returns the user's paper trading summary, including available virtual cash,
    delivery holdings (CNC), active intraday positions (MIS), and real-time P&L.
    """
    return get_portfolio()

@router.post("/portfolio/reset", summary="Reset virtual paper trading portfolio")
def reset_user_portfolio():
    """
    Resets the user's paper trading wallet to the initial ₹10,00,000 INR balance
    and clears all simulated holdings and positions.
    """
    return reset_virtual_portfolio()

