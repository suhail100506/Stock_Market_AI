"""
StockSense-AI: Base Market Data Interfaces & Data Models
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class InstrumentMetadata(BaseModel):
    instrument_id: str
    symbol: str
    name: str
    exchange: str  # NSE, BSE, MCX, GLOBAL
    instrument_type: str  # EQUITY, INDEX, FUT_INDEX, OPT_INDEX, FUT_STOCK, OPT_STOCK, ETF, COMMODITY
    category: str  # equity, index, fno_index, fno_stock, etf, commodity, global_index
    sector: Optional[str] = "General"
    lot_size: int = 1
    tick_size: float = 0.05
    expiry: Optional[str] = None
    strike_price: Optional[float] = None
    option_type: Optional[str] = None  # CE, PE
    isin: Optional[str] = None


class NormalizedQuote(BaseModel):
    instrument_id: str
    symbol: str
    name: str
    exchange: str
    instrument_type: str
    ltp: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    prev_close: float
    volume: int
    volume_str: str
    timestamp: str
    market_status: str  # OPEN, CLOSED, PRE_OPEN, HOLIDAY
    data_source: str  # UPSTOX, ANGEL_ONE, KITE, EXTERNAL_MARKET_FEED, SIMULATED_EXCHANGE
    data_freshness: str  # LIVE, DELAYED_15M, EOD, SIMULATED
    sparkline: List[float] = Field(default_factory=list)


class NormalizedCandle(BaseModel):
    timestamp: int
    datetime_str: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class BaseMarketDataProvider(ABC):
    """
    Abstract interface for Indian market-data providers (Upstox, Angel One, Kite, Yahoo/NSE feeds).
    """

    @abstractmethod
    def get_quote(self, instrument_id: str) -> Optional[NormalizedQuote]:
        """Fetch quote for a single instrument identifier."""
        pass

    @abstractmethod
    def get_quotes_batch(self, instrument_ids: List[str]) -> Dict[str, NormalizedQuote]:
        """Fetch quotes in batch to minimize network roundtrips."""
        pass

    @abstractmethod
    def get_historical_candles(
        self, instrument_id: str, timeframe: str = "1D", count: int = 60
    ) -> List[NormalizedCandle]:
        """Fetch historical candlestick bars."""
        pass

    @abstractmethod
    def get_market_status(self) -> str:
        """Returns whether Indian stock exchanges (NSE/BSE) are OPEN, CLOSED, or in PRE_OPEN."""
        pass
