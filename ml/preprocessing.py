"""
StockSense-AI: Preprocessing & Chronological Splitting Module
=============================================================

Prepares financial time-series data for machine learning with strict leakage-free guards.

Core Principles:
1. NO Random Train/Test Split:
   2018 ───────── 2023 │ 2024 │ 2025
          TRAIN        │ VAL  │ TEST
2. Supervised Classification Target:
   Tomorrow's price > Today's price -> 1 (UP)
   Otherwise                       -> 0 (DOWN)
3. Price Regression Target (Scaffolding for Future Step):
   Tomorrow's actual price / percent return
4. Feature Normalization Discipline:
   StandardScaler fitted STRICTLY on TRAIN partition.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler
from .features import FEATURE_COLUMNS, compute_features

def create_targets(
    df: pd.DataFrame,
    horizon: int = 1,
) -> pd.DataFrame:
    """
    Creates both classification and regression targets:
    
    1. Binary Direction Target (Step 9 Primary):
       Tomorrow's price > Today's price -> 1 (UP), else 0 (DOWN)
       
    2. Approximate Price Target (Future Step Scaffolding):
       Tomorrow's price value and tomorrow's forward return
    """
    df_out = df.copy()

    # Shift Close backwards by horizon to obtain tomorrow's closing price
    df_out["Tomorrow_Close"] = df_out["Close"].shift(-horizon)

    # Classification Target: 1 (UP) vs 0 (DOWN)
    df_out["Target"] = np.where(df_out["Tomorrow_Close"] > df_out["Close"], 1, 0)
    df_out["Direction"] = np.where(df_out["Target"] == 1, "UP", "DOWN")

    # Regression Targets: Tomorrow's approximate price & forward return
    df_out["Target_Price"] = df_out["Tomorrow_Close"]
    df_out["Target_Return"] = (df_out["Tomorrow_Close"] - df_out["Close"]) / df_out["Close"]

    return df_out

def split_chronologically(
    df: pd.DataFrame,
    date_col: str = "Date",
    train_end_date: str = "2023-12-31",
    val_end_date: str = "2024-12-31",
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Chronological calendar split:
    2018 ───────── 2023 │ 2024 │ 2025
           TRAIN        │ VAL  │ TEST

    Preserves strict temporal arrow of time.
    """
    df_sorted = df.copy()
    if date_col in df_sorted.columns:
        df_sorted[date_col] = pd.to_datetime(df_sorted[date_col])
        df_sorted = df_sorted.sort_values(by=date_col).reset_index(drop=True)

        train_cutoff = pd.to_datetime(train_end_date)
        val_cutoff = pd.to_datetime(val_end_date)

        train_df = df_sorted[df_sorted[date_col] <= train_cutoff].copy().reset_index(drop=True)
        val_df = (
            df_sorted[(df_sorted[date_col] > train_cutoff) & (df_sorted[date_col] <= val_cutoff)]
            .copy()
            .reset_index(drop=True)
        )
        test_df = df_sorted[df_sorted[date_col] > val_cutoff].copy().reset_index(drop=True)

        # Fallback to ratio split if date bounds resulted in empty sets
        if len(train_df) > 0 and len(val_df) > 0 and len(test_df) > 0:
            return train_df, val_df, test_df

    # Ratio-based chronological split (70% Train, 15% Val, 15% Test)
    n = len(df_sorted)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)
    return (
        df_sorted.iloc[:train_end].copy().reset_index(drop=True),
        df_sorted.iloc[train_end:val_end].copy().reset_index(drop=True),
        df_sorted.iloc[val_end:].copy().reset_index(drop=True),
    )

def preprocess_data(
    df: pd.DataFrame,
    features: Optional[List[str]] = None,
    train_end_date: str = "2023-12-31",
    val_end_date: str = "2024-12-31",
    scale: bool = True,
) -> Dict[str, Any]:
    """
    Complete end-to-end preprocessing pipeline:
    1. Computes technical features if not already present
    2. Creates directional classification target (UP=1, DOWN=0)
    3. Drops NaN rows from warm-up windows and last unlabelled session
    4. Chronologically splits into TRAIN, VAL, TEST
    5. Fits StandardScaler strictly on TRAIN and transforms VAL & TEST
    """
    # 1. Feature computation
    if "SMA50" not in df.columns or "RSI" not in df.columns:
        df_featured = compute_features(df)
    else:
        df_featured = df.copy()

    # Ensure EMA alias exists
    if "EMA" not in df_featured.columns and "EMA20" in df_featured.columns:
        df_featured["EMA"] = df_featured["EMA20"]

    # 2. Target creation
    df_targeted = create_targets(df_featured)

    feature_cols = features or [c for c in FEATURE_COLUMNS if c in df_targeted.columns]

    # 3. Drop warmup NaNs and final session where tomorrow's price is unobservable
    cleaned_df = df_targeted.dropna(subset=feature_cols + ["Tomorrow_Close"]).copy()
    cleaned_df.reset_index(drop=True, inplace=True)

    # 4. Chronological Split
    train_df, val_df, test_df = split_chronologically(
        cleaned_df,
        date_col="Date",
        train_end_date=train_end_date,
        val_end_date=val_end_date,
    )

    # Extract feature matrices and target vectors
    X_train = train_df[feature_cols].copy()
    y_train = train_df["Target"].copy().values
    y_train_price = train_df["Target_Price"].copy().values

    X_val = val_df[feature_cols].copy()
    y_val = val_df["Target"].copy().values
    y_val_price = val_df["Target_Price"].copy().values

    X_test = test_df[feature_cols].copy()
    y_test = test_df["Target"].copy().values
    y_test_price = test_df["Target_Price"].copy().values

    # 5. Fit Scaler STRICTLY on TRAIN
    scaler = None
    if scale:
        scaler = StandardScaler()
        X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=feature_cols)
        X_val_scaled = pd.DataFrame(scaler.transform(X_val), columns=feature_cols)
        X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=feature_cols)
    else:
        X_train_scaled = X_train
        X_val_scaled = X_val
        X_test_scaled = X_test

    return {
        "features": feature_cols,
        "scaler": scaler,
        "X_train": X_train_scaled,
        "y_train": y_train,
        "y_train_price": y_train_price,
        "X_val": X_val_scaled,
        "y_val": y_val,
        "y_val_price": y_val_price,
        "X_test": X_test_scaled,
        "y_test": y_test,
        "y_test_price": y_test_price,
        "train_df": train_df,
        "val_df": val_df,
        "test_df": test_df,
        "full_df": cleaned_df,
    }
