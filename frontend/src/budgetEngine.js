/**
 * Client-side Wedding Budget Engine
 * Ported from backend/routers/budget.py + backend/models.py
 * Runs entirely in the browser — no backend required.
 */

// ─── Cost Tables (from budget.py) ────────────────────────────────────────────

const VENUE_RATES = {
  "5star_palace": [900000, 2000000],
  "5star_city": [500000, 1100000],
  "4star": [250000, 550000],
  resort: [300000, 750000],
  farmhouse: [150000, 350000],
};

const ROOM_RATES = {
  "5star_palace": [18000, 42000],
  "5star_city": [12000, 26000],
  "4star": [7000, 15000],
  resort: [8000, 18000],
  farmhouse: [4000, 10000],
};

const PHOTO_RATES = {
  "5star_palace": [300000, 900000],
  "5star_city": [220000, 700000],
  "4star": [125000, 400000],
  resort: [150000, 480000],
  farmhouse: [80000, 250000],
};

const BAR_RATES = {
  dry: [0, 0],
  beer_wine: [1500, 3500],
  full_bar: [2500, 6000],
};

const DECOR_RATES = {
  budget: {
    mehendi: [80000, 180000],
    haldi: [70000, 160000],
    sangeet: [160000, 300000],
    baraat: [60000, 150000],
    pheras: [150000, 300000],
    reception: [180000, 350000],
  },
  mid: {
    mehendi: [150000, 350000],
    haldi: [120000, 300000],
    sangeet: [280000, 650000],
    baraat: [90000, 220000],
    pheras: [300000, 650000],
    reception: [350000, 900000],
  },
  premium: {
    mehendi: [250000, 550000],
    haldi: [220000, 500000],
    sangeet: [450000, 1100000],
    baraat: [150000, 350000],
    pheras: [500000, 1200000],
    reception: [650000, 1600000],
  },
  "ultra-premium": {
    mehendi: [450000, 900000],
    haldi: [400000, 800000],
    sangeet: [900000, 2000000],
    baraat: [300000, 700000],
    pheras: [900000, 2200000],
    reception: [1200000, 3000000],
  },
};

const ENTERTAINMENT_MULTIPLIER = { minimal: 0.6, standard: 1.0, premium: 1.45 };

const MEAL_BY_FUNCTION = {
  mehendi: "floating_snacks",
  haldi: "lunch_buffet",
  sangeet: "gala_dinner",
  baraat: "floating_snacks",
  pheras: "lunch_buffet",
  reception: "gala_dinner",
};

// ─── Seed Data (from models.py) ──────────────────────────────────────────────

const FB_RATE_GRID = {
  "5star_palace": { welcome_dinner: [2200, 4200], lunch_buffet: [1800, 3200], gala_dinner: [3000, 6500], floating_snacks: [900, 1800] },
  "5star_city": { welcome_dinner: [1800, 3400], lunch_buffet: [1500, 2600], gala_dinner: [2400, 4800], floating_snacks: [800, 1600] },
  "4star": { welcome_dinner: [1200, 2200], lunch_buffet: [1100, 2000], gala_dinner: [1600, 3200], floating_snacks: [550, 1100] },
  resort: { welcome_dinner: [1400, 2600], lunch_buffet: [1200, 2100], gala_dinner: [1800, 3600], floating_snacks: [650, 1300] },
  farmhouse: { welcome_dinner: [900, 1800], lunch_buffet: [850, 1500], gala_dinner: [1200, 2400], floating_snacks: [450, 900] },
};

const LOGISTICS_DATA = {
  udaipur: { ghodi_min: 25000, ghodi_max: 60000, dholi_per_hour_min: 8000, dholi_per_hour_max: 18000, innova_per_day_min: 5500, innova_per_day_max: 8500 },
  jaipur: { ghodi_min: 20000, ghodi_max: 50000, dholi_per_hour_min: 6000, dholi_per_hour_max: 15000, innova_per_day_min: 4500, innova_per_day_max: 7500 },
  mumbai: { ghodi_min: 35000, ghodi_max: 80000, dholi_per_hour_min: 10000, dholi_per_hour_max: 25000, innova_per_day_min: 6000, innova_per_day_max: 10000 },
  delhi: { ghodi_min: 30000, ghodi_max: 70000, dholi_per_hour_min: 8000, dholi_per_hour_max: 20000, innova_per_day_min: 5000, innova_per_day_max: 8000 },
  goa: { ghodi_min: 28000, ghodi_max: 65000, dholi_per_hour_min: 7000, dholi_per_hour_max: 18000, innova_per_day_min: 5500, innova_per_day_max: 9000 },
  jodhpur: { ghodi_min: 22000, ghodi_max: 55000, dholi_per_hour_min: 7000, dholi_per_hour_max: 16000, innova_per_day_min: 5000, innova_per_day_max: 7800 },
  hyderabad: { ghodi_min: 25000, ghodi_max: 60000, dholi_per_hour_min: 7000, dholi_per_hour_max: 17000, innova_per_day_min: 4800, innova_per_day_max: 7600 },
};

export const ARTIST_SEED = [
  { id: 1, category: "singer", tier: "a_list", name: "Bollywood A-List Singer", cost_min: 1200000, cost_max: 2500000, notes: "Requires premium hospitality + travel" },
  { id: 2, category: "singer", tier: "premium", name: "Premium Playback Singer", cost_min: 500000, cost_max: 1200000, notes: "Great for sangeet headline slot" },
  { id: 3, category: "singer", tier: "standard", name: "Regional Performance Singer", cost_min: 180000, cost_max: 450000, notes: "Performs 60-90 minute set" },
  { id: 4, category: "singer", tier: "local", name: "Local Sufi Singer", cost_min: 45000, cost_max: 120000, notes: "Popular for mehendi welcome" },
  { id: 5, category: "live_band", tier: "premium", name: "Celebrity Wedding Band", cost_min: 800000, cost_max: 1800000, notes: "Includes 8-10 artists" },
  { id: 6, category: "live_band", tier: "standard", name: "Curated Live Band", cost_min: 250000, cost_max: 650000, notes: "4-6 piece ensemble" },
  { id: 7, category: "live_band", tier: "local", name: "Acoustic Duo", cost_min: 50000, cost_max: 150000, notes: "Cocktail or brunch set" },
  { id: 8, category: "dj", tier: "a_list", name: "Celebrity DJ", cost_min: 400000, cost_max: 1000000, notes: "Includes premium setup rider" },
  { id: 9, category: "dj", tier: "premium", name: "Club Headliner DJ", cost_min: 180000, cost_max: 400000, notes: "Strong sangeet/reception fit" },
  { id: 10, category: "dj", tier: "standard", name: "Wedding DJ", cost_min: 100000, cost_max: 350000, notes: "Common all-rounder" },
  { id: 11, category: "dj", tier: "local", name: "Local DJ Console", cost_min: 30000, cost_max: 90000, notes: "Budget-friendly option" },
  { id: 12, category: "folk", tier: "premium", name: "Rajasthani Folk Ensemble", cost_min: 120000, cost_max: 250000, notes: "Perfect for baraat or welcome" },
  { id: 13, category: "folk", tier: "standard", name: "Folk Dance Troupe", cost_min: 80000, cost_max: 200000, notes: "Traditional performance block" },
  { id: 14, category: "choreographer", tier: "premium", name: "Celebrity Choreography Team", cost_min: 300000, cost_max: 800000, notes: "Includes rehearsal planning" },
  { id: 15, category: "choreographer", tier: "standard", name: "Wedding Choreographer", cost_min: 80000, cost_max: 250000, notes: "3-5 family performances" },
  { id: 16, category: "anchor", tier: "premium", name: "Celebrity Anchor", cost_min: 250000, cost_max: 600000, notes: "Great for sangeet stage flow" },
  { id: 17, category: "anchor", tier: "standard", name: "Professional Wedding MC", cost_min: 50000, cost_max: 150000, notes: "Suitable for reception" },
  { id: 18, category: "special", tier: "premium", name: "LED Dhol Act", cost_min: 150000, cost_max: 350000, notes: "High-energy baraat feature" },
  { id: 19, category: "special", tier: "standard", name: "Fireworks / Sparkular Team", cost_min: 80000, cost_max: 220000, notes: "Venue permissions required" },
  { id: 20, category: "special", tier: "local", name: "Live Bangle Artist", cost_min: 15000, cost_max: 60000, notes: "Favours mehendi guest engagement" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _range(minVal, maxVal, note) {
  const payload = { min: Math.round(minVal), max: Math.round(maxVal) };
  if (note) payload.note = note;
  return payload;
}

function _section(label, items) {
  return {
    label,
    items,
    total_min: Object.values(items).reduce((s, i) => s + i.min, 0),
    total_max: Object.values(items).reduce((s, i) => s + i.max, 0),
  };
}

// ─── Main Calculation (mirrors calculate_budget in budget.py) ────────────────

export function calculateBudget(inp) {
  const functions =
    (inp.functions || []).slice(0, inp.num_functions).length > 0
      ? inp.functions.slice(0, inp.num_functions)
      : ["mehendi", "sangeet", "pheras", "reception"];

  const logistics = LOGISTICS_DATA[inp.city];
  if (!logistics) throw new Error(`Unsupported city: ${inp.city}`);

  const [venueMin, venueMax] = VENUE_RATES[inp.hotel_tier];
  const [roomMin, roomMax] = ROOM_RATES[inp.hotel_tier];
  const decorBook = DECOR_RATES[inp.decor_style] || DECOR_RATES.mid;

  // Venue & Stay
  const venueItems = {
    venue_block: _range(
      venueMin * functions.length,
      venueMax * functions.length,
      `${inp.hotel_tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} across ${functions.length} events`
    ),
    hotel_rooms: _range(
      roomMin * inp.hotel_rooms * functions.length,
      roomMax * inp.hotel_rooms * functions.length,
      `${inp.hotel_rooms} rooms for ${functions.length} nights`
    ),
  };

  // Decor
  const decorItems = {};
  for (const fn of functions) {
    const rates = decorBook[fn] || decorBook.reception;
    decorItems[fn] = _range(rates[0], rates[1], fn.charAt(0).toUpperCase() + fn.slice(1));
  }

  // Food & Beverage
  const fbItems = {};
  for (const fn of functions) {
    const mealType = MEAL_BY_FUNCTION[fn] || "gala_dinner";
    const tierMeals = FB_RATE_GRID[inp.hotel_tier];
    if (tierMeals && tierMeals[mealType]) {
      const [cMin, cMax] = tierMeals[mealType];
      fbItems[fn] = _range(
        cMin * inp.total_guests,
        cMax * inp.total_guests,
        `${mealType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${fn.charAt(0).toUpperCase() + fn.slice(1)}`
      );
    }
  }
  const [barMin, barMax] = BAR_RATES[inp.bar_type] || [0, 0];
  fbItems.bar_program = _range(
    barMin * inp.total_guests,
    barMax * inp.total_guests,
    (inp.bar_type || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );

  // Logistics
  const outstationGuests = inp.total_guests * ((inp.outstation_pct || 0) / 100);
  const transferUnits = Math.max(1, Math.round((outstationGuests / 3) * 2));
  const logisticsItems = {
    guest_transfer: _range(
      transferUnits * logistics.innova_per_day_min,
      transferUnits * logistics.innova_per_day_max,
      "Airport and venue transfer fleet"
    ),
  };
  if (functions.includes("baraat")) {
    logisticsItems.ghodi = _range(logistics.ghodi_min, logistics.ghodi_max, "Baraat ghodi");
    logisticsItems.dholi = _range(
      2 * 3 * logistics.dholi_per_hour_min,
      2 * 3 * logistics.dholi_per_hour_max,
      "2 dholi players for 3 hours"
    );
  }

  // Entertainment / Artists
  const multiplier = ENTERTAINMENT_MULTIPLIER[inp.entertainment_preference] || 1.0;
  const artistItems = {};
  const selectedIds = inp.selected_artists || [];
  const selectedArtists = ARTIST_SEED.filter((a) => selectedIds.includes(a.id));
  for (const artist of selectedArtists) {
    artistItems[`artist_${artist.id}`] = _range(
      artist.cost_min * multiplier,
      artist.cost_max * multiplier,
      artist.name || `${artist.category} (${artist.tier})`
    );
  }
  if (Object.keys(artistItems).length === 0) {
    const baseline = { minimal: [60000, 180000], standard: [180000, 500000], premium: [450000, 1200000] }[
      inp.entertainment_preference
    ] || [180000, 500000];
    artistItems.programming = _range(
      baseline[0],
      baseline[1],
      `${(inp.entertainment_preference || "standard").charAt(0).toUpperCase() + (inp.entertainment_preference || "standard").slice(1)} entertainment package`
    );
  }

  // Photography
  const photographyItems = {};
  if (inp.include_photography) {
    const [pMin, pMax] = PHOTO_RATES[inp.hotel_tier];
    photographyItems.photo_video_team = _range(pMin, pMax, "Photography + cinematography");
  }

  // Sundries
  const sundryItems = {
    room_baskets: _range(1200 * inp.hotel_rooms, 4000 * inp.hotel_rooms, "Welcome room baskets"),
    gift_hampers: _range(500 * inp.total_guests, 2200 * inp.total_guests, "Guest gifting"),
    stationery: _range(200 * inp.total_guests, 800 * inp.total_guests, "Invites, signage, stationery"),
  };

  // Assemble breakdown
  const breakdown = {
    venue: _section("Venue & Stay", venueItems),
    decor: _section("Decor", decorItems),
    food_beverage: _section("Food & Beverage", fbItems),
    logistics: _section("Logistics", logisticsItems),
    artists: _section("Entertainment", artistItems),
    photography: _section("Photography", photographyItems),
    sundries: _section("Sundries", sundryItems),
  };

  const subtotalMin = Object.values(breakdown).reduce((s, sec) => s + sec.total_min, 0);
  const subtotalMax = Object.values(breakdown).reduce((s, sec) => s + sec.total_max, 0);
  const contPct = inp.contingency_pct || 10;
  breakdown.contingency = _section("Contingency", {
    reserve: _range(subtotalMin * (contPct / 100), subtotalMax * (contPct / 100), `${contPct}% planning reserve`),
  });

  // Confidence
  let confidence = 85 + (selectedIds.length > 0 ? 5 : 0) + (inp.outstation_pct > 0 ? 3 : 0) - (["ultra-premium", "budget"].includes(inp.decor_style) ? 5 : 0);
  confidence = Math.min(95, Math.max(60, confidence));

  // Section totals
  const sectionTotals = {};
  for (const [key, section] of Object.entries(breakdown)) {
    sectionTotals[key] = {
      label: section.label,
      min: section.total_min,
      max: section.total_max,
      mid: Math.round((section.total_min + section.total_max) / 2),
    };
  }

  const grandTotalMin = Object.values(breakdown).reduce((s, sec) => s + sec.total_min, 0);
  const grandTotalMax = Object.values(breakdown).reduce((s, sec) => s + sec.total_max, 0);

  return {
    inputs: { ...inp },
    breakdown,
    section_totals: sectionTotals,
    grand_total_min: grandTotalMin,
    grand_total_max: grandTotalMax,
    confidence,
    meta: {
      outstation_guests: Math.round(outstationGuests),
      functions_considered: functions,
      city: inp.city,
    },
  };
}

/**
 * Generates a simple narrative (no AI needed — fallback text).
 */
export function generateNarrative(estimate) {
  const inputs = estimate.inputs;
  const tier = (inputs.hotel_tier || "").replace(/_/g, " ");
  const city = (inputs.city || "").charAt(0).toUpperCase() + (inputs.city || "").slice(1);
  const minL = (estimate.grand_total_min / 100000).toFixed(1);
  const maxL = (estimate.grand_total_max / 100000).toFixed(1);

  return `This estimate for a ${tier} celebration in ${city} lands between ₹${minL}L and ₹${maxL}L. Venue stay, decor, and hospitality are the biggest cost drivers, and the ${estimate.confidence}% confidence score reflects the level of detail provided. Consider adjusting decor style or entertainment tier to optimize your budget.`;
}
