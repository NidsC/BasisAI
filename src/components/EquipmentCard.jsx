import { X, Thermometer, Gauge, Clock, Droplets, Zap, Wind } from 'lucide-react';

const typeIcons = {
  digester: '🔬',
  storage: '🎈',
  chp: '⚡',
  upgrader: '🧪',
  heatExchanger: '🔥',
  tank: '🛢️',
};

const typeColors = {
  digester: '#00d4ff',
  storage: '#00ff88',
  chp: '#ff8800',
  upgrader: '#8b5cf6',
  heatExchanger: '#ff4444',
  tank: '#DAA520',
};

export default function EquipmentCard({ equipment, onClose }) {
  if (!equipment) return null;

  const color = typeColors[equipment.type] || '#00d4ff';

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num?.toLocaleString() || '—';
  };

  const renderSpecs = () => {
    const specs = equipment.specs;
    if (!specs) return null;

    switch (equipment.type) {
      case 'digester':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Droplets />} label="Volume" value={`${formatNumber(specs.volume)} m³`} />
            <SpecItem icon={<Clock />} label="HRT" value={`${specs.hrt} days`} />
            <SpecItem icon={<Thermometer />} label="Temperature" value={`${specs.temperature}°C`} />
            <SpecItem icon={<Gauge />} label="OLR" value={`${specs.loading} kg VS/m³/d`} />
          </div>
        );
      case 'storage':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Droplets />} label="Capacity" value={`${formatNumber(specs.capacity)} m³`} />
            <SpecItem icon={<Gauge />} label="Pressure" value={`${specs.pressure} mbar`} />
            <SpecItem icon={<Clock />} label="Retention" value={`${specs.retention} hrs`} />
          </div>
        );
      case 'chp':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Zap />} label="Capacity" value={`${formatNumber(specs.capacity)} kWe`} />
            <SpecItem icon={<Zap />} label="Elec. Eff." value={`${specs.electricalEff}%`} />
            <SpecItem icon={<Thermometer />} label="Thermal Eff." value={`${specs.thermalEff}%`} />
            <SpecItem icon={<Wind />} label="NOx" value={`${specs.nox} mg/Nm³`} />
          </div>
        );
      case 'upgrader':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Droplets />} label="Capacity" value={`${formatNumber(specs.capacity)} m³/d`} />
            <SpecItem icon={<Gauge />} label="CH4 Recovery" value={`${specs.methaneRecovery}%`} />
            <SpecItem icon={<Wind />} label="Purity" value={`${specs.purity}%`} />
            <SpecItem icon={<Gauge />} label="Pressure" value={`${specs.pressure} bar`} />
          </div>
        );
      case 'heatExchanger':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Thermometer />} label="Duty" value={`${formatNumber(specs.duty)} MJ/h`} />
            <SpecItem icon={<Droplets />} label="Area" value={`${formatNumber(specs.area)} m²`} />
            <SpecItem icon={<Thermometer />} label="LMTD" value={`${specs.lmtd}°C`} />
          </div>
        );
      case 'tank':
        return (
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Droplets />} label="Volume" value={`${formatNumber(specs.volume)} m³`} />
            <SpecItem icon={<Wind />} label="Covered" value={specs.covered ? 'Yes' : 'No'} />
            <SpecItem icon={<Thermometer />} label="N Content" value={`${specs.nutrients?.N}%`} />
            <SpecItem icon={<Thermometer />} label="P Content" value={`${specs.nutrients?.P}%`} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-4 right-4 w-96 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a38] animate-in slide-in-from-right duration-300">
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            {typeIcons[equipment.type]}
          </div>
          <div>
            <h3 className="font-semibold text-white">{equipment.name}</h3>
            <p className="text-xs text-[#6b7280]">Equipment ID: {equipment.id.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[#2a2a38] hover:bg-[#3a3a48] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-[#9ca3af]" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <h4 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
            Function
          </h4>
          <p className="text-sm text-[#d1d5db] leading-relaxed">{equipment.function}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
            Stream Data
          </h4>
          <div className="bg-[#0a0a0f] rounded-xl p-4 space-y-3">
            <StreamRow
              label="Mass In"
              value={equipment.streams.massIn || equipment.streams.coldIn || equipment.streams.biogasIn}
              unit="kg/h"
              color="#00d4ff"
            />
            <StreamRow
              label="Mass Out"
              value={equipment.streams.massOut || equipment.streams.coldOut || equipment.streams.biomethaneOut || equipment.streams.powerOut}
              unit={equipment.streams.powerOut ? 'kW' : 'kg/h'}
              color="#00ff88"
            />
            <div className="border-t border-[#2a2a38] pt-3 mt-3">
              <StreamRow
                label="Enthalpy In"
                value={equipment.streams.enthalpyIn}
                unit="MJ/h"
                color="#ff8800"
              />
              <StreamRow
                label="Enthalpy Out"
                value={equipment.streams.enthalpyOut}
                unit="MJ/h"
                color="#8b5cf6"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
            Specifications
          </h4>
          {renderSpecs()}
        </div>
      </div>

      <div className="px-5 py-3 bg-[#0a0a0f] border-t border-[#2a2a38] flex items-center justify-between">
        <span className="text-xs text-[#4b5563]">Last updated: Real-time</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-xs text-[#00ff88]">Online</span>
        </div>
      </div>
    </div>
  );
}

function StreamRow({ label, value, unit, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm" style={{ color }}>
          {value?.toLocaleString() || '—'}
        </span>
        <span className="text-xs text-[#4b5563]">{unit}</span>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <div className="bg-[#0a0a0f] rounded-lg p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center text-[#00d4ff]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#6b7280]">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
