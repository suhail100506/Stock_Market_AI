"""
StockSense-AI: Database Persistence Layer
========================================

STEP 13: Paper Trading Ledger & Database
----------------------------------------
Manages:
1. Virtual Wallets: Every new user starts with ₹10,00,000 INR
2. Orders Collection:
   - userId
   - symbol
   - type (BUY / SELL)
   - quantity
   - price
   - total
   - timestamp
   - status (EXECUTED / COMPLETED)
3. Holdings & Positions Ledger
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_DIR = os.path.dirname(os.path.abspath(__file__))
ORDERS_FILE = os.path.join(DB_DIR, "orders.json")
WALLETS_FILE = os.path.join(DB_DIR, "wallets.json")
HOLDINGS_FILE = os.path.join(DB_DIR, "holdings.json")

try:
    from .mongo import mongo_orders, mongo_portfolio
    MONGO_SYNC_AVAILABLE = True
except Exception:
    MONGO_SYNC_AVAILABLE = False

DEFAULT_VIRTUAL_BALANCE = 1000000.00  # ₹10,00,000 INR

class PaperTradingDatabase:
    """
    Thread-safe persistent JSON & in-memory store for paper trading.
    """
    def __init__(self):
        self._load_data()

    def _load_data(self):
        # 1. Orders
        if os.path.exists(ORDERS_FILE):
            try:
                with open(ORDERS_FILE, "r") as f:
                    self.orders: List[Dict[str, Any]] = json.load(f)
            except Exception:
                self.orders = []
        else:
            self.orders = []

        # 2. Wallets (userId -> { userId, virtual_balance, invested_value })
        if os.path.exists(WALLETS_FILE):
            try:
                with open(WALLETS_FILE, "r") as f:
                    self.wallets: Dict[str, Dict[str, Any]] = json.load(f)
            except Exception:
                self.wallets = {}
        else:
            self.wallets = {}

        # 3. Holdings (userId -> { symbol -> { symbol, quantity, avg_price } })
        if os.path.exists(HOLDINGS_FILE):
            try:
                with open(HOLDINGS_FILE, "r") as f:
                    self.holdings: Dict[str, Dict[str, Any]] = json.load(f)
            except Exception:
                self.holdings = {}
        else:
            self.holdings = {}

    def _save_orders(self):
        try:
            with open(ORDERS_FILE, "w") as f:
                json.dump(self.orders, f, indent=2)
        except Exception:
            pass

    def _save_wallets(self):
        try:
            with open(WALLETS_FILE, "w") as f:
                json.dump(self.wallets, f, indent=2)
        except Exception:
            pass

    def _save_holdings(self):
        try:
            with open(HOLDINGS_FILE, "w") as f:
                json.dump(self.holdings, f, indent=2)
        except Exception:
            pass

    def get_wallet(self, user_id: str = "user_default") -> Dict[str, Any]:
        """
        Retrieves wallet for user. Every new user gets ₹10,00,000 virtual balance.
        """
        if user_id not in self.wallets:
            self.wallets[user_id] = {
                "userId": user_id,
                "virtual_balance": DEFAULT_VIRTUAL_BALANCE,
                "starting_balance": DEFAULT_VIRTUAL_BALANCE,
                "currency": "INR (₹)",
                "created_at": datetime.now().isoformat(),
            }
            self._save_wallets()
        return self.wallets[user_id]

    def update_balance(self, user_id: str, delta: float) -> float:
        """
        Updates virtual balance. Delta is negative for BUY, positive for SELL.
        """
        wallet = self.get_wallet(user_id)
        wallet["virtual_balance"] = round(wallet["virtual_balance"] + delta, 2)
        self._save_wallets()
        return wallet["virtual_balance"]

    def save_order(
        self,
        user_id: str,
        symbol: str,
        order_type: str,
        quantity: int,
        price: float,
        status: str = "COMPLETED",
        order_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Saves an executed paper order into the orders database.
        Database schema:
        - userId
        - symbol
        - type (BUY / SELL)
        - quantity
        - price
        - total
        - timestamp
        - status
        """
        total = round(float(quantity) * float(price), 2)
        now_ts = datetime.now().isoformat()
        oid = order_id or f"ORD-{len(self.orders) + 1:05d}"

        order_record = {
            "id": oid,
            "userId": user_id,
            "user_id": user_id,
            "symbol": symbol.upper().strip(),
            "type": order_type.upper().strip(),
            "side": order_type.upper().strip(),
            "quantity": int(quantity),
            "price": round(float(price), 2),
            "total": total,
            "total_value": total,
            "timestamp": now_ts,
            "time": datetime.now().strftime("%I:%M:%S %p"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "status": status,
        }

        self.orders.insert(0, order_record)
        self._save_orders()

        if MONGO_SYNC_AVAILABLE:
            try:
                mongo_orders.save_order(order_record)
            except Exception:
                pass

        return order_record

    def get_orders(self, user_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        orders = self.orders
        if user_id:
            orders = [o for o in orders if o.get("userId") == user_id or o.get("user_id") == user_id]
        if status and status.upper() != "ALL":
            orders = [o for o in orders if o.get("status", "").upper() == status.upper()]
        return orders

    def update_holding(self, user_id: str, symbol: str, quantity: int, price: float, side: str = "BUY"):
        sym = symbol.upper().strip()
        if user_id not in self.holdings:
            self.holdings[user_id] = {}

        user_h = self.holdings[user_id]
        if side.upper() == "BUY":
            if sym in user_h:
                old_qty = user_h[sym]["quantity"]
                old_avg = user_h[sym]["avg_price"]
                new_qty = old_qty + quantity
                new_avg = round(((old_qty * old_avg) + (quantity * price)) / new_qty, 2)
                user_h[sym]["quantity"] = new_qty
                user_h[sym]["avg_price"] = new_avg
            else:
                user_h[sym] = {
                    "symbol": sym,
                    "quantity": quantity,
                    "avg_price": round(float(price), 2),
                }
        elif side.upper() == "SELL":
            if sym in user_h:
                user_h[sym]["quantity"] -= quantity
                if user_h[sym]["quantity"] <= 0:
                    del user_h[sym]
        self._save_holdings()

        if MONGO_SYNC_AVAILABLE:
            try:
                cash = self.get_wallet(user_id).get("virtual_balance", DEFAULT_VIRTUAL_BALANCE)
                mongo_portfolio.save_portfolio(user_id, cash, list(self.holdings.get(user_id, {}).values()))
            except Exception:
                pass

    def get_holdings(self, user_id: str = "user_default") -> List[Dict[str, Any]]:
        if user_id not in self.holdings:
            return []
        return list(self.holdings[user_id].values())

    def reset(self, user_id: str = "user_default"):
        """Resets virtual balance to initial ₹10,00,000 and clears user holdings."""
        if user_id in self.wallets:
            self.wallets[user_id]["virtual_balance"] = DEFAULT_VIRTUAL_BALANCE
            self._save_wallets()
        if user_id in self.holdings:
            self.holdings[user_id] = {}
            self._save_holdings()

# Global singleton
db = PaperTradingDatabase()
