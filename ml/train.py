"""
StockSense-AI: Model Training Pipeline
======================================

STEP 9: Train Your First ML Model
---------------------------------
Models Implemented:
1. Model 1: Logistic Regression (Interpretable Linear Baseline)
2. Model 2: Random Forest (Bagging Ensemble Decision Trees)
3. Model 3: XGBoost ⭐ (Gradient Boosted Trees - Recommended Champion)

Why We DON'T Start with LSTM:
- Financial daily price time-series has a very low signal-to-noise ratio (SNR ≈ 0.05).
- LSTMs have large recurrent parameter matrices that memorize daily market noise and overfit rapidly.
- LSTMs require extensive sequence padding and hyperparameter tuning for negligible gain on daily data.
- Tree-based gradient boosting (XGBoost) consistently outperforms neural networks on tabular financial features.

Targets:
1. Primary Classification Target: Will tomorrow's price go UP or DOWN? (Binary: 1 or 0)
2. Scaffolding Regression Target: What will tomorrow's approximate price be? (Continuous: Price / Return)

Artifacts Saved:
- ml/models/xgboost_model.pkl ⭐
- ml/models/random_forest_model.pkl
- ml/models/logistic_regression_model.pkl
- ml/models/scaler.pkl
- ml/models/model_metadata.json
"""

import os
import sys
import json
import pickle
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

from .features import FEATURE_COLUMNS
from .preprocessing import preprocess_data
from .dataset_builder import generate_multiyear_ohlcv

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

class ModelTrainer:
    """
    Trains, compares, and serializes Model 1 (Logistic Regression),
    Model 2 (Random Forest), and Model 3 (XGBoost ⭐).
    """

    def __init__(self, data_bundle: Dict[str, Any]):
        self.bundle = data_bundle
        self.X_train = data_bundle["X_train"]
        self.y_train = data_bundle["y_train"]
        self.X_val = data_bundle["X_val"]
        self.y_val = data_bundle["y_val"]
        self.X_test = data_bundle["X_test"]
        self.y_test = data_bundle["y_test"]
        self.scaler = data_bundle["scaler"]
        self.features = data_bundle["features"]

        self.models: Dict[str, Any] = {}
        self.val_scores: Dict[str, Dict[str, float]] = {}

    def train_logistic_regression(self) -> LogisticRegression:
        """
        Model 1: Logistic Regression
        Provides a well-calibrated linear probability baseline with L2 regularization.
        """
        print("[Training] Model 1: Logistic Regression...")
        model = LogisticRegression(
            penalty="l2",
            C=0.5,
            solver="lbfgs",
            max_iter=1000,
            random_state=42,
        )
        model.fit(self.X_train, self.y_train)
        self.models["logistic_regression"] = model
        self.val_scores["logistic_regression"] = self._score_model(model, self.X_val, self.y_val)
        return model

    def train_random_forest(self) -> RandomForestClassifier:
        """
        Model 2: Random Forest
        Non-linear ensemble capturing complex indicator interactions with reduced variance.
        """
        print("[Training] Model 2: Random Forest...")
        model = RandomForestClassifier(
            n_estimators=150,
            max_depth=5,
            min_samples_split=6,
            min_samples_leaf=4,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        )
        model.fit(self.X_train, self.y_train)
        self.models["random_forest"] = model
        self.val_scores["random_forest"] = self._score_model(model, self.X_val, self.y_val)
        return model

    def train_xgboost(self) -> Any:
        """
        Model 3: XGBoost ⭐
        State-of-the-art gradient boosting with shrinkage and tree pruning.
        """
        print("[Training] Model 3: XGBoost (Champion)...")
        if XGB_AVAILABLE:
            model = xgb.XGBClassifier(
                n_estimators=120,
                max_depth=4,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                gamma=0.1,
                reg_alpha=0.05,
                reg_lambda=1.0,
                eval_metric="logloss",
                random_state=42,
            )
            # Evaluate against Validation partition
            model.fit(
                self.X_train,
                self.y_train,
                eval_set=[(self.X_val, self.y_val)],
                verbose=False,
            )
        else:
            print("  XGBoost not installed; falling back to tuned Random Forest as champion.")
            model = RandomForestClassifier(
                n_estimators=200,
                max_depth=6,
                min_samples_split=4,
                random_state=42,
            )
            model.fit(self.X_train, self.y_train)

        self.models["xgboost"] = model
        self.val_scores["xgboost"] = self._score_model(model, self.X_val, self.y_val)
        return model

    def train_price_regressor(self) -> Any:
        """
        Future Step Scaffolding:
        What will tomorrow's approximate price be?
        Trains regression model on tomorrow's target price.
        """
        print("[Training] Price Regressor (Tomorrow's Price Approximation)...")
        y_train_price = self.bundle.get("y_train_price")
        if y_train_price is None:
            return None

        if XGB_AVAILABLE:
            regressor = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.04,
                random_state=42,
            )
        else:
            regressor = RandomForestRegressor(
                n_estimators=100,
                max_depth=5,
                random_state=42,
            )

        regressor.fit(self.X_train, y_train_price)
        self.models["price_regressor"] = regressor
        return regressor

    def _score_model(self, model: Any, X: pd.DataFrame, y: np.ndarray) -> Dict[str, float]:
        """Calculates validation accuracy, precision, recall, F1, and ROC-AUC."""
        if len(y) == 0:
            return {}
        y_pred = model.predict(X)
        y_prob = model.predict_proba(X)[:, 1] if hasattr(model, "predict_proba") else y_pred

        acc = accuracy_score(y, y_pred)
        prec = precision_score(y, y_pred, zero_division=0)
        rec = recall_score(y, y_pred, zero_division=0)
        f1 = f1_score(y, y_pred, zero_division=0)
        try:
            auc = roc_auc_score(y, y_prob) if len(np.unique(y)) > 1 else 0.5
        except Exception:
            auc = 0.5

        return {
            "accuracy": round(float(acc) * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "roc_auc": round(float(auc), 4),
        }

    def save_artifacts(self) -> Dict[str, str]:
        """
        Serializes champion models and scaler into ml/models/.
        """
        saved_paths = {}

        # 1. Save XGBoost ⭐ (Primary model requested: ml/models/xgboost_model.pkl)
        xgb_path = os.path.join(MODELS_DIR, "xgboost_model.pkl")
        if "xgboost" in self.models:
            with open(xgb_path, "wb") as f:
                pickle.dump(self.models["xgboost"], f)
            saved_paths["xgboost"] = xgb_path

        # 2. Save Random Forest
        rf_path = os.path.join(MODELS_DIR, "random_forest_model.pkl")
        if "random_forest" in self.models:
            with open(rf_path, "wb") as f:
                pickle.dump(self.models["random_forest"], f)
            saved_paths["random_forest"] = rf_path

        # 3. Save Logistic Regression
        lr_path = os.path.join(MODELS_DIR, "logistic_regression_model.pkl")
        if "logistic_regression" in self.models:
            with open(lr_path, "wb") as f:
                pickle.dump(self.models["logistic_regression"], f)
            saved_paths["logistic_regression"] = lr_path

        # 4. Save Price Regressor if available
        if "price_regressor" in self.models:
            reg_path = os.path.join(MODELS_DIR, "price_regressor_model.pkl")
            with open(reg_path, "wb") as f:
                pickle.dump(self.models["price_regressor"], f)
            saved_paths["price_regressor"] = reg_path

        # 5. Save Scaler
        scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
        if self.scaler is not None:
            with open(scaler_path, "wb") as f:
                pickle.dump(self.scaler, f)
            saved_paths["scaler"] = scaler_path

        # 6. Save Metadata & Validation Comparison
        meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
        metadata = {
            "trained_at": datetime.now().isoformat(),
            "target": "Tomorrow_Close > Close -> 1 (UP), else 0 (DOWN)",
            "features": self.features,
            "train_size": len(self.X_train),
            "val_size": len(self.X_val),
            "test_size": len(self.X_test),
            "validation_scores": self.val_scores,
            "champion_model": "xgboost",
        }
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2)
        saved_paths["metadata"] = meta_path

        return saved_paths

def train_all_models(symbol: str = "TCS") -> Dict[str, Any]:
    """
    Main training execution function:
    1. Generates / loads chronological data (2018-2025)
    2. Runs leakage-free preprocessing
    3. Trains Model 1 (Logistic Regression), Model 2 (Random Forest), Model 3 (XGBoost ⭐)
    4. Trains future price regressor scaffolding
    5. Saves serialized models to ml/models/
    """
    print("=" * 70)
    print(f"StockSense-AI: Step 9 - Training ML Direction Models for {symbol.upper()}")
    print("=" * 70)

    # 1. Ingest Data
    raw_df = generate_multiyear_ohlcv(symbol=symbol, start_date="2018-01-01", end_date="2025-12-31")

    # 2. Preprocess & Chronologically Split
    bundle = preprocess_data(
        raw_df,
        features=FEATURE_COLUMNS,
        train_end_date="2023-12-31",
        val_end_date="2024-12-31",
        scale=True,
    )

    # 3. Train all 3 models
    trainer = ModelTrainer(bundle)
    trainer.train_logistic_regression()
    trainer.train_random_forest()
    trainer.train_xgboost()
    trainer.train_price_regressor()

    # 4. Compare Validation Performance
    print("\n" + "-" * 55)
    print("Validation Set (2024 Out-of-Time) Model Comparison:")
    print("-" * 55)
    for model_name, scores in trainer.val_scores.items():
        print(f"  {model_name.upper():<20} | Acc: {scores['accuracy']}% | F1: {scores['f1_score']}% | AUC: {scores['roc_auc']}")

    # 5. Serialize Artifacts
    saved_paths = trainer.save_artifacts()
    print("\nSaved Model Artifacts:")
    for name, path in saved_paths.items():
        print(f"  - {name}: {path}")
    print("=" * 70)

    return {
        "trainer": trainer,
        "saved_paths": saved_paths,
        "validation_scores": trainer.val_scores,
    }

if __name__ == "__main__":
    train_all_models("TCS")
