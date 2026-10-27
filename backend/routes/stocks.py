from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from ..models.stock import StockSummary, StockDetail, CandlePoint
from ..models.watchlist import WatchlistResponse, WatchlistToggleRequest
from ..services.stock_service import (
    get_all_stocks,
    get_stock_by_symbol,
    generate_stock_history,
    get_watchlist_symbols,
    toggle_watchlist_symbol,
    MOCK_STOCKS_DATA,
    format_stock_summary
)

router = APIRouter(prefix="/api", tags=["Stocks & Watchlist"])

@router.get("/stocks", response_model=List[StockSummary], summary="List all Indian stocks")
def list_stocks(
    sector: Optional[str] = Query(None, description="Filter by sector, e.g. IT, Banking"),
    search: Optional[str] = Query(None, description="Search symbol or name")
):
    """
    Returns a list of all supported Indian equities with current LTP, day changes, and AI signals.
    """
    return get_all_stocks(sector=sector, search=search)

@router.get("/stocks/{symbol}", response_model=StockDetail, summary="Get full stock detail")
def get_stock(symbol: str):
    """
    Fetch comprehensive stock data including Level 2 market depth, technicals, and AI signals.
    """
    stock = get_stock_by_symbol(symbol)
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock with symbol '{symbol.upper()}' was not found in the simulation."
        )
    return stock

@router.get("/stocks/{symbol}/history", response_model=List[CandlePoint], summary="Get historical price candles")
def get_stock_history(
    symbol: str,
    timeframe: str = Query("1M", pattern="^(1D|1W|1M|1Y)$", description="Candle timeframe: 1D, 1W, 1M, 1Y")
):
    """
    Returns OHLCV candlestick time series for interactive charting.
    """
    sym = symbol.upper().strip()
    if sym not in MOCK_STOCKS_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock with symbol '{sym}' was not found."
        )
    return generate_stock_history(sym, timeframe=timeframe)

@router.get("/watchlist", response_model=WatchlistResponse, summary="Get user watchlist")
def get_watchlist():
    """
    Fetch all symbols currently on the user's paper trading watchlist.
    """
    symbols = get_watchlist_symbols()
    stocks = [format_stock_summary(MOCK_STOCKS_DATA[s]) for s in symbols if s in MOCK_STOCKS_DATA]
    return WatchlistResponse(
        symbols=symbols,
        stocks=stocks,
        message="Watchlist retrieved from MongoDB successfully",
        mongo_saved=True,
        storage="MongoDB (watchlists collection)"
    )

@router.post("/watchlist", response_model=WatchlistResponse, summary="Toggle symbol in watchlist")
def update_watchlist(payload: WatchlistToggleRequest):
    """
    Add or remove a symbol from the user's watchlist.
    """
    res = toggle_watchlist_symbol(payload.symbol)
    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message")
        )
    return WatchlistResponse(
        symbols=res["symbols"],
        stocks=res["stocks"],
        message=res["message"],
        mongo_saved=res.get("mongo_saved", True),
        storage=res.get("storage", "MongoDB (watchlists collection)")
    )

@router.get("/stocks/{symbol}/indicators", summary="Get data science indicators dataset")
def get_stock_indicators(symbol: str, timeframe: str = "1M"):
    """
    Calculates Data Science Feature Dataset:
    - Moving averages: SMA20, SMA50, EMA20
    - Momentum: RSI, MACD
    - Volatility: Return, Volatility (20-day rolling std), Bollinger Bands
    """
    import pandas as pd
    from ml.feature_engineering import build_feature_dataset, compute_indicator_summary

    sym = symbol.upper().strip()
    if sym not in MOCK_STOCKS_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock '{sym}' not found."
        )

    candles = generate_stock_history(sym, timeframe=timeframe)
    if not candles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch historical price data for '{sym}'."
        )

    # Convert to DataFrame
    df_raw = pd.DataFrame([
        {
            "Date": c.time,
            "Open": c.open,
            "High": c.high,
            "Low": c.low,
            "Close": c.close,
            "Volume": c.volume,
        }
        for c in candles
    ])

    # Run feature engineering pipeline
    feature_df = build_feature_dataset(df_raw, drop_na=False)
    summary = compute_indicator_summary(feature_df)

    # Replace NaNs with None for valid JSON serialization
    records = feature_df.where(pd.notnull(feature_df), None).to_dict(orient="records")

    return {
        "symbol": sym,
        "timeframe": timeframe,
        "record_count": len(records),
        "columns": [
            "Date", "Open", "High", "Low", "Close", "Volume",
            "SMA20", "SMA50", "EMA20", "RSI", "MACD", "Volatility", "Return"
        ],
        "dataset": records,
        "summary": summary
    }

