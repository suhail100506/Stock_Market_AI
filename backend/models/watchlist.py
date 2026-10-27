from pydantic import BaseModel, Field, field_validator
from typing import List
from .stock import StockSummary

class WatchlistToggleRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        return v.upper().strip()

class WatchlistResponse(BaseModel):
    symbols: List[str]
    stocks: List[StockSummary]
    message: str
    mongo_saved: bool = True
    storage: str = "MongoDB (watchlists collection)"
