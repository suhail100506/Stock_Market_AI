"""
StockSense-AI Market Data Architecture Package
"""
from .base import BaseMarketDataProvider, NormalizedQuote, NormalizedCandle
from .normalizer import normalize_quote, normalize_candles
from .cache import MarketDataCache
from .instrument_master import InstrumentMaster
from .provider_adapter import MarketDataProviderAdapter
from .websocket_manager import MarketDataWebSocketManager

__all__ = [
    "BaseMarketDataProvider",
    "NormalizedQuote",
    "NormalizedCandle",
    "normalize_quote",
    "normalize_candles",
    "MarketDataCache",
    "InstrumentMaster",
    "MarketDataProviderAdapter",
    "MarketDataWebSocketManager",
]
