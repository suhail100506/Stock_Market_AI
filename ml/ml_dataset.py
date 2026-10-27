"""
StockSense-AI - Machine Learning Dataset Engineering & Chronological Partitioning.

STEP 8 REQUIREMENTS:
1. Create target:
   Tomorrow's price > Today's price -> 1 (UP)
   Otherwise                       -> 0 (DOWN)

2. Chronological Splitting (NO Random Train/Test Split!):
   2018 ───────── 2023 │ 2024 │ 2025
          TRAIN        │ VAL  │ TEST

   Why Random Train/Test Split is WRONG:
   - Financial time-series data exhibits serial autocorrelation and non-stationarity.
   - Random shuffling leaks future price patterns, momentum, and moving averages into past data.
   - Results in false high accuracy during validation, followed by catastrophic failures in production.
   - Chronological splitting enforces strict causal temporal order: Train on past, tune on intermediate, test on future.

3. Features:
   RSI, MACD, SMA20, SMA50, EMA, Volume, Volatility -> ML Model -> UP / DOWN
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler

# Primary features requested for ML Model direction classification
ML_FEATURE_COLUMNS = [
    "RSI",
    "MACD",
    "SMA20",
    "SMA50",
    "EMA",
    "Volume",
    "Volatility",
]

def create_binary_target(df: pd.DataFrame, horizon: int = 1) -> pd.DataFrame:
    """
    Creates binary classification target for directional stock forecasting:
    
    Tomorrow's price > Today's price
                 ↓
                 1 (UP)
    Otherwise:
                 0 (DOWN)
                 
    Args:
        df: DataFrame containing at least 'Close' column.
        horizon: Prediction horizon in trading days (default=1 for next-day).
        
    Returns:
        DataFrame with 'Tomorrow_Close', 'Target' (1 or 0), and 'Direction' ('UP' or 'DOWN').
    """
    df_out = df.copy()

    # Shift Close backwards by horizon to look ahead strictly into tomorrow
    df_out["Tomorrow_Close"] = df_out["Close"].shift(-horizon)
    
    # 1 if tomorrow's price > today's price, else 0
    df_out["Target"] = np.where(df_out["Tomorrow_Close"] > df_out["Close"], 1, 0)
    df_out["Direction"] = np.where(df_out["Target"] == 1, "UP", "DOWN")
    
    return df_out

def chronological_split_by_dates(
    df: pd.DataFrame,
    date_col: str = "Date",
    train_end_date: str = "2023-12-31",
    val_end_date: str = "2024-12-31",
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Chronological splitting by fixed calendar boundaries:
    2018 ───────── 2023 │ 2024 │ 2025
           TRAIN        │ VAL  │ TEST

    Strictly preserves the causal arrow of time.
    - TRAIN: Inception (e.g. 2018) through Dec 31, 2023
    - VAL: Jan 01, 2024 through Dec 31, 2024
    - TEST: Jan 01, 2025 onwards (2025+)

    Args:
        df: DataFrame containing date_col.
        date_col: Column name containing session dates.
        train_end_date: Last date for training set.
        val_end_date: Last date for validation set.

    Returns:
        (train_df, val_df, test_df)
    """
    df_sorted = df.copy()
    df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
    df_sorted = df_sorted.sort_values(by=date_col).reset_index(drop=True)

    train_cutoff = pd.to_datetime(train_end_date)
    val_cutoff = pd.to_datetime(val_end_date)

    train_mask = df_sorted[date_col] <= train_cutoff
    val_mask = (df_sorted[date_col] > train_cutoff) & (df_sorted[date_col] <= val_cutoff)
    test_mask = df_sorted[date_col] > val_cutoff

    train_df = df_sorted[train_mask].copy().reset_index(drop=True)
    val_df = df_sorted[val_mask].copy().reset_index(drop=True)
    test_df = df_sorted[test_mask].copy().reset_index(drop=True)

    return train_df, val_df, test_df

def chronological_split_by_ratio(
    df: pd.DataFrame,
    date_col: str = "Date",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Chronological splitting by sequential index ratios (no random shuffling):
    First 70% -> TRAIN
    Next 15%  -> VAL
    Final 15% -> TEST
    """
    df_sorted = df.copy()
    if date_col in df_sorted.columns:
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
        df_sorted = df_sorted.sort_values(by=date_col).reset_index(drop=True)

    n = len(df_sorted)
    train_end_idx = int(n * train_ratio)
    val_end_idx = int(n * (train_ratio + val_ratio))

    train_df = df_sorted.iloc[:train_end_idx].copy().reset_index(drop=True)
    val_df = df_sorted.iloc[train_end_idx:val_end_idx].copy().reset_index(drop=True)
    test_df = df_sorted.iloc[val_end_idx:].copy().reset_index(drop=True)

    return train_df, val_df, test_df

def validate_chronological_splits(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    date_col: str = "Date",
) -> Dict[str, Any]:
    """
    Performs pre-flight integrity verification to ensure zero lookahead bias and no data leakage.
    Asserts:
    1. Max date in TRAIN < Min date in VAL
    2. Max date in VAL < Min date in TEST
    3. Zero date overlaps across partitions
    """
    results = {
        "valid": True,
        "errors": [],
        "train_size": len(train_df),
        "val_size": len(val_df),
        "test_size": len(test_df),
    }

    if date_col in train_df.columns and date_col in val_df.columns and len(train_df) > 0 and len(val_df) > 0:
        train_max = pd.to_datetime(train_df[date_col]).max()
        val_min = pd.to_datetime(val_df[date_col]).min()
        results["train_date_range"] = (str(pd.to_datetime(train_df[date_col]).min().date()), str(train_max.date()))
        results["val_date_range"] = (str(val_min.date()), str(pd.to_datetime(val_df[date_col]).max().date()))
        
        if train_max >= val_min:
            results["valid"] = False
            results["errors"].append(f"Data leakage detected: Train max date ({train_max}) >= Val min date ({val_min})")

    if date_col in val_df.columns and date_col in test_df.columns and len(val_df) > 0 and len(test_df) > 0:
        val_max = pd.to_datetime(val_df[date_col]).max()
        test_min = pd.to_datetime(test_df[date_col]).min()
        results["test_date_range"] = (str(test_min.date()), str(pd.to_datetime(test_df[date_col]).max().date()))

        if val_max >= test_min:
            results["valid"] = False
            results["errors"].append(f"Data leakage detected: Val max date ({val_max}) >= Test min date ({test_min})")

    return results

def prepare_ml_dataset(
    df: pd.DataFrame,
    feature_cols: Optional[List[str]] = None,
    split_method: str = "dates",  # "dates" or "ratio"
    train_end_date: str = "2023-12-31",
    val_end_date: str = "2024-12-31",
    scale_features: bool = True,
) -> Dict[str, Any]:
    """
    End-to-End ML Dataset Preparation:
    1. Creates target: Tomorrow Close > Today Close -> 1 (UP), else 0 (DOWN)
    2. Drops NaNs from indicator warmups (SMA50, etc.) and drops the final row where tomorrow's price is unobservable
    3. Chronologically partitions into TRAIN (2018-2023), VAL (2024), and TEST (2025)
    4. Applies feature scaler fitted STRICTLY on the TRAIN partition (preventing future information leakage)
    5. Returns feature matrices, target vectors, raw split dataframes, and distribution metrics
    """
    df_work = df.copy()

    # Ensure EMA alias exists if EMA20 is present
    if "EMA" not in df_work.columns and "EMA20" in df_work.columns:
        df_work["EMA"] = df_work["EMA20"]
    elif "EMA20" not in df_work.columns and "EMA" in df_work.columns:
        df_work["EMA20"] = df_work["EMA"]

    # 1. Target creation
    df_with_target = create_binary_target(df_work)

    # Resolve features to use
    if feature_cols is not None:
        features = feature_cols
    else:
        features = [col for col in ML_FEATURE_COLUMNS if col in df_with_target.columns]
        # Fallback if EMA not found but EMA20 found
        if "EMA" not in features and "EMA20" in df_with_target.columns:
            features.append("EMA20")

    # 2. Drop warmup NaNs and the final row where Tomorrow_Close is NaN
    cleaned_df = df_with_target.dropna(subset=features + ["Tomorrow_Close"]).copy()
    cleaned_df.reset_index(drop=True, inplace=True)

    # 3. Chronological Splitting
    split_used = split_method
    if split_method == "dates" and "Date" in cleaned_df.columns:
        try:
            train_df, val_df, test_df = chronological_split_by_dates(
                cleaned_df,
                date_col="Date",
                train_end_date=train_end_date,
                val_end_date=val_end_date,
            )
            # If dates resulted in empty partitions (e.g. short sample), fallback to ratio
            if len(train_df) == 0 or len(val_df) == 0 or len(test_df) == 0:
                train_df, val_df, test_df = chronological_split_by_ratio(cleaned_df)
                split_used = "ratio_fallback"
        except Exception:
            train_df, val_df, test_df = chronological_split_by_ratio(cleaned_df)
            split_used = "ratio_fallback"
    else:
        train_df, val_df, test_df = chronological_split_by_ratio(cleaned_df)
        split_used = "ratio"

    # Pre-flight chronological validation
    validation = validate_chronological_splits(train_df, val_df, test_df)

    # Extract X (features) and y (target)
    X_train = train_df[features].copy()
    y_train = train_df["Target"].copy().values

    X_val = val_df[features].copy()
    y_val = val_df["Target"].copy().values

    X_test = test_df[features].copy()
    y_test = test_df["Target"].copy().values

    # 4. Feature Scaling (Fit on Train ONLY - No Data Leakage!)
    scaler = None
    if scale_features:
        scaler = StandardScaler()
        X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=features)
        X_val_scaled = pd.DataFrame(scaler.transform(X_val), columns=features)
        X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=features)
    else:
        X_train_scaled = X_train
        X_val_scaled = X_val
        X_test_scaled = X_test

    # Compute target distribution stats
    def calculate_distribution(y_arr):
        if len(y_arr) == 0:
            return {"total": 0, "up_count": 0, "down_count": 0, "up_pct": 0.0, "down_pct": 0.0}
        up_count = int(np.sum(y_arr == 1))
        down_count = int(np.sum(y_arr == 0))
        return {
            "total": len(y_arr),
            "up_count": up_count,
            "down_count": down_count,
            "up_pct": round((up_count / len(y_arr)) * 100, 2),
            "down_pct": round((down_count / len(y_arr)) * 100, 2),
        }

    return {
        "features": features,
        "scaler": scaler,
        "split_method": split_used,
        "validation": validation,
        "X_train": X_train_scaled,
        "y_train": y_train,
        "X_val": X_val_scaled,
        "y_val": y_val,
        "X_test": X_test_scaled,
        "y_test": y_test,
        "train_df": train_df,
        "val_df": val_df,
        "test_df": test_df,
        "full_cleaned_df": cleaned_df,
        "distribution": {
            "train": calculate_distribution(y_train),
            "val": calculate_distribution(y_val),
            "test": calculate_distribution(y_test),
        },
    }
