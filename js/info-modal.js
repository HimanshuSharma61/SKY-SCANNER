// Skyscanner Footer Information & Help Center Modal Controller

import { AppState } from './state.js';
import { triggerFlightSearch } from './ui-handlers.js';
import { formatCurrency } from './currency-service.js';

export function openInfoModal(topic = 'help-support') {
  const modal = document.getElementById('info-modal');
  if (!modal) return;

  renderInfoModal(topic);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function renderInfoModal(topic) {
  const titleEl = document.getElementById('info-modal-title');
  const bodyEl = document.getElementById('info-modal-body');
  if (!titleEl || !bodyEl) return;

  const topicsMap = {
    'help-support': { title: 'Help & Support Centre', render: renderHelpSupport },
    'privacy-settings': { title: 'Privacy & Cookie Settings', render: renderPrivacySettings },
    'security-cookies': { title: 'Security & Cookie Policy', render: renderSecurityCookies },
    'terms-of-service': { title: 'Terms of Service', render: renderTermsOfService },
    'domestic-flights': { title: 'Domestic Flights Guide · Top Indian Routes', render: renderDomesticFlights },
    'international-flights': { title: 'International Flights Guide · Top Global Destinations', render: renderInternationalFlights },
    'cities-airports': { title: 'Cities & Airports Guide', render: renderCitiesAirports },
    'hotels-india': { title: 'Hotels in India · Curated Stays', render: renderHotelsIndia },
    'car-hire-deals': { title: 'Car Hire Deals & Rental Guide', render: renderCarHireDeals },
    'about': { title: 'About Skyscanner', render: renderAboutSkyscanner },
    'why-skyscanner': { title: 'Why Skyscanner?', render: renderWhySkyscanner },
    'media-press': { title: 'Media & Press Centre', render: renderMediaPress },
    'sustainability': { title: 'Sustainability & Greener Choices', render: renderSustainability },
    'careers': { title: 'Careers at Skyscanner', render: renderCareers }
  };

  const currentTopic = topicsMap[topic] || topicsMap['help-support'];
  titleEl.textContent = currentTopic.title;
  bodyEl.innerHTML = `
    <div class="info-modal-wrapper">
      <!-- Quick Navigation Chips Bar -->
      <div class="info-category-chips">
        <button type="button" class="info-chip ${topic === 'help-support' ? 'active' : ''}" data-topic="help-support">❓ Help & Support</button>
        <button type="button" class="info-chip ${topic === 'domestic-flights' ? 'active' : ''}" data-topic="domestic-flights">✈️ Domestic Flights</button>
        <button type="button" class="info-chip ${topic === 'international-flights' ? 'active' : ''}" data-topic="international-flights">🌍 International Flights</button>
        <button type="button" class="info-chip ${topic === 'cities-airports' ? 'active' : ''}" data-topic="cities-airports">📍 Cities & Airports</button>
        <button type="button" class="info-chip ${topic === 'hotels-india' ? 'active' : ''}" data-topic="hotels-india">🏨 Hotels</button>
        <button type="button" class="info-chip ${topic === 'car-hire-deals' ? 'active' : ''}" data-topic="car-hire-deals">🚗 Car Hire</button>
        <button type="button" class="info-chip ${topic === 'about' ? 'active' : ''}" data-topic="about">🏢 About Us</button>
        <button type="button" class="info-chip ${topic === 'why-skyscanner' ? 'active' : ''}" data-topic="why-skyscanner">⭐ Why Us</button>
        <button type="button" class="info-chip ${topic === 'privacy-settings' ? 'active' : ''}" data-topic="privacy-settings">🔒 Privacy Settings</button>
        <button type="button" class="info-chip ${topic === 'sustainability' ? 'active' : ''}" data-topic="sustainability">🌱 Sustainability</button>
        <button type="button" class="info-chip ${topic === 'careers' ? 'active' : ''}" data-topic="careers">💼 Careers</button>
      </div>

      <div class="info-content-area" id="info-content-area">
        ${currentTopic.render()}
      </div>
    </div>
  `;

  // Bind category chips
  bodyEl.querySelectorAll('.info-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetTopic = chip.getAttribute('data-topic');
      renderInfoModal(targetTopic);
    });
  });

  // Attach interactive listeners for the active topic
  attachTopicListeners(topic, bodyEl);
}

// ========================================================
// 1. HELP & SUPPORT CENTRE
// ========================================================
function renderHelpSupport() {
  return `
    <div class="help-center-hero">
      <div class="help-hero-icon">🎧</div>
      <div>
        <h3>How can we help you today?</h3>
        <p>Find quick answers to common questions about bookings, cancellations, baggage, and contacting airlines.</p>
      </div>
    </div>

    <!-- Search Help Articles -->
    <div class="help-search-box">
      <span class="help-search-icon">🔍</span>
      <input type="text" class="help-search-input" id="help-search-input" placeholder="Search help topics (e.g. refund, baggage, cancel, receipt)..." />
    </div>

    <!-- Quick Help Stats / Emergency Contacts -->
    <div class="help-quick-cards-grid">
      <div class="help-quick-card">
        <span class="hqc-icon">🔄</span>
        <div class="hqc-info">
          <h4>Changes &amp; Cancellations</h4>
          <p>Booked via an airline or travel agent? Manage your itinerary directly.</p>
        </div>
      </div>
      <div class="help-quick-card">
        <span class="hqc-icon">🧾</span>
        <div class="hqc-info">
          <h4>Booking Confirmation</h4>
          <p>Check how to retrieve your e-ticket or resend confirmation emails.</p>
        </div>
      </div>
      <div class="help-quick-card">
        <span class="hqc-icon">🧳</span>
        <div class="hqc-info">
          <h4>Baggage &amp; Check-in</h4>
          <p>Airline luggage rules, carry-on dimensions, and web check-in windows.</p>
        </div>
      </div>
    </div>

    <!-- FAQ Accordion -->
    <h4 class="info-section-title">Frequently Asked Questions</h4>
    <div class="faq-accordion-list" id="faq-accordion-list">
      <div class="faq-item" data-keywords="cancel cancellation change reschedule flight booking refund">
        <button type="button" class="faq-question-btn">
          <span>How do I cancel or change my flight booking?</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-content">
          <p>Because Skyscanner is a travel search engine, <strong>your booking is made directly with the airline or travel agent</strong> (such as IndiGo, Air India, MakeMyTrip, or Booking.com). To modify or cancel your trip:</p>
          <ol>
            <li>Find your booking confirmation email which contains your booking reference (PNR).</li>
            <li>Identify the travel provider listed on your confirmation.</li>
            <li>Visit the provider's website directly or contact their customer care team to process your change or refund.</li>
          </ol>
        </div>
      </div>

      <div class="faq-item" data-keywords="refund money back timeline return delay cancelled">
        <button type="button" class="faq-question-btn">
          <span>How do refunds work and when will I receive my money?</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-content">
          <p>Refunds are processed directly by the airline or travel agent you paid. As per standard airline protocols and DGCA / international guidelines:</p>
          <ul>
            <li><strong>Airlines directly:</strong> Typical processing time is 5 to 10 business days back to your original payment method.</li>
            <li><strong>Online Travel Agents (OTAs):</strong> Usually 7 to 14 business days.</li>
            <li>If an airline cancels your flight, you are legally entitled to a 100% full refund or a complimentary rescheduled flight.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" data-keywords="confirmation email missing ticket receipt pnr not received">
        <button type="button" class="faq-question-btn">
          <span>Where is my booking confirmation email?</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-content">
          <p>Booking confirmation emails are dispatched automatically within 15 minutes of purchase. If you haven't received yours:</p>
          <ul>
            <li>Check your Spam, Junk, and Promotions folders.</li>
            <li>Search your email inbox for keywords: "flight", "itinerary", "booking", or the name of the airline.</li>
            <li>Verify whether your bank account or card was charged. The transaction statement will display the exact merchant name (e.g. "IndiGo Air" or "MMT").</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" data-keywords="baggage cabin check-in luggage weight allowance kilo">
        <button type="button" class="faq-question-btn">
          <span>What is the standard baggage allowance for domestic and international flights?</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-content">
          <p>Baggage rules vary by airline and ticket class:</p>
          <ul>
            <li><strong>Indian Domestic Flights (Economy):</strong> Usually 15 kg check-in baggage + 7 kg cabin handbag per passenger (Air India often permits 25 kg).</li>
            <li><strong>International Flights:</strong> Typically 1 to 2 pieces of 23 kg to 30 kg total check-in allowance + 7 kg cabin luggage.</li>
            <li>Always review your e-ticket under "Baggage Allowance" before arriving at the airport.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" data-keywords="price changed increase fare difference booking">
        <button type="button" class="faq-question-btn">
          <span>Why did the flight price change when I clicked to book?</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-content">
          <p>Airlines operate dynamic pricing systems that update seat inventory in real time. Flight prices can change if:</p>
          <ul>
            <li>The last seat in a cheaper fare bucket was booked by another traveler simultaneously.</li>
            <li>The airline refreshed their seat availability or fare bucket.</li>
            <li>We display prices including all mandatory taxes and carrier fees so there are no surprise fees at checkout.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Contact Support Ticket Form -->
    <div class="help-ticket-box">
      <div class="ticket-box-header">
        <span style="font-size:1.4rem;">💬</span>
        <div>
          <h4>Can't find what you need? Send a Support Message</h4>
          <p>Our dedicated travel support specialists are available 24/7. Average response time: 2 hours.</p>
        </div>
      </div>

      <form id="support-ticket-form" class="support-ticket-form">
        <div class="form-row two-col">
          <div class="form-group">
            <label>Your Full Name *</label>
            <input type="text" class="sk-input" id="st-name" required placeholder="e.g. Himanshu Sharma" value="Himanshu Sharma" />
          </div>
          <div class="form-group">
            <label>Email Address *</label>
            <input type="email" class="sk-input" id="st-email" required placeholder="name@example.com" value="himanshu@example.com" />
          </div>
        </div>

        <div class="form-row two-col">
          <div class="form-group">
            <label>Booking Reference / PNR (Optional)</label>
            <input type="text" class="sk-input" id="st-ref" placeholder="e.g. SKY-948123 or Airline PNR" />
          </div>
          <div class="form-group">
            <label>Inquiry Topic *</label>
            <select class="sk-select" id="st-topic">
              <option value="flight-inquiry" selected>Flight Booking Assistance</option>
              <option value="hotel-booking">Hotel Stay Inquiry</option>
              <option value="car-hire">Car Hire Support</option>
              <option value="refund-status">Refund or Cancellation Status</option>
              <option value="technical">Website or App Technical Issue</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:14px;">
          <label>Describe your question or issue *</label>
          <textarea class="sk-input" id="st-message" rows="3" required placeholder="Please provide details about your inquiry, travel dates, or specific flight..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-submit-ticket" style="align-self:flex-start;">
          Submit Support Ticket ➔
        </button>
      </form>

      <div id="support-ticket-success" class="support-success-alert" style="display:none;">
        <span class="success-icon">✓</span>
        <div>
          <strong>Support Ticket #TKT-849201 Created Successfully!</strong>
          <p>We have sent a confirmation to your email. Our concierge support team will assist you shortly.</p>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 2. PRIVACY SETTINGS
// ========================================================
function renderPrivacySettings() {
  const prefs = JSON.parse(localStorage.getItem('sk_privacy_prefs') || '{"necessary":true,"analytics":true,"advertising":false,"functional":true}');

  return `
    <div class="privacy-intro-card">
      <div class="privacy-intro-icon">🛡️</div>
      <div>
        <h3>Your Privacy &amp; Data Choices</h3>
        <p>At Skyscanner, we believe your personal travel data belongs to you. We never sell your personal information or use cookies to artificially increase flight fares.</p>
      </div>
    </div>

    <div class="privacy-switches-list">
      <div class="privacy-switch-card">
        <div class="switch-meta">
          <div class="switch-title-row">
            <h4>Strictly Necessary Cookies</h4>
            <span class="badge badge-eco">Always Active</span>
          </div>
          <p>Essential for the Skyscanner website to function, maintain your secure sessions, remember your selected currency, and execute flight searches.</p>
        </div>
        <div class="switch-control">
          <input type="checkbox" id="pref-necessary" checked disabled class="toggle-checkbox" />
          <label for="pref-necessary" class="toggle-slider"></label>
        </div>
      </div>

      <div class="privacy-switch-card">
        <div class="switch-meta">
          <div class="switch-title-row">
            <h4>Performance &amp; Analytics Cookies</h4>
          </div>
          <p>Help us understand how travelers interact with flight searches, diagnose page speed issues, and continuously improve our website performance.</p>
        </div>
        <div class="switch-control">
          <input type="checkbox" id="pref-analytics" ${prefs.analytics ? 'checked' : ''} class="toggle-checkbox" />
          <label for="pref-analytics" class="toggle-slider"></label>
        </div>
      </div>

      <div class="privacy-switch-card">
        <div class="switch-meta">
          <div class="switch-title-row">
            <h4>Functional &amp; Experience Cookies</h4>
          </div>
          <p>Remembers your recent origin and destination searches, saved trips wishlist, and travel preferences so you don't have to retype them.</p>
        </div>
        <div class="switch-control">
          <input type="checkbox" id="pref-functional" ${prefs.functional ? 'checked' : ''} class="toggle-checkbox" />
          <label for="pref-functional" class="toggle-slider"></label>
        </div>
      </div>

      <div class="privacy-switch-card">
        <div class="switch-meta">
          <div class="switch-title-row">
            <h4>Personalised Offers &amp; Advertising</h4>
          </div>
          <p>Allows our trusted airline and hotel partners to present relevant discounts tailored to your preferred travel destinations.</p>
        </div>
        <div class="switch-control">
          <input type="checkbox" id="pref-advertising" ${prefs.advertising ? 'checked' : ''} class="toggle-checkbox" />
          <label for="pref-advertising" class="toggle-slider"></label>
        </div>
      </div>
    </div>

    <div class="privacy-actions-bar">
      <button type="button" class="btn btn-secondary" id="btn-reject-cookies">Reject Non-Essential</button>
      <button type="button" class="btn btn-secondary" id="btn-accept-all-cookies">Accept All</button>
      <button type="button" class="btn btn-primary" id="btn-save-cookie-prefs">Save Preferences ➔</button>
    </div>

    <div id="privacy-saved-notice" class="toast-notice" style="display:none;">
      ✓ Your privacy preferences have been saved and applied!
    </div>
  `;
}

// ========================================================
// 3. SECURITY & COOKIES
// ========================================================
function renderSecurityCookies() {
  return `
    <div class="info-hero-banner">
      <h3>Security &amp; Cookie Architecture</h3>
      <p>How Skyscanner protects your data, verifies airline integrity, and operates transparently.</p>
    </div>

    <div class="security-badges-row">
      <div class="sec-badge-card">
        <span class="sbc-icon">🔒</span>
        <h4>256-Bit TLS Encryption</h4>
        <p>All flight search traffic and regional data transmissions are secured with modern TLS 1.3 cryptographic protocols.</p>
      </div>
      <div class="sec-badge-card">
        <span class="sbc-icon">🛡️</span>
        <h4>Zero Price Inflation</h4>
        <p>We never track your searches with cookies to artificially inflate flight prices when you revisit a route.</p>
      </div>
      <div class="sec-badge-card">
        <span class="sbc-icon">💳</span>
        <h4>PCI-DSS Level 1 Safe</h4>
        <p>When booking, you interact directly with verified airline portals complying with maximum bank-grade card standards.</p>
      </div>
    </div>

    <h4 class="info-section-title">Cookie Registry &amp; Purpose Table</h4>
    <div class="info-table-container">
      <table class="info-table">
        <thead>
          <tr>
            <th>Cookie Identifier</th>
            <th>Type</th>
            <th>Lifespan</th>
            <th>Operational Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sk_session_id</code></td>
            <td>Strictly Necessary</td>
            <td>Browser Session</td>
            <td>Maintains search parameters and active flight results caching.</td>
          </tr>
          <tr>
            <td><code>sk_currency</code></td>
            <td>Functional</td>
            <td>365 Days</td>
            <td>Stores your selected currency preference (INR, USD, EUR, etc.).</td>
          </tr>
          <tr>
            <td><code>sk_saved_trips</code></td>
            <td>Functional</td>
            <td>180 Days</td>
            <td>Preserves flights added to your favourites wishlist.</td>
          </tr>
          <tr>
            <td><code>_sk_perf_metric</code></td>
            <td>Performance</td>
            <td>30 Days</td>
            <td>Anonymous latency tracking to ensure search sub-second response times.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// ========================================================
// 4. TERMS OF SERVICE
// ========================================================
function renderTermsOfService() {
  return `
    <div class="info-hero-banner">
      <h3>Skyscanner Terms of Service</h3>
      <p>Last updated: October 2026 · Effective for all worldwide travelers.</p>
    </div>

    <div class="terms-content-box">
      <div class="terms-section">
        <h4>1. Our Role as a Metasearch Provider</h4>
        <p>Skyscanner operates an independent price comparison and search aggregation platform. We index and compare travel deals from over 1,200 airlines, online travel agencies, hotel properties, and car rental companies. When you choose an offer, your transaction and contract are executed directly with that respective travel provider.</p>
      </div>

      <div class="terms-section">
        <h4>2. Accuracy of Prices &amp; Fare Availability</h4>
        <p>We continually refresh and verify flight fares using real-time API integrations and price feeds. Because airline seat inventory fluctuates based on global booking volume, final confirmation occurs upon checkout on the partner platform. Skyscanner guarantees that displayed prices incorporate all mandatory taxes and carrier surcharges.</p>
      </div>

      <div class="terms-section">
        <h4>3. Intellectual Property &amp; Acceptable Use</h4>
        <p>All design assets, proprietary flight sorting algorithms, and codebases are owned by Skyscanner Ltd. The platform is designed strictly for personal, non-commercial travel planning. Automated scraping, data harvesting, or reverse engineering of Skyscanner search endpoints is strictly prohibited.</p>
      </div>

      <div class="terms-section">
        <h4>4. Changes, Cancellations, and Refunds</h4>
        <p>Terms of carriage, baggage allowances, cancellation fees, and refunds are determined by the airline or travel agency with whom your booking was concluded. Skyscanner provides customer support guidance to facilitate direct liaison with your chosen provider.</p>
      </div>

      <div class="terms-section">
        <h4>5. Governing Law</h4>
        <p>These Terms are governed by and construed in accordance with the laws of the United Kingdom, without prejudice to mandatory consumer protection laws applicable in your country of residence.</p>
      </div>
    </div>
  `;
}

// ========================================================
// 5. DOMESTIC FLIGHTS GUIDE
// ========================================================
function renderDomesticFlights() {
  const routes = [
    { from: 'New Delhi (DEL)', to: 'Mumbai (BOM)', originCode: 'DEL', destCode: 'BOM', price: 3850, time: '2h 10m', flights: '65+ daily', badge: 'Most Popular' },
    { from: 'Bengaluru (BLR)', to: 'Goa (GOI)', originCode: 'BLR', destCode: 'GOI', price: 2499, time: '1h 15m', flights: '28+ daily', badge: 'Weekend Getaway' },
    { from: 'New Delhi (DEL)', to: 'Bengaluru (BLR)', originCode: 'DEL', destCode: 'BLR', price: 4650, time: '2h 45m', flights: '45+ daily', badge: 'Business Route' },
    { from: 'Mumbai (BOM)', to: 'Goa (GOI)', originCode: 'BOM', destCode: 'GOI', price: 2199, time: '1h 10m', flights: '22+ daily', badge: 'Best Deal' },
    { from: 'Kolkata (CCU)', to: 'New Delhi (DEL)', originCode: 'CCU', destCode: 'DEL', price: 4100, time: '2h 20m', flights: '35+ daily', badge: 'High Frequency' },
    { from: 'Hyderabad (HYD)', to: 'Mumbai (BOM)', originCode: 'HYD', destCode: 'BOM', price: 3200, time: '1h 30m', flights: '30+ daily', badge: 'Express Corridor' }
  ];

  const currency = AppState.getState().currency;

  return `
    <div class="info-hero-banner">
      <h3>Domestic Flights in India</h3>
      <p>Instant online comparisons across IndiGo, Air India, Vistara, Akasa Air, and SpiceJet. Click any route to search live fares immediately.</p>
    </div>

    <div class="routes-cards-grid">
      ${routes.map(r => `
        <div class="route-card-item">
          <div class="rc-header">
            <span class="badge badge-deal">${r.badge}</span>
            <span class="rc-freq">${r.flights}</span>
          </div>
          <div class="rc-path">
            <strong>${r.from}</strong>
            <span class="rc-arrow">➔</span>
            <strong>${r.to}</strong>
          </div>
          <div class="rc-meta-row">
            <span>⏱️ Non-stop · ${r.time}</span>
            <div class="rc-price">
              <span class="rc-from">from</span>
              <span class="rc-val">${formatCurrency(r.price, currency)}</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm btn-search-route" data-origin="${r.originCode}" data-dest="${r.destCode}">
            Search This Route ➔
          </button>
        </div>
      `).join('')}
    </div>

    <div class="domestic-tips-card">
      <h4>💡 Indian Domestic Travel Quick Tips</h4>
      <ul>
        <li><strong>DigiYatra:</strong> Enable biometric facial boarding at DEL, BOM, BLR, and CCU for fast-track 2-minute entry through security.</li>
        <li><strong>Free Web Check-in:</strong> Web check-in opens 48 hours prior to domestic departures.</li>
        <li><strong>Standard Baggage:</strong> 15 kg check-in luggage + 7 kg cabin bag included on most domestic airlines.</li>
      </ul>
    </div>
  `;
}

// ========================================================
// 6. INTERNATIONAL FLIGHTS GUIDE
// ========================================================
function renderInternationalFlights() {
  const routes = [
    { from: 'New Delhi (DEL)', to: 'Dubai (DXB)', originCode: 'DEL', destCode: 'DXB', price: 14299, time: '3h 40m', airlines: 'Emirates, IndiGo, Air India', badge: 'Middle East Hub' },
    { from: 'Mumbai (BOM)', to: 'London Heathrow (LHR)', originCode: 'BOM', destCode: 'LHR', price: 38999, time: '9h 30m', airlines: 'Virgin Atlantic, British Airways, Air India', badge: 'Europe Gateway' },
    { from: 'New Delhi (DEL)', to: 'Bangkok (BKK)', originCode: 'DEL', destCode: 'BKK', price: 11899, time: '4h 15m', airlines: 'Thai Airways, IndiGo, Air India', badge: 'Visa-Free Travel' },
    { from: 'Bengaluru (BLR)', to: 'Singapore (SIN)', originCode: 'BLR', destCode: 'SIN', price: 16499, time: '4h 30m', airlines: 'Singapore Airlines, IndiGo', badge: 'SE Asia Gateway' },
    { from: 'Mumbai (BOM)', to: 'Paris (CDG)', originCode: 'BOM', destCode: 'CDG', price: 41200, time: '9h 45m', airlines: 'Air France, Air India', badge: 'European Culture' },
    { from: 'New Delhi (DEL)', to: 'Tokyo Haneda (HND)', originCode: 'DEL', destCode: 'HND', price: 45500, time: '7h 50m', airlines: 'All Nippon Airways, Japan Airlines', badge: 'Far East' }
  ];

  const currency = AppState.getState().currency;

  return `
    <div class="info-hero-banner">
      <h3>International Flights from India</h3>
      <p>Compare nonstop and one-stop flights across 1,200+ global airlines. Click any route to compare live international fares.</p>
    </div>

    <div class="routes-cards-grid">
      ${routes.map(r => `
        <div class="route-card-item">
          <div class="rc-header">
            <span class="badge badge-eco">${r.badge}</span>
            <span class="rc-freq">${r.time}</span>
          </div>
          <div class="rc-path">
            <strong>${r.from}</strong>
            <span class="rc-arrow">➔</span>
            <strong>${r.to}</strong>
          </div>
          <div class="rc-airlines-text">${r.airlines}</div>
          <div class="rc-meta-row">
            <span>Direct / 1-Stop</span>
            <div class="rc-price">
              <span class="rc-from">from</span>
              <span class="rc-val">${formatCurrency(r.price, currency)}</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm btn-search-route" data-origin="${r.originCode}" data-dest="${r.destCode}">
            Search This Route ➔
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ========================================================
// 7. CITIES & AIRPORTS DIRECTORY
// ========================================================
function renderCitiesAirports() {
  const airports = [
    { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India', metro: 'Airport Express Metro Line (20 mins to New Delhi Railway Station)', terminals: 'T1, T2, T3 (International)' },
    { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', country: 'India', metro: 'Metro Line 3 + Western Express Highway', terminals: 'T1 (Domestic), T2 (Integrated)' },
    { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India', metro: 'Vayu Vajra AC Airport Express Bus fleet', terminals: 'T1 & T2 (Garden Terminal)' },
    { code: 'GOI', city: 'Goa', name: 'Goa Dabolim & Mopa International', country: 'India', metro: 'Direct coastal highway & express shuttle taxis', terminals: 'Domestic & International' },
    { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE', metro: 'Dubai Metro Red Line directly from Terminal 1 & 3', terminals: 'T1, T2, T3 (Emirates Hub)' },
    { code: 'LHR', city: 'London', name: 'London Heathrow Airport', country: 'United Kingdom', metro: 'Elizabeth Line & Heathrow Express to Central London', terminals: 'T2, T3, T4, T5' },
    { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', metro: 'East West MRT Line + Jewel Changi Rainforest', terminals: 'T1, T2, T3, T4' }
  ];

  return `
    <div class="info-hero-banner">
      <h3>Global Airport Guide &amp; Transit Hubs</h3>
      <p>Key transit information, terminal navigation, and public transit links for world-class airports.</p>
    </div>

    <div class="airports-grid-list">
      ${airports.map(a => `
        <div class="airport-info-card">
          <div class="aic-header">
            <span class="airport-code-badge">${a.code}</span>
            <div>
              <h4>${a.city}, ${a.country}</h4>
              <span class="aic-name">${a.name}</span>
            </div>
          </div>
          <div class="aic-details">
            <p><strong>🏢 Terminals:</strong> ${a.terminals}</p>
            <p><strong>🚆 City Transit:</strong> ${a.metro}</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm btn-fly-from-airport" data-code="${a.code}" data-city="${a.city}">
            Set as Origin Airport ➔
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ========================================================
// 8. HOTELS IN INDIA
// ========================================================
function renderHotelsIndia() {
  return `
    <div class="info-hero-banner">
      <h3>Hotels in India · Curated Destinations</h3>
      <p>Find extraordinary resorts, heritage palaces, and boutique city stays with transparent rates and free cancellation.</p>
    </div>

    <div class="hotel-dest-showcase">
      <div class="hotel-dest-card">
        <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80" alt="Goa Beaches" class="hdc-img" />
        <div class="hdc-body">
          <h4>Goa Beachfront Resorts</h4>
          <p>Luxury beach villas in South Goa & lively boutique stays in Vagator & Anjuna.</p>
          <span class="hdc-price">From ₹3,499 / night · Free cancellation</span>
          <button type="button" class="btn btn-primary btn-sm btn-go-to-hotels" data-dest="Goa">View Goa Hotels ➔</button>
        </div>
      </div>

      <div class="hotel-dest-card">
        <img src="https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80" alt="Jaipur Palace" class="hdc-img" />
        <div class="hdc-body">
          <h4>Rajasthan Royal Heritage</h4>
          <p>Opulent havelis and historic palaces in Jaipur, Udaipur, and Jodhpur.</p>
          <span class="hdc-price">From ₹4,200 / night · Breakfast included</span>
          <button type="button" class="btn btn-primary btn-sm btn-go-to-hotels" data-dest="Jaipur">View Jaipur Stays ➔</button>
        </div>
      </div>

      <div class="hotel-dest-card">
        <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80" alt="Kerala Backwaters" class="hdc-img" />
        <div class="hdc-body">
          <h4>Kerala Ayurvedic Retreats</h4>
          <p>Serene backwater houseboats in Alleppey & tea estate resorts in Munnar.</p>
          <span class="hdc-price">From ₹3,800 / night · Eco-certified</span>
          <button type="button" class="btn btn-primary btn-sm btn-go-to-hotels" data-dest="Kerala">View Kerala Stays ➔</button>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 9. CAR HIRE DEALS
// ========================================================
function renderCarHireDeals() {
  return `
    <div class="info-hero-banner">
      <h3>Car Hire &amp; Self-Drive Rentals</h3>
      <p>Compare leading rental companies including Avis, Hertz, Europcar, and Zoomcar with zero hidden charges.</p>
    </div>

    <div class="car-classes-grid">
      <div class="car-class-card">
        <span class="ccc-icon">🚗</span>
        <h4>Hatchback / Economy</h4>
        <p>Swift, Hyundai i20, Tiago. Perfect for city hopping, nimble parking, and high fuel economy.</p>
        <span class="ccc-price">From ₹1,499 / day</span>
      </div>
      <div class="car-class-card">
        <span class="ccc-icon">🚙</span>
        <h4>Compact SUV</h4>
        <p>Brezza, Hyundai Venue, Nexon. Extra ground clearance, spacious boot, and comfort for hill drives.</p>
        <span class="ccc-price">From ₹2,299 / day</span>
      </div>
      <div class="car-class-card">
        <span class="ccc-icon">🚐</span>
        <h4>Full-Size &amp; MPV</h4>
        <p>Innova Crysta, Mahindra XUV700. Maximum passenger room for groups and families.</p>
        <span class="ccc-price">From ₹3,499 / day</span>
      </div>
    </div>

    <div class="domestic-tips-card" style="margin-top:20px;">
      <h4>📋 Rental Requirements Checklist</h4>
      <ul>
        <li><strong>Driving License:</strong> Valid original driving license held for at least 1 year.</li>
        <li><strong>Security Deposit:</strong> Refundable pre-authorization deposit via credit or debit card at counter.</li>
        <li><strong>Fuel Policy:</strong> All Skyscanner partners guarantee a transparent <em>Full-to-Full</em> fuel policy.</li>
      </ul>
      <button type="button" class="btn btn-primary" id="btn-go-to-cars" style="margin-top:12px;">
        Browse All Car Hire Deals ➔
      </button>
    </div>
  `;
}

// ========================================================
// 10. ABOUT SKYSCANNER
// ========================================================
function renderAboutSkyscanner() {
  return `
    <div class="info-hero-banner">
      <h3>About Skyscanner</h3>
      <p>We started in 2003 with one simple mission: make flight search transparent, honest, and effortless for every traveler.</p>
    </div>

    <div class="stats-counter-grid">
      <div class="stat-counter-box">
        <span class="scb-num">100M+</span>
        <span class="scb-label">Monthly Active Travelers</span>
      </div>
      <div class="stat-counter-box">
        <span class="scb-num">1,200+</span>
        <span class="scb-label">Airlines &amp; Partners</span>
      </div>
      <div class="stat-counter-box">
        <span class="scb-num">80B+</span>
        <span class="scb-label">Price Feeds Processed Daily</span>
      </div>
      <div class="stat-counter-box">
        <span class="scb-num">30+</span>
        <span class="scb-label">Languages Supported</span>
      </div>
    </div>

    <div class="about-story-text">
      <h4>Our Journey</h4>
      <p>Skyscanner was founded in Edinburgh by three tech professionals who were tired of visiting dozens of airline websites just to find a cheap flight for a ski trip. Today, Skyscanner is the world's most trusted travel search engine, helping travelers find flights, hotels, and car rentals with 100% price transparency.</p>
      <p>With global offices in Edinburgh, London, Barcelona, Singapore, Miami, Tokyo, and Shenzhen, we are a passionate international team dedicated to putting travelers first.</p>
    </div>
  `;
}

// ========================================================
// 11. WHY SKYSCANNER?
// ========================================================
function renderWhySkyscanner() {
  return `
    <div class="info-hero-banner">
      <h3>Why Millions of Travelers Choose Us</h3>
      <p>Discover the values and technical advantages that make Skyscanner the world's favourite travel companion.</p>
    </div>

    <div class="why-us-grid">
      <div class="why-card">
        <span class="why-icon">⚖️</span>
        <h4>100% Unbiased Rankings</h4>
        <p>Airlines cannot pay to be listed higher in our results. Our algorithm sorts purely by price, duration, and traveler ratings.</p>
      </div>
      <div class="why-card">
        <span class="why-icon">🚫</span>
        <h4>Zero Hidden Fees</h4>
        <p>We mandate that all airline taxes, airport fees, and mandatory carrier surcharges are included right in the search price.</p>
      </div>
      <div class="why-card">
        <span class="why-icon">🔔</span>
        <h4>Smart Price Alerts</h4>
        <p>Monitor your favorite route without checking every day. We ping you the instant a fare drops so you can book at the right time.</p>
      </div>
      <div class="why-card">
        <span class="why-icon">🌱</span>
        <h4>Greener Choices CO2 Filter</h4>
        <p>We highlight flights that emit less CO2 than average on the route, helping you reduce your environmental footprint.</p>
      </div>
    </div>
  `;
}

// ========================================================
// 12. MEDIA & PRESS
// ========================================================
function renderMediaPress() {
  return `
    <div class="info-hero-banner">
      <h3>Media &amp; Press Centre</h3>
      <p>Journalist inquiries, global travel reports, press releases, and brand guidelines.</p>
    </div>

    <div class="press-releases-list">
      <div class="press-item">
        <span class="press-date">October 2026</span>
        <h4>Skyscanner Unveils Horizons: Global Travel Trend Forecast 2027</h4>
        <p>New travel data reveals significant surge in off-peak destination discovery and eco-friendly multi-modal itineraries.</p>
      </div>
      <div class="press-item">
        <span class="press-date">August 2026</span>
        <h4>Skyscanner Expands Free Open Travel APIs to 10,000+ Developers</h4>
        <p>Announcing instant live flight search feeds and open exchange rate connectivity for students and innovators worldwide.</p>
      </div>
    </div>

    <div class="domestic-tips-card" style="margin-top:20px;">
      <h4>📰 Media Contact</h4>
      <p>For press inquiries, expert travel spokespeople commentary, or customized travel data requests:</p>
      <p style="margin-top:6px;"><strong>Email:</strong> <a href="mailto:press@skyscanner.net" style="color:var(--sk-blue-primary);">press@skyscanner.net</a></p>
      <p><strong>Response Time:</strong> Urgent press queries answered within 4 hours.</p>
    </div>
  `;
}

// ========================================================
// 13. SUSTAINABILITY
// ========================================================
function renderSustainability() {
  return `
    <div class="info-hero-banner">
      <h3>Sustainability &amp; Greener Choices</h3>
      <p>How we are driving the aviation industry toward lower emissions and climate transparency.</p>
    </div>

    <div class="sustainability-pillars-grid">
      <div class="pillar-card">
        <span class="pc-icon">🌱</span>
        <h4>The Greener Choice Badge</h4>
        <p>Calculated using the Travalyst aviation framework, factoring in aircraft engine efficiency, seating configuration, and passenger load factors.</p>
      </div>
      <div class="pillar-card">
        <span class="pc-icon">✈️</span>
        <h4>Sustainable Aviation Fuel (SAF)</h4>
        <p>We actively partner with airlines investing in certified SAF, which reduces lifecycle emissions by up to 80% compared to fossil jet fuel.</p>
      </div>
      <div class="pillar-card">
        <span class="pc-icon">🌍</span>
        <h4>Travalyst Coalition</h4>
        <p>Founding member alongside Prince Harry, Duke of Sussex, Booking.com, Trip.com, and Visa to standardize sustainability metrics.</p>
      </div>
    </div>
  `;
}

// ========================================================
// 14. CAREERS
// ========================================================
function renderCareers() {
  return `
    <div class="info-hero-banner">
      <h3>Careers at Skyscanner</h3>
      <p>Join a diverse, global team transforming the way the world travels.</p>
    </div>

    <div class="careers-benefits-grid">
      <div class="cb-card">
        <h4>🌍 Work From Anywhere</h4>
        <p>Flexible hybrid work culture with 30 days per year international remote working option.</p>
      </div>
      <div class="cb-card">
        <h4>✈️ Travel Allowances</h4>
        <p>Annual travel stipends and exclusive partner discounts so you can explore the world.</p>
      </div>
      <div class="cb-card">
        <h4>📚 Continuous Learning</h4>
        <p>Generous personal growth budget, conference tickets, and mentorship programs.</p>
      </div>
    </div>

    <h4 class="info-section-title" style="margin-top:20px;">Open Departments</h4>
    <div class="open-depts-list">
      <div class="dept-row">
        <div>
          <strong>Software Engineering &amp; Platform Architecture</strong>
          <span style="font-size:0.8rem; color:var(--sk-text-secondary); display:block;">Frontend (React/Vanilla JS), Distributed Systems, Cloud Infrastructure</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="alert('Thank you for your interest! Please submit your portfolio or resume to careers@skyscanner.net')">Apply ➔</button>
      </div>
      <div class="dept-row">
        <div>
          <strong>Product Design &amp; User Experience Research</strong>
          <span style="font-size:0.8rem; color:var(--sk-text-secondary); display:block;">Design Systems, Accessibility, Interaction Design</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="alert('Thank you for your interest! Please submit your portfolio or resume to careers@skyscanner.net')">Apply ➔</button>
      </div>
      <div class="dept-row">
        <div>
          <strong>Data Science, Machine Learning &amp; AI</strong>
          <span style="font-size:0.8rem; color:var(--sk-text-secondary); display:block;">Fare Prediction Models, Ranking Algorithms, Anomaly Detection</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="alert('Thank you for your interest! Please submit your portfolio or resume to careers@skyscanner.net')">Apply ➔</button>
      </div>
    </div>
  `;
}

// ========================================================
// ATTACH TOPIC LISTENERS
// ========================================================
function attachTopicListeners(topic, container) {
  // 1. FAQ Accordions
  container.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });

  // 2. FAQ Search Filter
  const helpSearch = container.querySelector('#help-search-input');
  if (helpSearch) {
    helpSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      container.querySelectorAll('.faq-item').forEach(item => {
        const text = (item.textContent + ' ' + (item.getAttribute('data-keywords') || '')).toLowerCase();
        if (text.includes(q)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // 3. Support Ticket Submit
  const ticketForm = container.querySelector('#support-ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successBox = container.querySelector('#support-ticket-success');
      if (successBox) {
        ticketForm.style.display = 'none';
        successBox.style.display = 'flex';
      }
    });
  }

  // 4. Privacy Settings Toggles
  const btnSavePrefs = container.querySelector('#btn-save-cookie-prefs');
  if (btnSavePrefs) {
    btnSavePrefs.addEventListener('click', () => {
      const analytics = container.querySelector('#pref-analytics')?.checked ?? true;
      const functional = container.querySelector('#pref-functional')?.checked ?? true;
      const advertising = container.querySelector('#pref-advertising')?.checked ?? false;

      localStorage.setItem('sk_privacy_prefs', JSON.stringify({
        necessary: true,
        analytics,
        functional,
        advertising
      }));

      const notice = container.querySelector('#privacy-saved-notice');
      if (notice) {
        notice.style.display = 'block';
        setTimeout(() => { notice.style.display = 'none'; }, 3000);
      }
    });
  }

  const btnAcceptAll = container.querySelector('#btn-accept-all-cookies');
  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
      ['#pref-analytics', '#pref-functional', '#pref-advertising'].forEach(sel => {
        const el = container.querySelector(sel);
        if (el) el.checked = true;
      });
      btnSavePrefs?.click();
    });
  }

  const btnReject = container.querySelector('#btn-reject-cookies');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      ['#pref-analytics', '#pref-functional', '#pref-advertising'].forEach(sel => {
        const el = container.querySelector(sel);
        if (el) el.checked = false;
      });
      btnSavePrefs?.click();
    });
  }

  // 5. Search Route Buttons (Domestic & International)
  container.querySelectorAll('.btn-search-route').forEach(btn => {
    btn.addEventListener('click', () => {
      const origin = btn.getAttribute('data-origin');
      const dest = btn.getAttribute('data-dest');

      if (origin && dest) {
        AppState.updateFlightParams({ originCode: origin, destCode: dest });

        const originInput = document.getElementById('flight-origin-input');
        const destInput = document.getElementById('flight-dest-input');
        if (originInput) originInput.value = origin;
        if (destInput) destInput.value = dest;

        // Switch to flights view if on hotels/cars
        document.querySelector('.sk-nav-tab[data-tab="flights"]')?.click();

        closeInfoModal();
        triggerFlightSearch(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    });
  });

  // 6. Set Origin Airport
  container.querySelectorAll('.btn-fly-from-airport').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const city = btn.getAttribute('data-city');
      AppState.updateFlightParams({ originCode: code });

      const originInput = document.getElementById('flight-origin-input');
      if (originInput) originInput.value = `${city} (${code})`;

      closeInfoModal();
      document.querySelector('.sk-nav-tab[data-tab="flights"]')?.click();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
  });

  // 7. Go to Hotels view
  container.querySelectorAll('.btn-go-to-hotels').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.getAttribute('data-dest');
      if (dest) {
        AppState.updateHotelParams({ destination: dest });
      }
      closeInfoModal();
      document.querySelector('.sk-nav-tab[data-tab="hotels"]')?.click();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
  });

  // 8. Go to Cars view
  container.querySelector('#btn-go-to-cars')?.addEventListener('click', () => {
    closeInfoModal();
    document.querySelector('.sk-nav-tab[data-tab="cars"]')?.click();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  });
}
