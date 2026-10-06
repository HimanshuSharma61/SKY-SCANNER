// Hotels Search Service with realistic hotel inventory across major destinations

export const HOTELS_DATABASE = [
  // Goa Hotels
  {
    id: 'H_GOA_1',
    name: 'Taj Exotica Resort & Spa, Goa',
    city: 'Goa',
    location: 'Benaulim, South Goa (0.2 km from beach)',
    stars: 5,
    rating: 9.3,
    reviewsCount: 1420,
    priceINR: 18500,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    amenities: ['Free WiFi', 'Outdoor Pool', 'Spa & Wellness', 'Free Breakfast', 'Beachfront', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
  },
  {
    id: 'H_GOA_2',
    name: 'W Goa',
    city: 'Goa',
    location: 'Vagator, North Goa (Near Chapora Fort)',
    stars: 5,
    rating: 9.0,
    reviewsCount: 980,
    priceINR: 22000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Infinity Pool', 'Rock Pool Bar', 'Free WiFi', 'Fitness Centre', 'Pet Friendly'],
    freeCancellation: true,
    breakfastIncluded: false,
    dealProvider: 'Agoda'
  },
  {
    id: 'H_GOA_3',
    name: 'Heritage Village Resort & Spa',
    city: 'Goa',
    location: 'Arossim Beach, South Goa',
    stars: 4,
    rating: 8.6,
    reviewsCount: 650,
    priceINR: 7499,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    amenities: ['Swimming Pool', 'Free Breakfast', 'Kids Play Area', 'Ayurveda Spa', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'MakeMyTrip'
  },

  // Dubai Hotels
  {
    id: 'H_DXB_1',
    name: 'Atlantis, The Palm',
    city: 'Dubai',
    location: 'Palm Jumeirah, Dubai',
    stars: 5,
    rating: 9.2,
    reviewsCount: 3840,
    priceINR: 34500,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Aquaventure Waterpark Included', 'Private Beach', '29 Restaurants', 'Free WiFi', 'Luxury Spa'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Skyscanner Direct'
  },
  {
    id: 'H_DXB_2',
    name: 'Rove Downtown Dubai',
    city: 'Dubai',
    location: 'Downtown Dubai (Facing Burj Khalifa)',
    stars: 4,
    rating: 8.9,
    reviewsCount: 2150,
    priceINR: 8900,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    amenities: ['Burj Khalifa View', 'Outdoor Pool', '24h Gym', 'Free WiFi', 'Metro Shuttle'],
    freeCancellation: true,
    breakfastIncluded: false,
    dealProvider: 'Booking.com'
  },

  // Bangkok Hotels
  {
    id: 'H_BKK_1',
    name: 'The Peninsula Bangkok',
    city: 'Bangkok',
    location: 'Riverside, Chao Phraya River',
    stars: 5,
    rating: 9.4,
    reviewsCount: 1670,
    priceINR: 19800,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    amenities: ['River Shuttle Boat', 'Tiered Pool', 'Full Spa', 'Riverside Terrace', 'Free WiFi'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Agoda'
  },
  {
    id: 'H_BKK_2',
    name: 'Amari Bangkok',
    city: 'Bangkok',
    location: 'Pratunam, Shopping District',
    stars: 5,
    rating: 8.8,
    reviewsCount: 1120,
    priceINR: 7600,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    amenities: ['Breeze Spa', 'Central Location', 'Rooftop Pool', 'Free WiFi', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Trip.com'
  },

  // Delhi Hotels
  {
    id: 'H_DEL_1',
    name: 'The Leela Palace New Delhi',
    city: 'New Delhi',
    location: 'Chanakyapuri, Diplomatic Enclave',
    stars: 5,
    rating: 9.5,
    reviewsCount: 2200,
    priceINR: 21500,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Rooftop Infinity Pool', 'Michelin-starred Dining', 'Spa by ESPA', 'Free WiFi', 'Butler Service'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
  },

  // Mumbai Hotels
  {
    id: 'H_BOM_1',
    name: 'The Taj Mahal Palace, Mumbai',
    city: 'Mumbai',
    location: 'Colaba (Opposite Gateway of India)',
    stars: 5,
    rating: 9.6,
    reviewsCount: 4100,
    priceINR: 28000,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Harbour View', 'Historic Heritage', 'Jiva Spa', 'Sea Lounge', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Tata Neu / Taj Direct'
  },

  // London Hotels
  {
    id: 'H_LON_1',
    name: 'The Ritz London',
    city: 'London',
    location: 'Piccadilly, Mayfair',
    stars: 5,
    rating: 9.4,
    reviewsCount: 1890,
    priceINR: 58000,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    amenities: ['Michelin Dining', 'Afternoon Tea', 'Near Green Park', 'Luxury Valet', 'Free WiFi'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Skyscanner'
  }
];

export function searchHotels({ query = '', minStars = 0, maxPrice = 999999, freeCancellationOnly = false }) {
  let results = [...HOTELS_DATABASE];

  if (query && query.trim() !== '') {
    const q = query.trim().toLowerCase();
    results = results.filter(h =>
      h.city.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q)
    );
  }

  if (minStars > 0) {
    results = results.filter(h => h.stars >= minStars);
  }

  if (maxPrice > 0) {
    results = results.filter(h => h.priceINR <= maxPrice);
  }

  if (freeCancellationOnly) {
    results = results.filter(h => h.freeCancellation);
  }

  // If no exact query match, return popular recommendations with adjusted city tag
  if (results.length === 0) {
    return HOTELS_DATABASE.slice(0, 4);
  }

  return results;
}
