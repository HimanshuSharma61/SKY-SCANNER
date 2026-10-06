// Currency Exchange Rate Service using free public live rates
// Fallback rates if offline or rate-limited

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  JPY: '¥',
  AUD: 'A$',
  THB: '฿'
};

const DEFAULT_RATES_BASE_INR = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0109,
  GBP: 0.0093,
  AED: 0.0433,
  SGD: 0.0158,
  JPY: 1.77,
  AUD: 0.0181,
  THB: 0.428
};

let exchangeRates = { ...DEFAULT_RATES_BASE_INR };
let isRatesLoaded = false;

// Fetch live currency rates (100% Free, NO API Key needed)
export async function initCurrencyRates() {
  if (isRatesLoaded) return exchangeRates;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        Object.keys(DEFAULT_RATES_BASE_INR).forEach(curr => {
          if (data.rates[curr]) {
            exchangeRates[curr] = data.rates[curr];
          }
        });
        isRatesLoaded = true;
        console.log('Live currency rates fetched successfully');
      }
    }
  } catch (e) {
    console.warn('Using baseline exchange rates:', e.message);
  }
  return exchangeRates;
}

// Convert amount from INR base to target currency
export function convertCurrency(amountInINR, targetCurrency = 'INR') {
  const rate = exchangeRates[targetCurrency] || DEFAULT_RATES_BASE_INR[targetCurrency] || 1;
  return amountInINR * rate;
}

// Format currency according to locale
export function formatCurrency(amountInINR, currency = 'INR', showDecimals = false) {
  const converted = convertCurrency(amountInINR, currency);
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;

  let formattedNumber;
  if (currency === 'INR') {
    // Indian numbering format (lakhs/thousands: 1,00,000)
    formattedNumber = Math.round(converted).toLocaleString('en-IN');
  } else if (currency === 'JPY') {
    formattedNumber = Math.round(converted).toLocaleString('ja-JP');
  } else {
    formattedNumber = (showDecimals ? converted.toFixed(2) : Math.round(converted).toLocaleString('en-US'));
  }

  return `${symbol}${formattedNumber}`;
}

export function getCurrencySymbol(currency = 'INR') {
  return CURRENCY_SYMBOLS[currency] || `${currency} `;
}

export function getAllCurrencies() {
  return Object.keys(CURRENCY_SYMBOLS).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code],
    name: getCurrencyName(code)
  }));
}

function getCurrencyName(code) {
  switch (code) {
    case 'INR': return 'Indian Rupee';
    case 'USD': return 'US Dollar';
    case 'EUR': return 'Euro';
    case 'GBP': return 'British Pound';
    case 'AED': return 'UAE Dirham';
    case 'SGD': return 'Singapore Dollar';
    case 'JPY': return 'Japanese Yen';
    case 'AUD': return 'Australian Dollar';
    case 'THB': return 'Thai Baht';
    default: return code;
  }
}
