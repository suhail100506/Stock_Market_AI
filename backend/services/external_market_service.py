import os
import time
import json
import logging
from datetime import datetime
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List

logger = logging.getLogger("stocksense.market_provider")

# In-memory TTL Cache
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "60"))

# Indian Equity Symbol Mapping for External Market Feeds (NSE suffix: .NS)
INDIAN_SYMBOL_MAP = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "ITC": "ITC.NS",
    "LT": "LT.NS",
    "ZOMATO": "ZOMATO.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "SBIN": "SBIN.NS",
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
}

def get_cached(key: str) -> Optional[Any]:
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["timestamp"] < CACHE_TTL_SECONDS):
        return entry["data"]
    return None

def set_cached(key: str, data: Any):
    _CACHE[key] = {
        "timestamp": time.time(),
        "data": data,
    }

def fetch_external_chart(symbol: str, range_str: str = "1mo", interval: str = "1d") -> Optional[Dict[str, Any]]:
    """
    Fetches raw market quotes and OHLCV time-series from external market feed.
    Uses Yahoo Finance API with user-agent header.
    """
    clean_sym = symbol.upper().strip()
    ext_ticker = INDIAN_SYMBOL_MAP.get(clean_sym, f"{clean_sym}.NS")
    cache_key = f"chart_{ext_ticker}_{range_str}_{interval}"

    cached = get_cached(cache_key)
    if cached:
        return cached

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ext_ticker}?range={range_str}&interval={interval}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode())
                set_cached(cache_key, payload)
                return payload
    except Exception as exc:
        logger.warning(f"External market API fetch failed for {ext_ticker}: {exc}. Using normalized simulation fallback.")
        return None

def normalize_external_quote(symbol: str, raw_data: Dict[str, Any], fallback_meta: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms raw External Market API response into StockSense Normalized JSON.
    """
    try:
        chart_result = raw_data.get("chart", {}).get("result", [])[0]
        meta = chart_result.get("meta", {})
        indicators = chart_result.get("indicators", {}).get("quote", [])[0]

        ltp = float(meta.get("regularMarketPrice", fallback_meta.get("ltp", 0.0)))
        prev_close = float(meta.get("chartPreviousClose", meta.get("previousClose", fallback_meta.get("prev_close", ltp))))
        day_high = float(meta.get("regularMarketDayHigh", fallback_meta.get("high", ltp * 1.01)))
        day_low = float(meta.get("regularMarketDayLow", fallback_meta.get("low", ltp * 0.99)))
        raw_volume = meta.get("regularMarketVolume", 0)

        # Format human-readable volume
        if raw_volume > 1_000_000:
            volume_str = f"{raw_volume / 1_000_000:.2f}M"
        elif raw_volume > 1_000:
            volume_str = f"{raw_volume / 1_000:.1f}K"
        else:
            volume_str = fallback_meta.get("volume", "2.5M")

        # Extract recent close prices for sparkline
        closes = [c for c in indicators.get("close", []) if c is not None]
        sparkline = closes[-10:] if len(closes) >= 10 else fallback_meta.get("sparkline", [ltp] * 10)

        change = round(ltp - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close > 0 else 0.0

        return {
            "symbol": symbol,
            "name": fallback_meta.get("name", symbol),
            "exchange": "NSE",
            "sector": fallback_meta.get("sector", "Equities"),
            "ltp": round(ltp, 2),
            "prev_close": round(prev_close, 2),
            "open": round(float(meta.get("regularMarketDayLow", ltp)), 2),
            "high": round(day_high, 2),
            "low": round(day_low, 2),
            "change": change,
            "change_percent": change_pct,
            "volume": volume_str,
            "market_cap": fallback_meta.get("market_cap", "₹5.0 Lakh Cr"),
            "pe_ratio": fallback_meta.get("pe_ratio", 25.0),
            "dividend_yield": fallback_meta.get("dividend_yield", "1.0%"),
            "fifty_two_week_high": float(meta.get("fiftyTwoWeekHigh", fallback_meta.get("fifty_two_week_high", ltp * 1.2))),
            "fifty_two_week_low": float(meta.get("fiftyTwoWeekLow", fallback_meta.get("fifty_two_week_low", ltp * 0.8))),
            "sparkline": [round(s, 2) for s in sparkline],
            "ai_signal": fallback_meta.get("ai_signal", "BUY"),
            "ai_confidence": fallback_meta.get("ai_confidence", 80),
            "ai_target_price": round(ltp * 1.08, 2),
            "ai_stop_loss": round(ltp * 0.95, 2),
            "ai_summary": fallback_meta.get("ai_summary", "Live external market feed aggregated into StockSense AI normalized schema."),
            "sentiment": fallback_meta.get("sentiment", {"score": 0.65, "label": "Bullish", "positive_pct": 75, "news_count": 20}),
            "technicals": fallback_meta.get("technicals", {
                "rsi": 58.4,
                "macd": "Bullish",
                "ema20": round(ltp * 0.99, 2),
                "ema50": round(ltp * 0.97, 2),
                "support": round(day_low * 0.99, 2),
                "resistance": round(day_high * 1.01, 2),
                "trend": "Upward Channel",
            }),
            "order_book": fallback_meta.get("order_book", {
                "bids": [{"price": round(ltp - 0.5, 2), "orders": 30, "qty": 1500}],
                "asks": [{"price": round(ltp + 0.5, 2), "orders": 25, "qty": 1200}],
            }),
            "data_source": "EXTERNAL_MARKET_API"
        }
    except Exception as exc:
        logger.error(f"Normalization error for {symbol}: {exc}")
        return fallback_meta

def normalize_external_history(raw_data: Dict[str, Any], timeframe: str) -> Optional[List[Dict[str, Any]]]:
    """
    Transforms external timestamp and OHLCV vectors into normalized CandlePoint series.
    """
    try:
        chart_result = raw_data.get("chart", {}).get("result", [])[0]
        timestamps = chart_result.get("timestamp", [])
        quote = chart_result.get("indicators", {}).get("quote", [])[0]

        opens = quote.get("open", [])
        highs = quote.get("high", [])
        lows = quote.get("low", [])
        closes = quote.get("close", [])
        volumes = quote.get("volume", [])

        candles = []
        for i in range(len(timestamps)):
            if closes[i] is None or opens[i] is None:
                continue

            ts = timestamps[i]
            dt = datetime.fromtimestamp(ts)
            
            if timeframe == "1D":
                label = dt.strftime("%H:%M")
            elif timeframe in ("1W", "1M"):
                label = dt.strftime("%b %d")
            else:
                label = dt.strftime("%b '%y")

            candles.append({
                "time": label,
                "open": round(float(opens[i]), 2),
                "high": round(float(highs[i] or opens[i]), 2),
                "low": round(float(lows[i] or opens[i]), 2),
                "close": round(float(closes[i]), 2),
                "volume": int(volumes[i] or 100000),
            })

        return candles if len(candles) > 0 else None
    except Exception as exc:
        logger.warning(f"Could not parse external candles: {exc}")
        return None
