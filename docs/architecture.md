# System Architecture & Design

## 1. High-Level Architecture

StockSense-AI is organized as a modular, decoupled full-stack platform consisting of five primary tiers:

```mermaid
graph TD
    Client["Frontend UI (React/Modern Web)<br/>Original Fintech Theme & Terminal"]
    
    subgraph Backend_Services["Backend Services"]
        API["REST & WebSocket Gateway"]
        Engine["Simulated Matching Engine"]
        Ledger["Paper Trading Ledger & Portfolio"]
        Feed["Market Data Feed Simulator"]
    end
    
    subgraph ML_Services["Intelligence Engine"]
        Signals["Technical Indicators & Pattern Detector"]
        Sentiment["News & Market Sentiment Analyzer"]
        Predictor["Price Trend & Volatility Forecaster"]
    end
    
    subgraph Persistence["Storage Tier"]
        DB[(Relational DB: Accounts & Ledger)]
        TS[(Time-Series DB: Candles & Ticks)]
    end
    
    Client <-->|HTTP / WS| API
    API --> Engine
    Engine --> Ledger
    Ledger --> DB
    Feed --> API
    Feed --> Signals
    Signals --> Predictor
    Predictor --> API
    TS --> Feed
```

## 2. Core Modules Interaction
- **Frontend**: Connects via HTTP REST for authentication, account balances, historical candles, and order submissions. Establishes a persistent WebSocket connection for real-time simulated price ticks, order status updates, and live P&L streaming.
- **Backend**: Validates order margins against the virtual ledger, executes fills against current simulated market prices, and records double-entry bookkeeping transactions.
- **ML Engine**: Ingests incoming ticks and news digests, generating real-time sentiment scores and technical analysis overlays sent downstream to the client.
- **Database**: Stores transactional data (users, virtual portfolios, orders, trades) and time-series historical candle data.

## 3. End-to-End Market Data Pipeline

```mermaid
flowchart TD
    Ext["External Market API<br/>(Yahoo Finance / Public Feeds / Exchange APIs)"]
    
    subgraph FastAPI_Layer["FastAPI Ingestion & Normalization"]
        Fetch["external_market_service.py<br/>HTTP Ingestion Engine"]
        Cache[("In-Memory TTL Cache<br/>60s quotes / 5m candles")]
        Normalize["Pydantic Normalizer<br/>StockDetail, CandlePoint, StockSummary"]
        Router["stocks.py / prediction.py<br/>REST Endpoints (/api/stocks, /api/stocks/:symbol)"]
    end
    
    subgraph Normalized_JSON["Unified Normalized JSON Schema"]
        JSON["Standardized StockSense Payload<br/>symbol, ltp, prev_close, change, change_percent,<br/>order_book, technicals, ai_signal, candles"]
    end
    
    subgraph React_Client["React Frontend Layer"]
        Axios["client.js<br/>Centralized Axios Client & Normalizer"]
        Context["TradingContext.jsx<br/>Global State, Order Pad, Watchlist"]
        UI["React Views<br/>Dashboard, Markets, StockDetail, Watchlist, Portfolio"]
    end

    Ext -->|Raw Market Feeds| Fetch
    Fetch <-->|Hit / Miss| Cache
    Fetch --> Normalize
    Normalize --> Router
    Router -->|JSON via HTTP| JSON
    JSON --> Axios
    Axios --> Context
    Context --> UI
```

### Pipeline Steps:
1. **External Market API Ingestion**:  
   Ingests live quotes, day highs/lows, trading volume, and OHLCV historical candle vectors for Indian equities (e.g., `RELIANCE.NS`, `TCS.NS`, `INFY.NS`).
2. **FastAPI Caching & Normalization Tier**:  
   Raw multi-format external payloads are cached in-memory with configurable TTL to avoid rate-limiting. The normalizer enforces strict Pydantic models (`StockDetail`, `StockSummary`, `CandlePoint`).
3. **Normalized JSON Output**:  
   Guarantees a clean, standardized contract across all endpoints (`/api/stocks`, `/api/stocks/{symbol}`, `/api/stocks/{symbol}/history`), decoupling frontend presentation from volatile external API schemas.
4. **React Client Consumption**:  
   Centralized Axios client (`client.js`) and `TradingContext.jsx` consume the normalized JSON to power interactive candlestick charts, watchlists, market depth, and paper trading execution.

