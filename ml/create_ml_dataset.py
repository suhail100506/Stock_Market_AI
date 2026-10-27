"""
StockSense-AI: Step 8 ML Dataset Generator
=========================================

Builds the production-ready machine learning dataset for stock direction forecasting.

PIPELINE SPECIFICATION:
1. Features:
   - RSI (14-period momentum oscillator)
   - MACD (12-period EMA minus 26-period EMA)
   - SMA20 (20-day Simple Moving Average)
   - SMA50 (50-day Simple Moving Average)
   - EMA (20-day Exponential Moving Average)
   - Volume (Trading volume in shares)
   - Volatility (20-day rolling standard deviation of daily returns)

2. Supervised Target:
   Tomorrow's price > Today's price -> 1 (UP)
   Otherwise                       -> 0 (DOWN)

3. Chronological Splitting (NO Random Train/Test Split!):
   2018 ───────── 2023 │ 2024 │ 2025
          TRAIN        │ VAL  │ TEST

4. Zero Lookahead Bias:
   - No data shuffling across time
   - Feature normalizers (StandardScaler) fitted STRICTLY on TRAIN partition (2018-2023)
   - VAL (2024) and TEST (2025) transformed using TRAIN statistics
"""

import os
import sys
import pandas as pd
import numpy as np
from typing import Dict, Any

# Ensure project root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.feature_engineering import build_feature_dataset
from ml.ml_dataset import (
    create_binary_target,
    chronological_split_by_dates,
    prepare_ml_dataset,
    validate_chronological_splits,
    ML_FEATURE_COLUMNS,
)
from ml.dataset_builder import generate_multiyear_ohlcv, DATA_DIR

def build_ml_dataset_for_stock(
    symbol: str = "TCS",
    start_date: str = "2018-01-01",
    end_date: str = "2025-12-31",
    base_price: float = 1850.0,
    export_csv: bool = True,
) -> Dict[str, Any]:
    """
    Builds and optionally exports the complete chronological ML dataset for a given symbol.
    """
    sym = symbol.upper()
    print("=" * 70)
    print(f"StockSense-AI: Building ML Dataset for {sym}")
    print("=" * 70)

    # 1. Ingest / Generate 2018-2025 Daily OHLCV
    print(f"[1/4] Generating daily session history ({start_date} to {end_date})...")
    raw_df = generate_multiyear_ohlcv(
        symbol=sym,
        start_date=start_date,
        end_date=end_date,
        base_price=base_price,
    )
    print(f"      Total trading days generated: {len(raw_df)}")

    # 2. Compute Technical Indicators (Features)
    print("[2/4] Computing Technical Indicators (RSI, MACD, SMA20, SMA50, EMA, Volatility)...")
    feature_df = build_feature_dataset(raw_df, drop_na=False)

    # 3. Create Supervised Binary Target and Chronological Splits
    print("[3/4] Creating Binary Target and applying Chronological Splitting:")
    print("      2018 ───────── 2023 │ 2024 │ 2025")
    print("             TRAIN        │ VAL  │ TEST")
    
    dataset_bundle = prepare_ml_dataset(
        feature_df,
        feature_cols=ML_FEATURE_COLUMNS,
        split_method="dates",
        train_end_date="2023-12-31",
        val_end_date="2024-12-31",
        scale_features=True,
    )

    train_df = dataset_bundle["train_df"]
    val_df = dataset_bundle["val_df"]
    test_df = dataset_bundle["test_df"]
    dist = dataset_bundle["distribution"]
    validation = dataset_bundle["validation"]

    print("\n[Splits Summary]")
    print(f"  * TRAIN (2018-2023): {len(train_df):>5} samples | UP: {dist['train']['up_pct']}% | DOWN: {dist['train']['down_pct']}%")
    print(f"  * VAL   (2024):      {len(val_df):>5} samples | UP: {dist['val']['up_pct']}% | DOWN: {dist['val']['down_pct']}%")
    print(f"  * TEST  (2025):      {len(test_df):>5} samples | UP: {dist['test']['up_pct']}% | DOWN: {dist['test']['down_pct']}%")
    
    if validation.get("valid"):
        print("  * Temporal Integrity: [PASS] Zero lookahead leakage detected.")
    else:
        print(f"  * Temporal Integrity: [FAIL] Errors: {validation.get('errors')}")

    # 4. Export CSV artifacts
    csv_paths = {}
    if export_csv:
        print("\n[4/4] Exporting datasets to ml/data/...")
        full_path = os.path.join(DATA_DIR, f"{sym}_full_ml_dataset.csv")
        train_path = os.path.join(DATA_DIR, f"{sym}_train_2018_2023.csv")
        val_path = os.path.join(DATA_DIR, f"{sym}_val_2024.csv")
        test_path = os.path.join(DATA_DIR, f"{sym}_test_2025.csv")

        dataset_bundle["full_cleaned_df"].to_csv(full_path, index=False)
        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

        csv_paths = {
            "full": full_path,
            "train": train_path,
            "val": val_path,
            "test": test_path,
        }
        print(f"      Saved: {full_path}")
        print(f"      Saved: {train_path}")
        print(f"      Saved: {val_path}")
        print(f"      Saved: {test_path}")

    print("=" * 70)
    print("Dataset generation complete!")
    print("=" * 70)

    return {
        "symbol": sym,
        "features": ML_FEATURE_COLUMNS,
        "csv_paths": csv_paths,
        "bundle": dataset_bundle,
    }

if __name__ == "__main__":
    # Generates standard TCS dataset by default
    build_ml_dataset_for_stock("TCS")
