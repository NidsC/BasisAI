import { X, Thermometer, Gauge, Clock, Droplets, Zap, Wind, ArrowRight, Flame } from 'lucide-react';

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

  const formatNumber = (num, decimals = 0) => {
    if (num === undefined || num === null) return '—';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const renderStreams = () => {
    const { streams } = equipment;
    if (!streams) return null;

    switch (equipment.type) {
      case 'digester':
        return (
          <div className="space-y-3">
            <StreamBlock
              title="Inlet Stream"
              stream={streams.inlet}
              color="#00d4ff"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <StreamBlock
              title="Liquid Outlet"
              stream={streams.outlet_liquid}
              color="#DAA520"
              icon={<Droplets className="w-3 h-3" />}
            />
            <StreamBlock
              title="Vapor Outlet"
              stream={streams.outlet_vapor}
              color="#00ff88"
              icon={<Wind className="w-3 h-3" />}
            />
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-3">
            <StreamBlock
              title="Biogas In"
              stream={streams.inlet}
              color="#00d4ff"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <StreamBlock
              title="Biogas Out"
              stream={streams.outlet}
              color="#00ff88"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      case 'chp':
        return (
          <div className="space-y-3">
            <StreamBlock
              title="Fuel Input"
              stream={streams.inlet_fuel}
              color="#ff8800"
              icon={<Flame className="w-3 h-3" />}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#ffcc00]/10 rounded-lg p-2.5 border border-[#ffcc00]/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-[#ffcc00]" />
                  <span className="text-[10px] font-medium text-[#ffcc00]">Electrical</span>
                </div>
                <p className="text-base font-bold text-white">{formatNumber(streams.outlet_power?.power_kW)} kW</p>
                <p className="text-[10px] text-[#6b7280]">{streams.outlet_power?.voltage_V}V</p>
              </div>
              <div className="bg-[#ff8800]/10 rounded-lg p-2.5 border border-[#ff8800]/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3 h-3 text-[#ff8800]" />
                  <span className="text-[10px] font-medium text-[#ff8800]">Thermal</span>
                </div>
                <p className="text-base font-bold text-white">{formatNumber(streams.outlet_heat?.thermal_kW)} kW</p>
                <p className="text-[10px] text-[#6b7280]">{streams.outlet_heat?.temp_supply_C}→{streams.outlet_heat?.temp_return_C}°C</p>
              </div>
            </div>
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      case 'upgrader':
        return (
          <div className="space-y-3">
            <StreamBlock
              title="Raw Biogas In"
              stream={streams.inlet}
              color="#00d4ff"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <StreamBlock
              title="Biomethane Out"
              stream={streams.outlet_product}
              color="#00ff88"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <StreamBlock
              title="CO2 Off-gas"
              stream={streams.outlet_offgas}
              color="#6b7280"
              icon={<Wind className="w-3 h-3" />}
            />
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      case 'heatExchanger':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#00d4ff]/10 rounded-lg p-2.5 border border-[#00d4ff]/30">
                <span className="text-[10px] font-medium text-[#00d4ff]">Cold Side</span>
                <p className="text-sm text-white mt-1">
                  {streams.cold_inlet?.temp_C}°C → {streams.cold_outlet?.temp_C}°C
                </p>
                <p className="text-[10px] text-[#6b7280]">{formatNumber(streams.cold_inlet?.mass_kg_h)} kg/h</p>
              </div>
              <div className="bg-[#ff4444]/10 rounded-lg p-2.5 border border-[#ff4444]/30">
                <span className="text-[10px] font-medium text-[#ff4444]">Hot Side</span>
                <p className="text-sm text-white mt-1">
                  {streams.hot_inlet?.temp_C}°C → {streams.hot_outlet?.temp_C}°C
                </p>
                <p className="text-[10px] text-[#6b7280]">{formatNumber(streams.hot_inlet?.thermal_kW)} kW</p>
              </div>
            </div>
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      case 'tank':
        return (
          <div className="space-y-3">
            <StreamBlock
              title="Digestate In"
              stream={streams.inlet}
              color="#DAA520"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <StreamBlock
              title="Digestate Out"
              stream={streams.outlet}
              color="#8B4513"
              icon={<ArrowRight className="w-3 h-3" />}
            />
            <EnthalpyBlock enthalpy={streams.enthalpy} />
          </div>
        );

      default:
        return null;
    }
  };

  const renderSpecs = () => {
    const { specs } = equipment;
    if (!specs) return null;

    const specItems = [];

    switch (equipment.type) {
      case 'digester':
        specItems.push(
          { icon: <Droplets />, label: 'Volume', value: `${formatNumber(specs.volume_m3)} m³` },
          { icon: <Clock />, label: 'HRT', value: `${specs.HRT_days} days` },
          { icon: <Thermometer />, label: 'Temp', value: `${specs.temperature_C}°C` },
          { icon: <Gauge />, label: 'OLR', value: `${specs.OLR_kgVS_m3_d} kg/m³/d` },
          { icon: <Zap />, label: 'Mixing', value: `${formatNumber(specs.mixing_power_kW)} kW` },
        );
        break;
      case 'storage':
        specItems.push(
          { icon: <Droplets />, label: 'Capacity', value: `${formatNumber(specs.capacity_m3)} m³` },
          { icon: <Clock />, label: 'Buffer', value: `${specs.retention_hours} hrs` },
          { icon: <Gauge />, label: 'Pressure', value: `${specs.pressure_mbar} mbar` },
        );
        break;
      case 'chp':
        specItems.push(
          { icon: <Zap />, label: 'Capacity', value: `${formatNumber(specs.capacity_kWe)} kWe` },
          { icon: <Gauge />, label: 'ηₑ', value: `${specs.electrical_eff_pct}%` },
          { icon: <Thermometer />, label: 'ηₜₕ', value: `${specs.thermal_eff_pct}%` },
          { icon: <Gauge />, label: 'ηₜₒₜ', value: `${specs.total_eff_pct}%` },
          { icon: <Wind />, label: 'NOx', value: `${specs.NOx_mg_Nm3} mg/Nm³` },
        );
        break;
      case 'upgrader':
        specItems.push(
          { icon: <Droplets />, label: 'Capacity', value: `${formatNumber(specs.capacity_m3_h)} m³/h` },
          { icon: <Gauge />, label: 'Recovery', value: `${specs.methane_recovery_pct}%` },
          { icon: <Wind />, label: 'Purity', value: `${specs.product_purity_pct}%` },
          { icon: <Gauge />, label: 'P out', value: `${specs.outlet_pressure_bar} bar` },
          { icon: <Zap />, label: 'Power', value: `${formatNumber(specs.power_consumption_kW)} kW` },
        );
        break;
      case 'heatExchanger':
        specItems.push(
          { icon: <Thermometer />, label: 'Duty', value: `${formatNumber(specs.duty_kW)} kW` },
          { icon: <Droplets />, label: 'Area', value: `${formatNumber(specs.area_m2)} m²` },
          { icon: <Thermometer />, label: 'LMTD', value: `${specs.LMTD_C}°C` },
          { icon: <Gauge />, label: 'U', value: `${specs.U_W_m2K} W/m²K` },
        );
        break;
      case 'tank':
        specItems.push(
          { icon: <Droplets />, label: 'Volume', value: `${formatNumber(specs.volume_m3)} m³` },
          { icon: <Clock />, label: 'Storage', value: `${specs.retention_days} days` },
          { icon: <Wind />, label: 'N', value: `${specs.nutrient_N_pct}%` },
          { icon: <Wind />, label: 'P', value: `${specs.nutrient_P_pct}%` },
        );
        break;
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {specItems.map((item, i) => (
          <SpecItem key={i} icon={item.icon} label={item.label} value={item.value} />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute top-4 right-4 w-[400px] glass-panel rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a38] max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
        style={{ background: `linear-gradient(135deg, ${color}15 0%, #12121a 100%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            {typeIcons[equipment.type]}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{equipment.name}</h3>
            <p className="text-[10px] text-[#6b7280]">ID: {equipment.id.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[#2a2a38] hover:bg-[#3a3a48] flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#9ca3af]" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Function */}
        <div>
          <h4 className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">
            Function
          </h4>
          <p className="text-xs text-[#d1d5db] leading-relaxed">{equipment.function}</p>
        </div>

        {/* Stream Data */}
        <div>
          <h4 className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wider mb-2">
            Stream Data
          </h4>
          {renderStreams()}
        </div>

        {/* Specifications */}
        <div>
          <h4 className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wider mb-2">
            Design Specifications
          </h4>
          {renderSpecs()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-[#0a0a0f] border-t border-[#2a2a38] flex items-center justify-between sticky bottom-0">
        <span className="text-[10px] text-[#4b5563]">Mass/Energy: Balanced</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[10px] text-[#00ff88]">Online</span>
        </div>
      </div>
    </div>
  );
}

function StreamBlock({ title, stream, color, icon }) {
  if (!stream) return null;

  const formatNumber = (num, decimals = 1) => {
    if (num === undefined || num === null) return '—';
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  return (
    <div
      className="rounded-lg p-2.5"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-medium" style={{ color }}>{title}</span>
        {stream.phase && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0a0a0f] text-[#6b7280]">
            {stream.phase}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
        {stream.mass_kg_h !== undefined && (
          <DataRow label="Mass" value={`${formatNumber(stream.mass_kg_h)} kg/h`} />
        )}
        {stream.volume_m3_h !== undefined && (
          <DataRow label="Vol" value={`${formatNumber(stream.volume_m3_h)} m³/h`} />
        )}
        {stream.temp_C !== undefined && (
          <DataRow label="T" value={`${formatNumber(stream.temp_C, 0)}°C`} />
        )}
        {stream.pressure_bar !== undefined && (
          <DataRow label="P" value={`${formatNumber(stream.pressure_bar)} bar`} />
        )}
        {stream.LHV_MJ_m3 !== undefined && (
          <DataRow label="LHV" value={`${formatNumber(stream.LHV_MJ_m3)} MJ/m³`} />
        )}
      </div>
      {stream.composition && (
        <div className="mt-1.5 pt-1.5 border-t border-[#2a2a38]">
          <span className="text-[9px] text-[#4b5563]">Comp: </span>
          <span className="text-[9px] text-[#9ca3af]">
            {Object.entries(stream.composition)
              .slice(0, 4)
              .map(([k, v]) => `${k}:${typeof v === 'number' ? v.toFixed(1) : v}%`)
              .join(' ')}
          </span>
        </div>
      )}
    </div>
  );
}

function EnthalpyBlock({ enthalpy }) {
  if (!enthalpy) return null;

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const entries = [];
  if (enthalpy.inlet_MJ_h !== undefined) entries.push({ label: 'H in', value: enthalpy.inlet_MJ_h, color: '#00d4ff' });
  if (enthalpy.outlet_MJ_h !== undefined) entries.push({ label: 'H out', value: enthalpy.outlet_MJ_h, color: '#00ff88' });
  if (enthalpy.fuel_MJ_h !== undefined) entries.push({ label: 'Fuel', value: enthalpy.fuel_MJ_h, color: '#ff8800' });
  if (enthalpy.electrical_MJ_h !== undefined) entries.push({ label: 'Elec', value: enthalpy.electrical_MJ_h, color: '#ffcc00' });
  if (enthalpy.thermal_MJ_h !== undefined) entries.push({ label: 'Heat', value: enthalpy.thermal_MJ_h, color: '#ff8800' });
  if (enthalpy.duty_MJ_h !== undefined) entries.push({ label: 'Duty', value: enthalpy.duty_MJ_h, color: '#8b5cf6' });
  if (enthalpy.loss_MJ_h !== undefined) entries.push({ label: 'Loss', value: enthalpy.loss_MJ_h, color: '#ff4444' });
  if (enthalpy.compression_MJ_h !== undefined) entries.push({ label: 'Comp', value: enthalpy.compression_MJ_h, color: '#8b5cf6' });

  return (
    <div className="bg-[#0a0a0f] rounded-lg p-2.5 border border-[#2a2a38]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Flame className="w-3 h-3 text-[#ff8800]" />
        <span className="text-[10px] font-medium text-[#ff8800]">Energy Balance (MJ/h)</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {entries.map((e, i) => (
          <div key={i} className="text-center">
            <p className="text-[9px] text-[#6b7280]">{e.label}</p>
            <p className="text-xs font-mono font-medium" style={{ color: e.color }}>{formatNumber(e.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataRow({ label, value, color = '#9ca3af' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b7280]">{label}</span>
      <span className="font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <div className="bg-[#0a0a0f] rounded-lg p-2 flex items-center gap-2">
      <div className="w-5 h-5 rounded bg-[#1a1a24] flex items-center justify-center text-[#00d4ff] shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] text-[#6b7280]">{label}</p>
        <p className="text-[11px] font-medium text-white truncate">{value}</p>
      </div>
    </div>
  );
}
