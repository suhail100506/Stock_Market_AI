from fastapi import APIRouter, HTTPException, status
from ..models.prediction import PredictionResponse, ModelPerformanceResponse
from ..services.prediction_service import get_prediction_for_stock, get_model_performance

router = APIRouter(prefix="/api/prediction", tags=["AI Predictions"])

@router.get("/performance", response_model=ModelPerformanceResponse, summary="Get global AI model performance metrics")
def get_global_performance():
    """
    Returns authentic out-of-sample (2025 Test Partition) evaluation metrics for champion XGBoost:
    Directional Accuracy, Precision, Recall, F1 Score, ROC-AUC, Confusion Matrix, and Price Prediction MAE/RMSE/MAPE.
    """
    return get_model_performance(symbol="TCS")

@router.get("/{symbol}/performance", response_model=ModelPerformanceResponse, summary="Get model performance for symbol")
def get_symbol_performance(symbol: str):
    """
    Returns authentic out-of-sample test set evaluation metrics calibrated for the given stock symbol.
    """
    return get_model_performance(symbol=symbol)

@router.get("/{symbol}", response_model=PredictionResponse, summary="Get AI prediction for a stock")
def get_prediction(symbol: str):
    """
    Returns AI model signals, confidence scores, upside/downside forecasts,
    target price, stop-loss levels, and sentiment insights for an Indian equity.
    """
    prediction = get_prediction_for_stock(symbol)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{symbol.upper()}' was not found in the AI prediction universe."
        )
    return prediction

@router.get("/{symbol}/lstm", summary="Get LSTM recurrent sequence prediction")
def get_lstm_prediction(symbol: str):
    """
    Returns time series sequence forecast using deep learning Long Short-Term Memory (LSTM) network.
    """
    from ml.lstm_model import lstm_predictor
    from ..services.stock_service import get_stock_by_symbol
    stock = get_stock_by_symbol(symbol)
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{symbol.upper()}' was not found."
        )
    return lstm_predictor.predict_next_price(symbol, current_price=stock.ltp)
