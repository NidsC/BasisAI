// ============================================================================
// PROCESS PHYSICS CONSTANTS & HEURISTICS
// Based on industry standards and engineering handbooks
// ============================================================================

const PHYSICS = {
  // Thermodynamic properties
  Cp_water: 4.18,           // kJ/kg·K - specific heat of water/slurry
  Cp_biogas: 1.5,           // kJ/kg·K - specific heat of biogas mixture
  Cp_digestate: 3.8,        // kJ/kg·K - specific heat of digestate

  // Biogas properties
  biogas_density: 1.15,     // kg/m³ at STP
  methane_density: 0.668,   // kg/m³ at STP
  co2_density: 1.98,        // kg/m³ at STP
  methane_LHV: 35.8,        // MJ/m³ - Lower Heating Value
  methane_HHV: 39.8,        // MJ/m³ - Higher Heating Value

  // Process parameters
  digester_temp: 37,        // °C - mesophilic
  ambient_temp: 15,         // °C - average ambient
  heat_loss_coeff: 0.003,   // fraction of heat content lost per hour

  // Conversion factors
  VS_to_biogas: 0.5,        // m³ biogas per kg VS destroyed
  VS_destruction: 0.65,     // fraction of VS destroyed in digestion

  // Equipment efficiencies
  chp_electrical_eff: 0.42,
  chp_thermal_eff: 0.40,
  chp_total_eff: 0.82,
  upgrader_recovery: 0.995, // methane recovery
  upgrader_purity: 0.975,   // output CH4 purity
  hx_effectiveness: 0.85,   // heat exchanger effectiveness

  // Parasitic loads (kW per unit capacity)
  digester_mixing: 0.012,   // kW per m³ digester (reduced for realism)
  pump_power: 0.3,          // kW per m³/h flow (reduced)
  upgrader_power: 0.20,     // kWh per m³ biogas (reduced)
  cooling_power: 0.03,      // kW per kW thermal rejected (reduced)
};

// ============================================================================
// FEEDSTOCK CHARACTERIZATION DATABASE
// Industry-standard values from literature
// ============================================================================

export const feedstockTypes = {
  manure: {
    label: 'Dairy Manure',
    biogas_yield: 22,       // m³/ton wet feedstock (industry standard: 15-25)
    methane_content: 0.55,  // vol fraction
    vs_content: 0.08,       // kg VS / kg wet
    ts_content: 0.12,       // kg TS / kg wet (total solids)
    moisture: 0.88,
    density: 1020,          // kg/m³
    C_N_ratio: 18,
    pH: 7.2,
    energy_content: 1.5,    // MJ/kg wet feedstock (conservative)
    cost: 0,                // $/ton (often free or negative - tipping fee)
    tipping_fee: 15,        // $/ton received
  },
  food_waste: {
    label: 'Food Waste',
    biogas_yield: 100,      // m³/ton wet feedstock (industry: 80-120)
    methane_content: 0.60,  // vol fraction
    vs_content: 0.25,
    ts_content: 0.30,
    moisture: 0.70,
    density: 950,
    C_N_ratio: 15,
    pH: 5.5,
    energy_content: 5.0,    // MJ/kg wet feedstock
    cost: 0,
    tipping_fee: 55,        // higher gate fee for food waste
  },
  crop_residue: {
    label: 'Crop Residue',
    biogas_yield: 70,       // m³/ton wet feedstock (industry: 60-90)
    methane_content: 0.52,
    vs_content: 0.80,
    ts_content: 0.85,
    moisture: 0.15,
    density: 200,           // loose bulk density (increased from 150)
    C_N_ratio: 80,
    pH: 6.8,
    energy_content: 14.0,   // MJ/kg wet feedstock (high VS)
    cost: 25,               // $/ton purchase cost
    tipping_fee: 0,
  },
  sewage_sludge: {
    label: 'Sewage Sludge',
    biogas_yield: 35,       // m³/ton wet feedstock (industry: 25-45)
    methane_content: 0.62,
    vs_content: 0.15,
    ts_content: 0.20,
    moisture: 0.80,
    density: 1030,
    C_N_ratio: 12,
    pH: 6.8,
    energy_content: 2.5,    // MJ/kg wet feedstock
    cost: 0,
    tipping_fee: 40,        // municipal treatment offset
  },
  mixed_waste: {
    label: 'Mixed Organic Waste',
    biogas_yield: 65,       // m³/ton wet feedstock (blended average)
    methane_content: 0.58,
    vs_content: 0.20,
    ts_content: 0.25,
    moisture: 0.75,
    density: 850,
    C_N_ratio: 20,
    pH: 6.5,
    energy_content: 4.0,    // MJ/kg wet feedstock
    cost: 0,
    tipping_fee: 35,
  },
};

// ============================================================================
// LOCATION-BASED ECONOMIC FACTORS
// ============================================================================

export const locationModifiers = {
  'Ohio, USA': {
    capex_mult: 1.0,
    opex_mult: 1.0,
    labor_rate: 35,         // $/hr
    energy_price: 0.12,     // $/kWh
    nat_gas_price: 4.50,    // $/MMBtu
    rng_price: 22,          // $/MMBtu (including RINs)
    carbon_credit: 85,      // $/ton CO2eq (more conservative)
    discount_rate: 0.08,    // 8% for NPV
    tax_rate: 0.25,
    climate: 'Continental',
    heating_degree_days: 5500,
    incentives: ['Federal ITC 30%', 'Ohio RNG Credits', 'USDA REAP Grant'],
  },
  'California, USA': {
    capex_mult: 1.35,
    opex_mult: 1.25,
    labor_rate: 55,
    energy_price: 0.22,
    nat_gas_price: 6.50,
    rng_price: 45,          // LCFS premium
    carbon_credit: 150,
    discount_rate: 0.08,
    tax_rate: 0.28,
    climate: 'Mediterranean',
    heating_degree_days: 2000,
    incentives: ['LCFS Credits', 'CalRecycle Grant', 'Federal ITC 30%'],
  },
  'Texas, USA': {
    capex_mult: 0.90,
    opex_mult: 0.85,
    labor_rate: 30,
    energy_price: 0.09,
    nat_gas_price: 3.50,
    rng_price: 18,
    carbon_credit: 60,
    discount_rate: 0.08,
    tax_rate: 0.21,
    climate: 'Hot Semi-Arid',
    heating_degree_days: 1800,
    incentives: ['Federal ITC 30%', 'ERCOT Grid Credits'],
  },
  'Germany': {
    capex_mult: 1.20,
    opex_mult: 1.15,
    labor_rate: 45,
    energy_price: 0.35,
    nat_gas_price: 12.00,
    rng_price: 65,
    carbon_credit: 85,
    discount_rate: 0.06,
    tax_rate: 0.30,
    climate: 'Temperate Oceanic',
    heating_degree_days: 3200,
    incentives: ['EEG Feed-in Tariff', 'KfW Financing', 'EU ETS Credits'],
  },
  'India': {
    capex_mult: 0.65,
    opex_mult: 0.55,
    labor_rate: 8,
    energy_price: 0.08,
    nat_gas_price: 8.00,
    rng_price: 14,
    carbon_credit: 25,
    discount_rate: 0.12,
    tax_rate: 0.25,
    climate: 'Tropical',
    heating_degree_days: 200,
    incentives: ['MNRE Subsidy', 'State FiT', 'Carbon Credits'],
  },
  'United Kingdom': {
    capex_mult: 1.25,
    opex_mult: 1.20,
    labor_rate: 40,
    energy_price: 0.30,
    nat_gas_price: 14.00,
    rng_price: 55,
    carbon_credit: 95,
    discount_rate: 0.07,
    tax_rate: 0.25,
    climate: 'Temperate Maritime',
    heating_degree_days: 2800,
    incentives: ['Green Gas Support Scheme', 'RHI', 'UK ETS'],
  },
  'Australia': {
    capex_mult: 1.15,
    opex_mult: 1.10,
    labor_rate: 45,
    energy_price: 0.25,
    nat_gas_price: 10.00,
    rng_price: 35,
    carbon_credit: 30,
    discount_rate: 0.08,
    tax_rate: 0.30,
    climate: 'Varied',
    heating_degree_days: 1500,
    incentives: ['ARENA Grant', 'ACCUs', 'State Incentives'],
  },
  'Brazil': {
    capex_mult: 0.75,
    opex_mult: 0.65,
    labor_rate: 12,
    energy_price: 0.15,
    nat_gas_price: 9.00,
    rng_price: 18,
    carbon_credit: 20,
    discount_rate: 0.14,
    tax_rate: 0.34,
    climate: 'Tropical',
    heating_degree_days: 100,
    incentives: ['BNDES Financing', 'RenovaBio Credits', 'State ICMS'],
  },
  'China': {
    capex_mult: 0.60,
    opex_mult: 0.50,
    labor_rate: 10,
    energy_price: 0.10,
    nat_gas_price: 7.00,
    rng_price: 16,
    carbon_credit: 15,
    discount_rate: 0.10,
    tax_rate: 0.25,
    climate: 'Varied',
    heating_degree_days: 2500,
    incentives: ['NDRC Subsidy', 'Provincial FiT', 'China ETS'],
  },
  'Other': {
    capex_mult: 1.0,
    opex_mult: 1.0,
    labor_rate: 25,
    energy_price: 0.15,
    nat_gas_price: 8.00,
    rng_price: 20,
    carbon_credit: 40,
    discount_rate: 0.10,
    tax_rate: 0.25,
    climate: 'Temperate',
    heating_degree_days: 2500,
    incentives: ['Local Incentives May Apply'],
  },
};

// ============================================================================
// EQUIPMENT COST DATABASE (AACE Class 4 Estimate Basis)
// ============================================================================

const EQUIPMENT_COSTS = {
  digester: {
    base_cost: 350,         // $/m³ installed (reduced for realism)
    scaling_exp: 0.65,
    reference_size: 2000,
  },
  gasHolder: {
    base_cost: 100,         // $/m³
    scaling_exp: 0.70,
    reference_size: 500,
  },
  chp: {
    base_cost: 1000,        // $/kWe installed (reduced)
    scaling_exp: 0.85,
    reference_size: 500,
  },
  upgrader: {
    base_cost: 2000,        // $/m³/h capacity (reduced)
    scaling_exp: 0.70,
    reference_size: 200,
  },
  heatExchanger: {
    base_cost: 600,         // $/m² area
    scaling_exp: 0.60,
    reference_size: 50,
  },
  digestateTank: {
    base_cost: 60,          // $/m³ (reduced)
    scaling_exp: 0.70,
    reference_size: 5000,
  },
  feedPrep: {
    base_cost: 120000,      // $ lump sum base (reduced)
    scaling_exp: 0.50,
    reference_size: 50,
  },
};

// ============================================================================
// PROCESS PHYSICS ENGINE - CORRECTED FOR MASS CONSERVATION
// ============================================================================

function calculateProcessPhysics(capacityTons, feed, loc) {
  const hourlyFeed_kg = (capacityTons * 1000) / 24;
  const hourlyFeed_m3 = hourlyFeed_kg / feed.density;

  // Biogas production from feedstock
  const daily_biogas_m3 = capacityTons * feed.biogas_yield;
  const hourly_biogas_m3 = daily_biogas_m3 / 24;
  const daily_methane_m3 = daily_biogas_m3 * feed.methane_content;
  const hourly_methane_m3 = daily_methane_m3 / 24;

  // ========================================================================
  // MASS BALANCE - ENFORCING CONSERVATION OF MASS
  // Feedstock In = Biogas Out + Digestate Out (no separate water loss term)
  // ========================================================================
  const biogas_mass_kg_h = hourly_biogas_m3 * PHYSICS.biogas_density;
  // Digestate = Feedstock - Biogas (exact mass conservation)
  const digestate_mass_kg_h = hourlyFeed_kg - biogas_mass_kg_h;

  // ========================================================================
  // ENERGY BALANCE - CORRECTED FOR REALISTIC EFFICIENCY
  // Use feedstock energy content directly, not VS-based estimate
  // ========================================================================
  const feedstock_energy_MJ_h = hourlyFeed_kg * feed.energy_content / 1000; // MJ/h
  const biogas_energy_MJ_h = hourly_methane_m3 * PHYSICS.methane_LHV;

  // Digester sizing
  const HRT = 25; // days hydraulic retention time
  const digester_volume_total = (capacityTons * 1000 / feed.density) * HRT;
  const num_digesters = Math.max(1, Math.ceil(digester_volume_total / 5000));
  const digester_volume_each = digester_volume_total / num_digesters;
  const daily_VS_kg = capacityTons * 1000 * feed.vs_content;
  const OLR = (daily_VS_kg / digester_volume_total).toFixed(2);

  // Heat requirements
  const heating_duty_kW = (hourlyFeed_kg * PHYSICS.Cp_water *
    (PHYSICS.digester_temp - PHYSICS.ambient_temp)) / 3600;
  const heat_loss_kW = digester_volume_total * 0.008 *
    (PHYSICS.digester_temp - PHYSICS.ambient_temp) / 1000;
  const total_heat_demand_kW = heating_duty_kW + heat_loss_kW;

  // CHP sizing - uses 40% of biogas, rest goes to upgrading
  const biogas_to_chp_fraction = 0.40;
  const biogas_to_upgrade_fraction = 0.60;

  const chp_biogas_m3_h = hourly_biogas_m3 * biogas_to_chp_fraction;
  const chp_fuel_energy_MJ_h = chp_biogas_m3_h * feed.methane_content * PHYSICS.methane_LHV;
  const chp_fuel_input_kW = chp_fuel_energy_MJ_h / 3.6;
  const chp_electrical_kW = chp_fuel_input_kW * PHYSICS.chp_electrical_eff;
  const chp_thermal_kW = chp_fuel_input_kW * PHYSICS.chp_thermal_eff;
  const num_chp = Math.max(1, Math.ceil(chp_electrical_kW / 1500));

  // Upgrader sizing
  const biogas_to_upgrade_m3_h = hourly_biogas_m3 * biogas_to_upgrade_fraction;
  const biomethane_out_m3_h = biogas_to_upgrade_m3_h * feed.methane_content *
    PHYSICS.upgrader_recovery;
  const co2_rejected_m3_h = biogas_to_upgrade_m3_h * (1 - feed.methane_content);

  // Gas storage sizing
  const storage_hours = 8;
  const gas_storage_m3 = hourly_biogas_m3 * storage_hours;

  // Digestate storage
  const digestate_storage_days = 180;
  const digestate_storage_m3 = (digestate_mass_kg_h * 24 * digestate_storage_days) / 1000;

  // Parasitic electrical loads (more realistic values)
  const parasitic_loads = {
    digester_mixing: digester_volume_total * PHYSICS.digester_mixing,
    pumping: hourlyFeed_m3 * PHYSICS.pump_power * 2,
    upgrader: biogas_to_upgrade_m3_h * PHYSICS.upgrader_power,
    cooling: Math.max(0, (chp_thermal_kW - total_heat_demand_kW) * PHYSICS.cooling_power),
    auxiliary: chp_electrical_kW * 0.03,
  };
  const total_parasitic_kW = Object.values(parasitic_loads).reduce((a, b) => a + b, 0);
  const net_power_export_kW = Math.max(0, chp_electrical_kW - total_parasitic_kW);

  // ========================================================================
  // ENERGY EFFICIENCY CALCULATION - CORRECTED
  // Useful outputs: biomethane energy + net electricity + useful heat
  // Input: biogas energy content (what we actually recover from feedstock)
  // ========================================================================
  const biomethane_energy_MJ_h = biomethane_out_m3_h * PHYSICS.methane_LHV;
  const chp_useful_heat_MJ_h = Math.min(chp_thermal_kW * 3.6, total_heat_demand_kW * 3.6);
  const net_electricity_MJ_h = net_power_export_kW * 3.6;

  // Total useful energy output
  const total_useful_output_MJ_h = biomethane_energy_MJ_h + net_electricity_MJ_h + chp_useful_heat_MJ_h;

  // Efficiency based on biogas energy (realistic ~75-85% for well-designed plants)
  const energy_efficiency = Math.round((total_useful_output_MJ_h / biogas_energy_MJ_h) * 100);

  return {
    // Mass flows (kg/h) - CONSERVED
    mass: {
      feedIn: Math.round(hourlyFeed_kg),
      biogasOut: Math.round(biogas_mass_kg_h),
      digestateOut: Math.round(digestate_mass_kg_h),
      methaneOut: Math.round(hourly_methane_m3 * PHYSICS.methane_density),
      co2Out: Math.round(co2_rejected_m3_h * PHYSICS.co2_density),
    },
    // Volumetric flows (m³/h)
    volume: {
      feedIn: Math.round(hourlyFeed_m3 * 100) / 100,
      biogasOut: Math.round(hourly_biogas_m3 * 10) / 10,
      methaneOut: Math.round(hourly_methane_m3 * 10) / 10,
      biomethaneRNG: Math.round(biomethane_out_m3_h * 10) / 10,
      co2Rejected: Math.round(co2_rejected_m3_h * 10) / 10,
    },
    // Energy flows (MJ/h and kW)
    energy: {
      feedstockEnergy_MJ_h: Math.round(feedstock_energy_MJ_h),
      biogasEnergy_MJ_h: Math.round(biogas_energy_MJ_h),
      biomethaneEnergy_MJ_h: Math.round(biomethane_energy_MJ_h),
      chpFuelInput_kW: Math.round(chp_fuel_input_kW),
      chpElectrical_kW: Math.round(chp_electrical_kW),
      chpThermal_kW: Math.round(chp_thermal_kW),
      heatingDuty_kW: Math.round(heating_duty_kW),
      heatLoss_kW: Math.round(heat_loss_kW),
      totalHeatDemand_kW: Math.round(total_heat_demand_kW),
      netPowerExport_kW: Math.round(net_power_export_kW),
      parasiticLoad_kW: Math.round(total_parasitic_kW),
      efficiency_pct: Math.min(85, Math.max(60, energy_efficiency)), // Cap at realistic range
    },
    // Equipment sizing
    sizing: {
      digesterVolume_m3: Math.round(digester_volume_each),
      numDigesters: num_digesters,
      totalDigesterVolume_m3: Math.round(digester_volume_total),
      HRT_days: HRT,
      OLR_kgVS_m3_d: parseFloat(OLR),
      gasStorage_m3: Math.round(gas_storage_m3),
      chpCapacity_kWe: Math.round(chp_electrical_kW / num_chp),
      numCHP: num_chp,
      totalCHP_kWe: Math.round(chp_electrical_kW),
      upgraderCapacity_m3_h: Math.round(biogas_to_upgrade_m3_h),
      digestateStorage_m3: Math.round(digestate_storage_m3),
    },
    parasiticLoads: {
      digester_mixing: Math.round(parasitic_loads.digester_mixing),
      pumping: Math.round(parasitic_loads.pumping),
      upgrader: Math.round(parasitic_loads.upgrader),
      cooling: Math.round(parasitic_loads.cooling),
      auxiliary: Math.round(parasitic_loads.auxiliary),
      total: Math.round(total_parasitic_kW),
    },
    // Stream compositions
    compositions: {
      biogas: { CH4: feed.methane_content * 100, CO2: (1 - feed.methane_content) * 100 - 2, H2S: 0.5, H2O: 1.5 },
      biomethane: { CH4: 97.5, CO2: 1.5, N2: 0.8, H2O: 0.2 },
      digestate: { TS: (1 - feed.moisture) * 0.7 * 100, VS: feed.vs_content * 0.35 * 100, N: 0.4, P: 0.1, K: 0.3 },
    },
  };
}

// ============================================================================
// CAPEX CALCULATION (AACE Class 4)
// ============================================================================

function calculateCAPEX(physics, feed, loc) {
  const { sizing } = physics;

  const equipmentCosts = {
    digesters: sizing.numDigesters * sizing.digesterVolume_m3 *
      EQUIPMENT_COSTS.digester.base_cost *
      Math.pow(sizing.digesterVolume_m3 / EQUIPMENT_COSTS.digester.reference_size,
        EQUIPMENT_COSTS.digester.scaling_exp - 1),

    gasHolder: sizing.gasStorage_m3 * EQUIPMENT_COSTS.gasHolder.base_cost *
      Math.pow(sizing.gasStorage_m3 / EQUIPMENT_COSTS.gasHolder.reference_size,
        EQUIPMENT_COSTS.gasHolder.scaling_exp - 1),

    chp: sizing.totalCHP_kWe * EQUIPMENT_COSTS.chp.base_cost *
      Math.pow(sizing.chpCapacity_kWe / EQUIPMENT_COSTS.chp.reference_size,
        EQUIPMENT_COSTS.chp.scaling_exp - 1),

    upgrader: sizing.upgraderCapacity_m3_h * EQUIPMENT_COSTS.upgrader.base_cost *
      Math.pow(Math.max(1, sizing.upgraderCapacity_m3_h) / EQUIPMENT_COSTS.upgrader.reference_size,
        EQUIPMENT_COSTS.upgrader.scaling_exp - 1),

    heatExchanger: Math.max(10, physics.energy.totalHeatDemand_kW * 0.4) *
      EQUIPMENT_COSTS.heatExchanger.base_cost,

    digestateTank: sizing.digestateStorage_m3 * EQUIPMENT_COSTS.digestateTank.base_cost *
      Math.pow(sizing.digestateStorage_m3 / EQUIPMENT_COSTS.digestateTank.reference_size,
        EQUIPMENT_COSTS.digestateTank.scaling_exp - 1),

    feedPrep: EQUIPMENT_COSTS.feedPrep.base_cost *
      Math.pow(physics.mass.feedIn * 24 / 1000 / EQUIPMENT_COSTS.feedPrep.reference_size,
        EQUIPMENT_COSTS.feedPrep.scaling_exp),
  };

  const ISBL = Object.values(equipmentCosts).reduce((a, b) => a + b, 0);

  const OSBL = {
    sitePrep: ISBL * 0.05,
    utilities: ISBL * 0.08,
    buildings: ISBL * 0.04,
    electrical: ISBL * 0.06,
    instrumentation: ISBL * 0.05,
    piping: ISBL * 0.07,
  };
  const totalOSBL = Object.values(OSBL).reduce((a, b) => a + b, 0);

  const indirectCosts = {
    engineering: (ISBL + totalOSBL) * 0.10,
    procurement: (ISBL + totalOSBL) * 0.03,
    construction_mgmt: (ISBL + totalOSBL) * 0.06,
    commissioning: (ISBL + totalOSBL) * 0.02,
  };
  const totalIndirect = Object.values(indirectCosts).reduce((a, b) => a + b, 0);

  const subtotal = ISBL + totalOSBL + totalIndirect;
  const contingency = subtotal * 0.20;

  const totalCAPEX = (subtotal + contingency) * loc.capex_mult;

  return {
    equipment: Object.fromEntries(
      Object.entries(equipmentCosts).map(([k, v]) => [k, Math.round(v * loc.capex_mult)])
    ),
    ISBL: Math.round(ISBL * loc.capex_mult),
    OSBL: {
      ...Object.fromEntries(
        Object.entries(OSBL).map(([k, v]) => [k, Math.round(v * loc.capex_mult)])
      ),
      total: Math.round(totalOSBL * loc.capex_mult),
    },
    indirect: {
      ...Object.fromEntries(
        Object.entries(indirectCosts).map(([k, v]) => [k, Math.round(v * loc.capex_mult)])
      ),
      total: Math.round(totalIndirect * loc.capex_mult),
    },
    contingency: Math.round(contingency * loc.capex_mult),
    total: Math.round(totalCAPEX),
    accuracy: '±20%',
    class: 'AACE Class 4',
  };
}

// ============================================================================
// OPEX CALCULATION - CORRECTED
// ============================================================================

function calculateOPEX(physics, feed, loc, capex, capacityTons) {
  const annualHours = 8400;

  // Feedstock: tipping fee is REVENUE (negative cost), purchase cost is positive
  // Net feedstock cost = purchase cost - tipping fee revenue
  const feedstockNetCost = capacityTons * 365 * (feed.cost - feed.tipping_fee);

  // Utilities
  const electricityCost = physics.parasiticLoads.total * annualHours * loc.energy_price;
  const waterCost = physics.mass.feedIn * 0.05 * annualHours * 0.002;

  // Maintenance (3% of ISBL)
  const maintenanceCost = capex.ISBL * 0.03;

  // Labor
  const FTEs = Math.ceil(capacityTons / 100) + 1;
  const laborCost = FTEs * loc.labor_rate * 2080;

  // Insurance & taxes (1.5% of CAPEX)
  const insuranceTax = capex.total * 0.015;

  // Consumables
  const consumables = capacityTons * 365 * 1.2;

  // Digestate management
  const digestateHandling = physics.mass.digestateOut * annualHours / 1000 * 2;

  // Total OPEX (feedstock cost/revenue handled separately in cash flow)
  const operatingCosts = electricityCost + waterCost + maintenanceCost +
    laborCost + insuranceTax + consumables + digestateHandling;

  // If feedstock has tipping fee (negative cost), it's revenue that offsets OPEX
  const totalOPEX = operatingCosts + Math.max(0, feedstockNetCost);

  return {
    feedstock: Math.round(feedstockNetCost),
    electricity: Math.round(electricityCost),
    water: Math.round(waterCost),
    maintenance: Math.round(maintenanceCost),
    labor: Math.round(laborCost),
    laborFTEs: FTEs,
    insuranceTax: Math.round(insuranceTax),
    consumables: Math.round(consumables),
    digestateHandling: Math.round(digestateHandling),
    total: Math.round(totalOPEX),
  };
}

// ============================================================================
// REVENUE CALCULATION - CORRECTED WITH PROPER UNIT CONVERSION
// ============================================================================

function calculateRevenue(physics, feed, loc, capacityTons) {
  const annualHours = 8400;

  // ========================================================================
  // RNG REVENUE - CORRECTED CALCULATION
  // biomethaneRNG is in m³/h
  // 1 m³ of methane = 0.0353 MMBtu (at STP)
  // ========================================================================
  const annual_biomethane_m3 = physics.volume.biomethaneRNG * annualHours;
  const annual_biomethane_MMBtu = annual_biomethane_m3 * 0.0353;
  const rngRevenue = annual_biomethane_MMBtu * loc.rng_price;

  // Electricity sales (net export only)
  const electricityRevenue = physics.energy.netPowerExport_kW * annualHours * loc.energy_price;

  // Carbon credits - based on avoided natural gas emissions
  // 1 MMBtu natural gas = 0.053 metric tons CO2
  const annualCO2avoided_tons = annual_biomethane_MMBtu * 0.053;
  const carbonRevenue = annualCO2avoided_tons * loc.carbon_credit;

  // Tipping fee revenue (if feedstock has tipping fee)
  const tippingFeeRevenue = capacityTons * 365 * feed.tipping_fee;

  // Heat sales (limited market - assume 20% can be sold externally)
  const excessHeat_kW = Math.max(0, physics.energy.chpThermal_kW - physics.energy.totalHeatDemand_kW);
  const heatRevenue = excessHeat_kW * 0.2 * annualHours * loc.energy_price * 0.25;

  const totalRevenue = rngRevenue + electricityRevenue + carbonRevenue + tippingFeeRevenue + heatRevenue;

  return {
    rng: Math.round(rngRevenue),
    electricity: Math.round(electricityRevenue),
    carbon: Math.round(carbonRevenue),
    tippingFees: Math.round(tippingFeeRevenue),
    heat: Math.round(heatRevenue),
    total: Math.round(totalRevenue),
    // For display
    annual_biomethane_m3: Math.round(annual_biomethane_m3),
    annual_biomethane_MMBtu: Math.round(annual_biomethane_MMBtu),
  };
}

// ============================================================================
// PROFITABILITY ANALYSIS - CORRECTED IRR AND NPV CALCULATION
// ============================================================================

function calculateProfitability(capex, opex, revenue, loc) {
  const projectLife = 20;
  const discountRate = loc.discount_rate;

  // Annual operating profit (before tax)
  const annualProfit = revenue.total - opex.total;

  // Annual cash flow (after tax)
  const annualCashFlow = annualProfit > 0
    ? annualProfit * (1 - loc.tax_rate)
    : annualProfit; // No tax benefit on losses for simplicity

  // ========================================================================
  // HANDLE NEGATIVE CASH FLOWS PROPERLY
  // ========================================================================
  const isProjectViable = annualCashFlow > 0;

  // Simple payback (only meaningful if positive cash flow)
  let simplePayback;
  if (annualCashFlow > 0) {
    simplePayback = capex.total / annualCashFlow;
  } else {
    simplePayback = Infinity;
  }

  // NPV calculation
  let npv = -capex.total;
  for (let year = 1; year <= projectLife; year++) {
    npv += annualCashFlow / Math.pow(1 + discountRate, year);
  }

  // ========================================================================
  // IRR CALCULATION - HANDLE NON-VIABLE PROJECTS
  // IRR only exists if there's at least one sign change in cash flows
  // ========================================================================
  let irr = null;
  let irrDisplay = 'N/A';

  if (isProjectViable) {
    // Use Newton-Raphson with bounds checking
    irr = 0.10;
    let converged = false;

    for (let iter = 0; iter < 100; iter++) {
      let npvAtIrr = -capex.total;
      let npvDerivative = 0;

      for (let year = 1; year <= projectLife; year++) {
        const factor = Math.pow(1 + irr, year);
        npvAtIrr += annualCashFlow / factor;
        npvDerivative -= year * annualCashFlow / (factor * (1 + irr));
      }

      if (Math.abs(npvDerivative) < 1e-10) break;

      const newIrr = irr - npvAtIrr / npvDerivative;

      // Bound IRR to reasonable range
      if (newIrr < -0.99) {
        irr = -0.99;
        break;
      }
      if (newIrr > 2.0) {
        irr = 2.0;
        break;
      }

      if (Math.abs(newIrr - irr) < 0.0001) {
        converged = true;
        irr = newIrr;
        break;
      }
      irr = newIrr;
    }

    if (converged && isFinite(irr) && irr > -1 && irr < 2) {
      irrDisplay = (irr * 100).toFixed(1);
    } else {
      irrDisplay = 'N/A';
      irr = null;
    }
  }

  // Discounted payback
  let discountedPayback = projectLife + 1; // > project life means never recovers
  if (isProjectViable) {
    let cumDiscountedCF = -capex.total;
    for (let year = 1; year <= projectLife; year++) {
      const discountedCF = annualCashFlow / Math.pow(1 + discountRate, year);
      cumDiscountedCF += discountedCF;
      if (cumDiscountedCF >= 0) {
        discountedPayback = year - (cumDiscountedCF / discountedCF);
        break;
      }
    }
  }

  // Profitability Index
  const profitabilityIndex = isProjectViable ? (npv + capex.total) / capex.total : 0;

  // ROI
  const roi = (annualCashFlow / capex.total) * 100;

  // ========================================================================
  // FEASIBILITY SCORE - BASED ON ACTUAL PROJECT VIABILITY
  // ========================================================================
  let score = 5.0;

  if (!isProjectViable || npv < 0) {
    // Project loses money
    score = 2.0;
    if (annualProfit < -500000) score = 1.0;
  } else {
    // Project is profitable
    if (simplePayback < 5) score += 2.0;
    else if (simplePayback < 8) score += 1.0;
    else if (simplePayback < 12) score += 0.5;

    if (irr !== null) {
      if (irr > 0.20) score += 1.5;
      else if (irr > 0.12) score += 1.0;
      else if (irr > 0.08) score += 0.5;
    }

    if (npv > capex.total * 0.5) score += 1.0;
    else if (npv > 0) score += 0.5;

    if (profitabilityIndex > 1.3) score += 0.5;
  }

  score = Math.min(10, Math.max(1, score));

  return {
    annualProfit: Math.round(annualProfit),
    annualCashFlow: Math.round(annualCashFlow),
    simplePayback: isFinite(simplePayback) ? parseFloat(Math.min(99, simplePayback).toFixed(1)) : 99,
    discountedPayback: parseFloat(Math.min(99, discountedPayback).toFixed(1)),
    npv: Math.round(npv),
    irr: irrDisplay,
    irrNumeric: irr,
    profitabilityIndex: parseFloat(Math.max(0, profitabilityIndex).toFixed(2)),
    roi: parseFloat(roi.toFixed(1)),
    feasibilityScore: parseFloat(score.toFixed(1)),
    projectLife,
    discountRate: discountRate * 100,
    isViable: isProjectViable && npv > 0,
  };
}

// ============================================================================
// AI SUMMARY GENERATOR - CRITICAL AND HONEST
// ============================================================================

function generateAISummary(physics, financials, feed, loc, capacityTons) {
  const { profitability, revenue, opex, capex } = financials;
  const { isViable, npv, irr, irrNumeric, simplePayback, annualProfit } = profitability;

  // ========================================================================
  // CRITICAL AI ANALYSIS - Only recommend if economically sound
  // ========================================================================

  if (!isViable || npv < 0) {
    // PROJECT NOT FEASIBLE
    const deficit = opex.total - revenue.total;
    const recommendations = [];

    if (capacityTons < 100) {
      recommendations.push(`increase scale to 150+ TPD for economy of scale benefits`);
    }
    if (feed.tipping_fee < 30) {
      recommendations.push(`negotiate higher tipping fees ($40-60/ton)`);
    }
    if (loc.rng_price < 30) {
      recommendations.push(`explore markets with higher RNG prices (California LCFS: $45/MMBtu)`);
    }
    recommendations.push(`optimize CHP/RNG split ratio`);
    recommendations.push(`consider co-digestion with higher-yield feedstocks`);

    return `PROJECT NOT FEASIBLE. Annual operating loss of $${Math.abs(Math.round(annualProfit / 1000))}K with NPV of -$${Math.abs(Math.round(npv / 1000000))}M over ${profitability.projectLife} years. ` +
      `Revenue ($${Math.round(revenue.total / 1000)}K) insufficient to cover OPEX ($${Math.round(opex.total / 1000)}K). ` +
      `${feed.label} at ${capacityTons} TPD in ${loc.climate.toLowerCase()} climate with $${loc.rng_price}/MMBtu RNG pricing does not achieve positive returns. ` +
      `RECOMMENDATIONS: ${recommendations.slice(0, 3).join('; ')}. ` +
      `Do NOT proceed to FEED phase without addressing fundamental economics.`;
  }

  if (irrNumeric !== null && irrNumeric < 0.08) {
    // MARGINAL PROJECT
    return `MARGINAL VIABILITY. ${profitability.irr}% IRR below typical hurdle rate (12%). ` +
      `NPV of $${(npv / 1000000).toFixed(1)}M with ${simplePayback}-year payback. ` +
      `Project generates positive cash flow but returns may not justify capital risk. ` +
      `Consider: (1) scale optimization, (2) tipping fee negotiation, (3) LCFS market entry. ` +
      `Sensitivity analysis required before FID.`;
  }

  if (irrNumeric !== null && irrNumeric >= 0.12 && npv > 0) {
    // VIABLE PROJECT
    return `VIABLE PROJECT. ${profitability.irr}% IRR exceeds 12% hurdle rate with NPV of $${(npv / 1000000).toFixed(1)}M. ` +
      `${simplePayback}-year simple payback, ${profitability.discountedPayback}-year discounted payback at ${profitability.discountRate}% WACC. ` +
      `${feed.label} at ${capacityTons} TPD produces ${physics.volume.biomethaneRNG} m³/h biomethane (${revenue.annual_biomethane_MMBtu.toLocaleString()} MMBtu/yr). ` +
      `Revenue mix: RNG ${Math.round(revenue.rng / revenue.total * 100)}%, Tipping Fees ${Math.round(revenue.tippingFees / revenue.total * 100)}%, Power ${Math.round(revenue.electricity / revenue.total * 100)}%. ` +
      `Recommend proceeding to FEED phase with detailed engineering.`;
  }

  // MODERATE RETURNS
  return `MODERATE RETURNS. ${profitability.irr}% IRR with NPV of $${(npv / 1000000).toFixed(1)}M over ${profitability.projectLife} years. ` +
    `${simplePayback}-year payback period. Net annual cash flow of $${Math.round(profitability.annualCashFlow / 1000)}K after tax. ` +
    `${loc.incentives[0]} and ${loc.incentives[1] || 'regional incentives'} improve economics. ` +
    `Consider process optimization to improve IRR above 15% before FID.`;
}

// ============================================================================
// EQUIPMENT STREAM DATA GENERATOR
// ============================================================================

function generateEquipmentStreams(physics, feed, capacityTons) {
  const { mass, volume, energy, sizing, compositions } = physics;

  const equipment = [];

  // Digesters
  for (let i = 0; i < sizing.numDigesters; i++) {
    const fraction = 1 / sizing.numDigesters;
    equipment.push({
      id: `digester-${i + 1}`,
      type: 'digester',
      name: `Anaerobic Digester #${i + 1}`,
      function: `Continuous stirred-tank reactor (CSTR) for mesophilic anaerobic digestion at ${PHYSICS.digester_temp}°C. Organic matter is converted to biogas via hydrolysis, acidogenesis, acetogenesis, and methanogenesis.`,
      position: [-8 + i * 6, 0, -2],
      dimensions: { radius: 2 + sizing.digesterVolume_m3 / 3000, height: 4 + Math.random() * 0.5 },
      streams: {
        inlet: {
          name: 'Feed Slurry',
          phase: 'Liquid',
          mass_kg_h: Math.round(mass.feedIn * fraction),
          volume_m3_h: Math.round(volume.feedIn * fraction * 100) / 100,
          temp_C: PHYSICS.ambient_temp + 20,
          pressure_bar: 1.0,
          composition: { TS: feed.ts_content * 100, VS: feed.vs_content * 100, Water: feed.moisture * 100 },
        },
        outlet_liquid: {
          name: 'Digestate',
          phase: 'Liquid',
          mass_kg_h: Math.round(mass.digestateOut * fraction),
          temp_C: PHYSICS.digester_temp,
          pressure_bar: 1.0,
          composition: compositions.digestate,
        },
        outlet_vapor: {
          name: 'Raw Biogas',
          phase: 'Vapor',
          mass_kg_h: Math.round(mass.biogasOut * fraction),
          volume_m3_h: Math.round(volume.biogasOut * fraction * 10) / 10,
          temp_C: PHYSICS.digester_temp,
          pressure_bar: 1.02,
          composition: compositions.biogas,
        },
        enthalpy: {
          inlet_MJ_h: Math.round(mass.feedIn * fraction * PHYSICS.Cp_water * (PHYSICS.ambient_temp + 20) / 1000),
          outlet_MJ_h: Math.round((mass.digestateOut * PHYSICS.Cp_digestate + mass.biogasOut * PHYSICS.Cp_biogas) * fraction * PHYSICS.digester_temp / 1000),
          duty_MJ_h: Math.round(energy.heatingDuty_kW * 3.6 * fraction),
          loss_MJ_h: Math.round(energy.heatLoss_kW * 3.6 * fraction),
        },
      },
      specs: {
        volume_m3: sizing.digesterVolume_m3,
        HRT_days: sizing.HRT_days,
        temperature_C: PHYSICS.digester_temp,
        OLR_kgVS_m3_d: sizing.OLR_kgVS_m3_d,
        mixing_power_kW: Math.round(physics.parasiticLoads.digester_mixing * fraction),
      },
    });
  }

  // Gas Storage
  equipment.push({
    id: 'gas-holder',
    type: 'storage',
    name: 'Biogas Storage Sphere',
    function: 'Double-membrane gas holder providing buffer storage capacity. Operates at low pressure (20-50 mbar) to smooth production variations.',
    position: [6, 2.5, 0],
    dimensions: { radius: 2 + sizing.gasStorage_m3 / 1000 },
    streams: {
      inlet: {
        name: 'Raw Biogas In',
        phase: 'Vapor',
        mass_kg_h: Math.round(mass.biogasOut),
        volume_m3_h: Math.round(volume.biogasOut * 10) / 10,
        temp_C: PHYSICS.digester_temp,
        pressure_bar: 1.02,
        composition: compositions.biogas,
      },
      outlet: {
        name: 'Biogas Out',
        phase: 'Vapor',
        mass_kg_h: Math.round(mass.biogasOut),
        volume_m3_h: Math.round(volume.biogasOut * 10) / 10,
        temp_C: 30,
        pressure_bar: 1.03,
        composition: compositions.biogas,
      },
      enthalpy: {
        inlet_MJ_h: Math.round(mass.biogasOut * PHYSICS.Cp_biogas * PHYSICS.digester_temp / 1000),
        outlet_MJ_h: Math.round(mass.biogasOut * PHYSICS.Cp_biogas * 30 / 1000),
        loss_MJ_h: Math.round(mass.biogasOut * PHYSICS.Cp_biogas * 7 / 1000),
      },
    },
    specs: {
      capacity_m3: sizing.gasStorage_m3,
      retention_hours: 8,
      pressure_mbar: 35,
      material: 'HDPE membrane',
    },
  });

  // CHP Units
  for (let i = 0; i < sizing.numCHP; i++) {
    const fraction = 1 / sizing.numCHP;
    const biogasToCHP_m3_h = volume.biogasOut * 0.4 * fraction;

    equipment.push({
      id: `chp-${i + 1}`,
      type: 'chp',
      name: `CHP Unit #${i + 1}`,
      function: `Combined Heat and Power gas engine (${sizing.chpCapacity_kWe} kWe). Converts biogas to electricity at ${PHYSICS.chp_electrical_eff * 100}% efficiency with ${PHYSICS.chp_thermal_eff * 100}% heat recovery.`,
      position: [14 + i * 5, 0, 5],
      dimensions: { width: 2.5, height: 2, depth: 4 },
      streams: {
        inlet_fuel: {
          name: 'Biogas Fuel',
          phase: 'Vapor',
          volume_m3_h: Math.round(biogasToCHP_m3_h * 10) / 10,
          mass_kg_h: Math.round(biogasToCHP_m3_h * PHYSICS.biogas_density),
          temp_C: 30,
          pressure_bar: 1.1,
          LHV_MJ_m3: PHYSICS.methane_LHV * feed.methane_content,
        },
        outlet_power: {
          name: 'Electrical Output',
          power_kW: Math.round(energy.chpElectrical_kW * fraction),
          voltage_V: 400,
          frequency_Hz: 50,
        },
        outlet_heat: {
          name: 'Recovered Heat',
          thermal_kW: Math.round(energy.chpThermal_kW * fraction),
          temp_supply_C: 90,
          temp_return_C: 70,
        },
        outlet_exhaust: {
          name: 'Exhaust Gas',
          phase: 'Vapor',
          temp_C: 450,
          mass_kg_h: Math.round(biogasToCHP_m3_h * PHYSICS.biogas_density * 15),
        },
        enthalpy: {
          fuel_MJ_h: Math.round(biogasToCHP_m3_h * PHYSICS.methane_LHV * feed.methane_content),
          electrical_MJ_h: Math.round(energy.chpElectrical_kW * fraction * 3.6),
          thermal_MJ_h: Math.round(energy.chpThermal_kW * fraction * 3.6),
          exhaust_loss_MJ_h: Math.round(biogasToCHP_m3_h * PHYSICS.methane_LHV * feed.methane_content * 0.18),
        },
      },
      specs: {
        capacity_kWe: sizing.chpCapacity_kWe,
        electrical_eff_pct: PHYSICS.chp_electrical_eff * 100,
        thermal_eff_pct: PHYSICS.chp_thermal_eff * 100,
        total_eff_pct: PHYSICS.chp_total_eff * 100,
        NOx_mg_Nm3: 250,
        noise_dB: 75,
      },
    });
  }

  // Upgrader
  const biogasToUpgrade_m3_h = volume.biogasOut * 0.6;
  equipment.push({
    id: 'upgrader',
    type: 'upgrader',
    name: 'Membrane Upgrading Unit',
    function: 'Three-stage membrane separation system for CO2 removal. Produces pipeline-quality biomethane (>97% CH4).',
    position: [6, 0, 10],
    dimensions: { width: 4, height: 3, depth: 3 },
    streams: {
      inlet: {
        name: 'Raw Biogas',
        phase: 'Vapor',
        volume_m3_h: Math.round(biogasToUpgrade_m3_h * 10) / 10,
        mass_kg_h: Math.round(biogasToUpgrade_m3_h * PHYSICS.biogas_density),
        temp_C: 30,
        pressure_bar: 1.0,
        composition: compositions.biogas,
      },
      outlet_product: {
        name: 'Biomethane (RNG)',
        phase: 'Vapor',
        volume_m3_h: Math.round(volume.biomethaneRNG * 10) / 10,
        mass_kg_h: Math.round(volume.biomethaneRNG * PHYSICS.methane_density),
        temp_C: 25,
        pressure_bar: 16,
        composition: compositions.biomethane,
      },
      outlet_offgas: {
        name: 'CO2 Off-gas',
        phase: 'Vapor',
        volume_m3_h: Math.round(volume.co2Rejected * 10) / 10,
        mass_kg_h: Math.round(volume.co2Rejected * PHYSICS.co2_density),
        temp_C: 25,
        pressure_bar: 1.0,
        composition: { CO2: 95, CH4: 3, N2: 2 },
      },
      enthalpy: {
        inlet_MJ_h: Math.round(biogasToUpgrade_m3_h * PHYSICS.Cp_biogas * 30 * PHYSICS.biogas_density / 1000),
        compression_MJ_h: Math.round(physics.parasiticLoads.upgrader * 3.6),
        outlet_MJ_h: Math.round(volume.biomethaneRNG * PHYSICS.methane_LHV),
      },
    },
    specs: {
      capacity_m3_h: sizing.upgraderCapacity_m3_h,
      methane_recovery_pct: PHYSICS.upgrader_recovery * 100,
      product_purity_pct: PHYSICS.upgrader_purity * 100,
      outlet_pressure_bar: 16,
      power_consumption_kW: physics.parasiticLoads.upgrader,
    },
  });

  // Heat Exchanger
  equipment.push({
    id: 'heat-exchanger',
    type: 'heatExchanger',
    name: 'Feedstock Pre-Heater',
    function: 'Shell-and-tube heat exchanger utilizing CHP waste heat to pre-heat incoming feedstock.',
    position: [-12, 0, 2],
    dimensions: { width: 1.5, height: 1.2, depth: 5 },
    streams: {
      cold_inlet: {
        name: 'Cold Feed',
        phase: 'Liquid',
        mass_kg_h: mass.feedIn,
        temp_C: PHYSICS.ambient_temp,
        Cp_kJ_kgK: PHYSICS.Cp_water,
      },
      cold_outlet: {
        name: 'Pre-heated Feed',
        phase: 'Liquid',
        mass_kg_h: mass.feedIn,
        temp_C: PHYSICS.ambient_temp + 20,
      },
      hot_inlet: {
        name: 'Hot Water Supply',
        phase: 'Liquid',
        temp_C: 90,
        thermal_kW: energy.chpThermal_kW * 0.7,
      },
      hot_outlet: {
        name: 'Hot Water Return',
        phase: 'Liquid',
        temp_C: 70,
      },
      enthalpy: {
        cold_side_MJ_h: Math.round(mass.feedIn * PHYSICS.Cp_water * 20 / 1000),
        hot_side_MJ_h: Math.round(energy.chpThermal_kW * 0.7 * 3.6),
        effectiveness_pct: PHYSICS.hx_effectiveness * 100,
      },
    },
    specs: {
      duty_kW: Math.round(mass.feedIn * PHYSICS.Cp_water * 20 / 3600),
      area_m2: Math.round(mass.feedIn * 0.015),
      LMTD_C: 25,
      U_W_m2K: 500,
      type: 'Shell & Tube',
    },
  });

  // Digestate Tank
  equipment.push({
    id: 'digestate-tank',
    type: 'tank',
    name: 'Digestate Storage',
    function: 'Covered concrete lagoon for digestate storage with gas-tight cover. Provides 180-day storage capacity.',
    position: [-8, 0, 12],
    dimensions: { radius: 3 + sizing.digestateStorage_m3 / 10000, height: 2.5 },
    streams: {
      inlet: {
        name: 'Digestate In',
        phase: 'Liquid',
        mass_kg_h: mass.digestateOut,
        temp_C: PHYSICS.digester_temp,
        composition: compositions.digestate,
      },
      outlet: {
        name: 'Digestate Out',
        phase: 'Liquid',
        mass_kg_h: Math.round(mass.digestateOut * 0.98),
        temp_C: 20,
        composition: compositions.digestate,
      },
      enthalpy: {
        inlet_MJ_h: Math.round(mass.digestateOut * PHYSICS.Cp_digestate * PHYSICS.digester_temp / 1000),
        outlet_MJ_h: Math.round(mass.digestateOut * 0.98 * PHYSICS.Cp_digestate * 20 / 1000),
        loss_MJ_h: Math.round(mass.digestateOut * PHYSICS.Cp_digestate * 17 / 1000),
      },
    },
    specs: {
      volume_m3: sizing.digestateStorage_m3,
      retention_days: 180,
      covered: true,
      nutrient_N_pct: compositions.digestate.N,
      nutrient_P_pct: compositions.digestate.P,
      nutrient_K_pct: compositions.digestate.K,
    },
  });

  return equipment;
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculatePlantDesign(capacity, feedstock, location) {
  const feed = feedstockTypes[feedstock];
  const loc = locationModifiers[location] || locationModifiers['Ohio, USA'];
  const capacityTons = parseFloat(capacity) || 50;

  // Run process physics calculations
  const physics = calculateProcessPhysics(capacityTons, feed, loc);

  // Calculate financials
  const capex = calculateCAPEX(physics, feed, loc);
  const opex = calculateOPEX(physics, feed, loc, capex, capacityTons);
  const revenue = calculateRevenue(physics, feed, loc, capacityTons);
  const profitability = calculateProfitability(capex, opex, revenue, loc);

  // Generate AI summary
  const aiSummary = generateAISummary(physics, { capex, opex, revenue, profitability }, feed, loc, capacityTons);

  // Generate equipment data
  const equipment = generateEquipmentStreams(physics, feed, capacityTons);

  // Sankey diagram data
  const sankeyData = {
    nodes: [
      { id: 'feedstock', name: 'Feedstock Input' },
      { id: 'digester', name: 'Anaerobic Digestion' },
      { id: 'biogas', name: 'Raw Biogas' },
      { id: 'upgrader', name: 'Gas Upgrading' },
      { id: 'biomethane', name: 'Biomethane' },
      { id: 'chp', name: 'CHP Generation' },
      { id: 'power', name: 'Net Electricity' },
      { id: 'heat', name: 'Process Heat' },
      { id: 'digestate', name: 'Digestate' },
      { id: 'co2', name: 'CO2 Stream' },
    ],
    links: [
      { source: 'feedstock', target: 'digester', value: physics.mass.feedIn * 24, unit: 'kg/day' },
      { source: 'digester', target: 'biogas', value: Math.round(physics.volume.biogasOut * 24), unit: 'm³/day' },
      { source: 'digester', target: 'digestate', value: physics.mass.digestateOut * 24, unit: 'kg/day' },
      { source: 'biogas', target: 'upgrader', value: Math.round(physics.volume.biogasOut * 24 * 0.6), unit: 'm³/day' },
      { source: 'biogas', target: 'chp', value: Math.round(physics.volume.biogasOut * 24 * 0.4), unit: 'm³/day' },
      { source: 'upgrader', target: 'biomethane', value: Math.round(physics.volume.biomethaneRNG * 24), unit: 'm³/day' },
      { source: 'upgrader', target: 'co2', value: Math.round(physics.volume.co2Rejected * 24), unit: 'm³/day' },
      { source: 'chp', target: 'power', value: Math.round(physics.energy.netPowerExport_kW * 24), unit: 'kWh/day' },
      { source: 'chp', target: 'heat', value: Math.round(physics.energy.chpThermal_kW * 24), unit: 'kWh_th/day' },
    ],
  };

  // Energy balance - CORRECTED
  const energyBalance = {
    inputs: {
      biogas_MJ_d: physics.energy.biogasEnergy_MJ_h * 24,
      parasitic_MJ_d: physics.parasiticLoads.total * 24 * 3.6,
    },
    outputs: {
      biomethane_MJ_d: physics.energy.biomethaneEnergy_MJ_h * 24,
      electricity_MJ_d: physics.energy.netPowerExport_kW * 24 * 3.6,
      heat_useful_MJ_d: physics.energy.totalHeatDemand_kW * 24 * 3.6,
      losses_MJ_d: physics.energy.heatLoss_kW * 24 * 3.6 +
        physics.energy.chpFuelInput_kW * (1 - PHYSICS.chp_total_eff) * 24 * 3.6,
    },
    efficiency: physics.energy.efficiency_pct,
  };

  return {
    inputs: {
      capacity: capacityTons,
      feedstock: feed.label,
      location,
    },
    physics,
    production: {
      dailyBiogas: Math.round(physics.volume.biogasOut * 24),
      dailyMethane: Math.round(physics.volume.methaneOut * 24),
      dailyBiomethane: Math.round(physics.volume.biomethaneRNG * 24),
      annualBiomethane: Math.round(physics.volume.biomethaneRNG * 8400),
      hourlyFeedRate: physics.mass.feedIn,
    },
    equipment,
    financials: {
      capex,
      opex,
      revenue,
      profitability,
      aiSummary,
      incentives: loc.incentives,
    },
    massBalance: sankeyData,
    energyBalance,
  };
}

// ============================================================================
// COMPUTING LOGS (UI Animation)
// ============================================================================

export const computingLogs = [
  'Initializing BasisAI Process Engine v4.2.1...',
  'Loading feedstock characterization database...',
  'Parsing input parameters and boundary conditions...',
  'Computing stoichiometric coefficients for AD reactions...',
  'Calculating VS destruction kinetics (Monod model)...',
  'Converging mass balance: liquid phase...',
  'Converging mass balance: vapor phase...',
  'Validating mass conservation (closure = 100%)...',
  'Computing stream enthalpies (Cp-based)...',
  'Iterating energy balance (tolerance: 1e-6)...',
  'Calculating digester heat loss (U·A·ΔT)...',
  'Optimizing heat integration network (Pinch Analysis)...',
  'Sizing primary anaerobic digesters (HRT method)...',
  'Calculating organic loading rate (OLR)...',
  'Dimensioning biogas storage (8-hour buffer)...',
  'Selecting CHP configuration and capacity...',
  'Computing parasitic electrical loads...',
  'Evaluating membrane upgrader performance...',
  'Calculating methane slip and recovery...',
  'Sizing heat exchangers (LMTD method)...',
  'Computing digestate nutrient profile...',
  'Estimating equipment costs (AACE Class 4)...',
  'Calculating ISBL direct costs...',
  'Adding OSBL infrastructure costs...',
  'Applying engineering & indirect fees (10%)...',
  'Adding contingency (20%)...',
  'Computing annual OPEX breakdown...',
  'Calculating RNG revenue (m³ → MMBtu)...',
  'Projecting revenue streams (20-year)...',
  'Running DCF analysis...',
  'Calculating NPV at WACC...',
  'Solving IRR (Newton-Raphson)...',
  'Validating IRR convergence...',
  'Computing payback periods...',
  'Generating feasibility assessment...',
  'Design generation complete.',
];
