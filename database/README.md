# Database Module - StockSense-AI

## Overview
The `database/` directory manages data persistence, relational schemas, migrations, seed datasets, and time-series historical price storage for StockSense-AI.

## Planned Schemas & Data Models
1. **User & Auth**:
   - `users`: User profiles, authentication credentials, and preferences.
   - `user_settings`: UI preferences, notification alerts, default order quantities.
2. **Paper Trading & Ledger**:
   - `virtual_wallets`: Available cash, utilized margin, starting virtual capital (e.g., ₹10,00,000 INR default virtual balance).
   - `orders`: Order records (symbol, side: BUY/SELL, product: CNC/MIS, type: MKT/LMT/SL, quantity, price, trigger_price, status, timestamps).
   - `trades` / `executions`: Executed fill records, execution price, simulated taxes and brokerage fees.
   - `positions`: Active intraday and overnight positions with average cost and realized P&L.
   - `holdings`: Demat-style long-term paper delivery holdings.
3. **Market Data & Watchlists**:
   - `instruments`: Master list of tradable equities (NSE/BSE symbols, tick size, lot size, circuit limits).
   - `watchlists`: User-customized stock watchlists.
   - `market_candles`: Historical OHLCV candle records across multiple intervals (1m, 5m, 1h, 1D).
4. **AI & Analytics**:
   - `stock_insights`: Precomputed technical scores, sentiment indexes, and AI prediction logs.

## Status
- Initial folder structure established. Feature implementation pending.
