import pytest
from starlette.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print("[PASS] /api/health: OK")

    print("Testing GET /api/stocks...")
    res = client.get("/api/stocks")
    assert res.status_code == 200
    stocks = res.json()
    assert len(stocks) > 0
    print(f"[PASS] /api/stocks: OK ({len(stocks)} stocks)")

    print("Testing GET /api/stocks/RELIANCE...")
    res = client.get("/api/stocks/RELIANCE")
    assert res.status_code == 200
    assert res.json()["symbol"] == "RELIANCE"
    print("[PASS] /api/stocks/RELIANCE: OK")

    print("Testing GET /api/stocks/RELIANCE/history...")
    res = client.get("/api/stocks/RELIANCE/history?timeframe=1M")
    assert res.status_code == 200
    assert len(res.json()) > 0
    print("[PASS] /api/stocks/RELIANCE/history: OK")

    print("Testing GET /api/watchlist...")
    res = client.get("/api/watchlist")
    assert res.status_code == 200
    print("[PASS] /api/watchlist: OK")

    print("Testing POST /api/watchlist...")
    res = client.post("/api/watchlist", json={"symbol": "BAJFINANCE"})
    assert res.status_code == 200
    print("[PASS] POST /api/watchlist: OK")

    print("Testing GET /api/portfolio...")
    res = client.get("/api/portfolio")
    assert res.status_code == 200
    assert "virtual_cash" in res.json()
    print("[PASS] /api/portfolio: OK")

    print("Testing GET /api/orders...")
    res = client.get("/api/orders")
    assert res.status_code == 200
    print("[PASS] /api/orders: OK")

    print("Testing POST /api/orders/buy...")
    res = client.post("/api/orders/buy", json={
        "symbol": "TCS",
        "side": "BUY",
        "product": "CNC",
        "type": "MARKET",
        "quantity": 5
    })
    assert res.status_code == 201
    assert res.json()["status"] in ("EXECUTED", "COMPLETED")
    print("[PASS] POST /api/orders/buy: OK")

    print("Testing POST /api/orders/sell...")
    res = client.post("/api/orders/sell", json={
        "symbol": "TCS",
        "side": "SELL",
        "product": "CNC",
        "type": "MARKET",
        "quantity": 5
    })
    assert res.status_code == 201
    assert res.json()["status"] in ("EXECUTED", "COMPLETED")
    print("[PASS] POST /api/orders/sell: OK")

    print("Testing GET /api/prediction/RELIANCE...")
    res = client.get("/api/prediction/RELIANCE")
    assert res.status_code == 200
    assert "signal" in res.json()
    assert "confidence" in res.json()
    print("[PASS] /api/prediction/RELIANCE: OK")

    print("Testing GET /api/instruments/search...")
    res = client.get("/api/instruments/search?q=tata")
    assert res.status_code == 200
    assert res.json()["total"] > 0
    assert len(res.json()["instruments"]) > 0
    print(f"[PASS] /api/instruments/search: OK ({res.json()['total']} matches)")

    print("Testing GET /api/market/indices/all...")
    res = client.get("/api/market/indices/all")
    assert res.status_code == 200
    assert len(res.json()["indian_indices"]) >= 8
    assert len(res.json()["global_indices"]) >= 10
    print("[PASS] /api/market/indices/all: OK")

    print("Testing GET /api/market/fno/index...")
    res = client.get("/api/market/fno/index")
    assert res.status_code == 200
    assert "options_chain" in res.json()
    assert "oi_analysis" in res.json()
    assert "fii_dii_history" in res.json()
    print("[PASS] /api/market/fno/index: OK")

    print("Testing GET /api/market/fno/stocks...")
    res = client.get("/api/market/fno/stocks")
    assert res.status_code == 200
    assert len(res.json()["sectors"]) == 14
    assert len(res.json()["selected_sector_scripts"]) >= 5
    print("[PASS] /api/market/fno/stocks: OK")

    print("Testing GET /api/market/commodities...")
    res = client.get("/api/market/commodities")
    assert res.status_code == 200
    assert len(res.json()["top_commodities"]) >= 4
    assert "options_chain" in res.json()
    print("[PASS] /api/market/commodities: OK")

    print("Testing GET /api/market/etfs...")
    res = client.get("/api/market/etfs")
    assert res.status_code == 200
    assert len(res.json()["categories"]) >= 6
    assert len(res.json()["popular_etfs"]) >= 4
    print("[PASS] /api/market/etfs: OK")

    print("\nALL 17 BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()

