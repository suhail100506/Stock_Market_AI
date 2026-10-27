import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
from .indicators import (
    compute_sma,
    compute_ema,
    compute_rsi,
    compute_macd,
    compute_bollinger_bands,
    compute_returns,
    compute_rolling_volatility,
)

TARGET_DATASET_COLUMNS = [
    "Date",
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "SMA20",
    "SMA50",
    "EMA",
    "EMA20", 
    "RSI",
    "MACD",
    "Volatility",
    "Return",
]

def build_feature_dataset(
    df: pd.DataFrame,
    drop_na: bool = False,
    include_extended_bands: bool = True,
) -> pd.DataFrame:
    """
    Transforms raw OHLCV market data into the StockSense feature engineering dataset.

    Calculates:
    - Moving averages: SMA20, SMA50, EMA20
    - Momentum: RSI (14), MACD (12, 26, 9)
    - Volatility: Return (pct_change), Volatility (20-day rolling std), Bollinger Bands

    Resulting dataset columns:
    Date, Open, High, Low, Close, Volume, SMA20, SMA50, EMA20, RSI, MACD, Volatility, Return
    """
    df_out = df.copy()

    # Standardize column naming if necessary
    col_mapping = {col.lower(): col for col in df_out.columns}
    if "date" in col_mapping and "Date" not in df_out.columns:
        df_out.rename(columns={col_mapping["date"]: "Date"}, inplace=True)
    if "close" in col_mapping and "Close" not in df_out.columns:
        df_out.rename(columns={col_mapping["close"]: "Close"}, inplace=True)
    if "open" in col_mapping and "Open" not in df_out.columns:
        df_out.rename(columns={col_mapping["open"]: "Open"}, inplace=True)
    if "high" in col_mapping and "High" not in df_out.columns:
        df_out.rename(columns={col_mapping["high"]: "High"}, inplace=True)
    if "low" in col_mapping and "Low" not in df_out.columns:
        df_out.rename(columns={col_mapping["low"]: "Low"}, inplace=True)
    if "volume" in col_mapping and "Volume" not in df_out.columns:
        df_out.rename(columns={col_mapping["volume"]: "Volume"}, inplace=True)

    # 1. Moving Averages
    df_out["SMA20"] = df_out["Close"].rolling(20).mean()
    df_out["SMA50"] = df_out["Close"].rolling(50).mean()
    df_out["EMA"] = df_out["Close"].ewm(span=20, adjust=False).mean()
    df_out["EMA20"] = df_out["EMA"]

    # 2. Momentum
    df_out["RSI"] = compute_rsi(df_out["Close"], period=14)
    macd_line, macd_signal, macd_hist = compute_macd(df_out["Close"], fast_period=12, slow_period=26, signal_period=9)
    df_out["MACD"] = macd_line

    # 3. Volatility & Returns
    df_out["Return"] = df_out["Close"].pct_change()
    df_out["Volatility"] = df_out["Return"].rolling(20).std()

    # Bollinger Bands
    _, bb_upper, bb_lower = compute_bollinger_bands(df_out["Close"], window=20, num_std=2.0)
    if include_extended_bands:
        df_out["BB_Upper"] = bb_upper
        df_out["BB_Lower"] = bb_lower
        df_out["MACD_Signal"] = macd_signal

    # Reorder columns to place requested target columns first
    ordered_cols = [c for c in TARGET_DATASET_COLUMNS if c in df_out.columns]
    remaining_cols = [c for c in df_out.columns if c not in ordered_cols]
    final_df = df_out[ordered_cols + remaining_cols]

    if drop_na:
        final_df = final_df.dropna().reset_index(drop=True)

    return final_df

def compute_indicator_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Extracts high-level summary and trading signal triggers from the latest row of the feature dataset.
    """
    if df.empty:
        return {}

    latest = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else latest

    # Signal synthesis
    sma20 = latest.get("SMA20", 0.0)
    sma50 = latest.get("SMA50", 0.0)
    rsi = latest.get("RSI", 50.0)
    macd = latest.get("MACD", 0.0)
    close = latest.get("Close", 0.0)

    # Moving average trend
    if not np.isnan(sma20) and not np.isnan(sma50):
        ma_trend = "Bullish (SMA20 > SMA50)" if sma20 > sma50 else "Bearish (SMA20 < SMA50)"
    else:
        ma_trend = "Insufficient Data"

    # RSI condition
    if rsi >= 70:
        rsi_condition = "Overbought (>70)"
    elif rsi <= 30:
        rsi_condition = "Oversold (<30)"
    else:
        rsi_condition = "Neutral (30-70)"

    return {
        "current_close": round(float(close), 2),
        "sma20": round(float(sma20), 2) if not np.isnan(sma20) else None,
        "sma50": round(float(sma50), 2) if not np.isnan(sma50) else None,
        "ema20": round(float(latest.get("EMA20", 0.0)), 2),
        "rsi": round(float(rsi), 2),
        "rsi_condition": rsi_condition,
        "macd": round(float(macd), 2),
        "volatility": round(float(latest.get("Volatility", 0.0)), 4) if not np.isnan(latest.get("Volatility", 0.0)) else None,
        "daily_return": round(float(latest.get("Return", 0.0)) * 100, 2) if not np.isnan(latest.get("Return", 0.0)) else 0.0,
        "ma_trend": ma_trend,
    }
