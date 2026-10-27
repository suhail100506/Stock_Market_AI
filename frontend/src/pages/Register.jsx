import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, ArrowRight, User, Mail, Lock, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
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
            Open a simulated paper trading account with ₹10,00,000 virtual balance
          </p>

          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[#07966A] dark:text-[#19B88A] text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>₹10,00,000 Virtual Capital Credited Instantly</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#E5484D] dark:text-[#FF6268] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mohammed Suhail"
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] focus:bg-white dark:focus:bg-[#18191D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="suhail@example.com"
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] focus:border-[#405CF5] dark:focus:border-[#627BFF] focus:bg-white dark:focus:bg-[#18191D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#172033] dark:text-[#F4F6FC] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#69758A] dark:text-[#A0A7B5] mb-1">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#69758A] dark:text-[#A0A7B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#69758A] dark:text-[#A0A7B5]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#405CF5] dark:text-[#627BFF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
