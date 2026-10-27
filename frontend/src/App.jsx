import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TradingProvider } from './context/TradingContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Markets } from './pages/Markets';
import { TradeOne } from './pages/TradeOne';
import { Portfolio } from './pages/Portfolio';
import { Orders } from './pages/Orders';
import { Positions } from './pages/Positions';
import { Alerts } from './pages/Alerts';
import { AIPrediction } from './pages/AIPrediction';
import { Screener } from './pages/Screener';
import { Account } from './pages/Account';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { StockDetail } from './pages/StockDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TradingProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main Application with Global App Shell Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/trade" element={<TradeOne />} />
                <Route path="/trade/:symbol" element={<TradeOne />} />
                <Route path="/watchlist" element={<TradeOne />} />
                <Route path="/stock/:symbol" element={<TradeOne />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/screener" element={<Screener />} />
                <Route path="/ai-prediction" element={<AIPrediction />} />
                <Route path="/ai-prediction/:symbol" element={<AIPrediction />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TradingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
