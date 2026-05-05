import { GoogleGenerativeAI } from '@google/generative-ai';

export function getApiKey() {
  const localKey = localStorage.getItem('gemini_api_key');
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Return key only if it's a real key (not empty or placeholder)
  if (localKey && localKey.length > 10) return localKey;
  if (envKey && envKey.length > 10 && !envKey.includes('your_')) return envKey;
  return null;
}

export function setApiKey(key) {
  localStorage.setItem('gemini_api_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

export function clearApiKey() {
  localStorage.removeItem('gemini_api_key');
}

const VALID_FEEDSTOCKS = ['manure', 'food_waste', 'crop_residue', 'sewage_sludge', 'mixed_waste'];
const VALID_LOCATIONS = ['Ohio, USA', 'California, USA', 'Texas, USA', 'Germany', 'India', 'United Kingdom', 'Australia', 'Brazil', 'China', 'Other'];

const DESIGN_PROMPT_SYSTEM = {
  role: "user",
  parts: [{ text: `You are BasisAI, an expert biomethane plant design assistant. Analyze user requests and extract parameters for the engineering calculations.

Extract THREE parameters:
1. capacity - tons per day (number only)
2. feedstock - one of: manure, food_waste, crop_residue, sewage_sludge, mixed_waste
3. location - one of: Ohio USA, California USA, Texas USA, Germany, India, United Kingdom, Australia, Brazil, China, Other

Feedstock mapping:
- dairy/cattle/pig/poultry manure, animal waste -> manure
- restaurant/kitchen/organic waste, food scraps -> food_waste
- corn stover, wheat straw, agricultural residue -> crop_residue
- wastewater solids, municipal sludge -> sewage_sludge
- combination of above -> mixed_waste

Location mapping - pick closest match or use Other.

RULES:
- Only biomethane/biogas plants supported
- If user asks for hydrogen/ammonia/methanol, explain this tool is for biomethane only
- If any parameter unclear, ask for clarification conversationally
- When ALL THREE confirmed, respond ONLY with JSON block below (no other text):

json
{"status":"complete","capacity":NUMBER,"feedstock":"TYPE","location":"LOCATION"}

If parameters missing, ask conversationally (no JSON).` }]
};

export async function analyzeDesignPrompt(conversationHistory) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured. Please add your Gemini API key in settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Filter to only user/assistant messages, excluding the initial welcome message
  // and ensure history starts with a user message
  const filteredHistory = conversationHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');

  // Find first user message index
  const firstUserIndex = filteredHistory.findIndex(msg => msg.role === 'user');
  if (firstUserIndex === -1) {
    throw new Error('No user message found');
  }

  // Only include messages from first user message onwards
  const validHistory = filteredHistory.slice(firstUserIndex);

  // Build history for Gemini (all but the last message)
  const history = validHistory.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // For first message, prepend system context
  const systemText = DESIGN_PROMPT_SYSTEM.parts[0].text;

  const chat = model.startChat({
    history,
  });

  const lastMessage = validHistory[validHistory.length - 1];
  // Include system prompt with first user message if history is empty
  const messageToSend = history.length === 0
    ? `${systemText}\n\nUser request: ${lastMessage.content}`
    : lastMessage.content;

  const result = await chat.sendMessage(messageToSend);
  const responseText = result.response.text();

  // Try to find JSON in response (with or without markdown code block)
  let jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
  let jsonStr = jsonMatch ? jsonMatch[1] : null;

  // Also try to find raw JSON object
  if (!jsonStr) {
    const rawMatch = responseText.match(/\{[\s\S]*"status"[\s\S]*"complete"[\s\S]*\}/);
    if (rawMatch) jsonStr = rawMatch[0];
  }

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.status === 'complete' && typeof parsed.capacity === 'number' && parsed.feedstock && parsed.location) {
        // Normalize feedstock
        let feedstock = parsed.feedstock.toLowerCase().replace(/\s+/g, '_');
        if (!VALID_FEEDSTOCKS.includes(feedstock)) {
          if (feedstock.includes('manure') || feedstock.includes('dairy') || feedstock.includes('cattle')) feedstock = 'manure';
          else if (feedstock.includes('food') || feedstock.includes('organic')) feedstock = 'food_waste';
          else if (feedstock.includes('crop') || feedstock.includes('residue') || feedstock.includes('straw')) feedstock = 'crop_residue';
          else if (feedstock.includes('sludge') || feedstock.includes('sewage')) feedstock = 'sewage_sludge';
          else feedstock = 'mixed_waste';
        }

        // Normalize location
        let location = parsed.location;
        const locLower = location.toLowerCase();
        if (locLower.includes('ohio')) location = 'Ohio, USA';
        else if (locLower.includes('california')) location = 'California, USA';
        else if (locLower.includes('texas')) location = 'Texas, USA';
        else if (locLower.includes('germany')) location = 'Germany';
        else if (locLower.includes('india')) location = 'India';
        else if (locLower.includes('uk') || locLower.includes('united kingdom') || locLower.includes('britain')) location = 'United Kingdom';
        else if (locLower.includes('australia')) location = 'Australia';
        else if (locLower.includes('brazil')) location = 'Brazil';
        else if (locLower.includes('china')) location = 'China';
        else if (!VALID_LOCATIONS.includes(location)) location = 'Other';

        return {
          type: 'complete',
          parameters: {
            capacity: parsed.capacity,
            feedstock: feedstock,
            location: location
          }
        };
      }
    } catch (e) {
      // JSON parse failed, treat as conversation
    }
  }

  return {
    type: 'conversation',
    message: responseText.replace(/```json?[\s\S]*?```/g, '').trim()
  };
}

function buildSystemPrompt(plantData) {
  const basePrompt = `You are an expert biomethane plant design engineer and financial analyst assistant for BasisAI, a generative design tool for anaerobic digestion plants.

Your role is to:
1. Review and validate plant design calculations
2. Answer technical questions about the design
3. Identify potential issues or optimization opportunities
4. Explain financial projections and assumptions
5. Suggest improvements based on industry best practices

Always be specific and reference actual numbers from the design data. Use engineering terminology appropriately. Keep responses concise but thorough.`;

  if (!plantData) {
    return `${basePrompt}\n\nCurrently, no plant design has been generated. Help the user understand how to use the tool or answer general questions about biogas/biomethane plants.`;
  }

  return `${basePrompt}

## Current Plant Design Context

### Design Inputs
- Capacity: ${plantData.inputs.capacity} tons/day
- Feedstock: ${plantData.inputs.feedstock}
- Location: ${plantData.inputs.location}

### Process Physics
- Feed Rate: ${plantData.physics.mass.feedIn.toFixed(1)} kg/h
- Biogas Production: ${plantData.physics.volume.biogasOut.toFixed(1)} m³/h
- Biomethane (RNG) Output: ${plantData.physics.volume.biomethaneRNG.toFixed(1)} m³/h
- Methane Content: ${(plantData.physics.compositions.biogas.CH4 * 100).toFixed(1)}%
- Energy Efficiency: ${plantData.physics.energy.efficiency_pct.toFixed(1)}%
- Net Power Export: ${plantData.physics.energy.netPowerExport_kW.toFixed(1)} kW

### Equipment Sizing
- Digesters: ${plantData.physics.sizing.numDigesters} x ${plantData.physics.sizing.digesterVolume_m3.toFixed(0)} m³
- CHP Units: ${plantData.physics.sizing.numCHP} x ${plantData.physics.sizing.chpCapacity_kWe.toFixed(0)} kWe
- Upgrader Capacity: ${plantData.physics.sizing.upgraderCapacity_m3_h.toFixed(0)} m³/h
- HRT: ${plantData.physics.sizing.HRT_days.toFixed(1)} days
- OLR: ${plantData.physics.sizing.OLR_kgVS_m3_d.toFixed(2)} kg VS/m³/day

### Financial Summary
- Total CAPEX: $${(plantData.financials.capex.total / 1000000).toFixed(2)}M (${plantData.financials.capex.class})
- Annual OPEX: $${(plantData.financials.opex.total / 1000).toFixed(0)}K/year
- Annual Revenue: $${(plantData.financials.revenue.total / 1000).toFixed(0)}K/year
- IRR: ${plantData.financials.profitability.irr}
- NPV: $${(plantData.financials.profitability.npv / 1000000).toFixed(2)}M
- Simple Payback: ${plantData.financials.profitability.simplePayback} years
- Feasibility Score: ${plantData.financials.profitability.feasibilityScore}/10
- Project Viable: ${plantData.financials.profitability.isViable ? 'Yes' : 'No'}

### Revenue Breakdown
- RNG Sales: $${(plantData.financials.revenue.rng / 1000).toFixed(0)}K/year
- Electricity: $${(plantData.financials.revenue.electricity / 1000).toFixed(0)}K/year
- Tipping Fees: $${(plantData.financials.revenue.tippingFees / 1000).toFixed(0)}K/year
- Carbon Credits: $${(plantData.financials.revenue.carbon / 1000).toFixed(0)}K/year

### Current Assessment
${plantData.financials.aiSummary}

Reference this data when answering questions. Be specific about numbers and calculations.`;
}

export async function sendChatMessage(messages, plantData) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured. Please add your Gemini API key in settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = buildSystemPrompt(plantData);

  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
