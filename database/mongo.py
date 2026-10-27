"""
StockSense-AI: MongoDB Integration Layer
========================================

STEP 15: Watchlist Storage in MongoDB
-------------------------------------
Stores user watchlists in MongoDB collection 'watchlists':
- Database: stocksense
- Collection: watchlists
- Document Structure:
  {
    "_id": "user_default",
    "userId": "user_default",
    "name": "My Watchlist",
    "symbols": ["TCS", "INFY", "RELIANCE", "HDFC"],
    "updatedAt": "2026-10-06T12:00:00Z"
  }
Includes seamless resilient fallback to local JSON mirror if MongoDB service is offline.
"""

import os
import json
import secrets
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "stocksense")
WATCHLIST_COLLECTION = "watchlists"
USERS_COLLECTION = "users"
ORDERS_COLLECTION = "orders"
PORTFOLIO_COLLECTION = "portfolio"

DB_DIR = os.path.dirname(os.path.abspath(__file__))
WATCHLIST_FILE = os.path.join(DB_DIR, "watchlists.json")
USERS_FILE = os.path.join(DB_DIR, "users.json")
ORDERS_FILE = os.path.join(DB_DIR, "orders.json")
HOLDINGS_FILE = os.path.join(DB_DIR, "holdings.json")

# Step 15 Benchmark Watchlist
DEFAULT_WATCHLIST: List[str] = ["TCS", "INFY", "RELIANCE", "HDFC"]

class MongoWatchlistManager:
    """
    Manages user watchlists in MongoDB with automatic local mirror caching.
    """
    def __init__(self):
        self.client: Optional[Any] = None
        self.db: Optional[Any] = None
        self.collection: Optional[Any] = None
        self.is_connected = False
        self._init_connection()

    def _init_connection(self):
        if not PYMONGO_AVAILABLE:
            return
        try:
            # Low timeout for non-blocking local evaluation
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.collection = self.db[WATCHLIST_COLLECTION]
            self.is_connected = True
        except Exception:
            self.is_connected = False

    def _load_local_cache(self) -> Dict[str, List[str]]:
        if os.path.exists(WATCHLIST_FILE):
            try:
                with open(WATCHLIST_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_local_cache(self, user_id: str, symbols: List[str]):
        data = self._load_local_cache()
        data[user_id] = {
            "userId": user_id,
            "name": "My Watchlist",
            "symbols": symbols,
            "updatedAt": datetime.now().isoformat(),
        }
        try:
            with open(WATCHLIST_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def get_watchlist(self, user_id: str = "user_default") -> List[str]:
        """
        Retrieves user's watchlist from MongoDB, falling back to local storage or defaults.
        """
        if self.is_connected and self.collection is not None:
            try:
                doc = self.collection.find_one({"userId": user_id})
                if doc and "symbols" in doc:
                    return doc["symbols"]
            except Exception:
                pass

        # Local cache fallback
        cache = self._load_local_cache()
        if user_id in cache:
            return cache[user_id].get("symbols", DEFAULT_WATCHLIST)

        # Seed with initial Step 15 list
        self.save_watchlist(user_id, DEFAULT_WATCHLIST)
        return list(DEFAULT_WATCHLIST)

    def save_watchlist(self, user_id: str, symbols: List[str]) -> Dict[str, Any]:
        """
        Saves user's watchlist into MongoDB collection 'watchlists'.
        """
        doc = {
            "_id": user_id,
            "userId": user_id,
            "name": "My Watchlist",
            "symbols": symbols,
            "updatedAt": datetime.now().isoformat(),
        }

        mongo_saved = False
        if self.is_connected and self.collection is not None:
            try:
                self.collection.replace_one({"userId": user_id}, doc, upsert=True)
                mongo_saved = True
            except Exception:
                mongo_saved = False

        # Always save local mirror cache
        self._save_local_cache(user_id, symbols)

        return {
            "success": True,
            "userId": user_id,
            "symbols": symbols,
            "mongo_saved": mongo_saved,
            "storage": "MongoDB (watchlists collection)" if mongo_saved else "MongoDB Cache Mirror",
            "updatedAt": doc["updatedAt"]
        }

    def toggle_symbol(self, user_id: str, symbol: str) -> Dict[str, Any]:
        """
        Toggles stock symbol in user's watchlist and persists to MongoDB.
        """
        sym = symbol.upper().strip()
        current = self.get_watchlist(user_id)

        if sym in current:
            current.remove(sym)
            action = "removed from"
        else:
            current.append(sym)
            action = "added to"

        res = self.save_watchlist(user_id, current)
        res["action"] = action
        res["message"] = f"{sym} {action} My Watchlist in MongoDB"
        return res

# Global singleton manager for watchlists
mongo_watchlist = MongoWatchlistManager()


class MongoUserManager:
    """
    STEP 16: Authentication User Collection in MongoDB
    ---------------------------------------------------
    Database: stocksense
    Collection: users
    Schema:
      _id: Unique string user identifier (e.g. 'usr_12345')
      name: Full user display name
      email: User email address (unique, normalized lowercase)
      password_hash: Salted hash (PBKDF2-HMAC-SHA256). Never plain-text!
      balance: Paper trading virtual cash (defaults to ₹10,00,000 INR)
      created_at: ISO 8601 creation timestamp
    """
    def __init__(self):
        self.client: Optional[Any] = None
        self.db: Optional[Any] = None
        self.collection: Optional[Any] = None
        self.is_connected = False
        self._init_connection()
        self._seed_default_user()

    def _init_connection(self):
        if not PYMONGO_AVAILABLE:
            return
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.collection = self.db[USERS_COLLECTION]
            self.is_connected = True
        except Exception:
            self.is_connected = False

    def _load_local_cache(self) -> Dict[str, Dict[str, Any]]:
        if os.path.exists(USERS_FILE):
            try:
                with open(USERS_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_local_cache(self, users: Dict[str, Dict[str, Any]]):
        try:
            with open(USERS_FILE, "w") as f:
                json.dump(users, f, indent=2)
        except Exception:
            pass

    def _seed_default_user(self):
        """Seeds default user if no users exist in database."""
        try:
            from backend.utils.auth import hash_password
            default_email = "arjun.mehta@stocksense.ai"
            if not self.get_user_by_email(default_email):
                self.create_user(
                    name="Arjun Mehta",
                    email=default_email,
                    password_hash=hash_password("Password123!"),
                    balance=1000000.00,
                    user_id="usr_78912"
                )
        except Exception:
            pass

    def create_user(
        self,
        name: str,
        email: str,
        password_hash: str,
        balance: float = 1000000.00,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new user record in MongoDB 'users' collection.
        Enforces:
        - _id
        - name
        - email (lowercase)
        - password_hash (never plain text)
        - balance (₹10,00,000)
        - created_at
        """
        uid = user_id or f"usr_{secrets.token_hex(5)}"
        doc = {
            "_id": uid,
            "name": name.strip(),
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "balance": round(float(balance), 2),
            "created_at": datetime.now().isoformat(),
        }

        mongo_saved = False
        if self.is_connected and self.collection is not None:
            try:
                self.collection.replace_one({"_id": uid}, doc, upsert=True)
                mongo_saved = True
            except Exception:
                mongo_saved = False

        # Always save local mirror cache
        users = self._load_local_cache()
        users[uid] = doc
        self._save_local_cache(users)

        return doc

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Finds user by lowercase email from MongoDB or local mirror."""
        target_email = email.strip().lower()
        if self.is_connected and self.collection is not None:
            try:
                doc = self.collection.find_one({"email": target_email})
                if doc:
                    return doc
            except Exception:
                pass

        users = self._load_local_cache()
        for doc in users.values():
            if doc.get("email", "").lower() == target_email:
                return doc
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Finds user by _id from MongoDB or local mirror."""
        if self.is_connected and self.collection is not None:
            try:
                doc = self.collection.find_one({"_id": user_id})
                if doc:
                    return doc
            except Exception:
                pass

        users = self._load_local_cache()
        return users.get(user_id)

    def update_balance(self, user_id: str, new_balance: float) -> bool:
        """Updates virtual paper balance in MongoDB users document."""
        rounded = round(float(new_balance), 2)
        if self.is_connected and self.collection is not None:
            try:
                self.collection.update_one({"_id": user_id}, {"$set": {"balance": rounded}})
            except Exception:
                pass

        users = self._load_local_cache()
        if user_id in users:
            users[user_id]["balance"] = rounded
            self._save_local_cache(users)
            return True
        return False

    def update_profile(self, user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates user profile attributes in MongoDB."""
        allowed = ["name", "phone"]
        update_fields = {k: v for k, v in data.items() if k in allowed}
        if not update_fields:
            return self.get_user_by_id(user_id)

        if self.is_connected and self.collection is not None:
            try:
                self.collection.update_one({"_id": user_id}, {"$set": update_fields})
            except Exception:
                pass

        users = self._load_local_cache()
        if user_id in users:
            users[user_id].update(update_fields)
            self._save_local_cache(users)
            return users[user_id]
        return None


# Global singleton manager for users
mongo_users = MongoUserManager()


class MongoOrdersManager:
    """
    STEP 17: Orders Collection in MongoDB
    --------------------------------------
    Database: stocksense
    Collection: orders
    Document Schema:
      _id: Order ID (e.g. 'ORD-00001')
      userId: User ID
      symbol: Stock symbol (e.g. 'TCS')
      type: Order side ('BUY' or 'SELL')
      quantity: Number of shares
      price: Execution price
      total: Total traded amount
      status: 'COMPLETED' or 'CANCELLED'
      timestamp: ISO datetime
    """
    def __init__(self):
        self.client: Optional[Any] = None
        self.db: Optional[Any] = None
        self.collection: Optional[Any] = None
        self.is_connected = False
        self._init_connection()

    def _init_connection(self):
        if not PYMONGO_AVAILABLE:
            return
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.collection = self.db[ORDERS_COLLECTION]
            self.is_connected = True
        except Exception:
            self.is_connected = False

    def _load_local_cache(self) -> List[Dict[str, Any]]:
        if os.path.exists(ORDERS_FILE):
            try:
                with open(ORDERS_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_local_cache(self, orders: List[Dict[str, Any]]):
        try:
            with open(ORDERS_FILE, "w") as f:
                json.dump(orders, f, indent=2)
        except Exception:
            pass

    def save_order(self, order_doc: Dict[str, Any]) -> Dict[str, Any]:
        """Saves paper trading order to MongoDB collection 'orders'."""
        doc = dict(order_doc)
        if "_id" not in doc:
            doc["_id"] = doc.get("id", f"ORD_{secrets.token_hex(4)}")

        mongo_saved = False
        if self.is_connected and self.collection is not None:
            try:
                self.collection.replace_one({"_id": doc["_id"]}, doc, upsert=True)
                mongo_saved = True
            except Exception:
                mongo_saved = False

        # Save local mirror
        orders = self._load_local_cache()
        # Prepend to maintain reverse chronological order
        orders = [o for o in orders if o.get("id") != doc.get("id")]
        orders.insert(0, doc)
        self._save_local_cache(orders)
        doc["mongo_saved"] = mongo_saved
        return doc

    def get_orders(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves orders from MongoDB or local mirror."""
        if self.is_connected and self.collection is not None:
            try:
                query = {"userId": user_id} if user_id else {}
                cursor = self.collection.find(query).sort("timestamp", -1)
                orders = list(cursor)
                if orders:
                    return orders
            except Exception:
                pass

        orders = self._load_local_cache()
        if user_id:
            orders = [o for o in orders if o.get("userId") == user_id or o.get("user_id") == user_id]
        return orders


class MongoPortfolioManager:
    """
    STEP 17: Portfolio Collection in MongoDB
    -----------------------------------------
    Database: stocksense
    Collection: portfolio
    Document Schema:
      _id: User ID (e.g. 'usr_default')
      userId: User ID
      virtualCash: Free paper cash
      holdings: List of stock holdings
      updatedAt: ISO datetime
    """
    def __init__(self):
        self.client: Optional[Any] = None
        self.db: Optional[Any] = None
        self.collection: Optional[Any] = None
        self.is_connected = False
        self._init_connection()

    def _init_connection(self):
        if not PYMONGO_AVAILABLE:
            return
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.collection = self.db[PORTFOLIO_COLLECTION]
            self.is_connected = True
        except Exception:
            self.is_connected = False

    def save_portfolio(self, user_id: str, virtual_cash: float, holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Saves user's portfolio state into MongoDB collection 'portfolio'."""
        doc = {
            "_id": user_id,
            "userId": user_id,
            "virtualCash": round(float(virtual_cash), 2),
            "holdings": holdings,
            "updatedAt": datetime.now().isoformat(),
        }

        mongo_saved = False
        if self.is_connected and self.collection is not None:
            try:
                self.collection.replace_one({"_id": user_id}, doc, upsert=True)
                mongo_saved = True
            except Exception:
                mongo_saved = False

        return doc

    def get_portfolio(self, user_id: str = "user_default") -> Optional[Dict[str, Any]]:
        """Retrieves user's portfolio document from MongoDB."""
        if self.is_connected and self.collection is not None:
            try:
                doc = self.collection.find_one({"_id": user_id})
                if doc:
                    return doc
            except Exception:
                pass
        return None


# Global singletons for orders & portfolio
mongo_orders = MongoOrdersManager()
mongo_portfolio = MongoPortfolioManager()
