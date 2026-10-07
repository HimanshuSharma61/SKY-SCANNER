// API Configuration and Storage for Essential Travel APIs
// Handles Free API Keys, live connection testing, and fallback engines.

const STORAGE_KEY = 'skyscanner_api_keys';

// Default configuration with documentation on how to get free keys
export const DEFAULT_API_CONFIG = {
  // Amadeus Self-Service (Free Tier: 2,000 flight searches/month)
  // Signup: https://developers.amadeus.com/register
  amadeus: {
    enabled: false,
    clientId: '',
    clientSecret: '',
    hostname: 'test.api.amadeus.com', // test environment is completely free
    signupUrl: 'https://developers.amadeus.com/register',
    name: 'Amadeus Flight Offers API',
    description: 'Free 2,000 live flight searches / month'
  },

  // AviationStack (Free Tier: 100 API calls/month)
  // Signup: https://aviationstack.com/signup/free
  aviationStack: {
    enabled: true,
    apiKey: '607f188b2a9ddaaf01b59e4753888b85',
    signupUrl: 'https://aviationstack.com/signup/free',
    name: 'AviationStack Live Flights',
    description: 'Real-time flight statuses, route tracking & airport schedules'
  },

  // RapidAPI Skyscanner / Flight Data
  // Signup: https://rapidapi.com/hub
  rapidApi: {
    enabled: false,
    apiKey: '',
    signupUrl: 'https://rapidapi.com/hub',
    name: 'RapidAPI Flight Data',
    description: 'RapidAPI Skyscanner & Flight aggregators'
  },

  // AirLabs (Free Tier: 1,000 requests/month)
  // Signup: https://airlabs.co/
  airLabs: {
    enabled: false,
    apiKey: '',
    signupUrl: 'https://airlabs.co/',
    name: 'AirLabs Flight Schedules',
    description: 'Aviation schedules & airline route database'
  },

  // Open-Meteo Weather API (100% Free, NO API Key Required)
  openMeteo: {
    enabled: true,
    name: 'Open-Meteo Weather Service',
    description: 'Free global weather & live destination forecasts (No key needed)'
  },

  // ExchangeRate / Frankfurter API (100% Free, NO API Key Required)
  currencyApi: {
    enabled: true,
    name: 'Open Exchange Rates & Frankfurter',
    description: 'Live real-time FX currency conversion rates (No key needed)'
  }
};

export function getApiConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure AviationStack API key from defaults is set if missing or empty
      if (!parsed.aviationStack || !parsed.aviationStack.apiKey) {
        parsed.aviationStack = {
          ...DEFAULT_API_CONFIG.aviationStack,
          apiKey: DEFAULT_API_CONFIG.aviationStack.apiKey,
          enabled: true
        };
      }
      return { ...DEFAULT_API_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Could not load API config from localStorage:', e);
  }
  return { ...DEFAULT_API_CONFIG };
}

export function saveApiConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save API config:', e);
    return false;
  }
}

// Test connection for Amadeus OAuth2
export async function testAmadeusConnection(clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    return { success: false, message: 'Please enter both Client ID and Client Secret' };
  }
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: `Connected successfully! Token expires in ${data.expires_in}s.` };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error_description || `Authentication failed (${res.status})` };
    }
  } catch (e) {
    return { success: false, message: 'Network error or CORS restriction. Using intelligent local flight engine.' };
  }
}

// Test connection for AviationStack
export async function testAviationStackConnection(apiKey) {
  if (!apiKey) return { success: false, message: 'Please enter an AviationStack API Key' };
  try {
    const endpoint = `http://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(apiKey.trim())}&limit=1`;
    let res = null;
    try {
      res = await fetch(endpoint);
    } catch {
      // Fallback via CORS proxy if running under HTTPS
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
      res = await fetch(proxy);
    }

    if (res && res.ok) {
      const data = await res.json();
      if (data.error) return { success: false, message: data.error.message || data.error.info || 'Invalid API Key' };
      const total = data.pagination?.total || 0;
      return { success: true, message: `Connected! AviationStack API is active (${total.toLocaleString()} flights tracked).` };
    } else {
      return { success: false, message: `HTTP status ${res ? res.status : 'error'}` };
    }
  } catch (e) {
    return { success: false, message: 'Network error connecting to AviationStack. Falling back to local engine.' };
  }
}
