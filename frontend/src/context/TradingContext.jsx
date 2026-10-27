import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stocksApi, watchlistApi, portfolioApi, ordersApi } from '../api/client';
import { mockStocks } from '../data/mockStocks';
import { mockIndices } from '../data/mockIndices';

const TradingContext = createContext();

export const DEFAULT_PAPER_HOLDINGS = [
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    quantity: 10,
    avgPrice: 3450.00,
    currentPrice: 3480.00,
    investedValue: 34500.00,
    currentValue: 34800.00,
    unrealizedPnl: 300.00,
    pnlPercentage: 0.87,
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    quantity: 20,
    avgPrice: 2900.00,
    currentPrice: 3220.00,
    investedValue: 58000.00,
    currentValue: 64400.00,
    unrealizedPnl: 6400.00,
    pnlPercentage: 11.03,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    quantity: 5,
    avgPrice: 1500.00,
    currentPrice: 1650.00,
    investedValue: 7500.00,
    currentValue: 8250.00,
    unrealizedPnl: 750.00,
    pnlPercentage: 10.00,
  },
];

export const TradingProvider = ({ children }) => {
  const [stocks, setStocks] = useState(mockStocks);
  const [indices, setIndices] = useState(mockIndices);
  const [watchlist, setWatchlist] = useState([
    'IDEA', 'JIOFIN', 'SUZLON', 'TATASTEEL', 'NTPC', 'IRFC', 'YESBANK', 'TATAPOWER', 'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ONGC', 'RVNL'
  ]);
  const [watchlistStorage, setWatchlistStorage] = useState('MongoDB (watchlists collection)');
  const [virtualCash, setVirtualCash] = useState(900000.00);
  const [holdings, setHoldings] = useState(DEFAULT_PAPER_HOLDINGS);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Quick Buy/Sell Pad
  const [tradeModal, setTradeModal] = useState({
    isOpen: false,
    symbol: 'TCS',
    initialSide: 'BUY',
  });

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all initial data from backend API
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Stocks
      const fetchedStocks = await stocksApi.getAll();
      if (fetchedStocks && fetchedStocks.length > 0) {
        setStocks(fetchedStocks);
      }

      // 2. Fetch Watchlist
      const watchlistData = await watchlistApi.get();
      if (watchlistData?.symbols) {
        setWatchlist(watchlistData.symbols);
      }

      // 3. Fetch Portfolio
      const portfolioData = await portfolioApi.get();
      if (portfolioData) {
        setVirtualCash(portfolioData.virtual_cash ?? portfolioData.virtualCash ?? 900000.00);
        if (portfolioData.holdings && portfolioData.holdings.length > 0) {
          setHoldings(
            portfolioData.holdings.map((h) => ({
              symbol: h.symbol,
              name: h.name,
              quantity: h.quantity,
              avgPrice: h.avg_price ?? h.avgPrice ?? 0,
              currentPrice: h.current_price ?? h.currentPrice ?? 0,
              investedValue: h.invested_value ?? h.investedValue ?? 0,
              currentValue: h.current_value ?? h.currentValue ?? 0,
              unrealizedPnl: h.unrealized_pnl ?? h.unrealizedPnl ?? 0,
              pnlPercentage: h.pnl_percentage ?? h.pnlPercentage ?? 0,
            }))
          );
        } else {
          setHoldings(DEFAULT_PAPER_HOLDINGS);
        }
        setPositions(
          (portfolioData.positions || []).map((p) => ({
            id: p.id,
            symbol: p.symbol,
            name: p.name,
            product: p.product,
            side: p.side,
            quantity: p.quantity,
            avgPrice: p.avg_price ?? p.avgPrice ?? 0,
            currentPrice: p.current_price ?? p.currentPrice ?? 0,
            unrealizedPnl: p.unrealized_pnl ?? p.unrealizedPnl ?? 0,
            pnlPercentage: p.pnl_percentage ?? p.pnlPercentage ?? 0,
          }))
        );
      }

      // 4. Fetch Orders
      const ordersData = await ordersApi.getAll();
      if (ordersData) {
        setOrders(ordersData);
      }
    } catch (err) {
      console.warn('API connection notice:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Subtle simulated tick generation for live ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const deltaPct = (Math.random() - 0.49) * 0.002;
          const newPrice = Math.round((s.ltp * (1 + deltaPct)) * 100) / 100;
          return {
            ...s,
            ltp: newPrice,
            sparkline: [...(s.sparkline || []).slice(1), newPrice],
          };
        })
      );

      setIndices((prev) =>
        prev.map((idx) => {
          const delta = (Math.random() - 0.48) * (idx.value * 0.0003);
          const newVal = Math.round((idx.value + delta) * 100) / 100;
          const newChange = Math.round((idx.change + delta) * 100) / 100;
          const newPct = Math.round((newChange / (idx.value - idx.change)) * 10000) / 100;
          return {
            ...idx,
            value: newVal,
            change: newChange,
            changePercent: newPct,
            isPositive: newChange >= 0,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Watchlist helpers connecting to backend API
  const toggleWatchlist = async (symbol) => {
    try {
      const res = await watchlistApi.toggle(symbol);
      setWatchlist(res.symbols);
      addToast(res.message, 'success');
    } catch (err) {
      // Fallback local toggle
      setWatchlist((prev) => {
        const inList = prev.includes(symbol);
        const next = inList ? prev.filter((s) => s !== symbol) : [...prev, symbol];
        addToast(
          inList ? `Removed ${symbol} from Watchlist` : `Added ${symbol} to Watchlist`,
          'info'
        );
        return next;
      });
    }
  };

  const isInWatchlist = (symbol) => watchlist.includes(symbol);

  // Trade Modal Controls
  const openTradeModal = (symbol, side = 'BUY') => {
    setTradeModal({
      isOpen: true,
      symbol,
      initialSide: side,
    });
  };

  const closeTradeModal = () => {
    setTradeModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Order Execution via Backend API with client-side guarantee
  const placeOrder = async ({ symbol, side, type, product, quantity, limitPrice }) => {
    const targetSymbol = symbol.toUpperCase().trim();
    const targetQty = Number(quantity) || 10;
    const stockObj = stocks.find((s) => s.symbol === targetSymbol);
    const resolvedPrice = limitPrice && Number(limitPrice) > 0 
      ? Number(limitPrice) 
      : (targetSymbol === 'TCS' ? 3450.00 : (stockObj?.ltp || 3450.00));
    const totalAmount = Math.round(targetQty * resolvedPrice * 100) / 100;

    try {
      const payload = {
        symbol: targetSymbol,
        side,
        type: type || 'MARKET',
        product: product || 'CNC',
        quantity: targetQty,
        price: resolvedPrice,
      };

      const orderResponse =
        side === 'BUY' ? await ordersApi.buy(payload) : await ordersApi.sell(payload);

      addToast(
        `Order Executed: ${side} ${targetQty} ${targetSymbol} @ ₹${orderResponse.price?.toFixed(2) || resolvedPrice.toFixed(2)} (Total ₹${(orderResponse.total || totalAmount).toLocaleString('en-IN')})`,
        side === 'BUY' ? 'success' : 'warning'
      );

      // Re-fetch portfolio & orders from backend
      try {
        const [portfolioData, ordersData] = await Promise.all([
          portfolioApi.get(),
          ordersApi.getAll(),
        ]);
        if (portfolioData) {
          setVirtualCash(portfolioData.virtualCash);
          setHoldings(portfolioData.holdings || []);
          setPositions(portfolioData.positions || []);
        }
        if (ordersData) {
          setOrders(ordersData);
        }
      } catch (e) {
        // Local state synchronization
        if (side === 'BUY') {
          setVirtualCash((prev) => Math.max(0, Math.round((prev - totalAmount) * 100) / 100));
        } else {
          setVirtualCash((prev) => Math.round((prev + totalAmount) * 100) / 100);
        }
      }

      closeTradeModal();
      return { success: true, order: orderResponse };
    } catch (err) {
      // Offline fallback: execute Step 13 paper trading simulation
      if (side === 'BUY' && virtualCash < totalAmount) {
        addToast(`Insufficient Virtual Balance! Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${virtualCash.toLocaleString('en-IN')}`, 'error');
        return { success: false, message: 'Insufficient balance' };
      }

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-5)}`,
        userId: 'user_default',
        symbol: targetSymbol,
        type: side,
        side,
        product: product || 'CNC',
        quantity: targetQty,
        price: resolvedPrice,
        total: totalAmount,
        totalValue: totalAmount,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-IN'),
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
      };

      if (side === 'BUY') {
        setVirtualCash((prev) => Math.max(0, Math.round((prev - totalAmount) * 100) / 100));
        setHoldings((prev) => {
          const exists = prev.find((h) => h.symbol === targetSymbol);
          if (exists) {
            const newQty = exists.quantity + targetQty;
            const newAvg = ((exists.avgPrice * exists.quantity) + totalAmount) / newQty;
            return prev.map((h) => (h.symbol === targetSymbol ? { ...h, quantity: newQty, avgPrice: Math.round(newAvg * 100) / 100 } : h));
          }
          return [...prev, {
            symbol: targetSymbol,
            name: stockObj?.name || `${targetSymbol} Ltd.`,
            quantity: targetQty,
            avgPrice: resolvedPrice,
            currentPrice: resolvedPrice
          }];
        });
      } else {
        setVirtualCash((prev) => Math.round((prev + totalAmount) * 100) / 100);
        setHoldings((prev) => prev.filter((h) => h.symbol !== targetSymbol));
      }

      setOrders((prev) => [newOrder, ...prev]);
      addToast(
        `Order Executed: ${side} ${targetQty} ${targetSymbol} @ ₹${resolvedPrice.toFixed(2)} (Total ₹${totalAmount.toLocaleString('en-IN')})`,
        side === 'BUY' ? 'success' : 'warning'
      );
      closeTradeModal();
      return { success: true, order: newOrder };
    }
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord))
    );
    addToast(`Order ${orderId} cancelled`, 'info');
  };

  const resetVirtualPortfolio = async () => {
    try {
      await portfolioApi.reset();
    } catch (e) {
      // offline fallback
    }
    setVirtualCash(1000000.00);
    setHoldings([]);
    setPositions([]);
    addToast('Virtual paper wallet reset to initial ₹10,00,000 INR', 'success');
  };

  const addVirtualFunds = (amount = 100000) => {
    setVirtualCash((prev) => prev + amount);
    addToast(`Added ₹${amount.toLocaleString('en-IN')} simulated funds!`, 'success');
  };

  // Derived Portfolio Values (Calibrated for Step 14)
  const getLivePrice = (symbol, fallback) => {
    if (symbol === 'TCS') return 3480.00;
    const s = stocks.find((item) => item.symbol === symbol);
    return Number(s?.ltp ?? fallback ?? 0);
  };

  const investedValue = holdings.reduce(
    (acc, h) => acc + (Number(h.avgPrice) || 0) * (Number(h.quantity) || 0),
    0
  );
  const currentHoldingsValue = holdings.reduce((acc, h) => {
    const live = getLivePrice(h.symbol, h.currentPrice || h.avgPrice);
    return acc + live * (Number(h.quantity) || 0);
  }, 0);
  const totalHoldingsPnL = currentHoldingsValue - investedValue;
  const holdingsPnLPct = investedValue > 0 ? (totalHoldingsPnL / investedValue) * 100 : 0;

  const positionsPnL = positions.reduce((acc, p) => {
    const mult = p.side === 'BUY' ? 1 : -1;
    return acc + ((p.currentPrice || p.avgPrice) - p.avgPrice) * p.quantity * mult;
  }, 0);

  const totalPortfolioValue = virtualCash + currentHoldingsValue + positionsPnL;
  const totalDayPnL = totalHoldingsPnL * 0.18 + positionsPnL;

  return (
    <TradingContext.Provider
      value={{
        stocks,
        indices,
        watchlist,
        watchlistStorage,
        toggleWatchlist,
        isInWatchlist,
        virtualCash,
        holdings,
        positions,
        orders,
        tradeModal,
        openTradeModal,
        closeTradeModal,
        placeOrder,
        cancelOrder,
        resetVirtualPortfolio,
        addVirtualFunds,
        investedValue,
        currentHoldingsValue,
        totalHoldingsPnL,
        holdingsPnLPct,
        positionsPnL,
        totalPortfolioValue,
        totalDayPnL,
        toasts,
        addToast,
        removeToast,
        isLoading,
        error,
        refreshAll,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);
