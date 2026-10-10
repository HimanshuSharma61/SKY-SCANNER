// UI Event Handlers and DOM manipulation helpers

import { AppState } from './state.js';
import { searchAirports, getAirportByCode, AIRPORTS_DATABASE } from './airports.js';
import { searchFlights, generatePriceCalendar, AIRLINES } from './flights-service.js';
import { searchHotels } from './hotels-service.js';
import { searchCars } from './cars-service.js';
import { formatCurrency, getCurrencySymbol, getAllCurrencies } from './currency-service.js';
import { getDestinationWeather } from './weather-service.js';
import { getApiConfig, saveApiConfig, testAmadeusConnection, testAviationStackConnection } from './api-config.js';

// Setup autocomplete dropdown for an airport input
export function setupAirportAutocomplete(inputId, dropdownId, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;
  const wrapper = input.closest('.search-field-wrapper');

  function closeDropdown() {
    dropdown.classList.remove('active');
    if (wrapper) wrapper.classList.remove('is-active');
  }

  function openDropdown() {
    dropdown.classList.add('active');
    dropdown.scrollTop = 0;
    if (wrapper) wrapper.classList.add('is-active');
  }

  function renderDropdown(items) {
    if (!items || items.length === 0) {
      dropdown.innerHTML = '<div class="autocomplete-empty">No airports found</div>';
      openDropdown();
      return;
    }

    dropdown.innerHTML = items.map(a => `
      <div class="autocomplete-item" data-code="${a.code}">
        <div class="item-left">
          <span class="airport-code">${a.code}</span>
          <div class="airport-info">
            <span class="airport-city">${a.city}, ${a.country}</span>
            <span class="airport-name">${a.name}</span>
          </div>
        </div>
        <span class="country-pill">${a.countryCode}</span>
      </div>
    `).join('');

    openDropdown();
  }

  input.addEventListener('focus', () => {
    input.select();
    const list = searchAirports(input.value);
    renderDropdown(list);
  });

  input.addEventListener('input', (e) => {
    const list = searchAirports(e.target.value);
    renderDropdown(list);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      const code = item.getAttribute('data-code');
      const airport = getAirportByCode(code);
      if (airport) {
        input.value = `${airport.city} (${airport.code})`;
        onSelect(airport);
      }
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
}

// Render Travellers & Cabin Class summary string
export function updateTravellersSummary() {
  const { adults, children, cabinClass } = AppState.getState().flightParams;
  const count = adults + children;
  const travellerText = `${count} traveller${count > 1 ? 's' : ''}, ${cabinClass}`;
  const el = document.getElementById('travellers-summary');
  if (el) el.textContent = travellerText;
}

// Render the 7-Day price scrubber bar
export function renderPriceCalendarBar(calendarDays) {
  const container = document.getElementById('price-calendar-strip');
  if (!container) return;

  const { currency } = AppState.getState();

  container.innerHTML = calendarDays.map(day => `
    <div class="calendar-day-tab ${day.isCurrent ? 'selected' : ''} ${day.isCheapest ? 'cheapest' : ''}" data-date="${day.dateStr}">
      <span class="cal-day-name">${day.dayName}</span>
      <span class="cal-date">${day.dateFormatted}</span>
      <span class="cal-price">${formatCurrency(day.priceINR, currency)}</span>
      ${day.isCheapest ? '<span class="cal-badge">Cheapest</span>' : ''}
    </div>
  `).join('');

  // Click on date tab
  container.querySelectorAll('.calendar-day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const date = tab.getAttribute('data-date');
      AppState.updateFlightParams({ departDate: date });
      const depInput = document.getElementById('flight-depart-date');
      if (depInput) depInput.value = date;
      triggerFlightSearch();
    });
  });
}

// Render Flight Results List
export function renderFlightResults() {
  const container = document.getElementById('flight-results-list');
  const countHeader = document.getElementById('results-count-title');
  if (!container) return;

  const state = AppState.getState();
  const { flightResults, flightFilters, flightSortBy, currency, savedFlightIds } = state;

  // Filter flights
  let filtered = flightResults.filter(flight => {
    // Stops filter
    if (flightFilters.stops === 'direct' && !flight.isDirect) return false;
    if (flightFilters.stops === '1stop' && flight.stopsCount !== 1) return false;
    if (flightFilters.stops === '2plus' && flight.stopsCount < 2) return false;

    // Price filter
    if (flightFilters.maxPriceINR && flight.priceINR > flightFilters.maxPriceINR) return false;

    // Airlines filter
    if (flightFilters.airlines.length > 0 && !flightFilters.airlines.includes(flight.airline.code)) return false;

    // Greener only
    if (flightFilters.greenerOnly && !flight.isGreener) return false;

    // Time slot filter
    if (flightFilters.timeSlots.length > 0) {
      const depHour = parseInt(flight.depTime.split(':')[0], 10);
      const matchesSlot = flightFilters.timeSlots.some(slot => {
        if (slot === 'early') return depHour < 6;
        if (slot === 'morning') return depHour >= 6 && depHour < 12;
        if (slot === 'afternoon') return depHour >= 12 && depHour < 18;
        if (slot === 'evening') return depHour >= 18;
        return false;
      });
      if (!matchesSlot) return false;
    }

    return true;
  });

  // Sort flights
  if (flightSortBy === 'cheapest') {
    filtered.sort((a, b) => a.priceINR - b.priceINR);
  } else if (flightSortBy === 'fastest') {
    filtered.sort((a, b) => a.durationMinutes - b.durationMinutes);
  } else if (flightSortBy === 'best') {
    filtered.sort((a, b) => b.score - a.score);
  }

  // Update count title
  if (countHeader) {
    const origin = getAirportByCode(state.flightParams.originCode);
    const dest = getAirportByCode(state.flightParams.destCode);
    const hasLive = filtered.some(f => f.isLiveApi);
    countHeader.innerHTML = `<strong>${filtered.length} flights</strong> from ${origin ? origin.city : state.flightParams.originCode} to ${dest ? dest.city : state.flightParams.destCode}${hasLive ? ' <span class="badge-live-radar" style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;background:#E8F5E9;color:#1B5E20;font-weight:700;padding:3px 8px;border-radius:4px;margin-left:8px;vertical-align:middle;">📡 Live AviationStack Radar</span>' : ''}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results-card">
        <div class="empty-icon">✈️</div>
        <h3>No flights match your filters</h3>
        <p>Try resetting some filters or adjusting your departure time and stops.</p>
        <button class="btn btn-secondary" id="reset-filters-btn">Reset All Filters</button>
      </div>
    `;
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAllFilters);
    }
    return;
  }

  // Render cards
  container.innerHTML = filtered.map(flight => {
    const isSaved = savedFlightIds.includes(flight.id);
    const formattedPrice = formatCurrency(flight.priceINR, currency);

    return `
      <div class="flight-card" data-flight-id="${flight.id}">
        ${flight.isLiveApi ? `
          <div class="flight-card-banner live-radar-banner">
            <span>📡 Live Radar · Status: <strong style="text-transform: capitalize;">${flight.flightStatus}</strong>${flight.terminal ? ` · Terminal ${flight.terminal}` : ''}${flight.delay ? ` · Delay +${flight.delay}m` : ''}</span>
            <span style="font-size: 0.72rem; opacity: 0.85;">AviationStack Live</span>
          </div>
        ` : (flight.isGreener ? `
          <div class="flight-card-banner eco-banner">
            <span class="eco-icon">🌱</span> Greener choice: <strong>${flight.co2Reduction}% less CO2</strong> than average on this route
          </div>
        ` : '')}

        <div class="flight-card-main">
          <!-- Outbound Leg -->
          <div class="flight-leg">
            <div class="airline-brand">
              <div class="airline-badge" title="${flight.airline.name}">
                <img 
                  src="images/airlines/${flight.airline.code}.png" 
                  alt="${flight.airline.name}" 
                  class="airline-logo-img" 
                  loading="lazy"
                  onerror="this.onerror=null; this.src='https://pics.avs.io/120/120/${flight.airline.code}.png';" 
                />
              </div>
              <div class="airline-meta">
                <span class="airline-title">${flight.airline.name}</span>
                <span class="flight-number-tag">${flight.flightNumber} · ${flight.aircraft}</span>
              </div>
            </div>

            <div class="flight-times-route">
              <div class="time-point">
                <span class="time-large">${flight.depTime}</span>
                <span class="airport-code-tag">${flight.origin.code}</span>
              </div>

              <div class="route-line-col">
                <span class="duration-text">${flight.durationStr}</span>
                <div class="route-line ${flight.isDirect ? 'direct' : 'has-stops'}">
                  <div class="route-dot start"></div>
                  ${!flight.isDirect ? `<div class="stop-dot" title="Layover in ${flight.stops[0].airport}"></div>` : ''}
                  <div class="route-dot end"></div>
                </div>
                <span class="stops-label ${flight.isDirect ? 'text-success' : 'text-warning'}">
                  ${flight.isDirect ? 'Direct' : `${flight.stopsCount} stop (${flight.stops[0].airport})`}
                </span>
              </div>

              <div class="time-point">
                <span class="time-large">${flight.arrTime} ${flight.nextDay ? '<sup class="next-day-sup">+1</sup>' : ''}</span>
                <span class="airport-code-tag">${flight.dest.code}</span>
              </div>
            </div>
          </div>

          <!-- Return Leg (if Roundtrip) -->
          ${flight.returnLeg ? `
            <div class="flight-leg return-leg">
              <div class="airline-brand">
                <div class="airline-badge" title="${flight.airline.name}">
                  <img 
                    src="images/airlines/${flight.airline.code}.png" 
                    alt="${flight.airline.name}" 
                    class="airline-logo-img" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://pics.avs.io/120/120/${flight.airline.code}.png';" 
                  />
                </div>
                <div class="airline-meta">
                  <span class="airline-title">${flight.airline.name} (Return)</span>
                  <span class="flight-number-tag">${flight.returnLeg.flightNumber} · ${flight.returnLeg.aircraft}</span>
                </div>
              </div>

              <div class="flight-times-route">
                <div class="time-point">
                  <span class="time-large">${flight.returnLeg.depTime}</span>
                  <span class="airport-code-tag">${flight.returnLeg.origin.code}</span>
                </div>

                <div class="route-line-col">
                  <span class="duration-text">${flight.returnLeg.durationStr}</span>
                  <div class="route-line ${flight.returnLeg.isDirect ? 'direct' : 'has-stops'}">
                    <div class="route-dot start"></div>
                    ${!flight.returnLeg.isDirect ? `<div class="stop-dot"></div>` : ''}
                    <div class="route-dot end"></div>
                  </div>
                  <span class="stops-label ${flight.returnLeg.isDirect ? 'text-success' : 'text-warning'}">
                    ${flight.returnLeg.isDirect ? 'Direct' : '1 stop'}
                  </span>
                </div>

                <div class="time-point">
                  <span class="time-large">${flight.returnLeg.arrTime}</span>
                  <span class="airport-code-tag">${flight.returnLeg.dest.code}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Amenities Strip -->
          <div class="flight-amenities">
            <span class="amenity-tag" title="Baggage included">🧳 ${flight.amenities.baggage}</span>
            ${flight.amenities.wifi ? '<span class="amenity-tag">📶 Wi-Fi</span>' : ''}
            ${flight.amenities.power ? '<span class="amenity-tag">🔌 USB Power</span>' : ''}
            ${flight.amenities.meal ? '<span class="amenity-tag">🍽️ Meal included</span>' : ''}
            <span class="amenity-tag class-tag">${flight.cabinClass}</span>
          </div>
        </div>

        <!-- Pricing & CTA Column -->
        <div class="flight-card-cta">
          <button class="btn-save-flight ${isSaved ? 'saved' : ''}" data-flight-id="${flight.id}" title="${isSaved ? 'Saved to trips' : 'Save this flight'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? '#FF5452' : 'none'}" stroke="${isSaved ? '#FF5452' : 'currentColor'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <div class="price-container">
            <span class="price-provider-label">via ${flight.cheapestProvider.name}</span>
            <span class="flight-price-huge">${formattedPrice}</span>
            <span class="price-subtext">total price · all taxes incl.</span>
          </div>

          <button class="btn btn-primary btn-select-flight" data-flight-id="${flight.id}">
            Select <span class="arrow">➜</span>
          </button>

          <button class="btn-text-link toggle-details-btn" data-flight-id="${flight.id}">
            Flight details ▾
          </button>
        </div>

        <!-- Collapsible Details Drawer -->
        <div class="flight-details-drawer" id="details-${flight.id}" style="display: none;">
          <div class="details-inner">
            <div class="details-segment">
              <h4>Outbound: ${flight.origin.city} (${flight.origin.code}) to ${flight.dest.city} (${flight.dest.code})</h4>
              <p><strong>Departure:</strong> ${flight.depTime} · ${flight.origin.name}</p>
              <p><strong>Arrival:</strong> ${flight.arrTime} · ${flight.dest.name}</p>
              <p><strong>Aircraft:</strong> ${flight.aircraft} · Operated by ${flight.airline.name}</p>
              ${flight.stops.length > 0 ? `
                <div class="layover-box">
                  ⏱️ <strong>${flight.stops[0].durationStr} layover</strong> in ${flight.stops[0].airport} (Transfer)
                </div>
              ` : '<p class="text-success">✓ Non-stop direct flight</p>'}
              <p><strong>Baggage:</strong> ${flight.amenities.baggage}</p>
            </div>
            ${flight.returnLeg ? `
              <div class="details-segment">
                <h4>Inbound: ${flight.dest.city} (${flight.dest.code}) to ${flight.origin.city} (${flight.origin.code})</h4>
                <p><strong>Departure:</strong> ${flight.returnLeg.depTime} · ${flight.dest.name}</p>
                <p><strong>Arrival:</strong> ${flight.returnLeg.arrTime} · ${flight.origin.name}</p>
                <p><strong>Aircraft:</strong> ${flight.returnLeg.aircraft}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach card event listeners
  container.querySelectorAll('.btn-select-flight').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const flightId = btn.getAttribute('data-flight-id');
      const flight = flightResults.find(f => f.id === flightId);
      if (flight) openBookingModal(flight);
    });
  });

  container.querySelectorAll('.btn-save-flight').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const flightId = btn.getAttribute('data-flight-id');
      AppState.toggleSaveFlight(flightId);
      renderFlightResults();
      updateSavedCountBadge();
    });
  });

  container.querySelectorAll('.toggle-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const flightId = btn.getAttribute('data-flight-id');
      const drawer = document.getElementById(`details-${flightId}`);
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'block' : 'none';
        btn.innerHTML = isHidden ? 'Flight details ▴' : 'Flight details ▾';
      }
    });
  });

  updateActiveFiltersBadge();
}

// Open Booking & Deal Modal
export function openBookingModal(flight) {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  AppState.setState({
    selectedFlightForBooking: flight,
    selectedProviderForBooking: flight.providers[0],
    activeBookingStep: 'providers'
  });

  renderBookingModalStep();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Render dynamic steps of booking modal
export function renderBookingModalStep() {
  const { selectedFlightForBooking: flight, selectedProviderForBooking: currentProvider, activeBookingStep, currency } = AppState.getState();
  const content = document.getElementById('booking-modal-body');
  if (!content || !flight) return;

  if (activeBookingStep === 'providers') {
    content.innerHTML = `
      <div class="booking-step-view">
        <div class="booking-flight-summary-card">
          <div class="flight-mini-route">
            <img src="images/airlines/${flight.airline.code}.png" alt="${flight.airline.name}" class="flight-mini-logo" onerror="this.onerror=null; this.src='https://pics.avs.io/60/60/${flight.airline.code}.png';" />
            <span class="flight-mini-code">${flight.origin.code}</span>
            <span class="flight-mini-arrow">➔</span>
            <span class="flight-mini-code">${flight.dest.code}</span>
            <span class="flight-mini-airline">${flight.airline.name} · ${flight.flightNumber}</span>
          </div>
          <div class="flight-mini-times">
            <span>${flight.depTime} - ${flight.arrTime} (${flight.durationStr})</span>
            <span class="tag-pill">${flight.isDirect ? 'Direct' : '1 stop'}</span>
          </div>
        </div>

        <h3 class="modal-subheading">Compare deals from 5 travel providers</h3>
        <p class="modal-subtext">Prices include all mandatory fees, taxes, and charges.</p>

        <div class="providers-comparison-list">
          ${flight.providers.map((p, idx) => `
            <div class="provider-deal-row ${idx === 0 ? 'recommended-deal' : ''}">
              <div class="provider-info-col">
                <span class="provider-title">${p.name}</span>
                <div class="provider-ratings">
                  <span class="star-rating">★ ${p.rating}</span>
                  ${p.badge ? `<span class="deal-pill ${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
                </div>
              </div>
              <div class="provider-price-col">
                <span class="provider-price-val">${formatCurrency(p.price, currency)}</span>
                <button class="btn btn-primary btn-sm btn-choose-deal" data-provider-name="${p.name}" data-provider-price="${p.price}">
                  Book on ${p.name.split(' ')[0]} ➔
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    content.querySelectorAll('.btn-choose-deal').forEach(btn => {
      btn.addEventListener('click', () => {
        const pName = btn.getAttribute('data-provider-name');
        const pPrice = parseFloat(btn.getAttribute('data-provider-price'));
        AppState.setState({
          selectedProviderForBooking: { name: pName, price: pPrice },
          activeBookingStep: 'details'
        });
        renderBookingModalStep();
      });
    });
  } else if (activeBookingStep === 'details') {
    content.innerHTML = `
      <div class="booking-step-view">
        <div class="booking-progress-bar">
          <div class="step completed">1. Deals</div>
          <div class="step active">2. Passenger Details</div>
          <div class="step">3. Confirmation</div>
        </div>

        <div class="passenger-form-container">
          <h3>Passenger Information</h3>
          <p class="form-hint">Enter names exactly as shown on government-issued travel ID / Passport.</p>

          <form id="passenger-booking-form">
            <div class="form-row two-col">
              <div class="form-group">
                <label>First & Middle Name *</label>
                <input type="text" class="sk-input" id="p-firstname" required placeholder="e.g. Rahul" value="Himan" />
              </div>
              <div class="form-group">
                <label>Last / Surname *</label>
                <input type="text" class="sk-input" id="p-lastname" required placeholder="e.g. Sharma" value="Verma" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" class="sk-input" id="p-email" required placeholder="name@example.com" value="traveler@example.com" />
              </div>
              <div class="form-group">
                <label>Mobile Number *</label>
                <input type="tel" class="sk-input" id="p-phone" required placeholder="+91 98765 43210" value="+91 98765 43210" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Seat Preference</label>
                <select class="sk-select" id="p-seat">
                  <option value="Window">Window Seat</option>
                  <option value="Aisle" selected>Aisle Seat</option>
                  <option value="Extra Legroom">Extra Legroom (+₹500)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Meal Preference</label>
                <select class="sk-select" id="p-meal">
                  <option value="Vegetarian Hindu (AVML)">Vegetarian Hindu (AVML)</option>
                  <option value="Standard Non-Veg">Standard Non-Veg Meal</option>
                  <option value="Jain Meal">Jain Vegetarian Meal</option>
                  <option value="Gluten Free">Gluten Free Meal</option>
                </select>
              </div>
            </div>

            <div class="booking-order-summary">
              <div class="summary-line">
                <span>Flight (${flight.flightNumber}):</span>
                <span>${flight.origin.code} ➔ ${flight.dest.code}</span>
              </div>
              <div class="summary-line">
                <span>Provider:</span>
                <span>${currentProvider.name}</span>
              </div>
              <div class="summary-line total-line">
                <strong>Total Amount:</strong>
                <strong class="text-primary">${formatCurrency(currentProvider.price, currency)}</strong>
              </div>
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-secondary" id="btn-back-to-providers">Back</button>
              <button type="submit" class="btn btn-primary btn-lg">Confirm & Generate E-Ticket ➔</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-back-to-providers')?.addEventListener('click', () => {
      AppState.setState({ activeBookingStep: 'providers' });
      renderBookingModalStep();
    });

    document.getElementById('passenger-booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pName = `${document.getElementById('p-firstname').value} ${document.getElementById('p-lastname').value}`;
      const pEmail = document.getElementById('p-email').value;
      const seat = document.getElementById('p-seat').value;
      const pnr = `SKY${Math.floor(100000 + Math.random() * 900000)}`;

      const booking = {
        pnr,
        passengerName: pName,
        email: pEmail,
        seat,
        flight,
        provider: currentProvider,
        bookingDate: new Date().toLocaleDateString('en-GB')
      };

      try {
        const allBookings = JSON.parse(localStorage.getItem('skyscanner_all_confirmed_bookings') || '[]');
        allBookings.unshift({
          pnr,
          passengerName: pName,
          email: pEmail,
          seat,
          flightNumber: flight.flightNumber,
          airlineName: flight.airline?.name,
          originCode: flight.origin?.code,
          destCode: flight.dest?.code,
          price: currentProvider.price,
          providerName: currentProvider.name,
          date: new Date().toLocaleDateString('en-GB')
        });
        localStorage.setItem('skyscanner_all_confirmed_bookings', JSON.stringify(allBookings));
      } catch {}

      AppState.setState({
        activeBookingStep: 'confirmed',
        latestBookingConfirmed: booking
      });
      renderBookingModalStep();
    });
  } else if (activeBookingStep === 'confirmed') {
    const booking = AppState.getState().latestBookingConfirmed;
    content.innerHTML = `
      <div class="booking-step-view confirmed-view">
        <div class="booking-success-header">
          <div class="success-checkmark">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your electronic ticket and travel receipt have been issued successfully.</p>
        </div>

        <div class="e-ticket-card">
          <div class="ticket-header">
            <div class="ticket-airline">
              <img src="images/airlines/${flight.airline.code}.png" alt="${flight.airline.name}" class="ticket-airline-logo" onerror="this.onerror=null; this.src='https://pics.avs.io/120/120/${flight.airline.code}.png';" />
              <strong>${flight.airline.name}</strong>
            </div>
            <div class="ticket-pnr">
              <span class="pnr-label">PNR / BOOKING REF</span>
              <span class="pnr-code">${booking.pnr}</span>
            </div>
          </div>

          <div class="ticket-body">
            <div class="ticket-row">
              <div class="t-col">
                <span class="t-label">PASSENGER</span>
                <span class="t-val">${booking.passengerName}</span>
              </div>
              <div class="t-col">
                <span class="t-label">FLIGHT</span>
                <span class="t-val">${flight.flightNumber}</span>
              </div>
              <div class="t-col">
                <span class="t-label">CLASS / SEAT</span>
                <span class="t-val">${flight.cabinClass} · ${booking.seat}</span>
              </div>
            </div>

            <div class="ticket-flight-path">
              <div class="tf-point">
                <span class="tf-city">${flight.origin.city}</span>
                <span class="tf-code">${flight.origin.code}</span>
                <span class="tf-time">${flight.depTime}</span>
              </div>
              <div class="tf-connector">
                <span>✈️ ${flight.durationStr} (${flight.isDirect ? 'Direct' : '1 Stop'})</span>
              </div>
              <div class="tf-point">
                <span class="tf-city">${flight.dest.city}</span>
                <span class="tf-code">${flight.dest.code}</span>
                <span class="tf-time">${flight.arrTime}</span>
              </div>
            </div>

            <div class="ticket-footer-row">
              <div class="qr-mock">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#05203C">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-5 0h2v3h-2v-3zm3 3h2v3h-2v-3zm-3 2h2v2h-2v-2zm5 0h3v2h-3v-2z"/>
                </svg>
                <span>SCAN AT GATE</span>
              </div>
              <div class="gate-info">
                <span>Terminal 3 · Gate opens 45m prior to departure</span>
                <span class="booked-with">Booked via ${booking.provider.name} · Paid ${formatCurrency(booking.provider.price, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print E-Ticket</button>
          <button class="btn btn-primary" id="btn-done-booking">Done & Back to Flights</button>
        </div>
      </div>
    `;

    document.getElementById('btn-done-booking')?.addEventListener('click', () => {
      closeBookingModal();
    });
  }
}

// Reset all flight filters
export function resetAllFilters() {
  AppState.updateFlightFilters({
    stops: 'all',
    airlines: [],
    maxPriceINR: 100000,
    timeSlots: [],
    greenerOnly: false
  });

  // Reset filter checkboxes and sliders in DOM
  const stopsAllRadio = document.querySelector('input[name="filter-stops"][value="all"]');
  if (stopsAllRadio) stopsAllRadio.checked = true;

  document.querySelectorAll('.filter-airline-checkbox').forEach(cb => cb.checked = false);
  document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('active'));

  const greenerCb = document.getElementById('filter-greener');
  if (greenerCb) greenerCb.checked = false;

  const priceSlider = document.getElementById('price-range-slider');
  if (priceSlider) priceSlider.value = 100000;
  const priceDisplay = document.getElementById('price-slider-display');
  if (priceDisplay) priceDisplay.textContent = formatCurrency(100000, AppState.getState().currency);

  renderFlightResults();
  updateActiveFiltersBadge();
}

// Update the active filters count badge for mobile
export function updateActiveFiltersBadge() {
  const badge = document.getElementById('active-filter-badge');
  if (!badge) return;

  const { flightFilters } = AppState.getState();
  let count = 0;
  if (flightFilters.stops && flightFilters.stops !== 'all') count++;
  if (flightFilters.timeSlots && flightFilters.timeSlots.length > 0) count += flightFilters.timeSlots.length;
  if (flightFilters.airlines && flightFilters.airlines.length > 0) count += flightFilters.airlines.length;
  if (flightFilters.maxPriceINR && flightFilters.maxPriceINR < 100000) count++;
  if (flightFilters.greenerOnly) count++;

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

// Update the Saved Trips count in navbar
export function updateSavedCountBadge() {
  const badge = document.getElementById('saved-count-badge');
  const count = AppState.getState().savedFlightIds.length;
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

// Render Skeleton Flight Cards while loading
export function renderSkeletonFlightCards() {
  const container = document.getElementById('flight-results-list');
  if (!container) return;

  container.innerHTML = Array(4).fill(0).map(() => `
    <div class="flight-card skeleton-card">
      <div class="flight-card-main">
        <div class="flight-leg-row">
          <div class="airline-meta-col">
            <div class="skeleton-box skeleton-logo"></div>
            <div class="skeleton-box" style="width: 55px; height: 12px; margin-top: 6px;"></div>
          </div>
          <div class="flight-time-col">
            <div class="skeleton-box" style="width: 68px; height: 22px;"></div>
            <div class="skeleton-box" style="width: 44px; height: 12px; margin-top: 4px;"></div>
          </div>
          <div class="flight-duration-col">
            <div class="skeleton-box" style="width: 58px; height: 13px; margin: 0 auto 6px;"></div>
            <div class="flight-route-visual">
              <div class="route-line" style="background: #E8EEF5;"></div>
            </div>
            <div class="skeleton-box" style="width: 44px; height: 12px; margin: 6px auto 0;"></div>
          </div>
          <div class="flight-time-col">
            <div class="skeleton-box" style="width: 68px; height: 22px;"></div>
            <div class="skeleton-box" style="width: 44px; height: 12px; margin-top: 4px;"></div>
          </div>
        </div>
      </div>
      <div class="flight-card-cta">
        <div class="flight-deal-col" style="align-items: flex-end;">
          <div class="skeleton-box" style="width: 72px; height: 12px; margin-bottom: 6px;"></div>
          <div class="skeleton-box" style="width: 96px; height: 26px; margin-bottom: 10px;"></div>
          <div class="skeleton-box" style="width: 86px; height: 36px; border-radius: 8px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// Format date nicely (e.g. "10 Oct 2026")
function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Selected dates';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Show Flight Search Loading Screen Animation
function playFlightSearchAnimation(flightParams) {
  const overlay = document.getElementById('flight-search-loading-overlay');
  const searchBtn = document.getElementById('btn-search-flights');
  if (!overlay) return () => Promise.resolve();

  const origin = getAirportByCode(flightParams.originCode) || { code: flightParams.originCode, city: flightParams.originCode };
  const dest = getAirportByCode(flightParams.destCode) || { code: flightParams.destCode, city: flightParams.destCode };

  const originCodeEl = document.getElementById('load-origin-code');
  const originCityEl = document.getElementById('load-origin-city');
  const destCodeEl = document.getElementById('load-dest-code');
  const destCityEl = document.getElementById('load-dest-city');
  const dateTextEl = document.getElementById('load-date-text');
  const travellersTextEl = document.getElementById('load-travellers-text');
  const progressBar = document.getElementById('load-progress-bar');
  const pathTrail = document.getElementById('load-path-trail');
  const planeIcon = document.getElementById('loading-plane-icon');
  const statusText = document.getElementById('load-status-text');
  const percentText = document.getElementById('load-percent-text');

  if (originCodeEl) originCodeEl.textContent = origin.code;
  if (originCityEl) originCityEl.textContent = origin.city;
  if (destCodeEl) destCodeEl.textContent = dest.code;
  if (destCityEl) destCityEl.textContent = dest.city;

  const depFormatted = formatDisplayDate(flightParams.departDate);
  const retFormatted = flightParams.tripType === 'roundtrip' && flightParams.returnDate ? ` – ${formatDisplayDate(flightParams.returnDate)}` : '';
  if (dateTextEl) dateTextEl.textContent = `${depFormatted}${retFormatted}`;

  const travellersStr = `${flightParams.adults || 1} adult${(flightParams.adults || 1) > 1 ? 's' : ''}${flightParams.children ? `, ${flightParams.children} child` : ''}, ${flightParams.cabinClass || 'Economy'}`;
  if (travellersTextEl) travellersTextEl.textContent = travellersStr;

  // Reset animations
  if (progressBar) progressBar.style.width = '12%';
  if (pathTrail) pathTrail.style.width = '12%';
  if (planeIcon) planeIcon.style.left = '12%';
  if (percentText) percentText.textContent = '12%';
  if (statusText) statusText.textContent = 'Connecting to 1,200+ airline systems...';

  // Search button state
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.classList.add('loading');
  }

  // Render skeleton cards in results view
  renderSkeletonFlightCards();

  // Show overlay
  overlay.classList.add('active');

  const keyframes = [
    { at: 350, progress: 38, plane: 38, text: 'Scanning live fares on IndiGo, Air India, Vistara...' },
    { at: 750, progress: 68, plane: 68, text: 'Finding direct routes & cheapest connections...' },
    { at: 1200, progress: 88, plane: 88, text: 'Locking in lowest fares for your dates...' },
    { at: 1650, progress: 98, plane: 94, text: 'Finalising best flight results...' }
  ];

  keyframes.forEach(step => setTimeout(() => {
    if (progressBar) progressBar.style.width = `${step.progress}%`;
    if (pathTrail) pathTrail.style.width = `${step.progress}%`;
    if (planeIcon) planeIcon.style.left = `${step.plane}%`;
    if (percentText) percentText.textContent = `${step.progress}%`;
    if (statusText) statusText.textContent = step.text;
  }, step.at));

  const startTime = Date.now();

  return async function finishAnimation() {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 1800 - elapsed);
    if (remainingTime > 0) {
      await new Promise(r => setTimeout(r, remainingTime));
    }

    if (progressBar) progressBar.style.width = '100%';
    if (pathTrail) pathTrail.style.width = '100%';
    if (planeIcon) planeIcon.style.left = '96%';
    if (percentText) percentText.textContent = '100%';
    if (statusText) statusText.textContent = 'Ready! Showing flight results...';

    await new Promise(r => setTimeout(r, 250));

    overlay.classList.remove('active');
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.classList.remove('loading');
    }
  };
}

// Trigger Flight Search
export async function triggerFlightSearch(showAnimation = false) {
  const loadingOverlay = document.getElementById('search-loading-bar');
  if (loadingOverlay) loadingOverlay.style.display = 'block';

  let finishAnimation = null;
  const state = AppState.getState();

  if (showAnimation) {
    finishAnimation = playFlightSearchAnimation(state.flightParams);
  }

  try {
    const results = await searchFlights(state.flightParams);
    const calendar = generatePriceCalendar(state.flightParams.departDate, state.flightParams.originCode, state.flightParams.destCode);

    if (finishAnimation) {
      await finishAnimation();
    }

    AppState.setState({
      flightResults: results,
      priceCalendar: calendar
    });

    renderPriceCalendarBar(calendar);
    renderFlightResults();
    populateAirlineFilterCheckboxes(results);

    if (showAnimation) {
      const resultsSection = document.getElementById('flights-tab-view');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  } catch (e) {
    console.error('Error during flight search:', e);
    if (finishAnimation) {
      await finishAnimation();
    }
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
}

// Populate airline filters dynamically based on available sector flights
function populateAirlineFilterCheckboxes(flights) {
  const container = document.getElementById('airline-filters-list');
  if (!container) return;

  const { currency, flightFilters } = AppState.getState();
  const airlineMap = new Map();

  flights.forEach(f => {
    if (!airlineMap.has(f.airline.code)) {
      airlineMap.set(f.airline.code, {
        name: f.airline.name,
        code: f.airline.code,
        minPrice: f.priceINR
      });
    } else {
      const cur = airlineMap.get(f.airline.code);
      if (f.priceINR < cur.minPrice) cur.minPrice = f.priceINR;
    }
  });

  container.innerHTML = Array.from(airlineMap.values()).map(a => `
    <label class="filter-checkbox-label">
      <div style="display: flex; align-items: center; min-width: 0;">
        <input type="checkbox" class="filter-airline-checkbox" value="${a.code}" ${flightFilters.airlines.includes(a.code) ? 'checked' : ''} />
        <span class="cb-custom"></span>
        <img src="images/airlines/${a.code}.png" alt="${a.name}" class="airline-filter-logo" onerror="this.onerror=null; this.src='https://pics.avs.io/60/60/${a.code}.png';" />
        <span class="airline-name-text">${a.name}</span>
      </div>
      <span class="filter-price-from">${formatCurrency(a.minPrice, currency)}</span>
    </label>
  `).join('');

  container.querySelectorAll('.filter-airline-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = Array.from(container.querySelectorAll('.filter-airline-checkbox:checked')).map(el => el.value);
      AppState.updateFlightFilters({ airlines: selected });
      renderFlightResults();
    });
  });
}

// Render Hotels Results
export function renderHotelsView() {
  const container = document.getElementById('hotels-results-container');
  if (!container) return;

  const { destination, minStars, freeCancellationOnly } = AppState.getState().hotelParams;
  const { currency } = AppState.getState();
  const results = searchHotels({ query: destination, minStars, freeCancellationOnly });

  container.innerHTML = `
    <div class="hotels-header-row">
      <h2>Hotels in ${destination}</h2>
      <span class="hotels-found-text">${results.length} stays available</span>
    </div>
    <div class="hotels-grid">
      ${results.map(h => `
        <div class="hotel-card">
          <div class="hotel-img-wrapper">
            <img src="${h.image}" alt="${h.name}" class="hotel-img" loading="lazy" />
            <div class="hotel-stars-tag">
              ${'★'.repeat(h.stars)}
            </div>
            ${h.freeCancellation ? '<div class="cancellation-badge">Free cancellation</div>' : ''}
          </div>
          <div class="hotel-content">
            <div class="hotel-header">
              <h3 class="hotel-name">${h.name}</h3>
              <p class="hotel-location">📍 ${h.location}</p>
            </div>
            <div class="hotel-rating-row">
              <div class="rating-badge">${h.rating}</div>
              <span class="rating-text">${h.rating >= 9 ? 'Exceptional' : 'Fabulous'} (${h.reviewsCount} reviews)</span>
            </div>
            <div class="hotel-amenities-row">
              ${h.amenities.slice(0, 3).map(a => `<span class="h-amenity">${a}</span>`).join('')}
            </div>
            <div class="hotel-price-row">
              <div class="h-price-col">
                <span class="h-price-sub">per night via ${h.dealProvider}</span>
                <span class="h-price-huge">${formatCurrency(h.priceINR, currency)}</span>
              </div>
              <button class="btn btn-primary btn-sm btn-book-hotel" data-hotel-id="${h.id}" data-hotel-name="${h.name}">Select Hotel ➔</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-book-hotel').forEach(btn => {
    btn.addEventListener('click', () => {
      const hotelId = btn.getAttribute('data-hotel-id');
      const hotel = results.find(h => h.id === hotelId);
      if (hotel) openHotelModal(hotel);
    });
  });
}

// Render Cars Results
export function renderCarsView() {
  const container = document.getElementById('cars-results-container');
  if (!container) return;

  const { location, category } = AppState.getState().carParams;
  const { currency } = AppState.getState();
  const cars = searchCars({ location, category, days: 3 });

  container.innerHTML = `
    <div class="cars-header-row">
      <h2>Car hire at ${location}</h2>
      <span class="cars-found-text">${cars.length} cars found for 3 days</span>
    </div>
    <div class="cars-grid">
      ${cars.map(c => `
        <div class="car-card">
          <div class="car-img-col">
            <img src="${c.image}" alt="${c.name}" class="car-img" loading="lazy" />
            <span class="car-category-pill">${c.category}</span>
          </div>
          <div class="car-info-col">
            <div class="car-title-row">
              <h3 class="car-name">${c.name}</h3>
              <div class="car-supplier-tag">
                <strong>${c.supplier}</strong> (★ ${c.supplierRating})
              </div>
            </div>
            <div class="car-specs-row">
              <span>👤 ${c.passengers} seats</span>
              <span>🧳 ${c.luggage} bags</span>
              <span>⚙️ ${c.transmission}</span>
              <span>❄️ A/C</span>
            </div>
            <div class="car-policies">
              <span class="policy-tag">✓ ${c.mileage}</span>
              <span class="policy-tag">✓ ${c.fuelPolicy}</span>
              <span class="policy-tag text-success">✓ Free cancellation</span>
            </div>
          </div>
          <div class="car-price-col">
            <span class="price-daily">${formatCurrency(c.dailyPriceINR, currency)} / day</span>
            <span class="car-price-huge">${formatCurrency(c.totalPriceINR, currency)}</span>
            <span class="car-total-sub">Total for 3 days</span>
            <button class="btn btn-primary btn-sm btn-book-car" data-car-id="${c.id}" data-car-name="${c.name}">Select Car ➔</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-book-car').forEach(btn => {
    btn.addEventListener('click', () => {
      const carId = btn.getAttribute('data-car-id');
      const car = cars.find(c => c.id === carId);
      if (car) openCarModal(car);
    });
  });
}

// ========================================================
// HOTEL SELECTION & RESERVATION MODAL
// ========================================================

function getHotelRoomsForBooking(hotel) {
  return [
    {
      id: 'deluxe',
      name: 'Deluxe King Room',
      bed: '1 Extra-large King Bed',
      size: '36 m²',
      view: 'Ocean / Garden View',
      provider: hotel.dealProvider || 'Booking.com',
      priceINR: hotel.priceINR,
      badge: 'Bestseller',
      badgeClass: 'bestseller',
      breakfast: true,
      freeCancellation: true,
      perks: ['Free High-Speed Wi-Fi', 'Breakfast Included', 'Free Cancellation up to 24h prior', 'Pay at Hotel available']
    },
    {
      id: 'suite',
      name: 'Executive Club Suite',
      bed: '1 King Bed + Living Lounge',
      size: '56 m²',
      view: 'Panoramic Beachfront View',
      provider: 'Luxury Escapes / Agoda',
      priceINR: Math.round(hotel.priceINR * 1.35),
      badge: 'Luxury Upgrade',
      badgeClass: 'luxury',
      breakfast: true,
      freeCancellation: true,
      perks: ['Club Lounge Access', 'Complimentary Evening Cocktails', 'Free Airport Shuttle', 'Deep Soaking Tub']
    },
    {
      id: 'standard',
      name: 'Superior Double Room',
      bed: '1 Queen Bed or 2 Twins',
      size: '28 m²',
      view: 'Courtyard View',
      provider: 'Skyscanner Direct Deals',
      priceINR: Math.round(hotel.priceINR * 0.82),
      badge: 'Best Value',
      badgeClass: 'saver',
      breakfast: false,
      freeCancellation: false,
      perks: ['Free Wi-Fi', 'En-suite Rain Shower', 'Smart TV with Streaming', 'Best Budget Rate']
    }
  ];
}

export function openHotelModal(hotel) {
  const modal = document.getElementById('hotel-booking-modal');
  if (!modal) return;

  const rooms = getHotelRoomsForBooking(hotel);
  AppState.setState({
    selectedHotelForBooking: hotel,
    selectedRoomForBooking: rooms[0],
    hotelBookingStep: 'rooms'
  });

  renderHotelModalStep(rooms);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeHotelModal() {
  const modal = document.getElementById('hotel-booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function renderHotelModalStep(roomsList) {
  const modal = document.getElementById('hotel-booking-modal');
  const body = document.getElementById('hotel-modal-body');
  const title = document.getElementById('hotel-modal-title');
  if (!modal || !body) return;

  const state = AppState.getState();
  const hotel = state.selectedHotelForBooking;
  const room = state.selectedRoomForBooking;
  const step = state.hotelBookingStep;
  const currency = state.currency;
  const { hotelParams } = state;

  if (!hotel) return;
  const rooms = roomsList || getHotelRoomsForBooking(hotel);

  // Calculate nights
  let nights = 4;
  if (hotelParams.checkIn && hotelParams.checkOut) {
    const diff = Math.round((new Date(hotelParams.checkOut) - new Date(hotelParams.checkIn)) / (1000 * 60 * 60 * 24));
    if (diff > 0) nights = diff;
  }

  if (step === 'rooms') {
    if (title) title.textContent = `Select Room · ${hotel.name}`;
    body.innerHTML = `
      <div class="booking-step-view">
        <div class="hotel-summary-modal-card">
          <img src="${hotel.image}" alt="${hotel.name}" class="hotel-modal-thumb" />
          <div class="hotel-modal-meta">
            <h3>${hotel.name}</h3>
            <div class="hotel-modal-stars">${'★'.repeat(hotel.stars)} · <span class="badge badge-eco" style="font-size:0.75rem;">${hotel.rating} Exceptional</span> (${hotel.reviewsCount} verified reviews)</div>
            <div class="hotel-modal-location">📍 ${hotel.location}</div>
            <div class="hotel-stay-pill">📅 ${hotelParams.checkIn || '11-10-2026'} ➔ ${hotelParams.checkOut || '15-10-2026'} · <strong>${nights} nights</strong> · 👤 ${hotelParams.guests || 2} guests</div>
          </div>
        </div>

        <h3 class="modal-subheading">Choose your room & deal</h3>
        <p class="modal-subtext">Compare available room types, included perks, and free cancellation options for your stay.</p>

        <div class="room-options-list">
          ${rooms.map(r => {
            const totalForStay = r.priceINR * nights;
            return `
              <div class="room-option-card ${r.id === 'deluxe' ? 'featured-room' : ''}">
                <div class="room-header-row">
                  <div class="room-title-col">
                    <span class="room-title">${r.name}</span>
                    <span class="room-badge ${r.badgeClass}">${r.badge}</span>
                  </div>
                  <span class="room-provider-tag">via ${r.provider}</span>
                </div>

                <div class="room-features-grid">
                  <span class="room-feature-item">🛏️ ${r.bed}</span>
                  <span class="room-feature-item">📐 ${r.size}</span>
                  <span class="room-feature-item">🌅 ${r.view}</span>
                  ${r.perks.map(p => `<span class="room-feature-item">✓ ${p}</span>`).join('')}
                </div>

                <div class="room-bottom-cta-row">
                  <div class="room-price-col">
                    <span class="room-price-val">${formatCurrency(r.priceINR, currency)} <span style="font-size:0.8rem; font-weight:500; color:var(--sk-text-muted);">/ night</span></span>
                    <span class="room-price-sub">${formatCurrency(totalForStay, currency)} total for ${nights} nights (taxes included)</span>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm btn-choose-room" data-room-id="${r.id}">
                    Select Room ➔
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    body.querySelectorAll('.btn-choose-room').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.getAttribute('data-room-id');
        const chosen = rooms.find(r => r.id === roomId) || rooms[0];
        AppState.setState({
          selectedRoomForBooking: chosen,
          hotelBookingStep: 'guest'
        });
        renderHotelModalStep(rooms);
      });
    });

  } else if (step === 'guest') {
    if (title) title.textContent = `Guest Details · ${hotel.name}`;
    const selectedRoom = room || rooms[0];
    const totalStay = selectedRoom.priceINR * nights;
    const taxes = Math.round(totalStay * 0.12);
    const grandTotal = totalStay + taxes;

    body.innerHTML = `
      <div class="booking-step-view">
        <div class="booking-progress-bar">
          <div class="step completed">1. Room & Rate</div>
          <div class="step active">2. Guest Information</div>
          <div class="step">3. Confirmation</div>
        </div>

        <div class="booking-flight-summary-card" style="margin-bottom: 18px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <strong style="color:var(--sk-blue-primary); font-size:1rem;">${hotel.name} · ${selectedRoom.name}</strong>
            <span style="font-size:0.85rem; color:var(--sk-text-secondary);">📅 ${hotelParams.checkIn || '11-10-2026'} to ${hotelParams.checkOut || '15-10-2026'} (${nights} nights) · 👤 ${hotelParams.guests || 2} guests · 1 room</span>
          </div>
          <span class="badge badge-eco">✓ Free cancellation</span>
        </div>

        <div class="passenger-form-container">
          <h3>Guest Information</h3>
          <p class="form-hint">Please enter guest details matching the government ID presented at check-in.</p>

          <form id="hotel-guest-booking-form">
            <div class="form-row two-col">
              <div class="form-group">
                <label>First & Middle Name *</label>
                <input type="text" class="sk-input" id="h-firstname" required placeholder="e.g. Rahul" value="Himan" />
              </div>
              <div class="form-group">
                <label>Last / Surname *</label>
                <input type="text" class="sk-input" id="h-lastname" required placeholder="e.g. Sharma" value="Verma" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" class="sk-input" id="h-email" required placeholder="name@example.com" value="traveler@example.com" />
              </div>
              <div class="form-group">
                <label>Mobile Number *</label>
                <input type="tel" class="sk-input" id="h-phone" required placeholder="+91 98765 43210" value="+91 98765 43210" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Bed Preference</label>
                <select class="sk-select" id="h-bed">
                  <option value="1 King Bed" selected>1 Large King Bed</option>
                  <option value="2 Twin Beds">2 Single Twin Beds</option>
                </select>
              </div>
              <div class="form-group">
                <label>Estimated Arrival Time</label>
                <select class="sk-select" id="h-arrival">
                  <option value="14:00 - 15:00" selected>14:00 - 15:00 (Standard Check-in)</option>
                  <option value="15:00 - 18:00">15:00 - 18:00 (Afternoon)</option>
                  <option value="18:00 - 22:00">18:00 - 22:00 (Evening)</option>
                  <option value="Late arrival (after 22:00)">Late arrival (after 22:00)</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label>Special Requests (Optional)</label>
              <textarea class="sk-input" id="h-requests" rows="2" placeholder="e.g. High floor room, quiet room, late check-out..."></textarea>
            </div>

            <div class="booking-order-summary">
              <div class="summary-line">
                <span>Room Rate (${nights} nights x ${formatCurrency(selectedRoom.priceINR, currency)}):</span>
                <span>${formatCurrency(totalStay, currency)}</span>
              </div>
              <div class="summary-line">
                <span>Estimated Taxes & Service Fees (12% GST):</span>
                <span>${formatCurrency(taxes, currency)}</span>
              </div>
              <div class="summary-line total-line">
                <strong>Total Payable Amount:</strong>
                <strong class="text-primary">${formatCurrency(grandTotal, currency)}</strong>
              </div>
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-secondary" id="btn-back-to-rooms">Back to Rooms</button>
              <button type="submit" class="btn btn-primary btn-lg">Confirm & Reserve Room ➔</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-back-to-rooms')?.addEventListener('click', () => {
      AppState.setState({ hotelBookingStep: 'rooms' });
      renderHotelModalStep(rooms);
    });

    document.getElementById('hotel-guest-booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = `${document.getElementById('h-firstname').value} ${document.getElementById('h-lastname').value}`;
      const email = document.getElementById('h-email').value;
      const bed = document.getElementById('h-bed').value;
      const arrival = document.getElementById('h-arrival').value;
      const requests = document.getElementById('h-requests').value;
      const ref = `HTL-${Math.floor(100000 + Math.random() * 900000)}`;

      const booking = {
        ref,
        hotel,
        room: selectedRoom,
        guestName,
        email,
        bed,
        arrival,
        requests,
        nights,
        checkIn: hotelParams.checkIn || '11-10-2026',
        checkOut: hotelParams.checkOut || '15-10-2026',
        totalPrice: grandTotal,
        bookingDate: new Date().toLocaleDateString('en-GB')
      };

      AppState.setState({
        hotelBookingStep: 'confirmed',
        latestHotelBooking: booking
      });
      renderHotelModalStep(rooms);
    });

  } else if (step === 'confirmed') {
    if (title) title.textContent = `Reservation Confirmed · ${hotel.name}`;
    const booking = state.latestHotelBooking;
    if (!booking) return;

    body.innerHTML = `
      <div class="booking-step-view confirmed-view">
        <div class="booking-success-header">
          <div class="success-checkmark">✓</div>
          <h2>Hotel Reservation Confirmed!</h2>
          <p>Your room at <strong>${hotel.name}</strong> is reserved and guaranteed. Confirmation voucher sent to <strong>${booking.email}</strong>.</p>
        </div>

        <div class="e-ticket-card">
          <div class="ticket-header">
            <div class="ticket-airline">
              <span class="badge-mini" style="background:#0770E3;">🏨</span>
              <strong>${hotel.name}</strong>
            </div>
            <div class="ticket-pnr">
              <span class="pnr-label">HOTEL CONFIRMATION REF</span>
              <span class="pnr-code">${booking.ref}</span>
            </div>
          </div>

          <div class="ticket-body">
            <div class="voucher-details-grid">
              <div class="t-col">
                <span class="t-label">PRIMARY GUEST</span>
                <span class="t-val">${booking.guestName}</span>
              </div>
              <div class="t-col">
                <span class="t-label">ROOM TYPE</span>
                <span class="t-val">${booking.room.name}</span>
              </div>
              <div class="t-col">
                <span class="t-label">STAY DURATION</span>
                <span class="t-val">${booking.nights} Nights · 1 Room</span>
              </div>
            </div>

            <div class="ticket-flight-path" style="background:#F4FAF9; border:1px solid #C2EAE5;">
              <div class="tf-point">
                <span class="tf-city">CHECK-IN</span>
                <span class="tf-code" style="font-size:1.1rem; color:var(--sk-navy-main);">${booking.checkIn}</span>
                <span class="tf-time">From 14:00</span>
              </div>
              <div class="tf-connector" style="color:var(--sk-green-eco); font-weight:700;">
                <span>🏨 ${booking.nights} NIGHTS</span>
              </div>
              <div class="tf-point">
                <span class="tf-city">CHECK-OUT</span>
                <span class="tf-code" style="font-size:1.1rem; color:var(--sk-navy-main);">${booking.checkOut}</span>
                <span class="tf-time">Until 11:00</span>
              </div>
            </div>

            <div class="ticket-footer-row">
              <div class="qr-mock">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#05203C">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-5 0h2v3h-2v-3zm3 3h2v3h-2v-3zm-3 2h2v2h-2v-2zm5 0h3v2h-3v-2z"/>
                </svg>
                <span>SCAN AT CHECK-IN</span>
              </div>
              <div class="gate-info">
                <span>📍 ${hotel.location}</span>
                <span class="booked-with">Booked via ${booking.room.provider} · Total: ${formatCurrency(booking.totalPrice, currency)} (Pay at Property)</span>
                <span style="font-size:0.75rem; color:#137333; font-weight:600;">✓ Free cancellation guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Hotel Voucher</button>
          <button class="btn btn-primary" id="btn-done-hotel-booking">Done & Back to Hotels</button>
        </div>
      </div>
    `;

    document.getElementById('btn-done-hotel-booking')?.addEventListener('click', () => {
      closeHotelModal();
    });
  }
}

// ========================================================
// CAR HIRE SELECTION & BOOKING MODAL
// ========================================================

export function openCarModal(car) {
  const modal = document.getElementById('car-booking-modal');
  if (!modal) return;

  AppState.setState({
    selectedCarForBooking: car,
    selectedCarProtection: 'basic',
    selectedCarAddons: [],
    carBookingStep: 'protection'
  });

  renderCarModalStep();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeCarModal() {
  const modal = document.getElementById('car-booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function renderCarModalStep() {
  const modal = document.getElementById('car-booking-modal');
  const body = document.getElementById('car-modal-body');
  const title = document.getElementById('car-modal-title');
  if (!modal || !body) return;

  const state = AppState.getState();
  const car = state.selectedCarForBooking;
  const step = state.carBookingStep;
  const currency = state.currency;
  const protection = state.selectedCarProtection || 'basic';
  const selectedAddons = state.selectedCarAddons || [];
  const { carParams } = state;

  if (!car) return;

  const rentalDays = 3;
  const basePrice = car.dailyPriceINR * rentalDays;
  const protectionDaily = protection === 'premium' ? 650 : 0;
  const protectionTotal = protectionDaily * rentalDays;

  const addonPrices = {
    driver: 350,
    gps: 250,
    seat: 300
  };

  const addonsTotal = selectedAddons.reduce((acc, a) => acc + (addonPrices[a] || 0) * rentalDays, 0);
  const totalAmount = basePrice + protectionTotal + addonsTotal;

  if (step === 'protection') {
    if (title) title.textContent = `Select Protection & Extras · ${car.name}`;
    body.innerHTML = `
      <div class="booking-step-view">
        <div class="car-summary-modal-card">
          <img src="${car.image}" alt="${car.name}" class="car-modal-thumb" />
          <div class="car-modal-meta">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-deal" style="font-size:0.72rem;">${car.category}</span>
              <span style="font-size:0.8rem; font-weight:700; color:var(--sk-blue-primary);">${car.supplier} (★ ${car.supplierRating})</span>
            </div>
            <h3>${car.name}</h3>
            <div class="car-modal-specs">
              <span>👤 ${car.passengers} seats</span>
              <span>🧳 ${car.luggage} bags</span>
              <span>⚙️ ${car.transmission}</span>
              <span>❄️ A/C</span>
            </div>
            <div class="hotel-stay-pill">📍 ${carParams.location || 'Goa Dabolim Airport (GOI)'} · 📅 3 Days Rental · ✓ Unlimited mileage</div>
          </div>
        </div>

        <h3 class="modal-subheading">Choose your protection cover</h3>
        <p class="modal-subtext">Choose your level of damage cover and liability for your rental.</p>

        <div class="protection-plans-grid">
          <div class="protection-plan-card ${protection === 'basic' ? 'active' : ''}" data-protection="basic">
            <div class="protection-header">
              <div>
                <div class="protection-title">Basic Cover</div>
                <span style="font-size:0.75rem; color:var(--sk-text-muted);">Standard Protection</span>
              </div>
              <span class="protection-cost" style="color:var(--sk-green-eco);">Included</span>
            </div>
            <ul class="protection-features-list">
              <li>Third-party liability cover</li>
              <li>Collision damage waiver (CDW)</li>
              <li>Standard deposit: ₹15,000 excess</li>
            </ul>
          </div>

          <div class="protection-plan-card ${protection === 'premium' ? 'active' : ''}" data-protection="premium">
            <div class="protection-header">
              <div>
                <div class="protection-title">Full Peace of Mind</div>
                <span class="badge badge-eco" style="font-size:0.7rem; padding:2px 6px;">Recommended</span>
              </div>
              <span class="protection-cost">+${formatCurrency(650, currency)} <span style="font-size:0.7rem; font-weight:500;">/day</span></span>
            </div>
            <ul class="protection-features-list">
              <li><strong>Zero excess liability (₹0 excess)</strong></li>
              <li>Tyres, glass, windscreen & underbody</li>
              <li>24/7 emergency breakdown roadside assist</li>
              <li>Lost key replacement coverage</li>
            </ul>
          </div>
        </div>

        <h3 class="modal-subheading">Optional Equipment & Add-ons</h3>
        <div class="car-addons-list">
          <label class="car-addon-row">
            <div class="addon-label-group">
              <input type="checkbox" class="car-addon-checkbox" data-addon="driver" ${selectedAddons.includes('driver') ? 'checked' : ''} />
              <span>👤 Additional Driver</span>
            </div>
            <span class="addon-price-tag">+${formatCurrency(350, currency)} / day</span>
          </label>
          <label class="car-addon-row">
            <div class="addon-label-group">
              <input type="checkbox" class="car-addon-checkbox" data-addon="gps" ${selectedAddons.includes('gps') ? 'checked' : ''} />
              <span>🛰️ GPS Navigation System</span>
            </div>
            <span class="addon-price-tag">+${formatCurrency(250, currency)} / day</span>
          </label>
          <label class="car-addon-row">
            <div class="addon-label-group">
              <input type="checkbox" class="car-addon-checkbox" data-addon="seat" ${selectedAddons.includes('seat') ? 'checked' : ''} />
              <span>👶 Child Safety Booster Seat</span>
            </div>
            <span class="addon-price-tag">+${formatCurrency(300, currency)} / day</span>
          </label>
        </div>

        <div class="booking-order-summary" style="margin-top:20px;">
          <div class="summary-line">
            <span>Base Car Rental (3 days x ${formatCurrency(car.dailyPriceINR, currency)}):</span>
            <span>${formatCurrency(basePrice, currency)}</span>
          </div>
          ${protection === 'premium' ? `
            <div class="summary-line">
              <span>Full Peace of Mind Cover (3 days):</span>
              <span>+${formatCurrency(protectionTotal, currency)}</span>
            </div>
          ` : ''}
          ${addonsTotal > 0 ? `
            <div class="summary-line">
              <span>Selected Add-ons (3 days):</span>
              <span>+${formatCurrency(addonsTotal, currency)}</span>
            </div>
          ` : ''}
          <div class="summary-line total-line">
            <strong>Estimated Total (3 days):</strong>
            <strong class="text-primary">${formatCurrency(totalAmount, currency)}</strong>
          </div>
        </div>

        <div class="form-actions-row">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('car-booking-modal').classList.remove('active')">Cancel</button>
          <button type="button" class="btn btn-primary btn-lg" id="btn-to-driver-step">Continue to Driver Details ➔</button>
        </div>
      </div>
    `;

    // Protection card toggles
    body.querySelectorAll('.protection-plan-card').forEach(card => {
      card.addEventListener('click', () => {
        const pType = card.getAttribute('data-protection');
        AppState.setState({ selectedCarProtection: pType });
        renderCarModalStep();
      });
    });

    // Addon checkboxes
    body.querySelectorAll('.car-addon-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedList = Array.from(body.querySelectorAll('.car-addon-checkbox:checked')).map(c => c.getAttribute('data-addon'));
        AppState.setState({ selectedCarAddons: checkedList });
        renderCarModalStep();
      });
    });

    // Continue to driver step
    document.getElementById('btn-to-driver-step')?.addEventListener('click', () => {
      AppState.setState({ carBookingStep: 'driver' });
      renderCarModalStep();
    });

  } else if (step === 'driver') {
    if (title) title.textContent = `Driver Information · ${car.name}`;
    body.innerHTML = `
      <div class="booking-step-view">
        <div class="booking-progress-bar">
          <div class="step completed">1. Protection & Extras</div>
          <div class="step active">2. Driver Details</div>
          <div class="step">3. Confirmation</div>
        </div>

        <div class="booking-flight-summary-card" style="margin-bottom: 18px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <strong style="color:var(--sk-blue-primary); font-size:1rem;">${car.name} (${car.supplier})</strong>
            <span style="font-size:0.85rem; color:var(--sk-text-secondary);">📍 Pick-up: ${carParams.location || 'Goa Dabolim Airport (GOI)'} · 3 days rental · Unlimited mileage</span>
          </div>
          <span class="badge badge-eco">✓ Free cancellation</span>
        </div>

        <div class="passenger-form-container">
          <h3>Lead Driver Details</h3>
          <p class="form-hint">Driver must present a valid physical driving license and credit/debit card in their name at counter pickup.</p>

          <form id="car-driver-booking-form">
            <div class="form-row two-col">
              <div class="form-group">
                <label>First & Middle Name *</label>
                <input type="text" class="sk-input" id="c-firstname" required placeholder="e.g. Himanshu" value="Himanshu" />
              </div>
              <div class="form-group">
                <label>Last / Surname *</label>
                <input type="text" class="sk-input" id="c-lastname" required placeholder="e.g. Sharma" value="Sharma" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" class="sk-input" id="c-email" required placeholder="name@example.com" value="driver@example.com" />
              </div>
              <div class="form-group">
                <label>Mobile Number *</label>
                <input type="tel" class="sk-input" id="c-phone" required placeholder="+91 98765 43210" value="+91 98765 43210" />
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label>Driving License Number *</label>
                <input type="text" class="sk-input" id="c-license" required placeholder="DL-0420110023456" value="DL-0420180098765" />
              </div>
              <div class="form-group">
                <label>Flight Number (Optional for delay tracking)</label>
                <input type="text" class="sk-input" id="c-flightno" placeholder="e.g. 6E-204" value="6E-204" />
              </div>
            </div>

            <div class="booking-order-summary">
              <div class="summary-line">
                <span>Vehicle (${car.name}):</span>
                <span>${formatCurrency(basePrice, currency)}</span>
              </div>
              <div class="summary-line">
                <span>Protection:</span>
                <span>${protection === 'premium' ? `Full Zero-Excess (${formatCurrency(protectionTotal, currency)})` : 'Basic Standard (Included)'}</span>
              </div>
              ${addonsTotal > 0 ? `
                <div class="summary-line">
                  <span>Add-ons:</span>
                  <span>+${formatCurrency(addonsTotal, currency)}</span>
                </div>
              ` : ''}
              <div class="summary-line total-line">
                <strong>Total Payable Amount:</strong>
                <strong class="text-primary">${formatCurrency(totalAmount, currency)}</strong>
              </div>
            </div>

            <div class="form-actions-row">
              <button type="button" class="btn btn-secondary" id="btn-back-to-car-protection">Back to Options</button>
              <button type="submit" class="btn btn-primary btn-lg">Confirm & Reserve Vehicle ➔</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-back-to-car-protection')?.addEventListener('click', () => {
      AppState.setState({ carBookingStep: 'protection' });
      renderCarModalStep();
    });

    document.getElementById('car-driver-booking-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const driverName = `${document.getElementById('c-firstname').value} ${document.getElementById('c-lastname').value}`;
      const email = document.getElementById('c-email').value;
      const license = document.getElementById('c-license').value;
      const flightNo = document.getElementById('c-flightno').value;
      const ref = `CAR-${Math.floor(100000 + Math.random() * 900000)}`;

      const booking = {
        ref,
        car,
        driverName,
        email,
        license,
        flightNo,
        pickupLocation: carParams.location || 'Goa Dabolim Airport (GOI) Terminal Counter',
        pickupDate: carParams.pickupDate || '11-10-2026',
        dropoffDate: carParams.dropoffDate || '14-10-2026',
        rentalDays,
        protection,
        totalPrice: totalAmount,
        bookingDate: new Date().toLocaleDateString('en-GB')
      };

      AppState.setState({
        carBookingStep: 'confirmed',
        latestCarBooking: booking
      });
      renderCarModalStep();
    });

  } else if (step === 'confirmed') {
    if (title) title.textContent = `Car Rental Confirmed · ${car.name}`;
    const booking = state.latestCarBooking;
    if (!booking) return;

    body.innerHTML = `
      <div class="booking-step-view confirmed-view">
        <div class="booking-success-header">
          <div class="success-checkmark">✓</div>
          <h2>Car Hire Reservation Confirmed!</h2>
          <p>Your vehicle is reserved with <strong>${car.supplier}</strong>. Rental agreement voucher sent to <strong>${booking.email}</strong>.</p>
        </div>

        <div class="e-ticket-card">
          <div class="ticket-header">
            <div class="ticket-airline">
              <span class="badge-mini" style="background:#FF5452;">🚗</span>
              <strong>${car.name} (${car.supplier})</strong>
            </div>
            <div class="ticket-pnr">
              <span class="pnr-label">RENTAL AGREEMENT REF</span>
              <span class="pnr-code">${booking.ref}</span>
            </div>
          </div>

          <div class="ticket-body">
            <div class="voucher-details-grid">
              <div class="t-col">
                <span class="t-label">LEAD DRIVER</span>
                <span class="t-val">${booking.driverName}</span>
              </div>
              <div class="t-col">
                <span class="t-label">LICENSE NO.</span>
                <span class="t-val">${booking.license}</span>
              </div>
              <div class="t-col">
                <span class="t-label">RENTAL PERIOD</span>
                <span class="t-val">${booking.rentalDays} Days · ${car.category}</span>
              </div>
            </div>

            <div class="ticket-flight-path" style="background:#F4FAF9; border:1px solid #C2EAE5;">
              <div class="tf-point">
                <span class="tf-city">PICK-UP</span>
                <span class="tf-code" style="font-size:1.1rem; color:var(--sk-navy-main);">${booking.pickupDate}</span>
                <span class="tf-time">10:00 AM</span>
              </div>
              <div class="tf-connector" style="color:var(--sk-green-eco); font-weight:700;">
                <span>🚗 3 DAYS RENTAL</span>
              </div>
              <div class="tf-point">
                <span class="tf-city">RETURN</span>
                <span class="tf-code" style="font-size:1.1rem; color:var(--sk-navy-main);">${booking.dropoffDate}</span>
                <span class="tf-time">10:00 AM</span>
              </div>
            </div>

            <div class="ticket-footer-row">
              <div class="qr-mock">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#05203C">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-5 0h2v3h-2v-3zm3 3h2v3h-2v-3zm-3 2h2v2h-2v-2zm5 0h3v2h-3v-2z"/>
                </svg>
                <span>SCAN AT RENTAL DESK</span>
              </div>
              <div class="gate-info">
                <span>📍 ${booking.pickupLocation}</span>
                <span class="booked-with">Full-to-Full Fuel Policy · Total: ${formatCurrency(booking.totalPrice, currency)}</span>
                <span style="font-size:0.75rem; color:#137333; font-weight:600;">✓ Unlimited mileage included · Free cancellation up to 48h</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Print Rental Voucher</button>
          <button class="btn btn-primary" id="btn-done-car-booking">Done & Back to Cars</button>
        </div>
      </div>
    `;

    document.getElementById('btn-done-car-booking')?.addEventListener('click', () => {
      closeCarModal();
    });
  }
}


// Render "Explore Everywhere" Popular Destinations Grid with Live Weather
export async function renderExploreDestinations() {
  const container = document.getElementById('explore-destinations-grid');
  if (!container) return;

  const popularDestinations = [
    { code: 'GOI', city: 'Goa', country: 'India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80', lat: 15.38, lon: 73.83, minPriceINR: 3499, tag: 'Beach & Parties' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80', lat: 25.25, lon: 55.36, minPriceINR: 14299, tag: 'Luxury & Skyline' },
    { code: 'BKK', city: 'Bangkok', country: 'Thailand', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=700&q=80', lat: 13.69, lon: 100.75, minPriceINR: 11899, tag: 'Street Food & Temples' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=700&q=80', lat: 1.36, lon: 103.99, minPriceINR: 16499, tag: 'Gardens & Modern City' },
    { code: 'DPS', city: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=80', lat: -8.74, lon: 115.16, minPriceINR: 19999, tag: 'Tropical Paradise' },
    { code: 'LHR', city: 'London', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=700&q=80', lat: 51.47, lon: -0.45, minPriceINR: 38999, tag: 'Iconic Culture' },
    { code: 'CDG', city: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80', lat: 49.00, lon: 2.54, minPriceINR: 41200, tag: 'Art & Romance' },
    { code: 'HND', city: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80', lat: 35.54, lon: 139.77, minPriceINR: 45500, tag: 'Vibrant Neon' }
  ];

  const { currency } = AppState.getState();

  container.innerHTML = popularDestinations.map(dest => `
    <div class="explore-card" data-dest-code="${dest.code}">
      <div class="explore-img-wrap">
        <img src="${dest.img}" alt="${dest.city}" class="explore-card-img" loading="lazy" />
        <span class="explore-tag-pill">${dest.tag}</span>
        <div class="weather-badge-pill" id="weather-${dest.code}">
          <span>🌤️ Loading weather...</span>
        </div>
      </div>
      <div class="explore-card-details">
        <div class="explore-header-row">
          <h3 class="dest-city-name">${dest.city}</h3>
          <span class="dest-country-name">${dest.country}</span>
        </div>
        <div class="explore-footer-row">
          <div class="dest-price-col">
            <span class="dest-price-label">Flights from</span>
            <span class="dest-price-value">${formatCurrency(dest.minPriceINR, currency)}</span>
          </div>
          <button class="btn btn-primary btn-sm btn-explore-search" data-dest-code="${dest.code}" data-dest-city="${dest.city}">Search Flights ➔</button>
        </div>
      </div>
    </div>
  `).join('');

  // Fetch live weather for each destination asynchronously
  popularDestinations.forEach(async dest => {
    const weather = await getDestinationWeather(dest.lat, dest.lon, dest.city);
    const badge = document.getElementById(`weather-${dest.code}`);
    if (badge && weather) {
      badge.innerHTML = `<span>${weather.icon} ${weather.temperature}°C · ${weather.condition}</span>`;
    }
  });

  // Click card or button to search flights to that destination
  container.querySelectorAll('.btn-explore-search, .explore-card').forEach(el => {
    el.addEventListener('click', (e) => {
      const code = el.getAttribute('data-dest-code');
      const airport = getAirportByCode(code);
      if (airport) {
        AppState.updateFlightParams({ destCode: airport.code });
        const destInput = document.getElementById('flight-dest-input');
        if (destInput) destInput.value = `${airport.city} (${airport.code})`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        triggerFlightSearch(true);
      }
    });
  });
}

// Render Currency Switcher Modal
export function openCurrencyModal() {
  const modal = document.getElementById('currency-modal');
  if (!modal) return;

  const current = AppState.getState().currency;
  const currencies = getAllCurrencies();

  const list = document.getElementById('currency-options-list');
  if (list) {
    list.innerHTML = currencies.map(c => `
      <div class="currency-option-item ${c.code === current ? 'active' : ''}" data-code="${c.code}">
        <span class="curr-symbol">${c.symbol}</span>
        <div class="curr-names">
          <span class="curr-code">${c.code}</span>
          <span class="curr-title">${c.name}</span>
        </div>
        ${c.code === current ? '<span class="curr-check">✓</span>' : ''}
      </div>
    `).join('');

    list.querySelectorAll('.currency-option-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-code');
        AppState.setCurrency(code);
        updateCurrencyDisplays();
        renderFlightResults();
        renderPriceCalendarBar(AppState.getState().priceCalendar);
        modal.classList.remove('active');
      });
    });
  }

  modal.classList.add('active');
}

export function updateCurrencyDisplays() {
  const { currency } = AppState.getState();
  const symbol = getCurrencySymbol(currency);
  const navBtn = document.getElementById('nav-currency-btn');
  if (navBtn) {
    navBtn.textContent = `🇮🇳 ₹ · ${currency}`;
  }
}

// API Keys Configuration Drawer / Modal
export function openApiSettingsModal() {
  const modal = document.getElementById('api-settings-modal');
  if (!modal) return;

  const config = getApiConfig();
  const body = document.getElementById('api-settings-body');
  if (body) {
    body.innerHTML = `
      <div class="api-settings-container">
        <div class="api-notice-box">
          <div class="notice-icon">🔑</div>
          <div class="notice-text">
            <strong>Essential Free Travel APIs & Keys</strong>
            <p>Our app connects to free public APIs for live weather and currencies out-of-the-box. You can also configure free travel keys below to activate live Amadeus or AviationStack flight lookups!</p>
          </div>
        </div>

        <!-- Open-Meteo & Frankfurter Status (Free & Active) -->
        <div class="api-service-card active-service">
          <div class="service-header">
            <div>
              <h4>🌤️ Open-Meteo Weather API</h4>
              <p class="service-desc">Live global airport weather and temperatures (100% Free, No key needed)</p>
            </div>
            <span class="status-badge connected">● Live & Connected</span>
          </div>
        </div>

        <div class="api-service-card active-service">
          <div class="service-header">
            <div>
              <h4>💱 Live Currency Exchange API</h4>
              <p class="service-desc">Real-time exchange rate conversion for INR, USD, EUR, GBP, AED, SGD (Free)</p>
            </div>
            <span class="status-badge connected">● Live & Connected</span>
          </div>
        </div>

        <!-- Amadeus API -->
        <div class="api-service-card">
          <div class="service-header">
            <div>
              <h4>✈️ Amadeus Flight Offers API (Self-Service Free Tier)</h4>
              <p class="service-desc">Offers 2,000 free live flight search calls every month. <a href="https://developers.amadeus.com/register" target="_blank" rel="noopener">Get Free Key here ↗</a></p>
            </div>
            <span class="status-badge ${config.amadeus.enabled ? 'connected' : 'optional'}">${config.amadeus.enabled ? '● Configured' : 'Optional'}</span>
          </div>
          <div class="service-inputs">
            <div class="form-group">
              <label>Amadeus API Client ID</label>
              <input type="text" class="sk-input" id="cfg-amadeus-client-id" value="${config.amadeus.clientId || ''}" placeholder="e.g. 8xJ921Lka9..." />
            </div>
            <div class="form-group">
              <label>Amadeus API Client Secret</label>
              <input type="password" class="sk-input" id="cfg-amadeus-client-secret" value="${config.amadeus.clientSecret || ''}" placeholder="e.g. 7qPz9..." />
            </div>
            <div class="service-actions">
              <button class="btn btn-secondary btn-sm" id="btn-test-amadeus">Test Amadeus Connection</button>
              <span class="test-feedback" id="feedback-amadeus"></span>
            </div>
          </div>
        </div>

        <!-- AviationStack API -->
        <div class="api-service-card">
          <div class="service-header">
            <div>
              <h4>📡 AviationStack Flight Radar API</h4>
              <p class="service-desc">Real-time flight statuses, route tracking & airport schedules. <a href="https://aviationstack.com/signup/free" target="_blank" rel="noopener">Get Free Key ↗</a></p>
            </div>
            <span class="status-badge ${config.aviationStack.apiKey ? 'connected' : 'optional'}">${config.aviationStack.apiKey ? '● Connected &amp; Active' : 'Optional'}</span>
          </div>
          <div class="service-inputs">
            <div class="form-group">
              <label>AviationStack Access Key</label>
              <input type="text" class="sk-input" id="cfg-aviationstack-key" value="${config.aviationStack.apiKey || ''}" placeholder="e.g. 3a7b9c1..." />
            </div>
            <div class="service-actions">
              <button class="btn btn-secondary btn-sm" id="btn-test-aviationstack">Test AviationStack Key</button>
              <span class="test-feedback" id="feedback-aviationstack"></span>
            </div>
          </div>
        </div>

        <div class="api-modal-footer">
          <button class="btn btn-secondary" id="btn-cancel-api-modal">Close</button>
          <button class="btn btn-primary" id="btn-save-api-config">Save API Configuration</button>
        </div>
      </div>
    `;

    // Connect test buttons
    document.getElementById('btn-test-amadeus')?.addEventListener('click', async () => {
      const cid = document.getElementById('cfg-amadeus-client-id').value;
      const csec = document.getElementById('cfg-amadeus-client-secret').value;
      const fb = document.getElementById('feedback-amadeus');
      fb.innerHTML = 'Testing...';
      const res = await testAmadeusConnection(cid, csec);
      fb.innerHTML = `<span class="${res.success ? 'text-success' : 'text-danger'}">${res.message}</span>`;
    });

    document.getElementById('btn-test-aviationstack')?.addEventListener('click', async () => {
      const key = document.getElementById('cfg-aviationstack-key').value;
      const fb = document.getElementById('feedback-aviationstack');
      fb.innerHTML = 'Testing...';
      const res = await testAviationStackConnection(key);
      fb.innerHTML = `<span class="${res.success ? 'text-success' : 'text-danger'}">${res.message}</span>`;
    });

    // Save configuration
    document.getElementById('btn-save-api-config')?.addEventListener('click', () => {
      const updated = {
        ...config,
        amadeus: {
          ...config.amadeus,
          clientId: document.getElementById('cfg-amadeus-client-id').value.trim(),
          clientSecret: document.getElementById('cfg-amadeus-client-secret').value.trim(),
          enabled: !!document.getElementById('cfg-amadeus-client-id').value.trim()
        },
        aviationStack: {
          ...config.aviationStack,
          apiKey: document.getElementById('cfg-aviationstack-key').value.trim(),
          enabled: !!document.getElementById('cfg-aviationstack-key').value.trim()
        }
      };
      saveApiConfig(updated);
      alert('API settings saved successfully! Active APIs are ready.');
      modal.classList.remove('active');
    });

    document.getElementById('btn-cancel-api-modal')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.classList.add('active');
}
