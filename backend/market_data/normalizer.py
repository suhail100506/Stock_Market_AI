"""
StockSense-AI: Market Data Normalizer
Standardizes provider payloads into consistent NormalizedQuote and NormalizedCandle objects.
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from .base import NormalizedQuote, NormalizedCandle, InstrumentMetadata

IST = timezone(timedelta(hours=5, minutes=30))


def get_current_ist_time() -> datetime:
    return datetime.now(IST)


def calculate_indian_market_status() -> str:
    """
    Evaluates NSE/BSE regular trading session (09:15 - 15:30 IST, Monday-Friday).
    """
    now = get_current_ist_time()
    weekday = now.weekday()  # 0: Mon, 4: Fri, 5: Sat, 6: Sun

    if weekday >= 5:
        return "CLOSED"  # Weekend

    current_minutes = now.hour * 60 + now.minute

    # Pre-open: 09:00 - 09:15 IST (540 - 555)
    if 540 <= current_minutes < 555:
        return "PRE_OPEN"
    # Regular trading: 09:15 - 15:30 IST (555 - 930)
    elif 555 <= current_minutes <= 930:
        return "OPEN"
    else:
        return "CLOSED"


def format_volume(volume: int) -> str:
    if volume >= 10_000_000:
        return f"{volume / 10_000_000:.2f} Cr"
    elif volume >= 100_000:
        return f"{volume / 100_000:.2f} L"
    elif volume >= 1_000:
        return f"{volume / 1_000:.1f} K"
    return str(volume)


def normalize_quote(
    instrument: InstrumentMetadata,
    ltp: float,
    prev_close: float,
    open_price: Optional[float] = None,
    high: Optional[float] = None,
    low: Optional[float] = None,
    volume: Optional[int] = None,
    data_source: str = "EXTERNAL_MARKET_FEED",
    data_freshness: str = "LIVE",
    sparkline: Optional[List[float]] = None,
) -> NormalizedQuote:
    """
    Builds a clean, normalized quote with strictly calculated change metrics.
    """
    safe_ltp = round(float(ltp), 2)
    safe_prev_close = round(float(prev_close), 2) if prev_close and prev_close > 0 else safe_ltp

    change = round(safe_ltp - safe_prev_close, 2)
    change_pct = (
        round((change / safe_prev_close) * 100, 2)
        if safe_prev_close > 0
        else 0.0
    )

    safe_open = round(float(open_price if open_price is not None else safe_prev_close), 2)
    safe_high = round(float(high if high is not None else max(safe_ltp, safe_open)), 2)
    safe_low = round(float(low if low is not None else min(safe_ltp, safe_open)), 2)
    safe_vol = int(volume or 100_000)

    now_ist = get_current_ist_time()
    market_status = calculate_indian_market_status()

    # Generate synthetic 10-point sparkline if none provided
    if not sparkline or len(sparkline) < 5:
        step = (safe_ltp - safe_prev_close) / 9.0
        sparkline = [round(safe_prev_close + step * i, 2) for i in range(10)]

    return NormalizedQuote(
        instrument_id=instrument.instrument_id,
        symbol=instrument.symbol,
        name=instrument.name,
        exchange=instrument.exchange,
        instrument_type=instrument.instrument_type,
        ltp=safe_ltp,
        change=change,
        change_percent=change_pct,
        open=safe_open,
        high=safe_high,
        low=safe_low,
        prev_close=safe_prev_close,
        volume=safe_vol,
        volume_str=format_volume(safe_vol),
        timestamp=now_ist.isoformat(),
        market_status=market_status,
        data_source=data_source,
        data_freshness=data_freshness,
        sparkline=[round(s, 2) for s in sparkline],
    )


def normalize_candles(
    raw_candles: List[Dict[str, Any]]
) -> List[NormalizedCandle]:
    """
    Converts diverse candlestick records into standard NormalizedCandle objects.
    """
    normalized: List[NormalizedCandle] = []
    for c in raw_candles:
        try:
            ts = int(c.get("timestamp") or c.get("time_epoch") or 0)
            dt_str = c.get("time") or c.get("datetime") or ""
            if not dt_str and ts:
                dt_str = datetime.fromtimestamp(ts, tz=IST).strftime("%Y-%m-%d %H:%M")

            normalized.append(
                NormalizedCandle(
                    timestamp=ts,
                    datetime_str=dt_str,
                    open=round(float(c.get("open", 0.0)), 2),
                    high=round(float(c.get("high", 0.0)), 2),
                    low=round(float(c.get("low", 0.0)), 2),
                    close=round(float(c.get("close", 0.0)), 2),
                    volume=int(c.get("volume", 0)),
                )
            )
        except Exception:
            continue
    return normalized
