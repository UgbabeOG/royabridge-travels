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

    // 2. India Check (Indian Rupee - INR)
    if (
      tzLower.includes('kolkata') ||
      tzLower.includes('calcutta') ||
      tzLower.includes('delhi') ||
      tzLower.includes('mumbai') ||
      tzLower.includes('india') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-in') || l.toLowerCase() === 'hi' || l.toLowerCase().startsWith('hi-')))
    ) {
      return {
        countryCode: 'IN',
        countryName: 'India',
        currency: 'INR',
        symbol: '₹',
        flag: '🇮🇳',
        detectedVia: 'browser_india_match'
      };
    }

    // 3. China Check (Chinese Yuan - CNY)
    if (
      tzLower.includes('shanghai') ||
      tzLower.includes('beijing') ||
      tzLower.includes('urumqi') ||
      tzLower.includes('china') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-cn') || l.toLowerCase() === 'zh-cn'))
    ) {
      return {
        countryCode: 'CN',
        countryName: 'China',
        currency: 'CNY',
        symbol: '¥',
        flag: '🇨🇳',
        detectedVia: 'browser_china_match'
      };
    }

    // 4. Japan Check (Japanese Yen - JPY)
    if (
      tzLower.includes('tokyo') ||
      tzLower.includes('japan') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-jp') || l.toLowerCase().startsWith('ja')))
    ) {
      return {
        countryCode: 'JP',
        countryName: 'Japan',
        currency: 'JPY',
        symbol: '¥',
        flag: '🇯🇵',
        detectedVia: 'browser_japan_match'
      };
    }

    // 5. Russia Check (Russian Ruble - RUB)
    if (
      tzLower.includes('moscow') ||
      tzLower.includes('samara') ||
      tzLower.includes('yekaterinburg') ||
      tzLower.includes('novosibirsk') ||
      tzLower.includes('krasnoyarsk') ||
      tzLower.includes('vladivostok') ||
      tzLower.includes('russia') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-ru') || l.toLowerCase().startsWith('ru')))
    ) {
      return {
        countryCode: 'RU',
        countryName: 'Russia',
        currency: 'RUB',
        symbol: '₽',
        flag: '🇷🇺',
        detectedVia: 'browser_russia_match'
      };
    }

    // 6. Turkey Check (Turkish Lira - TRY)
    if (
      tzLower.includes('istanbul') ||
      tzLower.includes('ankara') ||
      tzLower.includes('turkey') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-tr') || l.toLowerCase().startsWith('tr')))
    ) {
      return {
        countryCode: 'TR',
        countryName: 'Turkey',
        currency: 'TRY',
        symbol: '₺',
        flag: '🇹🇷',
        detectedVia: 'browser_turkey_match'
      };
    }

    // 7. United Kingdom Check
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

    // 8. Canada Check
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

    // 9. Australia Check
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

    // 10. United Arab Emirates Check
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

    // 11. Saudi Arabia Check
    if (
      tzLower.includes('riyadh') ||
      tzLower.includes('jeddah') ||
      navLangs.some(l => l && l.toLowerCase().includes('-sa'))
    ) {
      return {
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        currency: 'SAR',
        symbol: 'SAR',
        flag: '🇸🇦',
        detectedVia: 'browser_saudi_match'
      };
    }

    // 12. South Africa Check
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

    // 13. Ghana Check
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

    // 14. Kenya Check
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

    // 15. Brazil Check
    if (
      tzLower.includes('sao_paulo') ||
      tzLower.includes('brasilia') ||
      tzLower.includes('rio_branco') ||
      navLangs.some(l => l && l.toLowerCase().includes('-br'))
    ) {
      return {
        countryCode: 'BR',
        countryName: 'Brazil',
        currency: 'BRL',
        symbol: 'R$',
        flag: '🇧🇷',
        detectedVia: 'browser_brazil_match'
      };
    }

    // 16. Switzerland Check
    if (
      tzLower.includes('zurich') ||
      tzLower.includes('geneva') ||
      navLangs.some(l => l && l.toLowerCase().includes('-ch'))
    ) {
      return {
        countryCode: 'CH',
        countryName: 'Switzerland',
        currency: 'CHF',
        symbol: 'CHF',
        flag: '🇨🇭',
        detectedVia: 'browser_switzerland_match'
      };
    }

    // 17. European Union / France / Germany / Eurozone Check
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
      tzLower.includes('europe/') ||
      navLangs.some(l => l && (l.toLowerCase().includes('-fr') || l.toLowerCase().includes('-de') || l.toLowerCase().includes('-it') || l.toLowerCase().includes('-es')))
    ) {
      return {
        countryCode: 'EU',
        countryName: 'France / Eurozone',
        currency: 'EUR',
        symbol: '€',
        flag: '🇫🇷',
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
