import axios from 'axios';

// Centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Inject token if needed in future
    const token = localStorage.getItem('stocksense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(errorMsg));
  }
);

// Normalization helper: ensure consistent field names for frontend components
export const normalizeStock = (stock) => {
  if (!stock) return null;
  return {
    ...stock,
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange || 'NSE',
    sector: stock.sector,
    ltp: stock.ltp,
    prevClose: stock.prev_close ?? stock.prevClose ?? stock.ltp,
    change: stock.change ?? (stock.ltp - (stock.prev_close ?? stock.prevClose ?? stock.ltp)),
    changePercent: stock.change_percent ?? stock.changePercent ?? 0,
    volume: stock.volume,
    marketCap: stock.market_cap ?? stock.marketCap,
    peRatio: stock.pe_ratio ?? stock.peRatio,
    dividendYield: stock.dividend_yield ?? stock.dividendYield,
    fiftyTwoWeekHigh: stock.fifty_two_week_high ?? stock.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: stock.fifty_two_week_low ?? stock.fiftyTwoWeekLow,
    sparkline: stock.sparkline || [],
    aiSignal: stock.ai_signal ?? stock.aiSignal ?? 'HOLD',
    aiConfidence: stock.ai_confidence ?? stock.aiConfidence ?? 75,
    aiTargetPrice: stock.ai_target_price ?? stock.aiTargetPrice,
    aiStopLoss: stock.ai_stop_loss ?? stock.aiStopLoss,
    aiSummary: stock.ai_summary ?? stock.aiSummary,
    sentiment: stock.sentiment,
    technicals: stock.technicals,
    orderBook: stock.order_book
      ? {
          bids: stock.order_book.bids || [],
          asks: stock.order_book.asks || [],
        }
      : stock.orderBook,
  };
};

export const normalizePortfolio = (data) => {
  if (!data) return null;
  return {
    virtualCash: data.virtual_cash ?? data.virtualCash ?? 0,
    investedValue: data.invested_value ?? data.investedValue ?? 0,
    currentHoldingsValue: data.current_holdings_value ?? data.currentHoldingsValue ?? 0,
    totalHoldingsPnL: data.total_holdings_pnl ?? data.totalHoldingsPnL ?? 0,
    holdingsPnLPct: data.holdings_pnl_pct ?? data.holdingsPnLPct ?? 0,
    positionsPnL: data.positions_pnl ?? data.positionsPnL ?? 0,
    totalPortfolioValue: data.total_portfolio_value ?? data.totalPortfolioValue ?? 0,
    holdings: (data.holdings || []).map((h) => ({
      ...h,
      avgPrice: h.avg_price ?? h.avgPrice,
      currentPrice: h.current_price ?? h.currentPrice,
      investedValue: h.invested_value ?? h.investedValue,
      currentValue: h.current_value ?? h.currentValue,
      unrealizedPnl: h.unrealized_pnl ?? h.unrealizedPnl,
      pnlPercentage: h.pnl_percentage ?? h.pnlPercentage,
    })),
    positions: (data.positions || []).map((p) => ({
      ...p,
      avgPrice: p.avg_price ?? p.avgPrice,
      currentPrice: p.current_price ?? p.currentPrice,
      unrealizedPnl: p.unrealized_pnl ?? p.unrealizedPnl,
      pnlPercentage: p.pnl_percentage ?? p.pnlPercentage,
    })),
  };
};

// API Services
export const stocksApi = {
  getAll: (params) => apiClient.get('/stocks', { params }).then((res) => res.map(normalizeStock)),
  getBySymbol: (symbol) => apiClient.get(`/stocks/${symbol}`).then(normalizeStock),
  getHistory: (symbol, timeframe = '1M') =>
    apiClient.get(`/stocks/${symbol}/history`, { params: { timeframe } }),
  getIndicators: (symbol, timeframe = '1M') =>
    apiClient.get(`/stocks/${symbol}/indicators`, { params: { timeframe } }),
};

export const watchlistApi = {
  get: () =>
    apiClient.get('/watchlist').then((res) => ({
      symbols: res.symbols || [],
      stocks: (res.stocks || []).map(normalizeStock),
      message: res.message,
    })),
  toggle: (symbol) =>
    apiClient.post('/watchlist', { symbol }).then((res) => ({
      symbols: res.symbols || [],
      stocks: (res.stocks || []).map(normalizeStock),
      message: res.message,
    })),
};

export const portfolioApi = {
  get: () => apiClient.get('/portfolio').then(normalizePortfolio),
  reset: () => apiClient.post('/portfolio/reset'),
};

export const ordersApi = {
  getAll: (status) =>
    apiClient.get('/orders', { params: status ? { status } : {} }).then((res) =>
      res.map((o) => ({
        ...o,
        total: o.total ?? o.total_value ?? o.totalValue ?? (o.price * o.quantity),
        totalValue: o.total_value ?? o.total ?? o.totalValue ?? (o.price * o.quantity),
      }))
    ),
  buy: (data) =>
    apiClient.post('/orders/buy', {
      symbol: data.symbol,
      side: 'BUY',
      product: data.product,
      type: data.type,
      quantity: Number(data.quantity),
      price: data.price ? Number(data.price) : undefined,
      trigger_price: data.triggerPrice ? Number(data.triggerPrice) : undefined,
    }),
  sell: (data) =>
    apiClient.post('/orders/sell', {
      symbol: data.symbol,
      side: 'SELL',
      product: data.product,
      type: data.type,
      quantity: Number(data.quantity),
      price: data.price ? Number(data.price) : undefined,
      trigger_price: data.triggerPrice ? Number(data.triggerPrice) : undefined,
    }),
};

export const normalizePrediction = (data) => {
  if (!data) return null;
  const rawConf = data.confidence ?? 0.72;
  const confPct = rawConf <= 1.0 ? Math.round(rawConf * 100) : Math.round(rawConf);
  const confFloat = rawConf <= 1.0 ? rawConf : Number((rawConf / 100).toFixed(2));
  const currentPrice = data.current_price ?? data.currentPrice ?? data.ltp ?? 0;
  const predictedPrice = data.predicted_price ?? data.predictedPrice ?? data.target_price ?? currentPrice;

  return {
    symbol: data.symbol,
    current_price: currentPrice,
    currentPrice: currentPrice,
    predicted_price: predictedPrice,
    predictedPrice: predictedPrice,
    direction: data.direction ?? 'UP',
    signal: data.signal ?? 'BUY',
    confidence: confFloat,
    confidencePct: confPct,
    aiSignal: data.signal ?? data.ai_signal ?? 'BUY',
    aiConfidence: confPct,
    aiTargetPrice: predictedPrice,
    aiStopLoss: data.stop_loss ?? 0,
    aiSummary: data.summary ?? '',
    technicals: data.technicals ?? {},
  };
};

export const predictionApi = {
  getBySymbol: (symbol) =>
    apiClient.get(`/prediction/${symbol}`).then((res) => normalizePrediction(res)),
  getPerformance: (symbol) =>
    symbol
      ? apiClient.get(`/prediction/${symbol}/performance`)
      : apiClient.get('/prediction/performance'),
};

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

export default apiClient;
