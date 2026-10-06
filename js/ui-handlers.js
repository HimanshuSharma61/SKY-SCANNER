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

  function renderDropdown(items) {
    if (!items || items.length === 0) {
      dropdown.innerHTML = '<div class="autocomplete-empty">No airports found</div>';
      dropdown.classList.add('active');
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

    dropdown.classList.add('active');
  }

  input.addEventListener('focus', () => {
    const list = searchAirports(input.value);
    renderDropdown(list);
  });

  input.addEventListener('input', (e) => {
    const list = searchAirports(e.target.value);
    renderDropdown(list);
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
      dropdown.classList.remove('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
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
    countHeader.innerHTML = `<strong>${filtered.length} flights</strong> from ${origin ? origin.city : state.flightParams.originCode} to ${dest ? dest.city : state.flightParams.destCode}`;
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
        ${flight.isGreener ? `
          <div class="flight-card-banner eco-banner">
            <span class="eco-icon">🌱</span> Greener choice: <strong>${flight.co2Reduction}% less CO2</strong> than average on this route
          </div>
        ` : ''}

        <div class="flight-card-main">
          <!-- Outbound Leg -->
          <div class="flight-leg">
            <div class="airline-brand">
              <div class="airline-badge" style="background-color: ${flight.airline.logoBg}">
                ${flight.airline.code}
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
                <div class="airline-badge" style="background-color: ${flight.airline.logoBg}">
                  ${flight.airline.code}
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
              <span class="badge-mini" style="background:${flight.airline.logoBg}">${flight.airline.code}</span>
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

// Trigger Flight Search
export async function triggerFlightSearch() {
  const loadingOverlay = document.getElementById('search-loading-bar');
  if (loadingOverlay) loadingOverlay.style.display = 'block';

  const state = AppState.getState();
  try {
    const results = await searchFlights(state.flightParams);
    const calendar = generatePriceCalendar(state.flightParams.departDate, state.flightParams.originCode, state.flightParams.destCode);

    AppState.setState({
      flightResults: results,
      priceCalendar: calendar
    });

    renderPriceCalendarBar(calendar);
    renderFlightResults();
    populateAirlineFilterCheckboxes(results);
  } catch (e) {
    console.error('Error during flight search:', e);
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
      <input type="checkbox" class="filter-airline-checkbox" value="${a.code}" ${flightFilters.airlines.includes(a.code) ? 'checked' : ''} />
      <span class="cb-custom"></span>
      <span class="airline-name-text">${a.name}</span>
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
              <button class="btn btn-primary btn-sm btn-book-hotel" data-hotel-name="${h.name}">View Deal ➔</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-book-hotel').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`Booking redirect simulated for ${btn.getAttribute('data-hotel-name')}! In production, this redirects to partner deal.`);
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
            <button class="btn btn-primary btn-sm btn-book-car" data-car-name="${c.name}">Select Car ➔</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-book-car').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`Car hire selection simulated for ${btn.getAttribute('data-car-name')}!`);
    });
  });
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
        triggerFlightSearch();
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
            <span class="status-badge ${config.aviationStack.apiKey ? 'connected' : 'optional'}">${config.aviationStack.apiKey ? '● Configured' : 'Optional'}</span>
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
