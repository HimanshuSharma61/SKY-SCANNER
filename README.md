# SKY-SCANNER (Skyscanner Web Application Clone)

A full-featured, responsive, high-fidelity frontend replica of [Skyscanner](https://www.skyscanner.co.in/) built with vanilla modern HTML5, CSS3 design tokens, and modular JavaScript.

## 🚀 Live Local Server
The project is running on your local machine:
- **Local URL:** [http://localhost:5173/](http://localhost:5173/)
- **Or open directly:** Double-click [`index.html`](file:///d:/New%20folder/index.html) in your browser.

---

## ✨ Features

### 1. Iconic Skyscanner Design & Navigation
- **Midnight Navy Brand Theme:** Skyscanner signature colors (`#05203C`, `#0062E3`, `#00A698`, `#FF5452`).
- **Main Category Tabs:** Switch seamlessly between **Flights**, **Hotels**, and **Car Hire**.
- **Multi-Currency Switcher:** Live real-time currency conversion supporting **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **AED**, **SGD**, **JPY**, **AUD**, and **THB**.
- **Saved Trips / Favourites:** Save flights to bookmarks with a real-time counter badge.

### 2. Comprehensive Flight Search
- **Origin & Destination Autocomplete:** Preloaded with 60+ Indian and global airport hubs (DEL, BOM, BLR, DXB, LHR, SIN, BKK, DPS, etc.).
- **Trip Types:** Return (Round trip), One-way, and Multi-city.
- **Airport Swap:** Animated 180° rotation button.
- **Traveller & Cabin Selector:** Interactive counter for Adults and Children with Economy, Premium Economy, Business, and First Class tiers.
- **7-Day Price Scrubber:** Interactive date strip showing prices across adjacent days and highlighting the cheapest flight.

### 3. Dynamic Results, Filters & Sorting
- **Sorting Options:** **Cheapest** (lowest fare), **Best** (optimal balance of fare & duration), and **Fastest** (shortest travel time).
- **Filter Sidebar:**
  - **Stops:** Direct only, 1 stop, 2+ stops with live dynamic minimum price badges.
  - **Departure Times:** Early morning (<6am), Morning (6am–12pm), Afternoon (12pm–6pm), Evening (>6pm).
  - **Airlines:** IndiGo (6E), Air India (AI), Vistara (UK), Akasa Air (QP), Emirates (EK), Qatar Airways (QR), Singapore Airlines (SQ), British Airways (BA), Lufthansa (LH), etc.
  - **Max Budget Slider:** Live currency-formatted range slider.
  - **Greener Choice:** Filter flights with lower CO2 emissions.
  - **Expandable Details:** View baggage allowance, aircraft models (A320neo, B787 Dreamliner), terminals, and layover durations.

### 4. Deal Comparison & E-Ticket Booking Flow
- **Multi-Provider Comparison:** Compare rates from **Airline Direct**, **MakeMyTrip**, **Cleartrip**, **Booking.com**, and **Agoda**.
- **Passenger Checkout:** Enter passenger details, seat preference (Aisle/Window/Legroom), and meal requests.
- **Instant E-Ticket Generation:** Generates a complete Boarding Pass with a verified PNR code (`SKY-XXXXXX`), gate details, mock QR code, and **Print E-Ticket** button!

### 5. Hotels & Car Hire Hubs
- **Hotels:** Search stays in top destinations (Goa, Dubai, Bangkok, London, Mumbai, Delhi) with guest review ratings, star filters, free cancellation tags, and amenities.
- **Car Hire:** Search rental vehicles across Compact, Sedan, SUV, and Luxury categories with suppliers (Avis, Hertz, Enterprise, Zoomcar).

### 6. "Explore Everywhere" with Live Destination Weather
- Curated popular destinations from India with starting fares.
- **Live Weather Integration:** Powered by the free **Open-Meteo API** to display real-time temperatures and conditions (e.g. ☀️ 32°C Sunny in Dubai, 🌴 29°C Warm in Goa).

---

## 🔑 Essential Free APIs & Keys

Access the built-in **"Free APIs"** button in the header navbar to view status or enter your own free keys:

| API | Type | Status | Free Tier Details |
|---|---|---|---|
| **Open-Meteo Weather** | Weather | **Active & Live** | 100% Free, No API Key required. |
| **Open Exchange Rates / Frankfurter** | Currency | **Active & Live** | 100% Free, live FX rates for INR, USD, EUR, GBP, etc. |
| **Amadeus Flight Offers API** | Flight Search | Optional | Free 2,000 monthly search calls at [developers.amadeus.com](https://developers.amadeus.com/register). |
| **AviationStack API** | Flight Radar | Optional | Free 100 monthly calls at [aviationstack.com](https://aviationstack.com/signup/free). |

> **Smart Fallback:** Even without external keys, our realistic flight scheduling and pricing algorithm generates accurate routes, real flight numbers, and live pricing.

---

## 📁 Project Architecture

```
d:/New folder/
├── index.html              # Main Skyscanner application layout
├── README.md               # Documentation & API guidelines
├── styles/
│   ├── main.css            # Design tokens, variables & typography
│   ├── navbar.css          # Header, brand logo & navigation tabs
│   ├── hero-search.css     # Search card, inputs & travellers popover
│   ├── results.css         # Flight cards, 7-day calendar & route lines
│   ├── filters.css         # Filter sidebar, sliders & time pills
│   ├── hotels-cars.css     # Hotels & Car hire cards and grids
│   ├── explore.css         # Explore everywhere & footer styles
│   ├── modal.css           # Booking flow, E-ticket & API manager
│   └── responsive.css      # Mobile & tablet media queries
└── js/
    ├── app.js              # Application bootstrapper & event listeners
    ├── state.js            # Reactive application state manager
    ├── airports.js         # 60+ global & Indian airport database
    ├── api-config.js       # Free API keys storage & connection testers
    ├── currency-service.js # Live currency exchange rates
    ├── weather-service.js  # Live Open-Meteo destination weather
    ├── flights-service.js  # Flight generation, routing & pricing engine
    ├── hotels-service.js   # Hotel search & inventory
    ├── cars-service.js     # Car rental search & suppliers
    └── ui-handlers.js      # DOM rendering & interaction controllers
```
>>>>>>> 678919d (feat: complete Skyscanner India frontend clone with live travel APIs)
