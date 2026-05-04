import {
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Leaf,
  Building2,
  ChevronRight,
} from 'lucide-react';

export default function FinancialSummary({ financials, inputs }) {
  if (!financials) return null;

  const formatCurrency = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#00ff88';
    if (score >= 6) return '#ff8800';
    return '#ff4444';
  };

  const scoreColor = getScoreColor(financials.feasibilityScore);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a38] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#00ff88]" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Financial Analysis</h3>
            <p className="text-xs text-[#6b7280]">{inputs?.capacity} TPD • {inputs?.feedstock} • {inputs?.location}</p>
          </div>
        </div>
        <div
          className="px-4 py-2 rounded-xl text-center"
          style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40` }}
        >
          <p className="text-2xl font-bold" style={{ color: scoreColor }}>
            {financials.feasibilityScore}
          </p>
          <p className="text-xs text-[#6b7280]">Feasibility</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <MetricCard
            icon={<Building2 className="w-4 h-4" />}
            label="CAPEX"
            value={formatCurrency(financials.capex)}
            subvalue={`±${(financials.capexVariance * 100).toFixed(0)}%`}
            color="#00d4ff"
          />
          <MetricCard
            icon={<Calendar className="w-4 h-4" />}
            label="OPEX"
            value={formatCurrency(financials.opex)}
            subvalue="/year"
            color="#8b5cf6"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Payback"
            value={`${financials.paybackYears} yrs`}
            subvalue={`${financials.irr.toFixed(1)}% IRR`}
            color="#00ff88"
          />
        </div>

        <div className="bg-[#0a0a0f] rounded-xl p-4 mb-6">
          <h4 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
            Revenue Breakdown
          </h4>
          <div className="space-y-3">
            <RevenueRow
              icon={<Zap className="w-3.5 h-3.5" />}
              label="Energy Sales"
              value={financials.revenue.energy}
              total={financials.revenue.total}
              color="#ff8800"
            />
            <RevenueRow
              icon={<Leaf className="w-3.5 h-3.5" />}
              label="RNG Credits"
              value={financials.revenue.rng}
              total={financials.revenue.total}
              color="#00ff88"
            />
            <RevenueRow
              icon={<Award className="w-3.5 h-3.5" />}
              label="Carbon Credits"
              value={financials.revenue.carbon}
              total={financials.revenue.total}
              color="#00d4ff"
            />
            <div className="pt-3 border-t border-[#2a2a38] flex items-center justify-between">
              <span className="text-sm font-medium text-white">Total Annual Revenue</span>
              <span className="text-lg font-bold text-[#00ff88]">
                {formatCurrency(financials.revenue.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0f] rounded-xl p-4 mb-6">
          <h4 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
            Available Incentives
          </h4>
          <div className="flex flex-wrap gap-2">
            {financials.incentives?.map((incentive, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-[#1a1a24] rounded-lg text-xs text-[#00d4ff] border border-[#00d4ff]/20"
              >
                {incentive}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00ff88]/5 to-[#00d4ff]/5 rounded-xl p-4 border border-[#00ff88]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-1">AI Analysis</h4>
              <p className="text-sm text-[#9ca3af] leading-relaxed">{financials.aiSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MetricCard({ icon, label, value, subvalue, color }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#6b7280]">{subvalue}</p>
    </div>
  );
}

function RevenueRow({ icon, label, value, total, color }) {
  const percentage = (value / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm text-[#9ca3af]">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">
          ${(value / 1000).toFixed(0)}K
          <span className="text-[#6b7280] ml-1">({percentage.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}
