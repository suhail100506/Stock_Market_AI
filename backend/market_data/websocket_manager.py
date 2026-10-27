"""
StockSense-AI: WebSocket Market Data Streaming Manager
Streams real-time ticks, index movements, and subscription updates from FastAPI to React clients.
"""
import asyncio
import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone, timedelta

from .instrument_master import instrument_master
from .provider_adapter import market_provider

logger = logging.getLogger("stocksense.websocket")
IST = timezone(timedelta(hours=5, minutes=30))


class MarketDataWebSocketManager:
    """
    Manages active WebSocket connections and broadcasts batched price ticks.
    """

    def __init__(self):
        # Maps active WebSocket connection to set of subscribed symbol strings
        self.active_connections: Dict[WebSocket, Set[str]] = {}
        # Global benchmark symbols streamed by default to all clients
        self.default_symbols: Set[str] = {
            "NIFTY 50",
            "SENSEX",
            "BANK NIFTY",
            "FIN NIFTY",
            "INDIA VIX",
            "RELIANCE",
            "TCS",
            "HDFCBANK",
            "INFY",
        }
        self.broadcast_task: Optional[asyncio.Task] = None
        self._is_running = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = set(self.default_symbols)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

        # Send initial connection handshake with market status
        status = market_provider.get_market_status()
        await websocket.send_json({
            "type": "HANDSHAKE",
            "status": "CONNECTED",
            "market_status": status,
            "timestamp": datetime.now(IST).isoformat(),
            "subscribed": list(self.active_connections[websocket]),
            "message": "Connected to StockSense-AI Real-Time Market Data Stream",
        })

        # Ensure background broadcast loop is running
        if not self._is_running or not self.broadcast_task or self.broadcast_task.done():
            self._is_running = True
            self.broadcast_task = asyncio.create_task(self._broadcast_loop())

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]
            logger.info(f"WebSocket client disconnected. Remaining clients: {len(self.active_connections)}")
        if len(self.active_connections) == 0:
            self._is_running = False

    def subscribe(self, websocket: WebSocket, symbols: list):
        if websocket in self.active_connections:
            for s in symbols:
                clean = str(s).upper().strip()
                if clean:
                    self.active_connections[websocket].add(clean)

    def unsubscribe(self, websocket: WebSocket, symbols: list):
        if websocket in self.active_connections:
            for s in symbols:
                clean = str(s).upper().strip()
                if clean in self.active_connections[websocket] and clean not in self.default_symbols:
                    self.active_connections[websocket].remove(clean)

    async def _broadcast_loop(self):
        """
        Background periodic tick generator and broadcaster.
        """
        logger.info("Market data WebSocket broadcast loop started.")
        while self._is_running and len(self.active_connections) > 0:
            try:
                await asyncio.sleep(2.0)  # 2 second tick broadcast

                # Aggregate all uniquely subscribed symbols across all clients
                all_needed_symbols: Set[str] = set()
                for client_subs in self.active_connections.values():
                    all_needed_symbols.update(client_subs)

                if not all_needed_symbols:
                    continue

                # Batch fetch current quotes
                ticks_payload = []
                for sym in all_needed_symbols:
                    inst = instrument_master.get_by_symbol(sym)
                    if inst:
                        q = market_provider.get_quote(inst.instrument_id)
                        if q:
                            ticks_payload.append({
                                "symbol": q.symbol,
                                "instrument_id": q.instrument_id,
                                "ltp": q.ltp,
                                "change": q.change,
                                "change_percent": q.change_percent,
                                "open": q.open,
                                "high": q.high,
                                "low": q.low,
                                "volume": q.volume,
                                "volume_str": q.volume_str,
                                "data_freshness": q.data_freshness,
                                "market_status": q.market_status,
                                "timestamp": q.timestamp,
                            })

                if not ticks_payload:
                    continue

                tick_message = {
                    "type": "MARKET_TICK",
                    "timestamp": datetime.now(IST).isoformat(),
                    "market_status": market_provider.get_market_status(),
                    "ticks": ticks_payload,
                }

                # Broadcast to connected clients
                disconnected_clients = []
                for client in list(self.active_connections.keys()):
                    try:
                        await client.send_json(tick_message)
                    except Exception:
                        disconnected_clients.append(client)

                for dc in disconnected_clients:
                    self.disconnect(dc)

            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error(f"Error in broadcast loop: {exc}")
                await asyncio.sleep(2.0)

        self._is_running = False
        logger.info("Market data WebSocket broadcast loop stopped.")


# Global WebSocket manager instance
ws_manager = MarketDataWebSocketManager()
