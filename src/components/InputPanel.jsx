import { useState } from 'react';
import {
  Sparkles,
  Leaf,
  MapPin,
  Scale,
  ChevronDown,
  Zap,
  Loader2,
} from 'lucide-react';

const feedstockOptions = [
  { value: 'manure', label: 'Dairy Manure', icon: '🐄' },
  { value: 'food_waste', label: 'Food Waste', icon: '🍎' },
  { value: 'crop_residue', label: 'Crop Residue', icon: '🌾' },
];

const locationOptions = [
  { value: 'Ohio, USA', label: 'Ohio, USA', flag: '🇺🇸' },
  { value: 'California, USA', label: 'California, USA', flag: '🇺🇸' },
  { value: 'Texas, USA', label: 'Texas, USA', flag: '🇺🇸' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'India', label: 'India', flag: '🇮🇳' },
];

export default function InputPanel({
  onGenerate,
  isGenerating,
  computingLog,
  currentLogIndex,
}) {
  const [prompt, setPrompt] = useState('Design a 50 ton/day plant for dairy waste');
  const [capacity, setCapacity] = useState('50');
  const [feedstock, setFeedstock] = useState('manure');
  const [location, setLocation] = useState('Ohio, USA');

  const handleGenerate = () => {
    onGenerate({ prompt, capacity, feedstock, location });
  };

  const extractCapacityFromPrompt = (text) => {
    const match = text.match(/(\d+)\s*ton/i);
    if (match) {
      setCapacity(match[1]);
    }
  };

  return (
    <div className="w-80 h-full glass-panel border-r border-[#2a2a38] flex flex-col">
      <div className="p-6 border-b border-[#2a2a38]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">BasisAI</h1>
            <p className="text-xs text-[#6b7280]">Generative Design Engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#9ca3af] mb-3">
            <Sparkles className="w-4 h-4 text-[#00d4ff]" />
            Design Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              extractCapacityFromPrompt(e.target.value);
            }}
            placeholder="Describe your plant requirements..."
            className="w-full h-24 px-4 py-3 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/20 resize-none transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#9ca3af] mb-3">
            <Scale className="w-4 h-4 text-[#00d4ff]" />
            Plant Capacity
          </label>
          <div className="relative">
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-white focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
              tons/day
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {[25, 50, 100, 200].map((val) => (
              <button
                key={val}
                onClick={() => setCapacity(String(val))}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  capacity === String(val)
                    ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]'
                    : 'border-[#2a2a38] text-[#6b7280] hover:border-[#3a3a48]'
                }`}
              >
                {val}T
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#9ca3af] mb-3">
            <Leaf className="w-4 h-4 text-[#00ff88]" />
            Feedstock Type
          </label>
          <div className="relative">
            <select
              value={feedstock}
              onChange={(e) => setFeedstock(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/20 transition-all cursor-pointer"
            >
              {feedstockOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#9ca3af] mb-3">
            <MapPin className="w-4 h-4 text-[#ff8800]" />
            Project Location
          </label>
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/20 transition-all cursor-pointer"
            >
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isGenerating
                ? 'bg-[#1a1a24] border border-[#00d4ff] text-[#00d4ff]'
                : 'bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white hover:opacity-90 animate-pulse-glow'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Design...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Design
              </>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-xs font-medium text-[#00ff88]">AI Computing</span>
            </div>
            <div className="h-32 overflow-hidden font-mono text-xs">
              {computingLog.slice(0, currentLogIndex + 1).map((log, i) => (
                <div
                  key={i}
                  className={`py-0.5 transition-opacity duration-300 ${
                    i === currentLogIndex ? 'text-[#00d4ff]' : 'text-[#4b5563]'
                  }`}
                >
                  <span className="text-[#6b7280] mr-2">[{String(i + 1).padStart(2, '0')}]</span>
                  {log}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all duration-300"
                style={{ width: `${((currentLogIndex + 1) / computingLog.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#2a2a38]">
        <div className="flex items-center justify-between text-xs text-[#4b5563]">
          <span>v2.4.1</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
            Engine Ready
          </span>
        </div>
      </div>
    </div>
  );
}
