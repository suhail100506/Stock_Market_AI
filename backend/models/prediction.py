from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class PredictionResponse(BaseModel):
    # STEP 11 Core Response Schema
    symbol: str
    current_price: float
    predicted_price: float
    direction: str = "UP"  # "UP" or "DOWN"
    signal: str = "BUY"     # "BUY", "HOLD", or "SELL"
    confidence: float = 0.72  # e.g. 0.72

    # Additional contextual fields for UI dashboards and paper trading
    name: Optional[str] = None
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    upside_percentage: Optional[float] = None
    downside_percentage: Optional[float] = None
    summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    technicals: Optional[Dict[str, Any]] = None
    model_name: Optional[str] = "XGBoost ⭐"
    up_probability: Optional[float] = None
    down_probability: Optional[float] = None

class DirectionalPerformance(BaseModel):
    directional_accuracy: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: Dict[str, int]

class PricePredictionPerformance(BaseModel):
    mae: float
    rmse: float
    mape: float
    unit: str = "INR (₹)"

class ModelPerformanceResponse(BaseModel):
    model_name: str = "XGBoost"
    model_type: str = "Gradient Boosted Decision Trees"
    badge: str = "Champion Production Model"
    evaluated_at: str
    test_partition: Dict[str, Any]
    directional_performance: DirectionalPerformance
    price_prediction_performance: PricePredictionPerformance
    backtest_performance: Dict[str, Any]
    feature_importances: Dict[str, float]
