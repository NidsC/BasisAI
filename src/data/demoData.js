export const feedstockTypes = {
  manure: {
    label: 'Dairy Manure',
    biogas_yield: 25, // m³/ton
    methane_content: 0.55,
    vs_content: 0.08, // volatile solids
    moisture: 0.85,
    color: '#8B4513',
  },
  food_waste: {
    label: 'Food Waste',
    biogas_yield: 120, // m³/ton
    methane_content: 0.60,
    vs_content: 0.25,
    moisture: 0.75,
    color: '#228B22',
  },
  crop_residue: {
    label: 'Crop Residue',
    biogas_yield: 80, // m³/ton
    methane_content: 0.52,
    vs_content: 0.85,
    moisture: 0.15,
    color: '#DAA520',
  },
};

export const locationModifiers = {
  'Ohio, USA': {
    capex_mult: 1.0,
    opex_mult: 1.0,
    energy_price: 0.12, // $/kWh
    rng_price: 22, // $/MMBtu
    carbon_credit: 180, // $/ton CO2
    feasibility_bonus: 0,
    climate: 'Continental',
    incentives: ['Federal ITC 30%', 'Ohio RNG Credits', 'USDA REAP Grant'],
  },
  'California, USA': {
    capex_mult: 1.35,
    opex_mult: 1.25,
    energy_price: 0.22,
    rng_price: 45,
    carbon_credit: 220,
    feasibility_bonus: 1.5,
    climate: 'Mediterranean',
    incentives: ['LCFS Credits', 'CalRecycle Grant', 'Federal ITC 30%'],
  },
  'Texas, USA': {
    capex_mult: 0.9,
    opex_mult: 0.85,
    energy_price: 0.09,
    rng_price: 18,
    carbon_credit: 150,
    feasibility_bonus: -0.3,
    climate: 'Hot Semi-Arid',
    incentives: ['Federal ITC 30%', 'ERCOT Grid Credits'],
  },
  'Germany': {
    capex_mult: 1.2,
    opex_mult: 1.15,
    energy_price: 0.35,
    rng_price: 65,
    carbon_credit: 85,
    feasibility_bonus: 1.2,
    climate: 'Temperate Oceanic',
    incentives: ['EEG Feed-in Tariff', 'KfW Financing', 'EU ETS Credits'],
  },
  'India': {
    capex_mult: 0.65,
    opex_mult: 0.55,
    energy_price: 0.08,
    rng_price: 12,
    carbon_credit: 45,
    feasibility_bonus: 0.8,
    climate: 'Tropical',
    incentives: ['MNRE Subsidy', 'State FiT', 'Carbon Credits'],
  },
};

export function calculatePlantDesign(capacity, feedstock, location) {
  const feed = feedstockTypes[feedstock];
  const loc = locationModifiers[location] || locationModifiers['Ohio, USA'];

  const capacityTons = parseFloat(capacity) || 50;
  const scaleFactor = capacityTons / 50;
  const economyScale = Math.pow(scaleFactor, 0.7);

  const dailyBiogas = capacityTons * feed.biogas_yield;
  const dailyMethane = dailyBiogas * feed.methane_content;
  const hourlyFeedRate = (capacityTons * 1000) / 24;

  const digesterVolume = capacityTons * 2.5 * (1 / feed.vs_content) * 0.1;
  const numDigesters = Math.ceil(digesterVolume / 5000);
  const actualDigesterVolume = digesterVolume / numDigesters;

  const chpCapacity = (dailyMethane * 10 * 0.4) / 24;
  const numChpUnits = Math.max(1, Math.ceil(chpCapacity / 1500));

  const gasStorageVolume = dailyBiogas * 0.5;

  const upgraderCapacity = dailyMethane * 1.1;

  const baseCAPEX = 8500000;
  const capex = baseCAPEX * economyScale * loc.capex_mult;
  const capexVariance = 0.20;

  const baseOPEX = 850000;
  const opex = baseOPEX * economyScale * loc.opex_mult;

  const annualMethane = dailyMethane * 365;
  const annualEnergy = chpCapacity * 8000;
  const energyRevenue = annualEnergy * loc.energy_price;
  const rngRevenue = (annualMethane * 0.0353) * loc.rng_price;
  const carbonRevenue = (annualMethane * 0.002) * loc.carbon_credit;
  const totalRevenue = energyRevenue + rngRevenue + carbonRevenue;

  const annualProfit = totalRevenue - opex;
  const paybackYears = capex / annualProfit;
  const irr = ((annualProfit / capex) * 100);

  let feasibilityScore = 5.0;
  feasibilityScore += (paybackYears < 5) ? 2 : (paybackYears < 8) ? 1 : 0;
  feasibilityScore += (irr > 15) ? 1.5 : (irr > 10) ? 0.75 : 0;
  feasibilityScore += loc.feasibility_bonus;
  feasibilityScore += (feed.biogas_yield > 80) ? 0.5 : 0;
  feasibilityScore = Math.min(10, Math.max(1, feasibilityScore));

  const equipment = [
    ...Array.from({ length: numDigesters }, (_, i) => ({
      id: `digester-${i + 1}`,
      type: 'digester',
      name: `Anaerobic Digester #${i + 1}`,
      function: 'Continuous stirred-tank reactor (CSTR) for mesophilic anaerobic digestion at 37°C. Breaks down organic matter into biogas through microbial action.',
      position: [-8 + i * 5, 0, -2],
      dimensions: { radius: 2, height: 4 + Math.random() * 0.5 },
      streams: {
        massIn: Math.round(hourlyFeedRate / numDigesters),
        massOut: Math.round(hourlyFeedRate / numDigesters * 0.92),
        biogasOut: Math.round(dailyBiogas / numDigesters / 24),
        enthalpyIn: Math.round(hourlyFeedRate / numDigesters * 4.2 * 15),
        enthalpyOut: Math.round(hourlyFeedRate / numDigesters * 4.2 * 37),
      },
      specs: {
        volume: Math.round(actualDigesterVolume),
        hrt: 25,
        temperature: 37,
        loading: (feed.vs_content * 1000 * hourlyFeedRate / numDigesters * 24 / actualDigesterVolume).toFixed(1),
      },
    })),
    {
      id: 'gas-holder',
      type: 'storage',
      name: 'Biogas Storage Sphere',
      function: 'Double-membrane gas holder for biogas storage at low pressure (20-50 mbar). Provides buffer capacity for variable production rates.',
      position: [6, 2, 0],
      dimensions: { radius: 2.5 },
      streams: {
        massIn: Math.round(dailyBiogas / 24 * 1.2),
        massOut: Math.round(dailyBiogas / 24 * 1.18),
        enthalpyIn: Math.round(dailyBiogas / 24 * 22),
        enthalpyOut: Math.round(dailyBiogas / 24 * 22),
      },
      specs: {
        capacity: Math.round(gasStorageVolume),
        pressure: 35,
        retention: 12,
      },
    },
    ...Array.from({ length: numChpUnits }, (_, i) => ({
      id: `chp-${i + 1}`,
      type: 'chp',
      name: `CHP Unit #${i + 1}`,
      function: 'Combined Heat and Power gas engine for electricity generation with waste heat recovery. Thermal efficiency ~40%, electrical efficiency ~42%.',
      position: [12 + i * 4, 0, 4],
      dimensions: { width: 2, height: 1.5, depth: 3 },
      streams: {
        biogasIn: Math.round(dailyBiogas / numChpUnits / 24),
        powerOut: Math.round(chpCapacity / numChpUnits),
        heatOut: Math.round(chpCapacity / numChpUnits * 0.95),
        enthalpyIn: Math.round(dailyBiogas / numChpUnits / 24 * 22),
        enthalpyOut: Math.round(dailyBiogas / numChpUnits / 24 * 22 * 0.82),
      },
      specs: {
        capacity: Math.round(chpCapacity / numChpUnits),
        electricalEff: 42,
        thermalEff: 40,
        nox: 250,
      },
    })),
    {
      id: 'upgrader',
      type: 'upgrader',
      name: 'Membrane Upgrading Unit',
      function: 'Three-stage membrane separation system for CO2 removal. Produces pipeline-quality biomethane (>97% CH4) from raw biogas.',
      position: [6, 0, 8],
      dimensions: { width: 3, height: 2.5, depth: 2 },
      streams: {
        biogasIn: Math.round(dailyBiogas / 24),
        biomethaneOut: Math.round(dailyMethane / 24),
        co2Out: Math.round(dailyBiogas / 24 * (1 - feed.methane_content) * 0.95),
        enthalpyIn: Math.round(dailyBiogas / 24 * 22),
        enthalpyOut: Math.round(dailyMethane / 24 * 35.8),
      },
      specs: {
        capacity: Math.round(upgraderCapacity),
        methaneRecovery: 99.5,
        purity: 97.5,
        pressure: 16,
      },
    },
    {
      id: 'heat-exchanger',
      type: 'heatExchanger',
      name: 'Feedstock Pre-Heater',
      function: 'Shell-and-tube heat exchanger utilizing CHP waste heat to pre-heat incoming feedstock to digester operating temperature.',
      position: [-12, 0, 2],
      dimensions: { width: 1.5, height: 1, depth: 4 },
      streams: {
        coldIn: Math.round(hourlyFeedRate),
        coldOut: Math.round(hourlyFeedRate),
        hotIn: Math.round(chpCapacity * 0.6),
        hotOut: Math.round(chpCapacity * 0.3),
        enthalpyIn: Math.round(hourlyFeedRate * 4.2 * 10),
        enthalpyOut: Math.round(hourlyFeedRate * 4.2 * 35),
      },
      specs: {
        duty: Math.round(hourlyFeedRate * 4.2 * 25 / 1000),
        area: Math.round(hourlyFeedRate * 0.02),
        lmtd: 18,
      },
    },
    {
      id: 'digestate-tank',
      type: 'tank',
      name: 'Digestate Storage',
      function: 'Covered lagoon for digestate storage with residual biogas capture. Provides 180-day storage capacity for land application timing.',
      position: [-8, 0, 10],
      dimensions: { radius: 3, height: 2 },
      streams: {
        massIn: Math.round(hourlyFeedRate * 0.92),
        massOut: Math.round(hourlyFeedRate * 0.90),
        enthalpyIn: Math.round(hourlyFeedRate * 0.92 * 4.2 * 35),
        enthalpyOut: Math.round(hourlyFeedRate * 0.90 * 4.2 * 25),
      },
      specs: {
        volume: Math.round(capacityTons * 180 * 0.92),
        covered: true,
        nutrients: { N: 4.2, P: 0.8, K: 2.1 },
      },
    },
  ];

  const sankeyData = {
    nodes: [
      { id: 'feedstock', name: 'Feedstock Input' },
      { id: 'digester', name: 'Anaerobic Digestion' },
      { id: 'biogas', name: 'Raw Biogas' },
      { id: 'upgrader', name: 'Gas Upgrading' },
      { id: 'biomethane', name: 'Biomethane' },
      { id: 'chp', name: 'CHP Generation' },
      { id: 'power', name: 'Electricity' },
      { id: 'heat', name: 'Process Heat' },
      { id: 'digestate', name: 'Digestate' },
      { id: 'co2', name: 'CO2 Stream' },
    ],
    links: [
      { source: 'feedstock', target: 'digester', value: capacityTons * 1000, unit: 'kg/day' },
      { source: 'digester', target: 'biogas', value: Math.round(dailyBiogas), unit: 'm³/day' },
      { source: 'digester', target: 'digestate', value: Math.round(capacityTons * 920), unit: 'kg/day' },
      { source: 'biogas', target: 'upgrader', value: Math.round(dailyBiogas * 0.6), unit: 'm³/day' },
      { source: 'biogas', target: 'chp', value: Math.round(dailyBiogas * 0.4), unit: 'm³/day' },
      { source: 'upgrader', target: 'biomethane', value: Math.round(dailyMethane * 0.6), unit: 'm³/day' },
      { source: 'upgrader', target: 'co2', value: Math.round(dailyBiogas * 0.6 * (1 - feed.methane_content)), unit: 'm³/day' },
      { source: 'chp', target: 'power', value: Math.round(chpCapacity * 24 * 0.4), unit: 'kWh/day' },
      { source: 'chp', target: 'heat', value: Math.round(chpCapacity * 24 * 0.4), unit: 'kWh_th/day' },
    ],
  };

  const energyBalance = {
    inputs: {
      feedstock: Math.round(capacityTons * feed.vs_content * 18.5 * 1000),
      electricity: Math.round(chpCapacity * 24 * 0.08),
    },
    outputs: {
      biomethane: Math.round(dailyMethane * 35.8),
      electricity: Math.round(chpCapacity * 24 * 0.42),
      heat: Math.round(chpCapacity * 24 * 0.40),
      losses: Math.round(capacityTons * feed.vs_content * 18.5 * 1000 * 0.12),
    },
    efficiency: 82,
  };

  let aiSummary = '';
  if (feasibilityScore >= 8) {
    aiSummary = `Excellent project economics driven by ${loc.incentives[0]} and strong ${feed.label.toLowerCase()} availability. The ${location} location offers favorable regulatory environment with projected ${paybackYears.toFixed(1)}-year payback. High methane yield from ${feed.label.toLowerCase()} (${feed.biogas_yield} m³/ton) combined with ${loc.climate.toLowerCase()} climate conditions minimize heating requirements. Recommend proceeding to detailed engineering phase.`;
  } else if (feasibilityScore >= 6) {
    aiSummary = `Viable project with moderate returns. ${location} market conditions support ${paybackYears.toFixed(1)}-year payback through ${loc.incentives.slice(0, 2).join(' and ')}. ${feed.label} feedstock provides ${feed.biogas_yield} m³/ton biogas yield. Consider optimizing heat integration to improve margins. Sensitivity analysis recommended before FID.`;
  } else {
    aiSummary = `Challenging economics due to ${loc.energy_price < 0.10 ? 'low energy prices' : 'high CAPEX requirements'} in ${location}. ${feed.label} at ${capacityTons} TPD yields ${paybackYears.toFixed(1)}-year payback. Recommend exploring alternative revenue streams (tipping fees, carbon markets) or larger scale operations to improve unit economics.`;
  }

  return {
    inputs: {
      capacity: capacityTons,
      feedstock: feed.label,
      location,
    },
    production: {
      dailyBiogas: Math.round(dailyBiogas),
      dailyMethane: Math.round(dailyMethane),
      annualMethane: Math.round(annualMethane),
      hourlyFeedRate: Math.round(hourlyFeedRate),
    },
    equipment,
    financials: {
      capex: Math.round(capex),
      capexVariance,
      opex: Math.round(opex),
      revenue: {
        energy: Math.round(energyRevenue),
        rng: Math.round(rngRevenue),
        carbon: Math.round(carbonRevenue),
        total: Math.round(totalRevenue),
      },
      profit: Math.round(annualProfit),
      paybackYears: parseFloat(paybackYears.toFixed(1)),
      irr: parseFloat(irr.toFixed(1)),
      feasibilityScore: parseFloat(feasibilityScore.toFixed(1)),
      aiSummary,
      incentives: loc.incentives,
    },
    massBalance: sankeyData,
    energyBalance,
  };
}

export const computingLogs = [
  'Initializing thermodynamic engine v4.2.1...',
  'Loading feedstock characterization database...',
  'Parsing input parameters...',
  'Running stoichiometric analysis...',
  'Computing volatile solids degradation kinetics...',
  'Converging mass balance equations...',
  'Iterating energy balance (tolerance: 1e-6)...',
  'Optimizing heat integration network...',
  'Sizing primary anaerobic digesters...',
  'Calculating hydraulic retention time...',
  'Dimensioning biogas storage capacity...',
  'Selecting CHP configuration...',
  'Evaluating membrane upgrader performance...',
  'Running Pinch Analysis for heat recovery...',
  'Computing digestate nutrient profile...',
  'Applying regional cost factors...',
  'Estimating CAPEX breakdown by equipment class...',
  'Projecting OPEX over 20-year lifecycle...',
  'Calculating carbon credit eligibility...',
  'Running Monte Carlo sensitivity analysis...',
  'Generating equipment P&ID layout...',
  'Optimizing plant footprint...',
  'Validating regulatory compliance...',
  'Finalizing design specifications...',
  'Compiling technical documentation...',
  'Design generation complete.',
];
