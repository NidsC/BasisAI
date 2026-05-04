import { useState } from 'react';
import { X, ArrowRight, Zap, Droplets, Flame, Wind, Activity } from 'lucide-react';
import SankeyDiagram from './SankeyDiagram';

export default function MassEnergyBalance({ plantData, selectedEquipment, onClose }) {
  const [activeTab, setActiveTab] = useState('sankey');

  if (!plantData) return null;

  const { massBalance, energyBalance, production, equipment } = plantData;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num?.toLocaleString() || '—';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90vw] max-w-6xl h-[85vh] glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[#2a2a38] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#00ff88]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mass & Energy Balance</h2>
              <p className="text-xs text-[#6b7280]">
                {plantData.inputs.capacity} TPD • {plantData.inputs.feedstock}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#0a0a0f] rounded-xl p-1">
              {[
                { id: 'sankey', label: 'Flow Diagram' },
                { id: 'table', label: 'Data Table' },
                { id: 'energy', label: 'Energy Balance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                      : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[#2a2a38] hover:bg-[#3a3a48] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#9ca3af]" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'sankey' && (
            <div className="h-full flex flex-col">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <SummaryCard
                  icon={<Droplets className="w-4 h-4" />}
                  label="Feedstock Input"
                  value={`${formatNumber(production.hourlyFeedRate)} kg/h`}
                  color="#DAA520"
                />
                <SummaryCard
                  icon={<Wind className="w-4 h-4" />}
                  label="Daily Biogas"
                  value={`${formatNumber(production.dailyBiogas)} m³/d`}
                  color="#00ff88"
                />
                <SummaryCard
                  icon={<Flame className="w-4 h-4" />}
                  label="Daily Methane"
                  value={`${formatNumber(production.dailyMethane)} m³/d`}
                  color="#ff8800"
                />
                <SummaryCard
                  icon={<Zap className="w-4 h-4" />}
                  label="System Efficiency"
                  value={`${energyBalance.efficiency}%`}
                  color="#8b5cf6"
                />
              </div>
              <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-[#2a2a38] min-h-[400px]">
                <SankeyDiagram data={massBalance} />
              </div>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24]">
                  <h3 className="font-medium text-white">Equipment Stream Data</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2a2a38]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          Equipment
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          Mass In (kg/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          Mass Out (kg/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          Enthalpy In (MJ/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          Enthalpy Out (MJ/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          ΔH (MJ/h)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((eq, i) => {
                        const isSelected = selectedEquipment?.id === eq.id;
                        const massIn = eq.streams.massIn || eq.streams.coldIn || eq.streams.biogasIn || 0;
                        const massOut = eq.streams.massOut || eq.streams.coldOut || eq.streams.biomethaneOut || eq.streams.powerOut || 0;
                        const deltaH = eq.streams.enthalpyOut - eq.streams.enthalpyIn;

                        return (
                          <tr
                            key={eq.id}
                            className={`border-b border-[#2a2a38] ${
                              isSelected ? 'bg-[#00d4ff]/10' : i % 2 === 0 ? 'bg-[#0a0a0f]' : 'bg-[#12121a]'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isSelected ? 'bg-[#00ff88]' : 'bg-[#00d4ff]'
                                  }`}
                                />
                                <span className="text-sm text-white">{eq.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-[#00d4ff]">
                              {formatNumber(massIn)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-[#00ff88]">
                              {formatNumber(massOut)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-[#ff8800]">
                              {formatNumber(eq.streams.enthalpyIn)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-[#8b5cf6]">
                              {formatNumber(eq.streams.enthalpyOut)}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-mono text-sm ${
                                deltaH >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'
                              }`}
                            >
                              {deltaH >= 0 ? '+' : ''}
                              {formatNumber(deltaH)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">Mass Balance Summary</h4>
                  <div className="space-y-3">
                    <BalanceRow label="Total Feedstock Input" value={production.hourlyFeedRate * 24} unit="kg/day" />
                    <BalanceRow label="Biogas Generated" value={production.dailyBiogas * 1.2} unit="kg/day" />
                    <BalanceRow label="Digestate Output" value={production.hourlyFeedRate * 24 * 0.92} unit="kg/day" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow label="Mass Closure" value={99.2} unit="%" highlight />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">Global Plant Totals</h4>
                  <div className="space-y-3">
                    <BalanceRow label="Annual Biogas Production" value={production.dailyBiogas * 365} unit="m³/yr" />
                    <BalanceRow label="Annual Methane Production" value={production.annualMethane} unit="m³/yr" />
                    <BalanceRow label="Annual CO2 Avoided" value={production.annualMethane * 0.002} unit="tons/yr" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow label="Methane Content" value={55} unit="%" highlight />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'energy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#00d4ff]" />
                    Energy Inputs
                  </h3>
                  <div className="space-y-4">
                    <EnergyBar
                      label="Feedstock Chemical Energy"
                      value={energyBalance.inputs.feedstock}
                      max={energyBalance.inputs.feedstock}
                      color="#DAA520"
                    />
                    <EnergyBar
                      label="Parasitic Electricity"
                      value={energyBalance.inputs.electricity}
                      max={energyBalance.inputs.feedstock}
                      color="#8b5cf6"
                    />
                    <div className="pt-4 border-t border-[#2a2a38]">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Total Input Energy</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(
                            energyBalance.inputs.feedstock + energyBalance.inputs.electricity
                          )}{' '}
                          MJ/d
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#00ff88] rotate-180" />
                    Energy Outputs
                  </h3>
                  <div className="space-y-4">
                    <EnergyBar
                      label="Biomethane Energy"
                      value={energyBalance.outputs.biomethane}
                      max={energyBalance.inputs.feedstock}
                      color="#00ff88"
                    />
                    <EnergyBar
                      label="Electricity Generated"
                      value={energyBalance.outputs.electricity}
                      max={energyBalance.inputs.feedstock}
                      color="#ffcc00"
                    />
                    <EnergyBar
                      label="Recovered Heat"
                      value={energyBalance.outputs.heat}
                      max={energyBalance.inputs.feedstock}
                      color="#ff8800"
                    />
                    <EnergyBar
                      label="Losses"
                      value={energyBalance.outputs.losses}
                      max={energyBalance.inputs.feedstock}
                      color="#ff4444"
                    />
                    <div className="pt-4 border-t border-[#2a2a38]">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Total Output Energy</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(
                            energyBalance.outputs.biomethane +
                              energyBalance.outputs.electricity +
                              energyBalance.outputs.heat +
                              energyBalance.outputs.losses
                          )}{' '}
                          MJ/d
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#00ff88]/5 to-[#00d4ff]/5 rounded-xl border border-[#00ff88]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Overall Energy Efficiency</h4>
                    <p className="text-sm text-[#6b7280]">
                      Ratio of useful energy outputs to total energy inputs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#00ff88]">{energyBalance.efficiency}%</p>
                    <p className="text-sm text-[#6b7280]">Industry benchmark: 75-85%</p>
                  </div>
                </div>
                <div className="mt-4 h-3 bg-[#1a1a24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full"
                    style={{ width: `${energyBalance.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function BalanceRow({ label, value, unit, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-[#6b7280]'}`}>
        {label}
      </span>
      <span className={`font-mono text-sm ${highlight ? 'text-[#00ff88] font-bold' : 'text-white'}`}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value} {unit}
      </span>
    </div>
  );
}

function EnergyBar({ label, value, max, color }) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="font-mono text-sm text-white">
          {value >= 1000000
            ? (value / 1000000).toFixed(1) + 'M'
            : value >= 1000
            ? (value / 1000).toFixed(0) + 'k'
            : value.toLocaleString()}{' '}
          MJ/d
        </span>
      </div>
      <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
