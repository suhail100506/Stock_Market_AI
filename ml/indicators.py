import numpy as np
import pandas as pd
from typing import Tuple

def compute_sma(series: pd.Series, window: int = 20) -> pd.Series:
    """
    Computes Simple Moving Average (SMA).
    Example: df["SMA20"] = df["Close"].rolling(20).mean()
    """
    return series.rolling(window=window).mean()

def compute_ema(series: pd.Series, span: int = 20) -> pd.Series:
    """
    Computes Exponential Moving Average (EMA).
    Example: df["EMA20"] = df["Close"].ewm(span=20, adjust=False).mean()
    """
    return series.ewm(span=span, adjust=False).mean()

def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Computes Relative Strength Index (RSI) using standard Wilder's smoothing.
    1. delta = Close - Close[t-1]
    2. Separate gains and losses
    3. Exponential smoothing over period
    4. RSI = 100 - (100 / (1 + RS))
    """
    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)

    # Wilder's smoothing (equivalent to ewm with alpha=1/period or com=period-1)
    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

    # Avoid division by zero
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    
    # Fill cases where loss is 0 with 100, and where gain is 0 with 0
    rsi = rsi.fillna(50.0)
    return rsi

def compute_macd(
    series: pd.Series,
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9,
) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """
    Computes Moving Average Convergence Divergence (MACD).
    - MACD Line = EMA(12) - EMA(26)
    - Signal Line = EMA(9) of MACD Line
    - MACD Histogram = MACD Line - Signal Line
    """
    ema_fast = series.ewm(span=fast_period, adjust=False).mean()
    ema_slow = series.ewm(span=slow_period, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    macd_hist = macd_line - signal_line

    return macd_line, signal_line, macd_hist

def compute_bollinger_bands(
    series: pd.Series,
    window: int = 20,
    num_std: float = 2.0,
) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """
    Computes Bollinger Bands:
    - Middle Band = SMA(20)
    - Upper Band = SMA(20) + (2 * std(20))
    - Lower Band = SMA(20) - (2 * std(20))
    """
    middle = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = middle + (num_std * std)
    lower = middle - (num_std * std)

    return middle, upper, lower

def compute_returns(series: pd.Series) -> pd.Series:
    """
    Computes Daily Percentage Returns.
    Example: df["Return"] = df["Close"].pct_change()
    """
    return series.pct_change()

def compute_rolling_volatility(returns_series: pd.Series, window: int = 20) -> pd.Series:
    """
    Computes Rolling Standard Deviation of Returns (Rolling Volatility).
    Example: df["Volatility"] = df["Return"].rolling(20).std()
    """
    return returns_series.rolling(window=window).std()
