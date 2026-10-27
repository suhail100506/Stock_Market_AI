from pydantic import BaseModel, Field
from typing import List, Optional

class DepthEntry(BaseModel):
    price: float
    orders: int
    qty: int

class OrderBook(BaseModel):
    bids: List[DepthEntry]
    asks: List[DepthEntry]

class Technicals(BaseModel):
    rsi: float
    macd: str
    ema20: float
    ema50: float
    support: float
    resistance: float
    trend: str

class Sentiment(BaseModel):
    score: float
    label: str
    positive_pct: int
    news_count: int

class StockSummary(BaseModel):
    symbol: str
    name: str
    exchange: str = "NSE"
    sector: str
    ltp: float
    prev_close: float
    change: float
    change_percent: float
    volume: str
    market_cap: str
    ai_signal: str
    ai_confidence: int
    sparkline: List[float] = []

class StockDetail(StockSummary):
    open: float
    high: float
    low: float
    pe_ratio: float
    dividend_yield: str
    fifty_two_week_high: float
    fifty_two_week_low: float
    ai_target_price: float
    ai_stop_loss: float
    ai_summary: str
    sentiment: Sentiment
    technicals: Technicals
    order_book: OrderBook

class CandlePoint(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int
