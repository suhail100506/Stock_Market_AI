"""
StockSense-AI: High Performance Market Data Cache
"""
import time
import threading
from typing import Dict, Any, Optional, List


class MarketDataCache:
    """
    Thread-safe in-memory cache with TTL support for market quotes, candles, and instruments.
    """

    def __init__(self, default_ttl: int = 15):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            if time.time() > entry["expires_at"]:
                del self._cache[key]
                return None
            return entry["data"]

    def set(self, key: str, data: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        with self._lock:
            self._cache[key] = {
                "data": data,
                "expires_at": time.time() + duration,
                "cached_at": time.time(),
            }

    def get_many(self, keys: List[str]) -> Dict[str, Any]:
        results = {}
        now = time.time()
        with self._lock:
            for k in keys:
                entry = self._cache.get(k)
                if entry and entry["expires_at"] > now:
                    results[k] = entry["data"]
        return results

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


# Global cache instance
market_cache = MarketDataCache(default_ttl=15)
