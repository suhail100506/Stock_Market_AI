import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Shield,
  Sliders,
  Bell,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';

export const Settings = () => {
  const { refreshAll } = useTrading();
  const {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    fontSize,
    setFontSize,
    accessibilityMode,
    setAccessibilityMode,
    reConfirmOrder,
    setReConfirmOrder,
  } = useTheme();

  // Settings State
  const [defaultProduct, setDefaultProduct] = useState('CNC');
  const [defaultOrderType, setDefaultOrderType] = useState('MARKET');
  const [defaultQty, setDefaultQty] = useState('10');
  const [minConfidence, setMinConfidence] = useState('70');
  const [aiModel, setAiModel] = useState('xgboost');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] dark:text-[#F4F6FC] tracking-tight">
          System & Trading Settings
        </h1>
        <p className="text-xs text-[#69758A] dark:text-[#A0A7B5] mt-1">
          Configure simulated trading parameters, AI prediction thresholds, and interface preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Interface Theme & Appearance */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E4E9F2] dark:border-[#30333B] pb-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#405CF5] dark:text-[#627BFF]">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">Interface Theme</h2>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Switch between Light mode and Dark mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-lg border text-left transition-all ${
                theme === 'light'
                  ? 'border-[#405CF5] bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-[#E4E9F2] dark:border-[#30333B]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">Light Mode</span>
              </div>
              <p className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
                Default clean financial terminal layout with #F3F6FC background.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-lg border text-left transition-all ${
                theme === 'dark'
                  ? 'border-[#627BFF] bg-blue-950/40'
                  : 'border-[#E4E9F2] dark:border-[#30333B]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">Dark Mode</span>
              </div>
              <p className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
                Sleek dark trading aesthetic with #101114 terminal background.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className="p-3 rounded-lg border border-[#E4E9F2] dark:border-[#30333B] text-left hover:bg-[#F3F6FC] dark:hover:bg-[#202228]"
            >
              <div className="text-xs font-bold text-[#172033] dark:text-[#F4F6FC]">System Auto</div>
              <p className="text-[10px] text-[#69758A] dark:text-[#A0A7B5] mt-1">
                Sync with your operating system light / dark preferences.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Paper Trading Execution Defaults */}
        <div className="bg-white dark:bg-[#18191D] border border-[#E4E9F2] dark:border-[#30333B] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E4E9F2] dark:border-[#30333B] pb-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#07966A] dark:text-[#19B88A]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033] dark:text-[#F4F6FC]">
                Trading Terminal Defaults
              </h2>
              <p className="text-[11px] text-[#69758A] dark:text-[#A0A7B5]">
                Default parameters populated in the order ticket pad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                Default Product Type
              </label>
              <select
                value={defaultProduct}
                onChange={(e) => setDefaultProduct(e.target.value)}
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 text-[#172033] dark:text-[#F4F6FC] outline-none"
              >
                <option value="CNC">CNC (Delivery / Long Term)</option>
                <option value="MIS">MIS (Intraday Margin)</option>
              </select>
            </div>

            <div>
              <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                Default Order Type
              </label>
              <select
                value={defaultOrderType}
                onChange={(e) => setDefaultOrderType(e.target.value)}
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 text-[#172033] dark:text-[#F4F6FC] outline-none"
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
                <option value="SL">STOP LOSS (SL)</option>
              </select>
            </div>

            <div>
              <label className="text-[#69758A] dark:text-[#A0A7B5] font-semibold block mb-1">
                Default Quantity
              </label>
              <input
                type="number"
                min="1"
                value={defaultQty}
                onChange={(e) => setDefaultQty(e.target.value)}
                className="w-full bg-[#F3F6FC] dark:bg-[#101114] border border-[#E4E9F2] dark:border-[#30333B] rounded-lg px-3 py-1.5 font-mono text-[#172033] dark:text-[#F4F6FC] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#07966A] dark:text-[#19B88A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2 rounded-lg text-xs font-bold bg-[#405CF5] dark:bg-[#627BFF] text-white shadow-2xs hover:bg-[#3049D8] transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
