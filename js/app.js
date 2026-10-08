// Main Skyscanner Application Entry Point

import { AppState } from './state.js';
import { getAirportByCode, AIRPORTS_DATABASE } from './airports.js';
import { initCurrencyRates } from './currency-service.js';
import {
  setupAirportAutocomplete,
  updateTravellersSummary,
  triggerFlightSearch,
  renderHotelsView,
  renderCarsView,
  renderExploreDestinations,
  openCurrencyModal,
  openApiSettingsModal,
  closeBookingModal,
  resetAllFilters,
  updateCurrencyDisplays,
  updateSavedCountBadge,
  renderFlightResults,
  updateActiveFiltersBadge
} from './ui-handlers.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize live currency exchange rates
  await initCurrencyRates();
  updateCurrencyDisplays();
  updateSavedCountBadge();

  // 2. Initialize input default values
  initDefaultSearchInputs();

  // 3. Setup airport autocompletes
  setupAirportAutocomplete('flight-origin-input', 'flight-origin-dropdown', (airport) => {
    AppState.updateFlightParams({ originCode: airport.code });
  });

  setupAirportAutocomplete('flight-dest-input', 'flight-dest-dropdown', (airport) => {
    AppState.updateFlightParams({ destCode: airport.code });
  });

  // 4. Setup Main Navigation Tabs (Flights, Hotels, Car hire)
  setupMainNavigationTabs();

  // 5. Setup Trip Type Buttons (Return, One-way, Multi-city)
  setupTripTypeButtons();

  // 6. Setup Airport Swap Button
  setupSwapAirportsButton();

  // 7. Setup Travellers Popover
  setupTravellersPopover();

  // 8. Setup Sorting Tabs (Cheapest, Best, Fastest)
  setupSortTabs();

  // 9. Setup Filters (Stops, Price Slider, Time slots, Greener)
  setupFiltersListeners();

  // 10. Setup Modal controls (API Keys, Currency, Saved Flights)
  setupModals();

  // 11. Initial Flight Search & Explore Destinations
  await triggerFlightSearch(false);
  await renderExploreDestinations();

  // 12. Search Form Submit
  const flightSearchForm = document.getElementById('flight-search-form');
  if (flightSearchForm) {
    flightSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      triggerFlightSearch(true);
    });
  }

  // Explore Everywhere banner CTA
  document.getElementById('btn-explore-everywhere')?.addEventListener('click', () => {
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

function initDefaultSearchInputs() {
  const { flightParams } = AppState.getState();
  const originAirport = getAirportByCode(flightParams.originCode);
  const destAirport = getAirportByCode(flightParams.destCode);

  const originInput = document.getElementById('flight-origin-input');
  if (originInput && originAirport) {
    originInput.value = `${originAirport.city} (${originAirport.code})`;
  }

  const destInput = document.getElementById('flight-dest-input');
  if (destInput && destAirport) {
    destInput.value = `${destAirport.city} (${destAirport.code})`;
  }

  const depDateInput = document.getElementById('flight-depart-date');
  if (depDateInput) depDateInput.value = flightParams.departDate;

  const retDateInput = document.getElementById('flight-return-date');
  if (retDateInput) retDateInput.value = flightParams.returnDate;

  // Sync date change listeners
  depDateInput?.addEventListener('change', (e) => {
    AppState.updateFlightParams({ departDate: e.target.value });
    if (retDateInput && retDateInput.value < e.target.value) {
      retDateInput.value = e.target.value;
      AppState.updateFlightParams({ returnDate: e.target.value });
    }
  });

  retDateInput?.addEventListener('change', (e) => {
    AppState.updateFlightParams({ returnDate: e.target.value });
  });

  updateTravellersSummary();
}

function setupMainNavigationTabs() {
  const tabs = document.querySelectorAll('.sk-nav-tab');
  const sections = {
    flights: document.getElementById('flights-tab-view'),
    hotels: document.getElementById('hotels-tab-view'),
    cars: document.getElementById('cars-tab-view')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-tab');
      // Synchronize both desktop & mobile category tabs
      document.querySelectorAll('.sk-nav-tab').forEach(t => {
        if (t.getAttribute('data-tab') === target) {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });

      AppState.setState({ currentTab: target });

      // Toggle views
      Object.keys(sections).forEach(key => {
        if (sections[key]) {
          sections[key].style.display = (key === target) ? 'block' : 'none';
        }
      });

      if (target === 'hotels') {
        renderHotelsView();
      } else if (target === 'cars') {
        renderCarsView();
      }
    });
  });
}

function setupTripTypeButtons() {
  const tripBtns = document.querySelectorAll('.trip-type-btn');
  const returnDateGroup = document.getElementById('return-date-container');

  tripBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tripBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tripType = btn.getAttribute('data-trip');
      AppState.updateFlightParams({ tripType });

      if (returnDateGroup) {
        if (tripType === 'oneway') {
          returnDateGroup.style.opacity = '0.4';
          returnDateGroup.style.pointerEvents = 'none';
        } else {
          returnDateGroup.style.opacity = '1';
          returnDateGroup.style.pointerEvents = 'auto';
        }
      }
    });
  });

  // Direct flights checkbox
  const directCb = document.getElementById('filter-direct-only');
  directCb?.addEventListener('change', (e) => {
    AppState.updateFlightParams({ directOnly: e.target.checked });
  });
}

function setupSwapAirportsButton() {
  const swapBtn = document.getElementById('btn-swap-airports');
  if (!swapBtn) return;

  swapBtn.addEventListener('click', () => {
    const { originCode, destCode } = AppState.getState().flightParams;
    AppState.updateFlightParams({
      originCode: destCode,
      destCode: originCode
    });

    const origInput = document.getElementById('flight-origin-input');
    const destInput = document.getElementById('flight-dest-input');

    const tempVal = origInput.value;
    origInput.value = destInput.value;
    destInput.value = tempVal;

    // Trigger subtle rotate animation
    swapBtn.classList.add('rotating');
    setTimeout(() => swapBtn.classList.remove('rotating'), 300);

    triggerFlightSearch(true);
  });
}

function setupTravellersPopover() {
  const trigger = document.getElementById('travellers-trigger');
  const popover = document.getElementById('travellers-popover');
  const backdrop = document.getElementById('travellers-backdrop');
  const doneBtn = document.getElementById('btn-done-travellers');
  if (!trigger || !popover) return;

  function closeTravellers() {
    popover.classList.remove('active');
    backdrop?.classList.remove('active');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = popover.classList.toggle('active');
    if (isActive) {
      backdrop?.classList.add('active');
    } else {
      backdrop?.classList.remove('active');
    }
  });

  doneBtn?.addEventListener('click', closeTravellers);
  backdrop?.addEventListener('click', closeTravellers);

  document.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && !trigger.contains(e.target)) {
      closeTravellers();
    }
  });

  // Steppers for Adults
  const adultsVal = document.getElementById('adults-count');
  document.getElementById('btn-adults-minus')?.addEventListener('click', () => {
    const cur = AppState.getState().flightParams.adults;
    if (cur > 1) {
      AppState.updateFlightParams({ adults: cur - 1 });
      if (adultsVal) adultsVal.textContent = cur - 1;
      updateTravellersSummary();
    }
  });
  document.getElementById('btn-adults-plus')?.addEventListener('click', () => {
    const cur = AppState.getState().flightParams.adults;
    if (cur < 9) {
      AppState.updateFlightParams({ adults: cur + 1 });
      if (adultsVal) adultsVal.textContent = cur + 1;
      updateTravellersSummary();
    }
  });

  // Steppers for Children
  const childrenVal = document.getElementById('children-count');
  document.getElementById('btn-children-minus')?.addEventListener('click', () => {
    const cur = AppState.getState().flightParams.children;
    if (cur > 0) {
      AppState.updateFlightParams({ children: cur - 1 });
      if (childrenVal) childrenVal.textContent = cur - 1;
      updateTravellersSummary();
    }
  });
  document.getElementById('btn-children-plus')?.addEventListener('click', () => {
    const cur = AppState.getState().flightParams.children;
    if (cur < 6) {
      AppState.updateFlightParams({ children: cur + 1 });
      if (childrenVal) childrenVal.textContent = cur + 1;
      updateTravellersSummary();
    }
  });

  // Cabin Class Radio Pills
  document.querySelectorAll('.cabin-class-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cabin-class-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cabin = pill.getAttribute('data-class');
      AppState.updateFlightParams({ cabinClass: cabin });
      updateTravellersSummary();
    });
  });
}

function setupSortTabs() {
  const sortBtns = document.querySelectorAll('.sort-tab-btn');
  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sortBy = btn.getAttribute('data-sort');
      AppState.setState({ flightSortBy: sortBy });
      renderFlightResults();
    });
  });
}

function setupFiltersListeners() {
  // Stops radio
  document.querySelectorAll('input[name="filter-stops"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      AppState.updateFlightFilters({ stops: e.target.value });
      renderFlightResults();
    });
  });

  // Departure time slots
  document.querySelectorAll('.time-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const selected = Array.from(document.querySelectorAll('.time-slot-btn.active')).map(b => b.getAttribute('data-slot'));
      AppState.updateFlightFilters({ timeSlots: selected });
      renderFlightResults();
    });
  });

  // Price slider
  const slider = document.getElementById('price-range-slider');
  const display = document.getElementById('price-slider-display');
  slider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    AppState.updateFlightFilters({ maxPriceINR: val });
    if (display) display.textContent = `Up to ${val.toLocaleString('en-IN')}`;
    renderFlightResults();
  });

  // Greener toggle
  const greenCb = document.getElementById('filter-greener');
  greenCb?.addEventListener('change', (e) => {
    AppState.updateFlightFilters({ greenerOnly: e.target.checked });
    renderFlightResults();
  });

  // Clear filters button
  document.getElementById('btn-clear-filters')?.addEventListener('click', resetAllFilters);

  // Mobile Filter Drawer controls
  const mobileFilterBtn = document.getElementById('btn-mobile-filters');
  const closeFilterBtn = document.getElementById('btn-close-filters-mobile');
  const applyFilterBtn = document.getElementById('btn-apply-filters-mobile');
  const filterBackdrop = document.getElementById('filters-backdrop');
  const sidebar = document.getElementById('filters-sidebar');

  function openFilterDrawer() {
    sidebar?.classList.add('drawer-active');
    filterBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFilterDrawer() {
    sidebar?.classList.remove('drawer-active');
    filterBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileFilterBtn?.addEventListener('click', openFilterDrawer);
  closeFilterBtn?.addEventListener('click', closeFilterDrawer);
  applyFilterBtn?.addEventListener('click', closeFilterDrawer);
  filterBackdrop?.addEventListener('click', closeFilterDrawer);

  updateActiveFiltersBadge();
}

function setupModals() {
  // Currency Modal
  document.getElementById('nav-currency-btn')?.addEventListener('click', openCurrencyModal);
  document.getElementById('btn-close-currency-modal')?.addEventListener('click', () => {
    document.getElementById('currency-modal')?.classList.remove('active');
  });

  // API Settings Modal
  document.getElementById('btn-api-settings')?.addEventListener('click', openApiSettingsModal);

  // Booking Modal Close
  document.getElementById('btn-close-booking-modal')?.addEventListener('click', closeBookingModal);

  // Saved Trips Modal
  document.getElementById('btn-saved-trips')?.addEventListener('click', () => {
    const savedIds = AppState.getState().savedFlightIds;
    if (savedIds.length === 0) {
      alert('You have no saved flights yet. Click the heart icon on any flight to save it for quick reference!');
    } else {
      alert(`You have ${savedIds.length} flights saved in your trips!`);
    }
  });

  // Outside click close modals
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('sk-modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}
