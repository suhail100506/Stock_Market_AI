# StockSense AI - Data Science & Machine Learning Engine

# Step 8 & Technical Foundations
from .indicators import (
    compute_sma,
    compute_ema,
    compute_rsi,
    compute_macd,
    compute_bollinger_bands,
    compute_returns,
    compute_rolling_volatility,
)
from .feature_engineering import build_feature_dataset, compute_indicator_summary
from .ml_dataset import (
    create_binary_target,
    chronological_split_by_dates,
    chronological_split_by_ratio,
    prepare_ml_dataset,
    validate_chronological_splits,
    ML_FEATURE_COLUMNS,
)
from .train_pipeline import StockDirectionPredictor
from .dataset_builder import (
    generate_multiyear_ohlcv,
    build_and_export_chronological_dataset,
)

# Step 9 Modular ML Architecture
from .features import FEATURE_COLUMNS, compute_features, get_latest_feature_vector
from .preprocessing import create_targets, split_chronologically, preprocess_data
from .train import ModelTrainer, train_all_models
from .evaluate import evaluate_predictions, backtest_strategy, evaluate_saved_models
from .predict import (
    StockPredictor,
    get_predictor,
    predict_tomorrow_direction,
    predict_approximate_price,
)

__all__ = [
    # Feature Engineering
    "FEATURE_COLUMNS",
    "compute_features",
    "get_latest_feature_vector",
    "compute_sma",
    "compute_ema",
    "compute_rsi",
    "compute_macd",
    "compute_bollinger_bands",
    "compute_returns",
    "compute_rolling_volatility",
    "build_feature_dataset",
    "compute_indicator_summary",
    # Preprocessing
    "create_targets",
    "split_chronologically",
    "preprocess_data",
    "create_binary_target",
    "chronological_split_by_dates",
    "chronological_split_by_ratio",
    "prepare_ml_dataset",
    "validate_chronological_splits",
    "ML_FEATURE_COLUMNS",
    # Training & Models
    "ModelTrainer",
    "train_all_models",
    "StockDirectionPredictor",
    # Evaluation & Backtesting
    "evaluate_predictions",
    "backtest_strategy",
    "evaluate_saved_models",
    # Inference & Prediction
    "StockPredictor",
    "get_predictor",
    "predict_tomorrow_direction",
    "predict_approximate_price",
    # Data Builder
    "generate_multiyear_ohlcv",
    "build_and_export_chronological_dataset",
]
