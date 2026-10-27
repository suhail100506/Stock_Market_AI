from pydantic import BaseModel
from typing import List

class HoldingItem(BaseModel):
    symbol: str
    name: str
    quantity: int
    avg_price: float
    current_price: float
    invested_value: float
    current_value: float
    unrealized_pnl: float
    pnl_percentage: float

class PositionItem(BaseModel):
    id: str
    symbol: str
    name: str
    product: str
    side: str
    quantity: int
    avg_price: float
    current_price: float
    unrealized_pnl: float
    pnl_percentage: float

class PortfolioSummaryResponse(BaseModel):
    virtual_cash: float
    invested_value: float
    current_holdings_value: float
    total_holdings_pnl: float
    holdings_pnl_pct: float
    positions_pnl: float
    total_portfolio_value: float
    holdings: List[HoldingItem]
    positions: List[PositionItem]
