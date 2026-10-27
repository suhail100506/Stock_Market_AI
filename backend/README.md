# Backend Module - StockSense-AI

## Overview
The `backend/` directory houses the core server application, API endpoints, paper trading execution engine, and simulated market data services for StockSense-AI.

## Planned Architecture & Services
1. **Paper Trading Matching Engine**:
   - Order validation against virtual account balance and margin requirements.
   - Realistic order execution modeling (market orders, limit order triggers, slippage estimation).
   - Order lifecycle management: `OPEN`, `EXECUTED`, `CANCELLED`, `REJECTED`.
2. **Virtual Ledger & Portfolio Engine**:
   - Double-entry paper money ledger.
   - Real-time mark-to-market (MTM) calculation for open intraday and delivery positions.
   - Overnight position roll-over and settlement simulation.
3. **Market Session & Time Manager**:
   - Simulates Indian standard market sessions:
     - 09:00 - 09:08 AM IST: Pre-market order collection
     - 09:08 - 09:15 AM IST: Pre-market order matching
     - 09:15 - 03:30 PM IST: Normal trading session
     - 03:30 - 04:00 PM IST: Post-market session
4. **Market Data Feed Simulator**:
   - Realistic tick generation based on historical Indian equity candles (NSE/BSE).
   - WebSocket broadcaster for low-latency client updates.
5. **AI/ML Integration Layer**:
   - Service bridge connecting incoming market ticks to the ML analytics engine.
   - REST endpoints exposing AI scores, sentiment analysis, and technical insights.

## Status
- Initial folder structure established. Feature implementation pending.
