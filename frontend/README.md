# Frontend Module - StockSense-AI

## Overview
The `frontend/` directory contains the client-side user interface for StockSense-AI. It is envisioned as a high-performance, responsive fintech web application inspired by contemporary Indian brokerage trading terminals, featuring an original aesthetic and branding.

## Design Philosophy & Identity
- **Original Fintech Interface**: Distinct visual identity, custom color palette, sleek typography, and intuitive UX tailored for Indian stock market enthusiasts.
- **No Clone Branding**: Strictly original assets, design tokens, and layout paradigms (independent of Angel One, Zerodha, or any proprietary brokerage designs).
- **Theme Support**: Seamless dark and light modes optimized for high-density financial data visualization.
- **Responsive Layout**: Fluid experience across desktop trading terminals, tablets, and mobile devices.

## Planned Key Components & Views
1. **Market Header & Tickers**:
   - Live indices bar (NIFTY 50, SENSEX, BANKNIFTY simulation).
   - Market status indicator (Market Open / Closed / Pre-Market, IST countdown).
2. **Watchlist & Stock Scanner**:
   - Multi-tab watchlists with price, % change, and sparkline mini-charts.
   - Filterable by sector (IT, Banking, Auto, Energy, FMCG).
3. **Interactive Charting Studio**:
   - Candlestick and line charts with multi-timeframe resolution (1m, 5m, 15m, 1D).
   - Overlay technical indicators (EMA, RSI, MACD, Volume Profile).
4. **Simulated Order Placement Pad**:
   - Order types: Market, Limit, Stop-Loss (SL), Stop-Loss Market (SL-M).
   - Product types: Delivery (CNC) vs. Intraday (MIS) paper trading.
   - Margin & simulated brokerage calculator (estimated STT, stamp duty, exchange fees).
5. **Portfolio & Positions Manager**:
   - Real-time P&L (unrealized and realized).
   - Holdings table with average buy price, current value, and returns.
   - Virtual cash balance and margin utilization meters.
6. **AI Insights & Sentiment Deck**:
   - AI trend score and buy/neutral/sell signals.
   - Market news sentiment thermometer.

## Status
- Initial folder structure established. Feature implementation pending.
