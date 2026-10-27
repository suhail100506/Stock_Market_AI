# StockSense-AI

> **AI-Powered Stock Market Analysis & Simulated Paper Trading Platform**  
> *Inspired by modern Indian financial technology applications.*

---

## 📌 Project Overview

**StockSense-AI** is a full-stack, simulated stock market trading and intelligent analytics platform. It provides traders, researchers, and learners with a high-fidelity paper trading environment coupled with machine-learning-driven market insights and portfolio analytics.

### ⚠️ Important Notice & Disclaimers
- **Paper Trading Only**: StockSense-AI is strictly a simulation platform utilizing virtual currency. It is **not** a registered broker, does not handle real currency, and does not execute orders on live exchanges.
- **Original Fintech Interface**: StockSense-AI features an independent, original user interface and brand identity. It does not replicate the logos, branding, or proprietary UI designs of Angel One, Zerodha, Groww, or any other commercial brokerage.
- **Educational & Research Purpose**: Market signals, technical indicators, and AI analysis are provided solely for simulation, practice, and research.

---

## 🏗️ Project Architecture

```
StockSense-AI/
├── frontend/        # Modern fintech client interface (dashboards, charts, simulated order terminal)
├── backend/         # Core API services, paper trading matching engine, simulated market feeds
├── ml/              # Machine learning models, sentiment analysis, predictive signals
├── database/        # Database schemas, migrations, seed data, and time-series tick storage
├── docs/            # Architecture specifications, API documentation, simulation rules
└── README.md        # Project documentation and setup guide
```

---

## 📂 Module Descriptions

### 1. `frontend/`
- **Purpose**: Fast, responsive web application for retail market simulation.
- **Planned Stack**: Modern frontend framework (React/Next.js or Vite), high-performance canvas/SVG charting, and real-time WebSocket state management.
- **Key Views**:
  - Live Watchlist with Indian market indices (NIFTY 50, SENSEX, BANKNIFTY simulation).
  - Interactive Candlestick Charting with technical overlay indicators.
  - Simulated Buy/Sell Order Pad (Market, Limit, Stop-Loss, Intraday vs. Delivery).
  - Positions & Holdings Portfolio Tracker with real-time P&L calculation.
  - AI Insights Panel displaying automated signals and sentiment analysis.

### 2. `backend/`
- **Purpose**: High-throughput API server and paper trading matching engine.
- **Core Capabilities**:
  - **Simulated Order Execution Engine**: Models realistic market fills, slippage, and order states (`PENDING`, `EXECUTED`, `CANCELLED`, `REJECTED`).
  - **Virtual Ledger**: Double-entry paper money accounting with virtual wallet balances.
  - **Market Session Simulator**: Adheres to standard Indian market hours (Pre-market 9:00–9:08 AM, Regular 9:15 AM–3:30 PM IST).
  - **Data Feeds**: WebSocket streaming service for real-time tick and candle updates.

### 3. `ml/`
- **Purpose**: AI and quantitative analytics engine for market intelligence.
- **Core Capabilities**:
  - **Technical Indicator Synthesis**: Multi-timeframe trend and momentum signals (RSI, MACD, Bollinger Bands, EMA crossovers).
  - **News & Social Sentiment Scoring**: NLP-based sentiment extraction for Indian equities.
  - **Pattern Recognition**: Candlestick and chart pattern detection (head & shoulders, engulfing, double bottoms).
  - **Risk Profiling & AI Advisory**: Automated portfolio diversification scores and drawdown analysis.

### 4. `database/`
- **Purpose**: Data layer for user accounts, paper portfolios, order history, and historical price candles.
- **Components**:
  - Relational schemas for users, virtual accounts, orders, positions, and trades.
  - Time-series storage for OHLCV (Open, High, Low, Close, Volume) candle data.
  - Migration scripts and seed data for top Indian stocks (NIFTY 50 constituents).

### 5. `docs/`
- **Purpose**: Comprehensive technical, architectural, and financial simulation documentation.
- **Contents**:
  - System architecture diagrams and data flow specifications.
  - Paper trading execution mechanics and fee/tax simulations (STT, GST, Exchange charges).
  - REST and WebSocket API specifications.
  - Project roadmaps and contributing guidelines.

---

## 🚦 Current Status & Completed Milestones

- **STEP 8 — ML Dataset**: Chronological train/val/test split with engineered technical features (RSI, MACD, SMA20, SMA50, EMA20, Volatility).
- **STEP 9 — ML Model Training**: Multi-model suite (Logistic Regression, Random Forest, XGBoost) predicting directional price movements.
- **STEP 10 — Model Evaluation**: Comprehensive performance metrics (Accuracy, Precision, Recall, F1 Score, Directional Accuracy, ROC-AUC, MAE, RMSE).
- **STEP 11 — AI Prediction API**: `GET /api/prediction/{symbol}` pipeline serving live inference with signal recommendations (`BUY`/`SELL`/`HOLD`).
- **STEP 12 — AI Prediction Dashboard**: Real-time AI page with live confidence meters, technical breakdowns, and risk disclaimers.
- **STEP 13 — Paper Trading Engine**: Realistic brokerage ledger with ₹10,00,000 initial virtual cash, double-entry accounting, and persistent order matching.
- **STEP 14 — Portfolio Analytics**: Live P&L calculations, invested amounts, market values, and position holding records.
- **STEP 15 — Watchlist & MongoDB Persistence**: 
  - Dynamic user watchlist with ⭐ click toggle.
  - Benchmark equities: **TCS** (₹3,450, `+1.8%`), **INFY** (₹1,520, `+2.1%`), **RELIANCE** (₹1,425, `-0.4%`), **HDFC** (₹1,980, `+1.2%`).
  - Persisted in MongoDB database `stocksense`, collection `watchlists`.
- **STEP 16 — Authentication & JWT**:
  - Full authentication flow: Register, Login, Logout, JWT bearer tokens.
  - Salted PBKDF2-HMAC-SHA256 password hashing (100,000 iterations). Zero plain-text passwords.
  - Persisted in MongoDB database `stocksense`, collection `users` (`_id`, `name`, `email`, `password_hash`, `balance`, `created_at`).
- **STEP 17 — System Architecture**:
```
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │   React Frontend │
                 │                  │
                 │ Dashboard        │
                 │ Markets          │
                 │ Watchlist        │
                 │ Portfolio        │
                 │ Orders           │
                 │ AI Prediction    │
                 └────────┬─────────┘
                          │
                       REST API
                          │
                          ▼
                 ┌──────────────────┐
                 │    FastAPI       │
                 │                  │
                 │ Auth             │
                 │ Stocks           │
                 │ Portfolio        │
                 │ Orders           │
                 │ Prediction       │
                 └──────┬───┬───────┘
                        │   │
               ┌────────┘   └─────────┐
               ▼                      ▼
        ┌──────────────┐       ┌──────────────┐
        │   MongoDB    │       │ ML Pipeline  │
        │              │       │              │
        │ Users        │       │ Pandas       │
        │ Orders       │       │ Indicators   │
        │ Portfolio    │       │ XGBoost      │
        │ Watchlist    │       │ LSTM         │
        └──────────────┘       └──────┬───────┘
                                      │
                                      ▼
                              Stock Market Data
```
- **STEP 18 — Advanced Features Suite**:
```
🔥 Advanced Features Implemented
├── Candlestick charts (Interactive SVG & lightweight time-series charts)
├── Technical indicators (SMA20, SMA50, EMA20, RSI, MACD, Bollinger Bands, Volatility)
├── Stock screener (Multi-parameter scanner: Sector, RSI zones, AI signals, P/E)
├── Top gainers (Real-time momentum ranking)
├── Top losers (Real-time drawdown ranking)
├── Sector performance (Heatmap across Nifty IT, Banking, Auto, Energy, Metals)
├── News (Sentiment-tagged live financial news headlines & scores)
├── AI prediction (XGBoost directional accuracy 68.4% + LSTM sequence modeling)
├── AI explanation (Algorithmic reasoning & feature importance weights)
├── Portfolio analytics (Sharpe ratio, Win rate, Diversification, AUM)
├── Risk score (Real-time Beta & drawdown risk gauge)
├── Paper trading (₹10,00,000 initial virtual cash, double-entry ledger)
├── Order history (Detailed execution log with statuses and timestamps)
├── P&L analytics (Real-time unrealized MTM + realized returns)
└── Admin dashboard (MongoDB collection inspector, system health, ML registry)
```
