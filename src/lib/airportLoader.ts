import fs from 'fs';
import path from 'path';

export interface Airport {
  code: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  state: string;
  latitude?: number;
  longitude?: number;
  isPopular?: boolean;
}

let cachedAirports: Airport[] | null = null;
let cachedMapByCode: Map<string, Airport> | null = null;

let regionNames: Intl.DisplayNames | null = null;
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch (e) {
  // Fallback if Intl.DisplayNames unavailable
}

function getCountryName(countryCode: string): string {
  if (!countryCode) return '';
  const cleanCode = countryCode.trim().toUpperCase();
  if (regionNames) {
    try {
      const name = regionNames.of(cleanCode);
      if (name && name !== cleanCode) return name;
    } catch (e) {
      // Ignore
    }
  }
  return cleanCode;
}

// Helper to parse CSV lines handling quoted strings
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Popular hub codes for fast initial display
const POPULAR_HUB_CODES = new Set([
  'JFK', 'LHR', 'DXB', 'CDG', 'HND', 'SIN', 'SYD', 'FCO', 'DOH', 'LAX',
  'SFO', 'MIA', 'ORD', 'YYZ', 'FRA', 'AMS', 'ZRH', 'BCN', 'CPH', 'HKG',
  'ICN', 'BKK', 'IST', 'CAI', 'JNB', 'GRU', 'LOS', 'ABV', 'NBO', 'ACC',
  'CPT', 'MEX', 'EZE', 'DPS', 'MLE', 'ATH', 'MUC', 'MAD', 'VIE', 'GVA',
  'MCT', 'RUH', 'JED', 'BNE', 'MEL', 'YVR', 'BOG', 'SCL', 'LIM', 'DEL',
  'BOM', 'KUL', 'MNL', 'CGK', 'SGN', 'PEK', 'PVG', 'CAN', 'TPE', 'KIX',
  'NRT', 'EWR', 'LGA', 'LGW', 'STN', 'ORY', 'IAD', 'DCA', 'BWI', 'YUL'
]);

// Friendly major city overrides for primary international hubs
const MAJOR_CITY_ALIASES: Record<string, string> = {
  'HND': 'Tokyo',
  'NRT': 'Tokyo',
  'JFK': 'New York',
  'LGA': 'New York',
  'EWR': 'New York',
  'LHR': 'London',
  'LGW': 'London',
  'STN': 'London',
  'LCY': 'London',
  'LTN': 'London',
  'CDG': 'Paris',
  'ORY': 'Paris',
  'ORD': 'Chicago',
  'MDW': 'Chicago',
  'IAD': 'Washington D.C.',
  'DCA': 'Washington D.C.',
  'BWI': 'Baltimore / Washington',
  'LAX': 'Los Angeles',
  'BUR': 'Los Angeles',
  'YVR': 'Vancouver',
  'YYZ': 'Toronto',
  'YTZ': 'Toronto',
  'YUL': 'Montreal',
  'GRU': 'São Paulo',
  'CGH': 'São Paulo',
  'GIG': 'Rio de Janeiro',
  'SDU': 'Rio de Janeiro',
  'GVA': 'Geneva',
  'ZRH': 'Zurich',
  'FCO': 'Rome',
  'CIA': 'Rome',
  'MXP': 'Milan',
  'LIN': 'Milan',
  'BGY': 'Milan',
  'BER': 'Berlin',
  'ICN': 'Seoul',
  'GMP': 'Seoul',
  'PVG': 'Shanghai',
  'SHA': 'Shanghai',
  'PEK': 'Beijing',
  'PKX': 'Beijing',
  'BKK': 'Bangkok',
  'DMK': 'Bangkok',
  'LOS': 'Lagos',
  'ABV': 'Abuja',
  'ACC': 'Accra',
  'NBO': 'Nairobi',
  'JNB': 'Johannesburg',
  'CPT': 'Cape Town',
  'CAI': 'Cairo',
  'DXB': 'Dubai',
  'AUH': 'Abu Dhabi',
  'DOH': 'Doha',
  'RUH': 'Riyadh',
  'JED': 'Jeddah',
  'SYD': 'Sydney',
  'MEL': 'Melbourne',
  'BNE': 'Brisbane',
  'BOM': 'Mumbai',
  'DEL': 'New Delhi',
  'SIN': 'Singapore',
  'HKG': 'Hong Kong'
};

export function loadAllAirports(): Airport[] {
  if (cachedAirports && cachedAirports.length > 0) {
    return cachedAirports;
  }

  const list: Airport[] = [];
  const mapByCode = new Map<string, Airport>();

  try {
    const filePath = path.join(process.cwd(), 'airports.txt');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = parseCsvLine(line);
        if (parts.length < 11) continue;

        const code = parts[0]?.trim().toUpperCase();
        if (!code || code.length !== 3) continue;

        const icao = parts[1]?.trim().toUpperCase() || '';
        const rawName = parts[2]?.trim() || '';
        const lat = parseFloat(parts[3]) || undefined;
        const lon = parseFloat(parts[4]) || undefined;
        const countryCode = parts[9]?.trim().toUpperCase() || '';
        let rawCity = parts[10]?.trim() || '';
        const state = parts[11]?.trim() || '';

        const countryName = getCountryName(countryCode);
        const city = MAJOR_CITY_ALIASES[code] || rawCity || rawName || code;
        const name = rawName || `${city} Airport`;

        const airportObj: Airport = {
          code,
          icao,
          name,
          city,
          country: countryName,
          countryCode,
          state,
          latitude: lat,
          longitude: lon,
          isPopular: POPULAR_HUB_CODES.has(code)
        };

        list.push(airportObj);
        mapByCode.set(code, airportObj);
      }
    }
  } catch (err) {
    console.warn('[AirportLoader] Warning loading airports.txt:', err);
  }

  // Fallback to minimal list if file reading failed
  if (list.length === 0) {
    const fallbackList: Airport[] = [
      { code: 'JFK', icao: 'KJFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'United States', countryCode: 'US', state: 'NY', isPopular: true },
      { code: 'LHR', icao: 'EGLL', name: 'London Heathrow', city: 'London', country: 'United Kingdom', countryCode: 'GB', state: '', isPopular: true },
      { code: 'DXB', icao: 'OMDB', name: 'Dubai Intl', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', state: '', isPopular: true },
      { code: 'LOS', icao: 'DNMM', name: 'Murtala Muhammed Intl', city: 'Lagos', country: 'Nigeria', countryCode: 'NG', state: 'Lagos', isPopular: true },
      { code: 'ABV', icao: 'DNAA', name: 'Nnamdi Azikiwe Intl', city: 'Abuja', country: 'Nigeria', countryCode: 'NG', state: 'FCT', isPopular: true }
    ];
    cachedAirports = fallbackList;
    cachedMapByCode = new Map(fallbackList.map(a => [a.code, a]));
    return fallbackList;
  }

  cachedAirports = list;
  cachedMapByCode = mapByCode;
  console.info(`[AirportLoader] Successfully loaded ${list.length} global airports from airports.txt`);

  return list;
}

export function getAirportByCode(code: string): Airport | null {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  if (!cachedMapByCode) {
    loadAllAirports();
  }
  return cachedMapByCode?.get(cleanCode) || null;
}

export function searchAirports(query: string, limit: number = 50): Airport[] {
  const all = loadAllAirports();
  if (!query || !query.trim()) {
    // Return popular airports first when no search query
    const popular = all.filter(a => a.isPopular);
    if (popular.length >= limit) return popular.slice(0, limit);
    return [...popular, ...all.filter(a => !a.isPopular)].slice(0, limit);
  }

  const term = query.trim().toLowerCase();
  const matches: Array<{ airport: Airport; score: number }> = [];

  for (let i = 0; i < all.length; i++) {
    const ap = all[i];
    const codeLower = ap.code.toLowerCase();
    const cityLower = ap.city.toLowerCase();
    const countryLower = ap.country.toLowerCase();
    const nameLower = ap.name.toLowerCase();
    const countryCodeLower = ap.countryCode.toLowerCase();
    const stateLower = ap.state.toLowerCase();

    let score = -1;

    if (codeLower === term) score = 1000;
    else if (codeLower.startsWith(term)) score = 850;
    else if (cityLower === term) score = 700;
    else if (cityLower.startsWith(term)) score = 600;
    else if (cityLower.includes(term)) score = 500;
    else if (countryLower === term) score = 450;
    else if (countryLower.startsWith(term)) score = 400;
    else if (countryLower.includes(term)) score = 350;
    else if (nameLower.includes(term)) score = 300;
    else if (stateLower.includes(term)) score = 250;
    else if (countryCodeLower === term) score = 200;

    if (score > 0) {
      // Boost popular hubs slightly
      if (ap.isPopular) score += 50;
      matches.push({ airport: ap, score });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city));
  return matches.slice(0, limit).map(m => m.airport);
}
