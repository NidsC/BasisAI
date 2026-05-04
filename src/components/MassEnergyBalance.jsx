import { useState } from 'react';
import { X, ArrowRight, Zap, Droplets, Flame, Wind, Activity, Gauge, Thermometer } from 'lucide-react';
import SankeyDiagram from './SankeyDiagram';

export default function MassEnergyBalance({ plantData, selectedEquipment, onClose }) {
  const [activeTab, setActiveTab] = useState('sankey');

  if (!plantData) return null;

  const { massBalance, energyBalance, production, equipment, physics } = plantData;

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const getStreamData = (eq) => {
    const streams = eq.streams;
    if (!streams) return { massIn: 0, massOut: 0, enthalpyIn: 0, enthalpyOut: 0 };

    let massIn = 0, massOut = 0, enthalpyIn = 0, enthalpyOut = 0;

    if (streams.inlet?.mass_kg_h) massIn = streams.inlet.mass_kg_h;
    if (streams.cold_inlet?.mass_kg_h) massIn = streams.cold_inlet.mass_kg_h;

    if (streams.outlet_liquid?.mass_kg_h) massOut += streams.outlet_liquid.mass_kg_h;
    if (streams.outlet_vapor?.mass_kg_h) massOut += streams.outlet_vapor.mass_kg_h;
    if (streams.outlet?.mass_kg_h) massOut = streams.outlet.mass_kg_h;
    if (streams.outlet_product?.mass_kg_h) massOut = streams.outlet_product.mass_kg_h;
    if (streams.outlet_power?.power_kW) massOut = streams.outlet_power.power_kW;
    if (streams.cold_outlet?.mass_kg_h) massOut = streams.cold_outlet.mass_kg_h;

    if (streams.enthalpy) {
      enthalpyIn = streams.enthalpy.inlet_MJ_h || streams.enthalpy.fuel_MJ_h || streams.enthalpy.cold_side_MJ_h || 0;
      enthalpyOut = streams.enthalpy.outlet_MJ_h ||
        ((streams.enthalpy.electrical_MJ_h || 0) + (streams.enthalpy.thermal_MJ_h || 0)) ||
        streams.enthalpy.hot_side_MJ_h || 0;
    }

    return { massIn, massOut, enthalpyIn, enthalpyOut };
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
                {plantData.inputs.capacity} TPD • {plantData.inputs.feedstock} • {plantData.inputs.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#0a0a0f] rounded-xl p-1">
              {[
                { id: 'sankey', label: 'Flow Diagram' },
                { id: 'table', label: 'Stream Table' },
                { id: 'energy', label: 'Energy Balance' },
                { id: 'parasitic', label: 'Parasitic Loads' },
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
              <div className="grid grid-cols-5 gap-4 mb-6">
                <SummaryCard
                  icon={<Droplets className="w-4 h-4" />}
                  label="Feed Rate"
                  value={`${formatNumber(physics?.mass?.feedIn)} kg/h`}
                  color="#DAA520"
                />
                <SummaryCard
                  icon={<Wind className="w-4 h-4" />}
                  label="Biogas"
                  value={`${formatNumber(physics?.volume?.biogasOut)} m³/h`}
                  color="#00ff88"
                />
                <SummaryCard
                  icon={<Flame className="w-4 h-4" />}
                  label="Biomethane"
                  value={`${formatNumber(physics?.volume?.biomethaneRNG)} m³/h`}
                  color="#ff8800"
                />
                <SummaryCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Net Power"
                  value={`${formatNumber(physics?.energy?.netPowerExport_kW)} kW`}
                  color="#ffcc00"
                />
                <SummaryCard
                  icon={<Gauge className="w-4 h-4" />}
                  label="Efficiency"
                  value={`${energyBalance?.efficiency || 0}%`}
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
                  <h3 className="font-medium text-white">Equipment Stream Summary</h3>
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
                          H In (MJ/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          H Out (MJ/h)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                          ΔH (MJ/h)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((eq, i) => {
                        const isSelected = selectedEquipment?.id === eq.id;
                        const { massIn, massOut, enthalpyIn, enthalpyOut } = getStreamData(eq);
                        const deltaH = enthalpyOut - enthalpyIn;

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
                              {formatNumber(enthalpyIn)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-[#8b5cf6]">
                              {formatNumber(enthalpyOut)}
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

              {/* Global Mass Balance */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">Mass Balance (kg/h)</h4>
                  <div className="space-y-3">
                    <BalanceRow label="Feedstock Input" value={physics?.mass?.feedIn} unit="kg/h" />
                    <BalanceRow label="Biogas Output" value={physics?.mass?.biogasOut} unit="kg/h" />
                    <BalanceRow label="Digestate Output" value={physics?.mass?.digestateOut} unit="kg/h" />
                    <BalanceRow label="Water Loss" value={physics?.mass?.waterLoss} unit="kg/h" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow
                        label="Mass Closure"
                        value={((physics?.mass?.biogasOut + physics?.mass?.digestateOut + physics?.mass?.waterLoss) / physics?.mass?.feedIn * 100).toFixed(1)}
                        unit="%"
                        highlight
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">Volumetric Flows (m³/h)</h4>
                  <div className="space-y-3">
                    <BalanceRow label="Raw Biogas" value={physics?.volume?.biogasOut} unit="m³/h" />
                    <BalanceRow label="Methane Content" value={physics?.volume?.methaneOut} unit="m³/h" />
                    <BalanceRow label="Biomethane (RNG)" value={physics?.volume?.biomethaneRNG} unit="m³/h" />
                    <BalanceRow label="CO2 Rejected" value={physics?.volume?.co2Rejected} unit="m³/h" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow
                        label="CH4 Recovery"
                        value={((physics?.volume?.biomethaneRNG / physics?.volume?.methaneOut) * 100).toFixed(1)}
                        unit="%"
                        highlight
                      />
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
                    Energy Inputs (MJ/day)
                  </h3>
                  <div className="space-y-4">
                    <EnergyBar
                      label="Feedstock Chemical Energy"
                      value={energyBalance?.inputs?.feedstock_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#DAA520"
                    />
                    <EnergyBar
                      label="Parasitic Electricity"
                      value={energyBalance?.inputs?.parasitic_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#8b5cf6"
                    />
                    <div className="pt-4 border-t border-[#2a2a38]">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Total Input Energy</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(
                            (energyBalance?.inputs?.feedstock_MJ_d || 0) +
                            (energyBalance?.inputs?.parasitic_MJ_d || 0)
                          )} MJ/d
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#00ff88] rotate-180" />
                    Energy Outputs (MJ/day)
                  </h3>
                  <div className="space-y-4">
                    <EnergyBar
                      label="Biomethane Energy"
                      value={energyBalance?.outputs?.biomethane_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#00ff88"
                    />
                    <EnergyBar
                      label="Net Electricity Export"
                      value={energyBalance?.outputs?.electricity_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#ffcc00"
                    />
                    <EnergyBar
                      label="Useful Heat"
                      value={energyBalance?.outputs?.heat_useful_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#ff8800"
                    />
                    <EnergyBar
                      label="Losses"
                      value={energyBalance?.outputs?.losses_MJ_d}
                      max={energyBalance?.inputs?.feedstock_MJ_d}
                      color="#ff4444"
                    />
                    <div className="pt-4 border-t border-[#2a2a38]">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b7280]">Total Output Energy</span>
                        <span className="text-lg font-bold text-white">
                          {formatNumber(
                            (energyBalance?.outputs?.biomethane_MJ_d || 0) +
                            (energyBalance?.outputs?.electricity_MJ_d || 0) +
                            (energyBalance?.outputs?.heat_useful_MJ_d || 0) +
                            (energyBalance?.outputs?.losses_MJ_d || 0)
                          )} MJ/d
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
                      (Biomethane + Electricity + Useful Heat) / Feedstock Energy
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#00ff88]">{energyBalance?.efficiency || 0}%</p>
                    <p className="text-sm text-[#6b7280]">Industry benchmark: 75-85%</p>
                  </div>
                </div>
                <div className="mt-4 h-3 bg-[#1a1a24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full"
                    style={{ width: `${energyBalance?.efficiency || 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parasitic' && physics?.parasiticLoads && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4 text-center">
                  <Zap className="w-6 h-6 text-[#ffcc00] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatNumber(physics.energy?.chpElectrical_kW)} kW</p>
                  <p className="text-xs text-[#6b7280]">Gross Generation</p>
                </div>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4 text-center">
                  <Gauge className="w-6 h-6 text-[#ff4444] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatNumber(physics.parasiticLoads.total)} kW</p>
                  <p className="text-xs text-[#6b7280]">Parasitic Load</p>
                </div>
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4 text-center">
                  <Zap className="w-6 h-6 text-[#00ff88] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#00ff88]">{formatNumber(physics.energy?.netPowerExport_kW)} kW</p>
                  <p className="text-xs text-[#6b7280]">Net Export</p>
                </div>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Parasitic Load Breakdown</h3>
                <div className="space-y-4">
                  <ParasiticBar
                    label="Digester Mixing"
                    value={physics.parasiticLoads.digester_mixing}
                    total={physics.parasiticLoads.total}
                    color="#00d4ff"
                  />
                  <ParasiticBar
                    label="Pumping"
                    value={physics.parasiticLoads.pumping}
                    total={physics.parasiticLoads.total}
                    color="#8b5cf6"
                  />
                  <ParasiticBar
                    label="Gas Upgrading"
                    value={physics.parasiticLoads.upgrader}
                    total={physics.parasiticLoads.total}
                    color="#00ff88"
                  />
                  <ParasiticBar
                    label="Cooling System"
                    value={physics.parasiticLoads.cooling}
                    total={physics.parasiticLoads.total}
                    color="#ff8800"
                  />
                  <ParasiticBar
                    label="Auxiliary Systems"
                    value={physics.parasiticLoads.auxiliary}
                    total={physics.parasiticLoads.total}
                    color="#6b7280"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">CHP Performance</h4>
                  <div className="space-y-3">
                    <BalanceRow label="Fuel Input" value={physics.energy?.chpFuelInput_kW} unit="kW" />
                    <BalanceRow label="Electrical Output" value={physics.energy?.chpElectrical_kW} unit="kW" />
                    <BalanceRow label="Thermal Output" value={physics.energy?.chpThermal_kW} unit="kW" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow
                        label="Parasitic Fraction"
                        value={((physics.parasiticLoads.total / physics.energy?.chpElectrical_kW) * 100).toFixed(1)}
                        unit="%"
                        highlight
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a38] p-4">
                  <h4 className="text-sm font-medium text-white mb-4">Heat Integration</h4>
                  <div className="space-y-3">
                    <BalanceRow label="CHP Heat Available" value={physics.energy?.chpThermal_kW} unit="kW" />
                    <BalanceRow label="Process Heat Demand" value={physics.energy?.totalHeatDemand_kW} unit="kW" />
                    <BalanceRow label="Heating Duty" value={physics.energy?.heatingDuty_kW} unit="kW" />
                    <BalanceRow label="Heat Losses" value={physics.energy?.heatLoss_kW} unit="kW" />
                    <div className="pt-3 border-t border-[#2a2a38]">
                      <BalanceRow
                        label="Heat Recovery"
                        value={((physics.energy?.totalHeatDemand_kW / physics.energy?.chpThermal_kW) * 100).toFixed(1)}
                        unit="%"
                        highlight
                      />
                    </div>
                  </div>
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
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-[#6b7280]'}`}>
        {label}
      </span>
      <span className={`font-mono text-sm ${highlight ? 'text-[#00ff88] font-bold' : 'text-white'}`}>
        {formatNumber(value)} {unit}
      </span>
    </div>
  );
}

function EnergyBar({ label, value, max, color }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="font-mono text-sm text-white">{formatNumber(value)} MJ/d</span>
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

function ParasiticBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-[#9ca3af]">{label}</span>
        <span className="font-mono text-sm text-white">
          {value?.toLocaleString() || 0} kW
          <span className="text-[#6b7280] ml-1">({percentage.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}
