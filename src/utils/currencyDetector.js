import { CURRENCY_RATES } from './pnrGenerator';

const STORAGE_KEY_SELECTED = 'roya_selected_currency';
const STORAGE_KEY_DETECTED = 'roya_detected_country_info';

/**
 * Detects country and currency from browser environment (timezone, locales)
 */
export function detectBrowserLocationAndCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = tz.toLowerCase();
    const navLangs = navigator.languages ? [...navigator.languages] : [navigator.language || ''];

    // 1. Nigeria Check (Timezone & Locales)
    if (
      tzLower.includes('lagos') ||
      tzLower.includes('nigeria') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-ng') || l.toLowerCase() === 'ng'))
    ) {
      return {
        countryCode: 'NG',
        countryName: 'Nigeria',
        currency: 'NGN',
        symbol: '₦',
        flag: '🇳🇬',
        detectedVia: 'browser_nigeria_match'
      };
    }

    // 2. United Kingdom Check
    if (
      tzLower.includes('london') ||
      tzLower.includes('belfast') ||
      navLangs.some(l => l && l.toLowerCase().includes('-gb'))
    ) {
      return {
        countryCode: 'GB',
        countryName: 'United Kingdom',
        currency: 'GBP',
        symbol: '£',
        flag: '🇬🇧',
        detectedVia: 'browser_uk_match'
      };
    }

    // 3. Canada Check
    if (
      tzLower.includes('toronto') ||
      tzLower.includes('vancouver') ||
      tzLower.includes('montreal') ||
      tzLower.includes('edmonton') ||
      tzLower.includes('winnipeg') ||
      tzLower.includes('halifax') ||
      navLangs.some(l => l && l.toLowerCase().includes('-ca'))
    ) {
      return {
        countryCode: 'CA',
        countryName: 'Canada',
        currency: 'CAD',
        symbol: 'CA$',
        flag: '🇨🇦',
        detectedVia: 'browser_canada_match'
      };
    }

    // 4. Australia Check
    if (
      tzLower.includes('sydney') ||
      tzLower.includes('melbourne') ||
      tzLower.includes('brisbane') ||
      tzLower.includes('perth') ||
      tzLower.includes('adelaide') ||
      tzLower.includes('australia') ||
      navLangs.some(l => l && l.toLowerCase().includes('-au'))
    ) {
      return {
        countryCode: 'AU',
        countryName: 'Australia',
        currency: 'AUD',
        symbol: 'A$',
        flag: '🇦🇺',
        detectedVia: 'browser_australia_match'
      };
    }

    // 5. United Arab Emirates Check
    if (
      tzLower.includes('dubai') ||
      tzLower.includes('abu_dhabi') ||
      navLangs.some(l => l && l.toLowerCase().includes('-ae'))
    ) {
      return {
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        currency: 'AED',
        symbol: 'AED',
        flag: '🇦🇪',
        detectedVia: 'browser_uae_match'
      };
    }

    // 6. South Africa Check
    if (
      tzLower.includes('johannesburg') ||
      navLangs.some(l => l && l.toLowerCase().includes('-za'))
    ) {
      return {
        countryCode: 'ZA',
        countryName: 'South Africa',
        currency: 'ZAR',
        symbol: 'R',
        flag: '🇿🇦',
        detectedVia: 'browser_south_africa_match'
      };
    }

    // 7. Ghana Check
    if (
      tzLower.includes('accra') ||
      navLangs.some(l => l && l.toLowerCase().includes('-gh'))
    ) {
      return {
        countryCode: 'GH',
        countryName: 'Ghana',
        currency: 'GHS',
        symbol: 'GH₵',
        flag: '🇬🇭',
        detectedVia: 'browser_ghana_match'
      };
    }

    // 8. Kenya Check
    if (
      tzLower.includes('nairobi') ||
      navLangs.some(l => l && l.toLowerCase().includes('-ke'))
    ) {
      return {
        countryCode: 'KE',
        countryName: 'Kenya',
        currency: 'KES',
        symbol: 'KSh',
        flag: '🇰🇪',
        detectedVia: 'browser_kenya_match'
      };
    }

    // 9. European Union / Eurozone Check
    if (
      tzLower.includes('paris') ||
      tzLower.includes('berlin') ||
      tzLower.includes('rome') ||
      tzLower.includes('madrid') ||
      tzLower.includes('amsterdam') ||
      tzLower.includes('brussels') ||
      tzLower.includes('dublin') ||
      tzLower.includes('vienna') ||
      tzLower.includes('athens') ||
      tzLower.includes('europe/')
    ) {
      return {
        countryCode: 'EU',
        countryName: 'Europe',
        currency: 'EUR',
        symbol: '€',
        flag: '🇪🇺',
        detectedVia: 'browser_europe_match'
      };
    }
  } catch (err) {
    console.warn('[CURRENCY_DETECTOR] Browser locale detection error:', err);
  }

  return {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    detectedVia: 'default_usd'
  };
}

/**
 * Initializes and auto-detects user currency (respecting saved manual user preference if set)
 */
export async function initializeUserCurrency(onCurrencyDetected) {
  // Check if user has explicitly picked a currency in the past
  const savedCurrency = localStorage.getItem(STORAGE_KEY_SELECTED);
  
  // Detect from browser environment immediately
  const browserGeo = detectBrowserLocationAndCurrency();
  
  if (savedCurrency && CURRENCY_RATES[savedCurrency]) {
    if (onCurrencyDetected) {
      onCurrencyDetected(savedCurrency, {
        ...browserGeo,
        currency: savedCurrency,
        isUserSelected: true
      });
    }
    return savedCurrency;
  }

  // Set detected currency from browser
  let detectedCurrency = browserGeo.currency;
  let detectedInfo = browserGeo;

  // Attempt server-side IP header detection
  try {
    const res = await fetch('/api/geo/detect');
    if (res.ok) {
      const serverGeo = await res.json();
      if (serverGeo && serverGeo.currency && CURRENCY_RATES[serverGeo.currency]) {
        detectedCurrency = serverGeo.currency;
        detectedInfo = {
          ...detectedInfo,
          ...serverGeo,
          flag: CURRENCY_RATES[serverGeo.currency]?.flag || detectedInfo.flag
        };
      }
    }
  } catch (geoErr) {
    // Graceful fallback to browser detected
    console.info('[CURRENCY_DETECTOR] Server geo detect bypassed, using browser detection:', detectedCurrency);
  }

  try {
    localStorage.setItem(STORAGE_KEY_DETECTED, JSON.stringify(detectedInfo));
  } catch (e) {}

  if (onCurrencyDetected) {
    onCurrencyDetected(detectedCurrency, detectedInfo);
  }

  return detectedCurrency;
}

/**
 * Persists user's manual currency choice
 */
export function saveUserCurrencySelection(currency) {
  try {
    if (CURRENCY_RATES[currency]) {
      localStorage.setItem(STORAGE_KEY_SELECTED, currency);
    }
  } catch (e) {}
}
