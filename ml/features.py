"""
StockSense-AI: Feature Engineering Module
========================================

Extracts quantitative technical indicators and momentum signals from OHLCV data.

Core Feature Set:
- RSI:        14-period Relative Strength Index (Momentum)
- MACD:       12/26/9 Moving Average Convergence Divergence (Trend/Momentum)
- SMA20:      20-day Simple Moving Average (Short-term Trend)
- SMA50:      50-day Simple Moving Average (Medium-term Trend)
- EMA:        20-day Exponential Moving Average (Trend Sensitivity)
- Volume:     Session trading volume in shares (Liquidity & Conviction)
- Volatility: 20-day rolling standard deviation of daily returns (Risk)
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

# Primary feature set used across all ML classification models
FEATURE_COLUMNS: List[str] = [
    "RSI",
    "MACD",
    "SMA20",
    "SMA50",
    "EMA",
    "Volume",
    "Volatility",
]

def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Computes Wilder's Relative Strength Index (RSI).
    RSI = 100 - (100 / (1 + RS))
    """
    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)

    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

    # Prevent division by zero
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.fillna(50.0)

def compute_macd(
    series: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Computes MACD Line, Signal Line, and MACD Histogram.
    """
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist

def compute_features(df: pd.DataFrame, drop_na: bool = False) -> pd.DataFrame:
    """
    Transforms raw OHLCV market data into the ML features dataframe.

    Calculates:
    - SMA20, SMA50
    - EMA (20-day) & EMA20
    - RSI (14-day)
    - MACD (12, 26, 9)
    - Returns & 20-day Rolling Volatility
    - Bollinger Bands (20, 2std)
    """
    df_out = df.copy()

    # Normalize column names
    col_map = {c.lower(): c for c in df_out.columns}
    for standard_col in ["Date", "Open", "High", "Low", "Close", "Volume"]:
        if standard_col.lower() in col_map and standard_col not in df_out.columns:
            df_out.rename(columns={col_map[standard_col.lower()]: standard_col}, inplace=True)

    close = df_out["Close"]

    # 1. Moving Averages
    df_out["SMA20"] = close.rolling(window=20).mean()
    df_out["SMA50"] = close.rolling(window=50).mean()
    df_out["EMA"] = close.ewm(span=20, adjust=False).mean()
    df_out["EMA20"] = df_out["EMA"]

    # 2. Momentum Oscillators
    df_out["RSI"] = compute_rsi(close, period=14)
    macd_line, signal_line, macd_hist = compute_macd(close, fast=12, slow=26, signal=9)
    df_out["MACD"] = macd_line
    df_out["MACD_Signal"] = signal_line
    df_out["MACD_Hist"] = macd_hist

    # 3. Volatility & Returns
    df_out["Return"] = close.pct_change()
    df_out["Volatility"] = df_out["Return"].rolling(window=20).std()

    # Bollinger Bands
    bb_mid = df_out["SMA20"]
    bb_std = close.rolling(window=20).std()
    df_out["BB_Upper"] = bb_mid + (2.0 * bb_std)
    df_out["BB_Lower"] = bb_mid - (2.0 * bb_std)

    if drop_na:
        df_out = df_out.dropna().reset_index(drop=True)

    return df_out

def get_latest_feature_vector(df: pd.DataFrame) -> Dict[str, float]:
    """
    Extracts the feature vector from the most recent row of market data for live inference.
    """
    feature_df = compute_features(df)
    if feature_df.empty:
        return {}

    latest = feature_df.iloc[-1]
    return {
        col: float(latest.get(col, 0.0))
        for col in FEATURE_COLUMNS
    }
