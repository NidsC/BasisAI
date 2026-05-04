import { Activity, Layers, DollarSign, Settings, HelpCircle } from 'lucide-react';

export default function Header({ activeView, onViewChange, hasPlantData }) {
  return (
    <header className="h-14 glass-panel border-b border-[#2a2a38] flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          {[
            { id: '3d', label: '3D Viewport', icon: <Layers className="w-4 h-4" /> },
            { id: 'balance', label: 'Mass/Energy', icon: <Activity className="w-4 h-4" /> },
            { id: 'financial', label: 'Financials', icon: <DollarSign className="w-4 h-4" /> },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              disabled={!hasPlantData && view.id !== '3d'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === view.id
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                  : hasPlantData || view.id === '3d'
                  ? 'text-[#6b7280] hover:text-white hover:bg-[#1a1a24]'
                  : 'text-[#3a3a48] cursor-not-allowed'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {hasPlantData && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/20">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-xs text-[#00ff88] font-medium">Design Active</span>
          </div>
        )}

        <button className="w-9 h-9 rounded-lg bg-[#1a1a24] hover:bg-[#2a2a38] flex items-center justify-center transition-colors">
          <Settings className="w-4 h-4 text-[#6b7280]" />
        </button>

        <button className="w-9 h-9 rounded-lg bg-[#1a1a24] hover:bg-[#2a2a38] flex items-center justify-center transition-colors">
          <HelpCircle className="w-4 h-4 text-[#6b7280]" />
        </button>
      </div>
    </header>
  );
}
