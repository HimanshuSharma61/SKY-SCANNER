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
  {
    id: 'H_GOA_4',
    name: 'Alila Diwa Goa - That Hyatt Touch',
    city: 'Goa',
    location: 'Majorda Beach, South Goa',
    stars: 5,
    rating: 9.2,
    reviewsCount: 1120,
    priceINR: 14200,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    amenities: ['Paddy Field View', 'Infinity Pool', 'Spa Alila', 'Free Shuttle to Beach', 'Free Breakfast'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Hyatt Direct'
  },
  {
    id: 'H_GOA_5',
    name: 'The Leela Goa Resort',
    city: 'Goa',
    location: 'Mobor Beach, Cavelossim',
    stars: 5,
    rating: 9.5,
    reviewsCount: 1870,
    priceINR: 24500,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['12-Hole Golf Course', 'Lagoon Views', 'Private Beach Access', 'Fine Dining', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
  },
  {
    id: 'H_GOA_6',
    name: 'Fairfield by Marriott Goa Anjuna',
    city: 'Goa',
    location: 'Anjuna, North Goa (1.5 km to Anjuna Beach)',
    stars: 4,
    rating: 8.7,
    reviewsCount: 840,
    priceINR: 5200,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    amenities: ['Outdoor Pool', 'Kava Restaurant', 'Free WiFi', '24/7 Fitness Center', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Marriott Bonvoy'
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
  {
    id: 'H_BOM_2',
    name: 'The St. Regis Mumbai',
    city: 'Mumbai',
    location: 'Lower Parel, High Street Phoenix',
    stars: 5,
    rating: 9.3,
    reviewsCount: 2340,
    priceINR: 21500,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    amenities: ['24h Butler Service', 'Rooftop Swimming Pool', 'Iridium Spa', 'Skyline Bar', 'Free WiFi'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Marriott Bonvoy'
  },
  {
    id: 'H_BOM_3',
    name: 'JW Marriott Mumbai Juhu',
    city: 'Mumbai',
    location: 'Juhu Beachfront, Mumbai',
    stars: 5,
    rating: 9.1,
    reviewsCount: 2890,
    priceINR: 19800,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    amenities: ['Direct Beach Access', 'Infinity Saltwater Pool', 'Quan Spa', 'Lotus Cafe', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: false,
    dealProvider: 'Booking.com'
  },
  {
    id: 'H_BOM_4',
    name: 'Trident Hotel, Nariman Point',
    city: 'Mumbai',
    location: 'Marine Drive, Nariman Point',
    stars: 5,
    rating: 9.2,
    reviewsCount: 3100,
    priceINR: 16500,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    amenities: ['Queen Necklace Ocean View', 'Outdoor Pool', '24h Fitness', 'The Oberoi Spa', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Oberoi Hotels'
  },

  // New Delhi Hotels
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
  {
    id: 'H_DEL_2',
    name: 'The Imperial New Delhi',
    city: 'New Delhi',
    location: 'Janpath, Connaught Place',
    stars: 5,
    rating: 9.4,
    reviewsCount: 1950,
    priceINR: 18200,
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Colonial Heritage Gardens', 'Imperial Spa', 'Award-Winning Restaurants', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Agoda'
  },
  {
    id: 'H_DEL_3',
    name: 'ITC Maurya, a Luxury Collection Hotel',
    city: 'New Delhi',
    location: 'Diplomatic Enclave, Sardar Patel Marg',
    stars: 5,
    rating: 9.2,
    reviewsCount: 2600,
    priceINR: 17500,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    amenities: ['World-Famous Bukhara', 'Kaya Kalp Spa', 'Olympic Swimming Pool', 'Free WiFi', 'Green Luxury'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'MakeMyTrip'
  },
  {
    id: 'H_DEL_4',
    name: 'Roseate House New Delhi',
    city: 'New Delhi',
    location: 'Aerocity (10 min from IGI Airport)',
    stars: 5,
    rating: 8.9,
    reviewsCount: 1480,
    priceINR: 9800,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    amenities: ['Rooftop Infinity Pool', 'Aheli Spa', 'Airport Shuttle', 'Contemporary Design', 'Free WiFi'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Trip.com'
  },

  // Bengaluru Hotels
  {
    id: 'H_BLR_1',
    name: 'The Ritz-Carlton, Bangalore',
    city: 'Bengaluru',
    location: 'Residency Road, Central Business District',
    stars: 5,
    rating: 9.4,
    reviewsCount: 1720,
    priceINR: 19500,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Rooftop Bar Bang', 'Ritz-Carlton Spa', 'Outdoor Pool', 'Marble Bathrooms', 'Free WiFi'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Marriott Bonvoy'
  },
  {
    id: 'H_BLR_2',
    name: 'The Leela Palace Bengaluru',
    city: 'Bengaluru',
    location: 'Old Airport Road, Kodihalli',
    stars: 5,
    rating: 9.5,
    reviewsCount: 2450,
    priceINR: 23000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Vijayanagara Architecture', 'Tropical Gardens', 'Citrus Restaurant', 'Royal Spa', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
  },
  {
    id: 'H_BLR_3',
    name: 'Taj West End, Bengaluru',
    city: 'Bengaluru',
    location: 'Race Course Road (Adjacent to Golf Club)',
    stars: 5,
    rating: 9.3,
    reviewsCount: 1680,
    priceINR: 16800,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    amenities: ['20-Acre Heritage Flora', 'Open-Air Swimming Pool', 'Blue Ginger Vietnamese', 'Jiva Spa'],
    freeCancellation: true,
    breakfastIncluded: false,
    dealProvider: 'Tata Neu'
  },

  // Jaipur & Rajasthan Hotels
  {
    id: 'H_JAI_1',
    name: 'Rambagh Palace, Jaipur',
    city: 'Jaipur',
    location: 'Bhawani Singh Road, Jaipur',
    stars: 5,
    rating: 9.8,
    reviewsCount: 2900,
    priceINR: 42000,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Former Royal Residence', 'Peacock Gardens', 'Jiva Grande Spa', 'Suvarna Mahal Fine Dining'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Taj Direct'
  },
  {
    id: 'H_JAI_2',
    name: 'The Oberoi Rajvilas, Jaipur',
    city: 'Jaipur',
    location: 'Goner Road, Jaipur',
    stars: 5,
    rating: 9.7,
    reviewsCount: 1850,
    priceINR: 38500,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Luxury Tents & Villas', 'Private Pool Options', '32-Acre Oasis', 'Ayurvedic Spa'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Oberoi Direct'
  },
  {
    id: 'H_JAI_3',
    name: 'Fairmont Jaipur',
    city: 'Jaipur',
    location: 'Riico Kukas (Near Amer Fort)',
    stars: 5,
    rating: 9.1,
    reviewsCount: 1420,
    priceINR: 15500,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    amenities: ['Mughal-Rajput Palatial Design', 'Aravalli Hills View', 'Outdoor Pool', 'Ruhab Spa', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Accor Hotels'
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
  {
    id: 'H_DXB_3',
    name: 'Burj Al Arab Jumeirah',
    city: 'Dubai',
    location: 'Jumeirah Beach Road, Dubai',
    stars: 5,
    rating: 9.7,
    reviewsCount: 1650,
    priceINR: 98000,
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
    amenities: ['Iconic Sail Landmark', 'Private Beach', 'Helipad', 'Rolls-Royce Chauffeur', 'Talise Spa'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Jumeirah Direct'
  },
  {
    id: 'H_DXB_4',
    name: 'Address Sky View Dubai',
    city: 'Dubai',
    location: 'Downtown Dubai (Direct Mall Access)',
    stars: 5,
    rating: 9.4,
    reviewsCount: 2410,
    priceINR: 28500,
    image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=800&q=80',
    amenities: ['Twin Sky Bridge', 'Rooftop Infinity Pool', 'Panoramic Burj View', 'The Spa', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Agoda'
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
  {
    id: 'H_BKK_3',
    name: 'Mandarin Oriental, Bangkok',
    city: 'Bangkok',
    location: 'Charoenkrung, Bang Rak (Chao Phraya)',
    stars: 5,
    rating: 9.6,
    reviewsCount: 1980,
    priceINR: 32000,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Historic Grandeur', 'Two Pools', 'The Oriental Spa', 'Private Boat Shuttle', 'Butler Service'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
  },

  // Singapore Hotels
  {
    id: 'H_SIN_1',
    name: 'Marina Bay Sands',
    city: 'Singapore',
    location: '10 Bayfront Avenue, Marina Bay',
    stars: 5,
    rating: 9.3,
    reviewsCount: 5400,
    priceINR: 44000,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    amenities: ['World Famous Rooftop Infinity Pool', 'SkyPark Observation', 'Direct Casino & Mall', 'Banyan Tree Spa'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Skyscanner Direct'
  },
  {
    id: 'H_SIN_2',
    name: 'Raffles Hotel Singapore',
    city: 'Singapore',
    location: '1 Beach Road, City Hall',
    stars: 5,
    rating: 9.6,
    reviewsCount: 1820,
    priceINR: 52000,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    amenities: ['Colonial Luxury Landmark', 'Home of Singapore Sling', 'Raffles Spa', 'Courtyard Gardens', 'Butler Service'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Accor / Raffles'
  },

  // Bali Hotels
  {
    id: 'H_DPS_1',
    name: 'Ayana Resort and Spa, Bali',
    city: 'Bali',
    location: 'Jimbaran Bay, Bali',
    stars: 5,
    rating: 9.4,
    reviewsCount: 2650,
    priceINR: 23500,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Rock Bar Bali', '14 Swimming Pools', 'Private Beach', 'Aquatonic Seawater Pool', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Agoda'
  },
  {
    id: 'H_DPS_2',
    name: 'Four Seasons Resort Bali at Sayan',
    city: 'Bali',
    location: 'Ubud, Ayung River Valley',
    stars: 5,
    rating: 9.7,
    reviewsCount: 1450,
    priceINR: 48000,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    amenities: ['Suspended Bridge Entrance', 'Lush Jungle Valley View', 'Sacred River Spa', 'Private Plunge Pools'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Four Seasons Direct'
  },

  // London & Paris Hotels
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
  },
  {
    id: 'H_PAR_1',
    name: 'Hôtel Plaza Athénée Paris',
    city: 'Paris',
    location: 'Avenue Montaigne, 8th Arrondissement',
    stars: 5,
    rating: 9.5,
    reviewsCount: 1540,
    priceINR: 76000,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    amenities: ['Eiffel Tower Balcony Views', 'Dior Spa', 'Courtyard Ice Rink', 'Haute Cuisine', 'Free Cancellation'],
    freeCancellation: true,
    breakfastIncluded: true,
    dealProvider: 'Booking.com'
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

  // If no exact query match, return popular recommendations
  if (results.length === 0) {
    return HOTELS_DATABASE.slice(0, 8);
  }

  return results;
}
