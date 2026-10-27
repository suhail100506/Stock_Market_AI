import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, ArrowRight, Lock, Mail, Zap, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('arjun.mehta@stocksense.ai');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login('arjun.mehta@stocksense.ai', 'Password123!');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FC] dark:bg-[#101114] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-2xl p-7 shadow-card space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#405CF5] dark:bg-[#627BFF] items-center justify-center text-white shadow-xs mb-1">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-extrabold text-[#172033] dark:text-[#F4F6FC] tracking-tight">StockSense-AI</h1>
          </div>
          <p className="text-xs text-[#69758A] dark:text-[#A0A7B5]">
            Sign in to access your Indian paper trading simulator & AI models
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-medium text-[#07966A] dark:text-[#19B88A]">
            <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
              <KeyRound className="w-3 h-3 text-[#07966A] dark:text-[#19B88A]" />
              <span>JWT Authentication • PBKDF2 Hashing</span>
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-[#E5484D] dark:text-[#FF6268]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] focus:bg-white dark:focus:bg-[#18191D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] focus:bg-white dark:focus:bg-[#18191D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#405CF5] hover:bg-[#3049D8] dark:bg-[#627BFF] dark:hover:bg-[#4E68F0] shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Access Button */}
        <div className="pt-2 border-t border-[#E4E9F2] dark:border-[#30333B] space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#405CF5] dark:text-[#627BFF] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Demo Access (₹10,00,000 Paper Balance)</span>
          </button>

          <p className="text-center text-xs text-[#69758A] dark:text-[#A0A7B5]">
            New to StockSense?{' '}
            <Link to="/register" className="font-bold text-[#405CF5] dark:text-[#627BFF] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
