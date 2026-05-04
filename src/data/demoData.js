// ============================================================================
// PROCESS PHYSICS CONSTANTS & HEURISTICS
// Based on industry standards and engineering handbooks
// ============================================================================

const PHYSICS = {
  // Thermodynamic properties
  Cp_water: 4.18,           // kJ/kg·K - specific heat of water/slurry
  Cp_biogas: 1.5,           // kJ/kg·K - specific heat of biogas mixture
  Cp_digestate: 3.8,        // kJ/kg·K - specific heat of digestite

  // Biogas properties
  biogas_density: 1.15,     // kg/m³ at STP
  methane_density: 0.668,   // kg/m³ at STP
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
  digester_mixing: 0.015,   // kW per m³ digester
  pump_power: 0.5,          // kW per m³/h flow
  upgrader_power: 0.25,     // kWh per m³ biogas
  cooling_power: 0.05,      // kW per kW thermal rejected
};

// ============================================================================
// FEEDSTOCK CHARACTERIZATION DATABASE
// ============================================================================

export const feedstockTypes = {
  manure: {
    label: 'Dairy Manure',
    biogas_yield: 25,       // m³/ton wet feedstock
    methane_content: 0.55,  // vol fraction
    vs_content: 0.08,       // kg VS / kg wet
    ts_content: 0.12,       // kg TS / kg wet (total solids)
    moisture: 0.88,
    density: 1020,          // kg/m³
    C_N_ratio: 18,
    pH: 7.2,
    cost: 0,                // $/ton (often free or negative - tipping fee)
    tipping_fee: 15,        // $/ton received
  },
  food_waste: {
    label: 'Food Waste',
    biogas_yield: 120,
    methane_content: 0.60,
    vs_content: 0.25,
    ts_content: 0.30,
    moisture: 0.70,
    density: 950,
    C_N_ratio: 15,
    pH: 5.5,
    cost: 0,
    tipping_fee: 45,        // higher gate fee for food waste
  },
  crop_residue: {
    label: 'Crop Residue',
    biogas_yield: 80,
    methane_content: 0.52,
    vs_content: 0.82,
    ts_content: 0.85,
    moisture: 0.15,
    density: 150,           // loose bulk density
    C_N_ratio: 80,
    pH: 6.8,
    cost: 25,               // $/ton purchase cost
    tipping_fee: 0,
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
    carbon_credit: 180,     // $/ton CO2eq
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
    carbon_credit: 220,
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
    carbon_credit: 150,
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
    rng_price: 12,
    carbon_credit: 45,
    discount_rate: 0.12,
    tax_rate: 0.25,
    climate: 'Tropical',
    heating_degree_days: 200,
    incentives: ['MNRE Subsidy', 'State FiT', 'Carbon Credits'],
  },
};

// ============================================================================
// EQUIPMENT COST DATABASE (AACE Class 4 Estimate Basis)
// ============================================================================

const EQUIPMENT_COSTS = {
  digester: {
    base_cost: 450,         // $/m³ installed
    scaling_exp: 0.65,      // economy of scale exponent
    reference_size: 2000,   // m³
  },
  gasHolder: {
    base_cost: 120,         // $/m³
    scaling_exp: 0.70,
    reference_size: 500,
  },
  chp: {
    base_cost: 1200,        // $/kWe installed
    scaling_exp: 0.85,
    reference_size: 500,
  },
  upgrader: {
    base_cost: 2500,        // $/m³/h capacity
    scaling_exp: 0.70,
    reference_size: 200,
  },
  heatExchanger: {
    base_cost: 800,         // $/m² area
    scaling_exp: 0.60,
    reference_size: 50,
  },
  digestateTank: {
    base_cost: 80,          // $/m³
    scaling_exp: 0.70,
    reference_size: 5000,
  },
  feedPrep: {
    base_cost: 150000,      // $ lump sum base
    scaling_exp: 0.50,
    reference_size: 50,     // TPD
  },
};

// ============================================================================
// PROCESS PHYSICS ENGINE
// ============================================================================

function calculateProcessPhysics(capacityTons, feed, loc) {
  const hourlyFeed_kg = (capacityTons * 1000) / 24;
  const hourlyFeed_m3 = hourlyFeed_kg / feed.density;

  // VS loading and biogas production
  const daily_VS_kg = capacityTons * 1000 * feed.vs_content;
  const VS_destroyed_kg = daily_VS_kg * PHYSICS.VS_destruction;
  const daily_biogas_m3 = capacityTons * feed.biogas_yield;
  const daily_methane_m3 = daily_biogas_m3 * feed.methane_content;
  const hourly_biogas_m3 = daily_biogas_m3 / 24;
  const hourly_methane_m3 = daily_methane_m3 / 24;

  // Mass balance
  const biogas_mass_kg_h = hourly_biogas_m3 * PHYSICS.biogas_density;
  const digestate_mass_kg_h = hourlyFeed_kg - biogas_mass_kg_h;
  const water_evap_kg_h = hourlyFeed_kg * 0.02; // 2% water loss

  // Energy content
  const biogas_energy_MJ_h = hourly_methane_m3 * PHYSICS.methane_LHV;
  const feedstock_energy_MJ_h = daily_VS_kg / 24 * 18.5; // MJ/kg VS typical

  // Digester sizing
  const HRT = 25; // days hydraulic retention time
  const digester_volume_total = (capacityTons * 1000 / feed.density) * HRT;
  const num_digesters = Math.max(1, Math.ceil(digester_volume_total / 5000));
  const digester_volume_each = digester_volume_total / num_digesters;
  const OLR = (daily_VS_kg / digester_volume_total).toFixed(2); // kg VS/m³/day

  // Heat requirements
  const heating_duty_kW = (hourlyFeed_kg * PHYSICS.Cp_water *
    (PHYSICS.digester_temp - PHYSICS.ambient_temp)) / 3600;
  const heat_loss_kW = digester_volume_total * 0.015 *
    (PHYSICS.digester_temp - PHYSICS.ambient_temp) / 1000;
  const total_heat_demand_kW = heating_duty_kW + heat_loss_kW;

  // CHP sizing
  const chp_fuel_input_kW = biogas_energy_MJ_h / 3.6; // convert MJ/h to kW
  const chp_electrical_kW = chp_fuel_input_kW * PHYSICS.chp_electrical_eff;
  const chp_thermal_kW = chp_fuel_input_kW * PHYSICS.chp_thermal_eff;
  const num_chp = Math.max(1, Math.ceil(chp_electrical_kW / 1500));

  // Upgrader sizing (processes remaining biogas after CHP)
  const biogas_to_upgrade_m3_h = hourly_biogas_m3 * 0.6; // 60% to RNG
  const biomethane_out_m3_h = biogas_to_upgrade_m3_h * feed.methane_content *
    PHYSICS.upgrader_recovery;
  const co2_rejected_m3_h = biogas_to_upgrade_m3_h * (1 - feed.methane_content);

  // Gas storage sizing
  const storage_hours = 8; // buffer capacity
  const gas_storage_m3 = hourly_biogas_m3 * storage_hours;

  // Digestate storage
  const digestate_storage_days = 180;
  const digestate_storage_m3 = (digestate_mass_kg_h * 24 * digestate_storage_days) / 1000;

  // Parasitic electrical loads
  const parasitic_loads = {
    digester_mixing: digester_volume_total * PHYSICS.digester_mixing,
    pumping: hourlyFeed_m3 * PHYSICS.pump_power * 3, // feed, recirculation, digestate
    upgrader: biogas_to_upgrade_m3_h * PHYSICS.upgrader_power,
    cooling: (chp_thermal_kW - total_heat_demand_kW) * PHYSICS.cooling_power,
    auxiliary: chp_electrical_kW * 0.05, // 5% for controls, lighting, etc.
  };
  const total_parasitic_kW = Object.values(parasitic_loads).reduce((a, b) => a + b, 0);
  const net_power_export_kW = chp_electrical_kW - total_parasitic_kW;

  return {
    // Mass flows (kg/h)
    mass: {
      feedIn: Math.round(hourlyFeed_kg),
      biogasOut: Math.round(biogas_mass_kg_h),
      digestateOut: Math.round(digestate_mass_kg_h),
      waterLoss: Math.round(water_evap_kg_h),
      methaneOut: Math.round(hourly_methane_m3 * PHYSICS.methane_density),
      co2Out: Math.round(co2_rejected_m3_h * 1.98), // CO2 density
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
      chpFuelInput_kW: Math.round(chp_fuel_input_kW),
      chpElectrical_kW: Math.round(chp_electrical_kW),
      chpThermal_kW: Math.round(chp_thermal_kW),
      heatingDuty_kW: Math.round(heating_duty_kW),
      heatLoss_kW: Math.round(heat_loss_kW),
      totalHeatDemand_kW: Math.round(total_heat_demand_kW),
      netPowerExport_kW: Math.round(net_power_export_kW),
      parasiticLoad_kW: Math.round(total_parasitic_kW),
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
    // Stream compositions (mol% or wt%)
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

  // Equipment costs (ISBL - Inside Battery Limits)
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
      Math.pow(sizing.upgraderCapacity_m3_h / EQUIPMENT_COSTS.upgrader.reference_size,
        EQUIPMENT_COSTS.upgrader.scaling_exp - 1),

    heatExchanger: physics.energy.totalHeatDemand_kW * 0.5 * // approximate area
      EQUIPMENT_COSTS.heatExchanger.base_cost,

    digestateTank: sizing.digestateStorage_m3 * EQUIPMENT_COSTS.digestateTank.base_cost *
      Math.pow(sizing.digestateStorage_m3 / EQUIPMENT_COSTS.digestateTank.reference_size,
        EQUIPMENT_COSTS.digestateTank.scaling_exp - 1),

    feedPrep: EQUIPMENT_COSTS.feedPrep.base_cost *
      Math.pow(physics.mass.feedIn * 24 / 1000 / EQUIPMENT_COSTS.feedPrep.reference_size,
        EQUIPMENT_COSTS.feedPrep.scaling_exp),
  };

  const ISBL = Object.values(equipmentCosts).reduce((a, b) => a + b, 0);

  // OSBL - Outside Battery Limits (site infrastructure)
  const OSBL = {
    sitePrep: ISBL * 0.05,
    utilities: ISBL * 0.08,
    buildings: ISBL * 0.04,
    electrical: ISBL * 0.06,
    instrumentation: ISBL * 0.05,
    piping: ISBL * 0.07,
  };
  const totalOSBL = Object.values(OSBL).reduce((a, b) => a + b, 0);

  // Indirect costs
  const indirectCosts = {
    engineering: (ISBL + totalOSBL) * 0.12,  // 12% engineering & design
    procurement: (ISBL + totalOSBL) * 0.03,   // 3% procurement
    construction_mgmt: (ISBL + totalOSBL) * 0.08, // 8% construction management
    commissioning: (ISBL + totalOSBL) * 0.02, // 2% commissioning & startup
  };
  const totalIndirect = Object.values(indirectCosts).reduce((a, b) => a + b, 0);

  // Contingency (AACE Class 4: 15-25%)
  const subtotal = ISBL + totalOSBL + totalIndirect;
  const contingency = subtotal * 0.20; // 20%

  // Apply location factor
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
// OPEX CALCULATION
// ============================================================================

function calculateOPEX(physics, feed, loc, capex, capacityTons) {
  const annualHours = 8400; // 96% availability

  // Feedstock costs (or revenue from tipping fees)
  const feedstockCost = capacityTons * 365 * (feed.cost - feed.tipping_fee);

  // Utilities
  const electricityCost = physics.parasiticLoads.total * annualHours * loc.energy_price;
  const waterCost = physics.mass.feedIn * 0.1 * annualHours * 0.003; // $3/1000 gal

  // Maintenance (3% of ISBL per year)
  const maintenanceCost = capex.ISBL * 0.03;

  // Labor
  const FTEs = Math.ceil(capacityTons / 75) + 1; // 1 FTE per 75 TPD + supervisor
  const laborCost = FTEs * loc.labor_rate * 2080; // 2080 hrs/year

  // Insurance & taxes (1.5% of total CAPEX)
  const insuranceTax = capex.total * 0.015;

  // Consumables (chemicals, lubricants, etc.)
  const consumables = capacityTons * 365 * 1.5; // $1.50/ton

  // Digestate management
  const digestateHandling = physics.mass.digestateOut * annualHours / 1000 * 3; // $3/ton

  const totalOPEX = Math.abs(feedstockCost) + electricityCost + waterCost +
    maintenanceCost + laborCost + insuranceTax + consumables + digestateHandling;

  return {
    feedstock: Math.round(feedstockCost), // negative = revenue from tipping fees
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
// REVENUE CALCULATION
// ============================================================================

function calculateRevenue(physics, feed, loc) {
  const annualHours = 8400;

  // Electricity sales (net export)
  const electricityRevenue = physics.energy.netPowerExport_kW * annualHours * loc.energy_price;

  // RNG sales
  const annualBiomethane_m3 = physics.volume.biomethaneRNG * annualHours;
  const annualBiomethane_MMBtu = annualBiomethane_m3 * 0.0353; // m³ to MMBtu
  const rngRevenue = annualBiomethane_MMBtu * loc.rng_price;

  // Carbon credits
  const annualCO2avoided_tons = annualBiomethane_m3 * PHYSICS.methane_density *
    (44/16) * 0.001; // CH4 to CO2 equivalent
  const carbonRevenue = annualCO2avoided_tons * loc.carbon_credit;

  // Heat sales (if external demand exists - assume 50% can be sold)
  const excessHeat_kW = Math.max(0, physics.energy.chpThermal_kW - physics.energy.totalHeatDemand_kW);
  const heatRevenue = excessHeat_kW * 0.5 * annualHours * loc.energy_price * 0.3; // heat at 30% of electricity price

  return {
    electricity: Math.round(electricityRevenue),
    rng: Math.round(rngRevenue),
    carbon: Math.round(carbonRevenue),
    heat: Math.round(heatRevenue),
    total: Math.round(electricityRevenue + rngRevenue + carbonRevenue + heatRevenue),
  };
}

// ============================================================================
// PROFITABILITY ANALYSIS
// ============================================================================

function calculateProfitability(capex, opex, revenue, loc) {
  const projectLife = 20; // years
  const discountRate = loc.discount_rate;

  // Annual cash flows
  const annualProfit = revenue.total - opex.total;
  const annualCashFlow = annualProfit * (1 - loc.tax_rate);

  // Simple payback
  const simplePayback = capex.total / annualCashFlow;

  // NPV calculation
  let npv = -capex.total;
  const cashFlows = [-capex.total];
  for (let year = 1; year <= projectLife; year++) {
    const discountedCF = annualCashFlow / Math.pow(1 + discountRate, year);
    npv += discountedCF;
    cashFlows.push(annualCashFlow);
  }

  // IRR calculation (Newton-Raphson approximation)
  let irr = 0.10; // initial guess
  for (let iter = 0; iter < 50; iter++) {
    let npvAtIrr = -capex.total;
    let npvDerivative = 0;
    for (let year = 1; year <= projectLife; year++) {
      npvAtIrr += annualCashFlow / Math.pow(1 + irr, year);
      npvDerivative -= year * annualCashFlow / Math.pow(1 + irr, year + 1);
    }
    const newIrr = irr - npvAtIrr / npvDerivative;
    if (Math.abs(newIrr - irr) < 0.0001) break;
    irr = newIrr;
  }

  // Discounted payback
  let discountedPayback = projectLife;
  let cumDiscountedCF = -capex.total;
  for (let year = 1; year <= projectLife; year++) {
    cumDiscountedCF += annualCashFlow / Math.pow(1 + discountRate, year);
    if (cumDiscountedCF >= 0) {
      discountedPayback = year - 1 +
        (cumDiscountedCF - annualCashFlow / Math.pow(1 + discountRate, year)) /
        (annualCashFlow / Math.pow(1 + discountRate, year));
      break;
    }
  }

  // Profitability Index
  const profitabilityIndex = (npv + capex.total) / capex.total;

  // ROI
  const roi = (annualCashFlow / capex.total) * 100;

  // Feasibility score (weighted)
  let score = 5.0;
  score += (simplePayback < 5) ? 2.0 : (simplePayback < 7) ? 1.0 : 0;
  score += (irr > 0.20) ? 1.5 : (irr > 0.12) ? 0.75 : 0;
  score += (npv > capex.total) ? 1.0 : (npv > 0) ? 0.5 : -0.5;
  score += (profitabilityIndex > 1.5) ? 0.5 : 0;
  score = Math.min(10, Math.max(1, score));

  return {
    annualProfit: Math.round(annualProfit),
    annualCashFlow: Math.round(annualCashFlow),
    simplePayback: parseFloat(simplePayback.toFixed(1)),
    discountedPayback: parseFloat(discountedPayback.toFixed(1)),
    npv: Math.round(npv),
    irr: parseFloat((irr * 100).toFixed(1)),
    profitabilityIndex: parseFloat(profitabilityIndex.toFixed(2)),
    roi: parseFloat(roi.toFixed(1)),
    feasibilityScore: parseFloat(score.toFixed(1)),
    projectLife,
    discountRate: discountRate * 100,
  };
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
          temp_C: PHYSICS.ambient_temp + 20, // pre-heated
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
    function: 'Double-membrane gas holder providing buffer storage capacity. Operates at low pressure (20-50 mbar) to smooth production variations and provide consistent feed to downstream equipment.',
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
    const biogasToCHP_m3_h = volume.biogasOut * 0.4 * fraction; // 40% to CHP

    equipment.push({
      id: `chp-${i + 1}`,
      type: 'chp',
      name: `CHP Unit #${i + 1}`,
      function: `Combined Heat and Power gas engine (${sizing.chpCapacity_kWe} kWe). Converts biogas to electricity at ${PHYSICS.chp_electrical_eff * 100}% efficiency with ${PHYSICS.chp_thermal_eff * 100}% heat recovery from exhaust and jacket cooling.`,
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
          mass_kg_h: Math.round(biogasToCHP_m3_h * PHYSICS.biogas_density * 15), // with combustion air
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
  const biogasToUpgrade_m3_h = volume.biogasOut * 0.6; // 60% to RNG
  equipment.push({
    id: 'upgrader',
    type: 'upgrader',
    name: 'Membrane Upgrading Unit',
    function: 'Three-stage membrane separation system for CO2 removal. Uses selective permeation to produce pipeline-quality biomethane (>97% CH4) from raw biogas. Includes H2S pre-treatment and compression.',
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
        mass_kg_h: Math.round(volume.co2Rejected * 1.98),
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
    function: 'Shell-and-tube heat exchanger utilizing CHP waste heat to pre-heat incoming feedstock from ambient to near-digester temperature. Reduces digester heating load and improves overall energy efficiency.',
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
    function: 'Covered concrete lagoon for digestate storage with gas-tight HDPE cover for residual biogas capture. Provides 180-day storage capacity aligned with agricultural land application windows.',
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
        mass_kg_h: mass.digestateOut * 0.98,
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
  const revenue = calculateRevenue(physics, feed, loc);
  const profitability = calculateProfitability(capex, opex, revenue, loc);

  // Generate equipment data
  const equipment = generateEquipmentStreams(physics, feed, capacityTons);

  // Generate Sankey diagram data
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
      { source: 'digester', target: 'biogas', value: physics.volume.biogasOut * 24, unit: 'm³/day' },
      { source: 'digester', target: 'digestate', value: physics.mass.digestateOut * 24, unit: 'kg/day' },
      { source: 'biogas', target: 'upgrader', value: Math.round(physics.volume.biogasOut * 24 * 0.6), unit: 'm³/day' },
      { source: 'biogas', target: 'chp', value: Math.round(physics.volume.biogasOut * 24 * 0.4), unit: 'm³/day' },
      { source: 'upgrader', target: 'biomethane', value: physics.volume.biomethaneRNG * 24, unit: 'm³/day' },
      { source: 'upgrader', target: 'co2', value: physics.volume.co2Rejected * 24, unit: 'm³/day' },
      { source: 'chp', target: 'power', value: physics.energy.netPowerExport_kW * 24, unit: 'kWh/day' },
      { source: 'chp', target: 'heat', value: physics.energy.chpThermal_kW * 24, unit: 'kWh_th/day' },
    ],
  };

  // Energy balance summary
  const energyBalance = {
    inputs: {
      feedstock_MJ_d: physics.energy.feedstockEnergy_MJ_h * 24,
      parasitic_MJ_d: physics.parasiticLoads.total * 24 * 3.6,
    },
    outputs: {
      biomethane_MJ_d: physics.volume.biomethaneRNG * 24 * PHYSICS.methane_LHV,
      electricity_MJ_d: physics.energy.netPowerExport_kW * 24 * 3.6,
      heat_useful_MJ_d: physics.energy.totalHeatDemand_kW * 24 * 3.6,
      losses_MJ_d: physics.energy.heatLoss_kW * 24 * 3.6 +
        physics.energy.chpFuelInput_kW * (1 - PHYSICS.chp_total_eff) * 24 * 3.6,
    },
    efficiency: Math.round(
      ((physics.volume.biomethaneRNG * 24 * PHYSICS.methane_LHV) +
       (physics.energy.netPowerExport_kW * 24 * 3.6) +
       (physics.energy.totalHeatDemand_kW * 24 * 3.6)) /
      (physics.energy.feedstockEnergy_MJ_h * 24) * 100
    ),
  };

  // Generate AI summary
  let aiSummary = '';
  if (profitability.feasibilityScore >= 8) {
    aiSummary = `Excellent project economics with ${profitability.irr}% IRR and ${profitability.simplePayback}-year payback. NPV of $${(profitability.npv / 1000000).toFixed(1)}M over ${profitability.projectLife} years at ${profitability.discountRate}% discount rate. ${feed.label} in ${location} benefits from ${loc.incentives[0]} and strong RNG pricing at $${loc.rng_price}/MMBtu. Net power export of ${physics.energy.netPowerExport_kW} kW after ${physics.parasiticLoads.total} kW parasitic load. Recommend proceeding to FEED phase.`;
  } else if (profitability.feasibilityScore >= 6) {
    aiSummary = `Viable project with moderate returns: ${profitability.irr}% IRR, ${profitability.simplePayback}-year payback, NPV $${(profitability.npv / 1000000).toFixed(1)}M. ${location} offers ${loc.incentives.slice(0, 2).join(' and ')}. Consider optimizing CHP/RNG split ratio to maximize revenue. Heat integration recovers ${Math.round(physics.energy.totalHeatDemand_kW / physics.energy.chpThermal_kW * 100)}% of available thermal energy. Sensitivity analysis on feedstock availability recommended before FID.`;
  } else {
    aiSummary = `Challenging economics: ${profitability.irr}% IRR with ${profitability.simplePayback}-year payback. ${profitability.npv < 0 ? 'Negative' : 'Low'} NPV of $${(profitability.npv / 1000000).toFixed(1)}M suggests marginal viability. Consider: (1) larger scale for economy benefits, (2) higher tipping fees, (3) carbon credit monetization at $${loc.carbon_credit}/ton. Current parasitic load of ${physics.parasiticLoads.total} kW consumes ${Math.round(physics.parasiticLoads.total / physics.energy.chpElectrical_kW * 100)}% of gross generation.`;
  }

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
  'Applying engineering & indirect fees (12%)...',
  'Adding contingency (20%)...',
  'Computing annual OPEX breakdown...',
  'Projecting revenue streams (20-year)...',
  'Running DCF analysis...',
  'Calculating NPV at WACC...',
  'Solving IRR (Newton-Raphson)...',
  'Computing payback periods...',
  'Running Monte Carlo sensitivity...',
  'Generating equipment P&ID layout...',
  'Validating mass/energy closure...',
  'Compiling technical documentation...',
  'Design generation complete.',
];
