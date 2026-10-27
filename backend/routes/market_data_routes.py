"""
StockSense-AI: Comprehensive Market Data, Derivatives, ETFs & WebSocket Router
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from typing import List, Optional, Dict, Any

from ..market_data.instrument_master import instrument_master
from ..market_data.provider_adapter import market_provider
from ..market_data.websocket_manager import ws_manager

router = APIRouter(prefix="/api", tags=["Market Data & Streaming"])


# -------------------------------------------------------------------
# 1. SCALABLE INSTRUMENT MASTER SEARCH
# -------------------------------------------------------------------
@router.get("/instruments/search", summary="Search across full instrument master")
def search_instruments(
    q: Optional[str] = Query(None, description="Search term for symbol, name, or ISIN"),
    category: Optional[str] = Query("all", description="Filter by category: all, equity, index, fno_index, fno_stock, commodity, etf"),
    exchange: Optional[str] = Query("ALL", description="Filter by exchange: NSE, BSE, MCX, GLOBAL, or ALL"),
    sector: Optional[str] = Query("ALL", description="Filter by sector"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Search over hundreds of Indian equities, derivatives, commodities, indices, and ETFs with debounce support.
    """
    return instrument_master.search_instruments(
        q=q,
        category=category,
        exchange=exchange,
        sector=sector,
        page=page,
        limit=limit,
    )


# -------------------------------------------------------------------
# 2. REAL-TIME QUOTES (Single & Batch)
# -------------------------------------------------------------------
@router.get("/market/quote/{identifier}", summary="Get normalized quote for instrument")
def get_single_quote(identifier: str):
    """
    Returns normalized quote with live or calibrated pricing, change, OHLC, volume, and data freshness.
    """
    q = market_provider.get_quote(identifier)
    if not q:
        # Fallback search by symbol
        inst = instrument_master.get_by_symbol(identifier)
        if inst:
            q = market_provider.get_quote(inst.instrument_id)
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Instrument '{identifier}' not found in master directory."
        )
    return q


@router.get("/market/quotes", summary="Get batch quotes for multiple symbols")
def get_batch_quotes(symbols: str = Query(..., description="Comma-separated symbols, e.g. TCS,RELIANCE,INFY")):
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    results = {}
    for s in sym_list:
        inst = instrument_master.get_by_symbol(s)
        if inst:
            q = market_provider.get_quote(inst.instrument_id)
            if q:
                results[s] = q
    return results


# -------------------------------------------------------------------
# 3. ALL INDICES (Indian & Global) - Screenshot 4
# -------------------------------------------------------------------
@router.get("/market/indices/all", summary="Get complete Indian and Global benchmark indices")
def get_all_indices():
    """
    Returns Indian benchmark indices (8) with Open/High/Low/Close & composition link,
    and Global indices (14) categorized by USA, Asia, Europe.
    """
    # Indian Indices
    indian_keys = [
        "NIFTY 50", "SENSEX", "BANK NIFTY", "FIN NIFTY",
        "BANKEX", "MIDCPNIFTY", "INDIA VIX", "NIFTYNXT50"
    ]
    indian_quotes = []
    for sym in indian_keys:
        inst = instrument_master.get_by_symbol(sym)
        if inst:
            q = market_provider.get_quote(inst.instrument_id)
            if q:
                indian_quotes.append({
                    "symbol": q.symbol,
                    "name": q.name,
                    "exchange": q.exchange,
                    "ltp": q.ltp,
                    "change": q.change,
                    "change_percent": q.change_percent,
                    "open": q.open,
                    "high": q.high,
                    "low": q.low,
                    "close": q.prev_close,
                    "has_derivatives": sym in ("NIFTY 50", "BANK NIFTY", "FIN NIFTY", "MIDCPNIFTY"),
                })

    # Global Indices (USA, Asia, Europe)
    global_keys = [
        ("DOLLAR INDEX", "USA"),
        ("US 10 YR TREASURY", "USA"),
        ("DOW JONES", "USA"),
        ("RUSSELL 2000", "USA"),
        ("S&P 500", "USA"),
        ("NASDAQ", "USA"),
        ("TSX", "Americas"),
        ("NIKKEI 225", "Asia"),
        ("HANG SENG", "Asia"),
        ("FTSE 100", "Europe"),
        ("DAX 40", "Europe"),
        ("CAC 40", "Europe"),
    ]
    global_quotes = []
    for sym, region in global_keys:
        inst = instrument_master.get_by_symbol(sym)
        if inst:
            q = market_provider.get_quote(inst.instrument_id)
            if q:
                global_quotes.append({
                    "symbol": q.symbol,
                    "name": q.name,
                    "region": region,
                    "ltp": q.ltp,
                    "change": q.change,
                    "change_percent": q.change_percent,
                    "high": q.high,
                    "low": q.low,
                })

    return {
        "indian_indices": indian_quotes,
        "global_indices": global_quotes,
        "market_status": market_provider.get_market_status(),
    }


# -------------------------------------------------------------------
# 4. INDEX F&O WORKSPACE - Screenshot 1
# -------------------------------------------------------------------
@router.get("/market/fno/index", summary="Get Index F&O options ladder, OI analysis & institutional cash")
def get_index_fno(index: str = "NIFTY", expiry: str = "19 Oct 2026"):
    """
    Returns nearest futures, CE/PE call/put ladder across strikes, Call vs Put OI change chart data,
    FII/DII cash and futures flow table, and research ideas.
    """
    # Options Chain across strikes around 22800-23000
    options_chain = [
        {
            "strike": 22800,
            "call": {"symbol": f"{index} 22800 {expiry} CE", "ltp": 166.90, "change": -135.15, "change_pct": -37.59, "status": "ITM", "oi": "45.2L"},
            "put": {"symbol": f"{index} 22800 {expiry} PE", "ltp": 110.25, "change": 74.80, "change_pct": 156.15, "status": "OTM", "oi": "68.4L"},
        },
        {
            "strike": 22850,
            "call": {"symbol": f"{index} 22850 {expiry} CE", "ltp": 126.00, "change": -120.15, "change_pct": -45.18, "status": "ITM", "oi": "38.1L"},
            "put": {"symbol": f"{index} 22850 {expiry} PE", "ltp": 60.55, "change": 22.00, "change_pct": 56.45, "status": "OTM", "oi": "52.3L"},
        },
        {
            "strike": 22900,
            "call": {"symbol": f"{index} 22900 {expiry} CE", "ltp": 93.00, "change": -102.20, "change_pct": -49.38, "status": "ATM", "oi": "82.5L"},
            "put": {"symbol": f"{index} 22900 {expiry} PE", "ltp": 11.20, "change": -18.15, "change_pct": -42.82, "status": "ATM", "oi": "79.1L"},
        },
        {
            "strike": 22950,
            "call": {"symbol": f"{index} 22950 {expiry} CE", "ltp": 18.65, "change": -102.40, "change_pct": -59.32, "status": "OTM", "oi": "61.0L"},
            "put": {"symbol": f"{index} 22950 {expiry} PE", "ltp": 0.50, "change": -20.20, "change_pct": -90.79, "status": "ITM", "oi": "34.5L"},
        },
        {
            "strike": 23000,
            "call": {"symbol": f"{index} 23000 {expiry} CE", "ltp": 8.05, "change": -120.55, "change_pct": -69.87, "status": "OTM", "oi": "95.6L"},
            "put": {"symbol": f"{index} 23000 {expiry} PE", "ltp": 0.25, "change": -18.50, "change_pct": -88.75, "status": "ITM", "oi": "28.0L"},
        },
    ]

    # OI Change Bar Chart Data across strikes
    oi_analysis = [
        {"strike": 22800, "call_oi_change": 1.5, "put_oi_change": -0.8},
        {"strike": 22850, "call_oi_change": 0.2, "put_oi_change": -1.2},
        {"strike": 22900, "call_oi_change": 0.8, "put_oi_change": 1.4},
        {"strike": 22950, "call_oi_change": 2.8, "put_oi_change": 0.1},
        {"strike": 23000, "call_oi_change": 1.6, "put_oi_change": 0.3},
        {"strike": 23050, "call_oi_change": 1.4, "put_oi_change": -2.1},
    ]

    # FII / DII Institutional Provisional Cash & Net Position Table
    fii_dii_history = [
        {
            "date": "16 Oct 2026",
            "fii_buy": 13201.59,
            "fii_sell": 18195.91,
            "fii_net": -4994.32,
            "dii_buy": 17291.18,
            "dii_sell": 20852.38,
            "dii_net": -3561.20,
            "total_net": -8555.52,
        },
        {
            "date": "15 Oct 2026",
            "fii_buy": 12135.59,
            "fii_sell": 13328.96,
            "fii_net": -1193.37,
            "dii_buy": 14400.91,
            "dii_sell": 16518.26,
            "dii_net": -2117.35,
            "total_net": -3310.72,
        },
        {
            "date": "14 Oct 2026",
            "fii_buy": 15291.85,
            "fii_sell": 13234.21,
            "fii_net": 2057.64,
            "dii_buy": 17428.51,
            "dii_sell": 14258.17,
            "dii_net": 3170.34,
            "total_net": 5227.98,
        },
        {
            "date": "13 Oct 2026",
            "fii_buy": 13455.39,
            "fii_sell": 14779.52,
            "fii_net": -1324.13,
            "dii_buy": 15232.07,
            "dii_sell": 13309.73,
            "dii_net": 1922.34,
            "total_net": 598.21,
        },
        {
            "date": "12 Oct 2026",
            "fii_buy": 12563.21,
            "fii_sell": 14291.69,
            "fii_net": -1728.48,
            "dii_buy": 15506.73,
            "dii_sell": 12461.71,
            "dii_net": 3045.02,
            "total_net": 1316.54,
        },
    ]

    return {
        "index": index,
        "expiry": expiry,
        "nearest_future": {
            "symbol": f"{index} 27 Oct 2026",
            "ltp": 22884.00,
            "change": -220.20,
            "change_percent": -0.87,
        },
        "options_chain": options_chain,
        "oi_analysis": oi_analysis,
        "fii_dii_history": fii_dii_history,
    }


# -------------------------------------------------------------------
# 5. STOCKS F&O WORKSPACE - Screenshot 2
# -------------------------------------------------------------------
@router.get("/market/fno/stocks", summary="Get Stocks F&O 14-sector heatmap, movers & buildups")
def get_stocks_fno():
    """
    Returns 14-sector heatmap with performance and drilldown scripts,
    Movers (Price Gainers/Losers, OI Gainers/Losers), and Buildups (Long/Short Buildup, Covering).
    """
    sectors = [
        {"name": "PSU Bank", "change_pct": 1.78, "script_count": 6},
        {"name": "Banking", "change_pct": 0.43, "script_count": 8},
        {"name": "Realty", "change_pct": -0.14, "script_count": 4},
        {"name": "Energy", "change_pct": -0.21, "script_count": 7},
        {"name": "Services", "change_pct": -0.23, "script_count": 5},
        {"name": "Infra", "change_pct": -0.47, "script_count": 6},
        {"name": "Auto", "change_pct": -0.49, "script_count": 5},
        {"name": "Metal", "change_pct": -0.57, "script_count": 5},
        {"name": "Pharma", "change_pct": -0.77, "script_count": 6},
        {"name": "PSE", "change_pct": -0.80, "script_count": 8},
        {"name": "Technology", "change_pct": -0.87, "script_count": 7},
        {"name": "Cement", "change_pct": -0.93, "script_count": 4},
        {"name": "Consumer", "change_pct": -1.03, "script_count": 6},
        {"name": "Finance", "change_pct": -1.33, "script_count": 7},
    ]

    # PSU Bank Sector Scripts
    psu_bank_scripts = [
        {"symbol": "BANKBARODA 27 Oct 2026", "ltp": 238.50, "change": 8.15, "change_pct": 3.54, "oi": "13.34 Cr", "oi_change_pct": -1.40},
        {"symbol": "BANKINDIA 27 Oct 2026", "ltp": 136.89, "change": 4.78, "change_pct": 3.62, "oi": "6.11 Cr", "oi_change_pct": 1.18},
        {"symbol": "CANBK 27 Oct 2026", "ltp": 121.77, "change": 3.00, "change_pct": 2.53, "oi": "30.45 Cr", "oi_change_pct": -2.01},
        {"symbol": "PNB 27 Oct 2026", "ltp": 122.16, "change": 6.14, "change_pct": 5.29, "oi": "24.36 Cr", "oi_change_pct": 0.87},
        {"symbol": "SBIN 27 Oct 2026", "ltp": 812.15, "change": 7.80, "change_pct": 0.97, "oi": "9.13 Cr", "oi_change_pct": -2.18},
        {"symbol": "UNIONBANK 27 Oct 2026", "ltp": 181.15, "change": 8.52, "change_pct": 4.94, "oi": "9.78 Cr", "oi_change_pct": 2.55},
    ]

    # Price Gainers / Losers
    price_gainers = [
        {"symbol": "PNB 27 Oct 2026", "ltp": 122.16, "change": 6.14, "change_pct": 5.29},
        {"symbol": "UNIONBANK 27 Oct 2026", "ltp": 181.15, "change": 8.52, "change_pct": 4.94},
        {"symbol": "FEDERALBNK 27 Oct 2026", "ltp": 348.90, "change": 11.85, "change_pct": 3.52},
        {"symbol": "BANKINDIA 27 Oct 2026", "ltp": 136.89, "change": 4.78, "change_pct": 3.62},
        {"symbol": "BANKBARODA 27 Oct 2026", "ltp": 238.50, "change": 8.15, "change_pct": 3.54},
    ]

    # Long Buildup Movers
    long_buildup = [
        {"symbol": "PNB 27 Oct 2026", "ltp": 122.16, "change": 6.14, "change_pct": 5.29, "type": "Long Buildup"},
        {"symbol": "UNIONBANK 27 Oct 2026", "ltp": 181.15, "change": 8.52, "change_pct": 4.94, "type": "Long Buildup"},
        {"symbol": "BANKINDIA 27 Oct 2026", "ltp": 136.89, "change": 4.78, "change_pct": 3.62, "type": "Long Buildup"},
        {"symbol": "FEDERALBNK 27 Oct 2026", "ltp": 348.90, "change": 11.85, "change_pct": 3.52, "type": "Long Buildup"},
        {"symbol": "ABB 27 Oct 2026", "ltp": 7019.00, "change": 180.00, "change_pct": 2.63, "type": "Long Buildup"},
    ]

    # Research recommendations
    recommendations = [
        {"symbol": "GRASIM 27 Oct 26 3000.00 PE", "action": "BUY", "ltp": 118.60, "change": 31.25, "change_pct": 35.78, "sl": 65.00, "entry": "90.00 - 93.00", "target": 140.00, "profit_achieved": "29.03%"},
        {"symbol": "DIXON 27 Oct 26 13500.00 CE", "action": "BUY", "ltp": 13.25, "change": -26.85, "change_pct": -66.96, "sl": 20.00, "entry": "94.00 - 99.00", "target": 230.00, "profit_achieved": "Loss Booked"},
        {"symbol": "COFORGE 27 Oct 2026", "action": "SELL", "ltp": 1923.30, "change": -30.20, "change_pct": -1.55, "sl": 1946.00, "entry": "1932.00 - 1935.00", "target": 1890.00, "profit_achieved": "0.41%"},
        {"symbol": "DMART 27 Oct 2026", "action": "BUY", "ltp": 3295.00, "change": -46.60, "change_pct": -1.39, "sl": 3365.00, "entry": "3345.50 - 3355.00", "target": 3420.00, "profit_achieved": "Pending"},
    ]

    return {
        "sectors": sectors,
        "selected_sector_scripts": psu_bank_scripts,
        "price_gainers": price_gainers,
        "long_buildup": long_buildup,
        "recommendations": recommendations,
    }


# -------------------------------------------------------------------
# 6. COMMODITIES WORKSPACE - Screenshot 3
# -------------------------------------------------------------------
@router.get("/market/commodities", summary="Get MCX Commodities banner, F&O watchlist & options")
def get_commodities():
    """
    Returns top commodities (Crude, Nat Gas, Gold, Silver),
    options chain for crude oil, commodity recommendations, and guide.
    """
    top_commodities = [
        {"symbol": "Crude Oil", "expiry": "19 Nov 2026", "ltp": 6242.00, "change": -52.00, "change_pct": -0.83},
        {"symbol": "Natural Gas", "expiry": "27 Oct 2026", "ltp": 243.60, "change": -5.00, "change_pct": -2.01},
        {"symbol": "Gold", "expiry": "04 Dec 2026", "ltp": 78205.00, "change": -713.00, "change_pct": -0.90},
        {"symbol": "Silver", "expiry": "04 Dec 2026", "ltp": 97425.00, "change": -1425.00, "change_pct": -1.44},
    ]

    # Crude Oil Options Ladder (Strikes 9250 to 9450)
    crude_options = [
        {
            "strike": 9250,
            "call": {"symbol": "9250 CRUDEOIL 17 Nov 2026", "status": "ITM", "ltp": 555.00, "change": -60.90, "change_pct": -9.89},
            "put": {"symbol": "9450 CRUDEOIL 17 Nov 2026", "status": "ITM", "ltp": 569.50, "change": -9.40, "change_pct": -1.62},
        },
        {
            "strike": 9300,
            "call": {"symbol": "9300 CRUDEOIL 17 Nov 2026", "status": "ITM", "ltp": 528.70, "change": -63.40, "change_pct": -10.71},
            "put": {"symbol": "9400 CRUDEOIL 17 Nov 2026", "status": "ITM", "ltp": 540.60, "change": -9.10, "change_pct": -1.66},
        },
        {
            "strike": 9350,
            "call": {"symbol": "9350 CRUDEOIL 17 Nov 2026", "status": "ATM", "ltp": 507.00, "change": -62.20, "change_pct": -10.93},
            "put": {"symbol": "9350 CRUDEOIL 17 Nov 2026", "status": "ATM", "ltp": 513.40, "change": -10.70, "change_pct": -2.04},
        },
        {
            "strike": 9400,
            "call": {"symbol": "9400 CRUDEOIL 17 Nov 2026", "status": "OTM", "ltp": 485.90, "change": -59.50, "change_pct": -10.91},
            "put": {"symbol": "9300 CRUDEOIL 17 Nov 2026", "status": "OTM", "ltp": 484.50, "change": -13.50, "change_pct": -2.71},
        },
        {
            "strike": 9450,
            "call": {"symbol": "9450 CRUDEOIL 17 Nov 2026", "status": "OTM", "ltp": 465.30, "change": -58.10, "change_pct": -11.11},
            "put": {"symbol": "9250 CRUDEOIL 17 Nov 2026", "status": "OTM", "ltp": 458.00, "change": -14.70, "change_pct": -3.11},
        },
    ]

    recommendations = [
        {"symbol": "SILVER 04 Dec 2026", "action": "SELL", "ltp": 97425.00, "change": -1425.00, "sl": 99050.00, "entry": "98140.00 - 98170.00", "target": 96500.00, "profit_achieved": "0.35%"},
        {"symbol": "GOLDM 05 Nov 2026", "action": "SELL", "ltp": 78210.00, "change": -775.00, "sl": 79400.00, "entry": "78800.00 - 78850.00", "target": 77500.00, "profit_achieved": "0.43%"},
        {"symbol": "CRUDEOILM 19 Nov 2026", "action": "BUY", "ltp": 6245.00, "change": -54.00, "sl": 6110.00, "entry": "6200.00 - 6215.00", "target": 6450.00, "profit_achieved": "Pending"},
        {"symbol": "NATURALGAS 23 Oct 26 300.00 CE", "action": "BUY", "ltp": 5.60, "change": -3.60, "sl": 3.20, "entry": "4.00 - 4.50", "target": 9.50, "profit_achieved": "Pending"},
    ]

    return {
        "top_commodities": top_commodities,
        "nearest_future": {"symbol": "CRUDEOIL 19 Nov 2026", "ltp": 6242.00, "change": -52.00, "change_pct": -0.83},
        "options_chain": crude_options,
        "recommendations": recommendations,
    }


# -------------------------------------------------------------------
# 7. ETF DISCOVERY WORKSPACE - Screenshot 5
# -------------------------------------------------------------------
@router.get("/market/etfs", summary="Get ETF Directory with categories, curated returns & budget lists")
def get_etf_directory():
    """
    Returns categorised ETFs (Index, Gold, Silver, Sector, Debt, Global),
    Highest Returns international ETFs, and Budget-Friendly ETFs.
    """
    categories = [
        {"name": "Index", "count": 14},
        {"name": "Gold", "count": 6},
        {"name": "Silver", "count": 4},
        {"name": "Sector", "count": 12},
        {"name": "Debt", "count": 5},
        {"name": "Global", "count": 8},
        {"name": "Others", "count": 6},
    ]

    top_recommended = {
        "symbol": "JUNIORBEES",
        "name": "Nippon India ETF Nifty Next 50 Junior BeES",
        "one_year_return": "-0.10%",
        "ltp": 744.73,
        "change": -5.03,
        "change_pct": -0.67,
    }

    sector_of_month = [
        {"symbol": "AUTOIETF", "name": "ICICI Prudential Nifty Auto ETF", "one_year_return": "-4.65%", "ltp": 26.48, "change": -0.23, "change_pct": -0.86},
        {"symbol": "AUTOBEES", "name": "Nippon India Nifty Auto ETF", "one_year_return": "-5.39%", "ltp": 264.79, "change": -2.23, "change_pct": -0.84},
    ]

    popular_etfs = [
        {"symbol": "AONEGOLD", "name": "Angel One Gold ETF", "category": "GOLD", "ltp": 13.52, "change": -0.03, "return_1y": "+10.73%"},
        {"symbol": "AONELIQUID", "name": "Angel One Nifty 1D Rate Liquid ETF", "category": "DEBT", "ltp": 1081.94, "change": 0.31, "return_1y": "+5.00%"},
        {"symbol": "AONETMMQ50", "name": "Angel One Nifty Total Market Q50 ETF", "category": "INDEX", "ltp": 24.15, "change": -0.07, "return_1y": "+14.20%"},
        {"symbol": "TATAGOLD", "name": "Tata Gold Exchange Traded Fund", "category": "GOLD", "ltp": 14.09, "change": -0.04, "return_1y": "+11.21%"},
        {"symbol": "LIQUIDCASE", "name": "Zerodha Nifty 1D Rate Liquid ETF", "category": "DEBT", "ltp": 116.47, "change": 0.03, "return_1y": "+4.97%"},
        {"symbol": "TATSILV", "name": "Tata Silver Exchange Traded Fund", "category": "SILVER", "ltp": 94.20, "change": -0.90, "return_1y": "+18.40%"},
    ]

    highest_returns = [
        {"symbol": "MONQ50", "name": "Motilal Oswal Nasdaq Q 50 ETF", "category": "GLOBAL", "ltp": 236.71, "change": -7.24, "return_1y": "+136.21%"},
        {"symbol": "MAFANG", "name": "Mirae Asset NYSE FANG+ ETF", "category": "GLOBAL", "ltp": 267.62, "change": -6.70, "return_1y": "+59.43%"},
        {"symbol": "MASPTOP50", "name": "Mirae Asset S&P 500 Top 50 ETF", "category": "GLOBAL", "ltp": 104.26, "change": -1.04, "return_1y": "+53.70%"},
    ]

    budget_friendly = [
        {"symbol": "MODEFENCE", "name": "Motilal Oswal Nifty India Defence ETF", "category": "SECTOR", "ltp": 99.84, "change": -1.40, "return_1y": "+11.91%"},
        {"symbol": "MOPSE", "name": "Motilal Oswal Nifty PSE ETF", "category": "INDEX", "ltp": 94.07, "change": -0.81, "return_1y": "-5.69%"},
        {"symbol": "GROWWPSE", "name": "Groww Nifty PSE ETF", "category": "COMPANY", "ltp": 92.95, "change": -0.51, "return_1y": "+8.45%"},
    ]

    return {
        "categories": categories,
        "top_recommended": top_recommended,
        "sector_of_month": sector_of_month,
        "popular_etfs": popular_etfs,
        "highest_returns": highest_returns,
        "budget_friendly": budget_friendly,
    }


# -------------------------------------------------------------------
# 8. WEBSOCKET REAL-TIME STREAMING ENDPOINT
# -------------------------------------------------------------------
@router.websocket("/ws/market-data")
async def websocket_market_data_endpoint(websocket: WebSocket):
    """
    Real-time streaming WebSocket endpoint for continuous price ticks,
    index movements, and dynamic symbol subscriptions.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                symbols = msg.get("symbols", [])
                if action == "SUBSCRIBE":
                    ws_manager.subscribe(websocket, symbols)
                elif action == "UNSUBSCRIBE":
                    ws_manager.unsubscribe(websocket, symbols)
                elif action == "PING":
                    await websocket.send_json({"type": "PONG", "market_status": market_provider.get_market_status()})
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
