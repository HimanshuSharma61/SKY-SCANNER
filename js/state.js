// Central State Management for Skyscanner App

function getTomorrowDateString(daysAhead = 1) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

const INITIAL_STATE = {
  currentTab: 'flights', // 'flights', 'hotels', 'cars'
  currency: 'INR',
  locale: 'en-GB',

  // Flight Search Parameters
  flightParams: {
    originCode: 'DEL',
    destCode: 'BOM',
    departDate: getTomorrowDateString(3),
    returnDate: getTomorrowDateString(8),
    tripType: 'roundtrip', // 'roundtrip' | 'oneway' | 'multicity'
    adults: 1,
    children: 0,
    cabinClass: 'Economy',
    directOnly: false,
    nearbyAirports: false
  },

  // Flight Filters
  flightFilters: {
    stops: 'all', // 'all' | 'direct' | '1stop' | '2plus'
    airlines: [], // list of airline codes
    maxPriceINR: 100000,
    timeSlots: [], // 'early', 'morning', 'afternoon', 'evening'
    greenerOnly: false
  },

  // Flight Sorting
  flightSortBy: 'cheapest', // 'cheapest' | 'best' | 'fastest'

  // Hotel Search Parameters
  hotelParams: {
    destination: 'Goa',
    checkIn: getTomorrowDateString(3),
    checkOut: getTomorrowDateString(7),
    guests: 2,
    rooms: 1,
    minStars: 0,
    freeCancellationOnly: false
  },

  // Car Search Parameters
  carParams: {
    location: 'Goa (GOI)',
    pickupDate: getTomorrowDateString(3),
    dropoffDate: getTomorrowDateString(6),
    category: 'all',
    driverAgeOver30: true
  },

  // Results Cache
  flightResults: [],
  hotelResults: [],
  carResults: [],
  priceCalendar: [],

  // Saved / Bookmarks
  savedFlightIds: [],

  // Selected for booking modal
  selectedFlightForBooking: null,
  selectedProviderForBooking: null,
  activeBookingStep: 'providers', // 'providers' | 'details' | 'confirmed'
  latestBookingConfirmed: null
};

class StateManager {
  constructor() {
    this.state = { ...INITIAL_STATE };
    this.listeners = [];
    this.loadPersistedState();
  }

  loadPersistedState() {
    try {
      const savedCurrency = localStorage.getItem('skyscanner_currency');
      if (savedCurrency) this.state.currency = savedCurrency;

      const savedSaved = localStorage.getItem('skyscanner_saved_flights');
      if (savedSaved) this.state.savedFlightIds = JSON.parse(savedSaved);
    } catch (e) {
      console.warn('Could not load persisted state:', e);
    }
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  updateFlightParams(params) {
    this.state.flightParams = { ...this.state.flightParams, ...params };
    this.notify();
  }

  updateFlightFilters(filters) {
    this.state.flightFilters = { ...this.state.flightFilters, ...filters };
    this.notify();
  }

  setCurrency(curr) {
    this.state.currency = curr;
    localStorage.setItem('skyscanner_currency', curr);
    this.notify();
  }

  toggleSaveFlight(flightId) {
    let saved = [...this.state.savedFlightIds];
    if (saved.includes(flightId)) {
      saved = saved.filter(id => id !== flightId);
    } else {
      saved.push(flightId);
    }
    this.state.savedFlightIds = saved;
    try {
      localStorage.setItem('skyscanner_saved_flights', JSON.stringify(saved));
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }
}

export const AppState = new StateManager();
