import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Leaf,
  Building2,
  ChevronDown,
  ChevronUp,
  Factory,
  Wrench,
  Users,
  Gauge,
  PiggyBank,
  BarChart3,
} from 'lucide-react';

export default function FinancialSummary({ financials, inputs }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!financials) return null;

  const { capex, opex, revenue, profitability } = financials;

  const formatCurrency = (num) => {
    if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#00ff88';
    if (score >= 6) return '#ff8800';
    return '#ff4444';
  };

  const scoreColor = getScoreColor(profitability.feasibilityScore);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Header with Feasibility Score */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Financial Analysis</h3>
              <p className="text-xs text-[#6b7280]">
                {inputs?.capacity} TPD • {inputs?.feedstock} • {inputs?.location}
              </p>
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-center"
            style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40` }}
          >
            <p className="text-2xl font-bold" style={{ color: scoreColor }}>
              {profitability.feasibilityScore}
            </p>
            <p className="text-xs text-[#6b7280]">Feasibility</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard
              icon={<Building2 className="w-4 h-4" />}
              label="Total CAPEX"
              value={formatCurrency(capex.total)}
              subvalue={capex.accuracy}
              color="#00d4ff"
            />
            <MetricCard
              icon={<Calendar className="w-4 h-4" />}
              label="Annual OPEX"
              value={formatCurrency(opex.total)}
              subvalue="/year"
              color="#8b5cf6"
            />
            <MetricCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="IRR"
              value={`${profitability.irr}%`}
              subvalue={`${profitability.simplePayback} yr payback`}
              color="#00ff88"
            />
            <MetricCard
              icon={<PiggyBank className="w-4 h-4" />}
              label="NPV"
              value={formatCurrency(profitability.npv)}
              subvalue={`${profitability.projectLife}yr @ ${profitability.discountRate}%`}
              color={profitability.npv > 0 ? '#00ff88' : '#ff4444'}
            />
          </div>
        </div>
      </div>

      {/* CAPEX Breakdown - AACE Class 4 */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('capex')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a24] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Factory className="w-5 h-5 text-[#00d4ff]" />
            <div className="text-left">
              <h4 className="font-medium text-white">CAPEX Breakdown</h4>
              <p className="text-xs text-[#6b7280]">{capex.class} Estimate</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-white">{formatCurrency(capex.total)}</span>
            {expandedSection === 'capex' ? (
              <ChevronUp className="w-5 h-5 text-[#6b7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6b7280]" />
            )}
          </div>
        </button>

        {expandedSection === 'capex' && (
          <div className="px-6 pb-6 space-y-4">
            {/* ISBL */}
            <div className="bg-[#0a0a0f] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#00d4ff]">ISBL (Inside Battery Limits)</span>
                <span className="font-mono text-sm text-white">{formatCurrency(capex.ISBL)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(capex.equipment).map(([key, value]) => (
                  <CostRow key={key} label={formatLabel(key)} value={value} />
                ))}
              </div>
            </div>

            {/* OSBL */}
            <div className="bg-[#0a0a0f] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#8b5cf6]">OSBL (Outside Battery Limits)</span>
                <span className="font-mono text-sm text-white">{formatCurrency(capex.OSBL.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(capex.OSBL)
                  .filter(([key]) => key !== 'total')
                  .map(([key, value]) => (
                    <CostRow key={key} label={formatLabel(key)} value={value} />
                  ))}
              </div>
            </div>

            {/* Indirect Costs */}
            <div className="bg-[#0a0a0f] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#ff8800]">Indirect Costs</span>
                <span className="font-mono text-sm text-white">{formatCurrency(capex.indirect.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(capex.indirect)
                  .filter(([key]) => key !== 'total')
                  .map(([key, value]) => (
                    <CostRow key={key} label={formatLabel(key)} value={value} />
                  ))}
              </div>
            </div>

            {/* Contingency */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#ff444420] rounded-xl border border-[#ff444440]">
              <span className="text-sm font-medium text-[#ff4444]">Contingency (20%)</span>
              <span className="font-mono text-sm text-white">{formatCurrency(capex.contingency)}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00d4ff]/10 to-[#00ff88]/10 rounded-xl border border-[#00d4ff]/30">
              <span className="text-sm font-bold text-white">TOTAL CAPEX</span>
              <span className="font-mono text-lg font-bold text-[#00ff88]">{formatCurrency(capex.total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* OPEX Breakdown */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('opex')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a24] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-[#8b5cf6]" />
            <div className="text-left">
              <h4 className="font-medium text-white">Annual OPEX</h4>
              <p className="text-xs text-[#6b7280]">Operating expenditure breakdown</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-white">{formatCurrency(opex.total)}/yr</span>
            {expandedSection === 'opex' ? (
              <ChevronUp className="w-5 h-5 text-[#6b7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6b7280]" />
            )}
          </div>
        </button>

        {expandedSection === 'opex' && (
          <div className="px-6 pb-6">
            <div className="bg-[#0a0a0f] rounded-xl p-4 space-y-3">
              <OpexRow
                icon={<Leaf className="w-4 h-4" />}
                label="Feedstock"
                value={opex.feedstock}
                color={opex.feedstock < 0 ? '#00ff88' : '#ff8800'}
                note={opex.feedstock < 0 ? '(tipping fee revenue)' : ''}
              />
              <OpexRow
                icon={<Zap className="w-4 h-4" />}
                label="Electricity"
                value={opex.electricity}
                color="#ffcc00"
              />
              <OpexRow
                icon={<Wrench className="w-4 h-4" />}
                label="Maintenance"
                value={opex.maintenance}
                color="#8b5cf6"
                note="(3% of ISBL)"
              />
              <OpexRow
                icon={<Users className="w-4 h-4" />}
                label="Labor"
                value={opex.labor}
                color="#00d4ff"
                note={`(${opex.laborFTEs} FTEs)`}
              />
              <OpexRow
                icon={<Building2 className="w-4 h-4" />}
                label="Insurance & Tax"
                value={opex.insuranceTax}
                color="#6b7280"
                note="(1.5% CAPEX)"
              />
              <OpexRow
                icon={<Gauge className="w-4 h-4" />}
                label="Consumables"
                value={opex.consumables}
                color="#6b7280"
              />
              <OpexRow
                icon={<Factory className="w-4 h-4" />}
                label="Digestate Handling"
                value={opex.digestateHandling}
                color="#6b7280"
              />
              <div className="pt-3 border-t border-[#2a2a38] flex items-center justify-between">
                <span className="text-sm font-bold text-white">TOTAL OPEX</span>
                <span className="font-mono text-lg font-bold text-[#8b5cf6]">{formatCurrency(opex.total)}/yr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection('revenue')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a24] transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#00ff88]" />
            <div className="text-left">
              <h4 className="font-medium text-white">Annual Revenue</h4>
              <p className="text-xs text-[#6b7280]">Revenue stream breakdown</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#00ff88]">{formatCurrency(revenue.total)}/yr</span>
            {expandedSection === 'revenue' ? (
              <ChevronUp className="w-5 h-5 text-[#6b7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6b7280]" />
            )}
          </div>
        </button>

        {expandedSection === 'revenue' && (
          <div className="px-6 pb-6">
            <div className="bg-[#0a0a0f] rounded-xl p-4 space-y-3">
              <RevenueBar
                icon={<Zap className="w-3.5 h-3.5" />}
                label="Electricity Sales"
                value={revenue.electricity}
                total={revenue.total}
                color="#ffcc00"
              />
              <RevenueBar
                icon={<Leaf className="w-3.5 h-3.5" />}
                label="RNG Sales"
                value={revenue.rng}
                total={revenue.total}
                color="#00ff88"
              />
              <RevenueBar
                icon={<Award className="w-3.5 h-3.5" />}
                label="Carbon Credits"
                value={revenue.carbon}
                total={revenue.total}
                color="#00d4ff"
              />
              <RevenueBar
                icon={<Gauge className="w-3.5 h-3.5" />}
                label="Heat Sales"
                value={revenue.heat}
                total={revenue.total}
                color="#ff8800"
              />
              <div className="pt-3 border-t border-[#2a2a38]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9ca3af]">Annual Profit (pre-tax)</span>
                  <span className="font-mono text-sm text-white">{formatCurrency(profitability.annualProfit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Annual Cash Flow (after-tax)</span>
                  <span className="font-mono text-sm text-[#00ff88]">{formatCurrency(profitability.annualCashFlow)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profitability Metrics */}
      <div className="glass-panel rounded-2xl overflow-hidden p-6">
        <h4 className="text-sm font-medium text-[#6b7280] uppercase tracking-wider mb-4">
          Profitability Analysis
        </h4>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00ff88]">{profitability.irr}%</p>
            <p className="text-xs text-[#6b7280]">Internal Rate of Return</p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00d4ff]">{profitability.simplePayback} yrs</p>
            <p className="text-xs text-[#6b7280]">Simple Payback</p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#8b5cf6]">{profitability.discountedPayback} yrs</p>
            <p className="text-xs text-[#6b7280]">Discounted Payback</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0a0f] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">Profitability Index</span>
              <span className="font-mono text-lg font-bold text-white">{profitability.profitabilityIndex}</span>
            </div>
            <p className="text-xs text-[#4b5563] mt-1">PI &gt; 1.0 indicates value creation</p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">Return on Investment</span>
              <span className="font-mono text-lg font-bold text-white">{profitability.roi}%</span>
            </div>
            <p className="text-xs text-[#4b5563] mt-1">Annual cash flow / CAPEX</p>
          </div>
        </div>
      </div>

      {/* Incentives */}
      <div className="glass-panel rounded-2xl p-6">
        <h4 className="text-sm font-medium text-[#6b7280] uppercase tracking-wider mb-3">
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

      {/* AI Analysis */}
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-[#00ff88]/5 to-[#00d4ff]/5 border border-[#00ff88]/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">AI Investment Analysis</h4>
            <p className="text-sm text-[#9ca3af] leading-relaxed">{financials.aiSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
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

function CostRow({ label, value }) {
  const formatCurrency = (num) => {
    if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="font-mono text-xs text-white">{formatCurrency(value)}</span>
    </div>
  );
}

function OpexRow({ icon, label, value, color, note = '' }) {
  const formatCurrency = (num) => {
    if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-sm text-[#9ca3af]">{label}</span>
        {note && <span className="text-xs text-[#4b5563]">{note}</span>}
      </div>
      <span className="font-mono text-sm" style={{ color: value < 0 ? '#00ff88' : 'white' }}>
        {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function RevenueBar({ icon, label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const formatCurrency = (num) => {
    if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm text-[#9ca3af]">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">
          {formatCurrency(value)}
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

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
