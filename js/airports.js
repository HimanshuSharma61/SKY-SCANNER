// Database of major Indian and International Airports with IATA codes, cities, countries, and coordinates
export const AIRPORTS_DATABASE = [
  // India Major Hubs
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.5562, lon: 77.1000, popular: true },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0896, lon: 72.8656, popular: true },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', countryCode: 'IN', lat: 13.1986, lon: 77.7066, popular: true },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.2403, lon: 78.4294, popular: true },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', countryCode: 'IN', lat: 12.9941, lon: 80.1709, popular: true },
  { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.6547, lon: 88.4467, popular: true },
  { code: 'GOI', name: 'Dabolim Airport', city: 'Goa (Dabolim)', country: 'India', countryCode: 'IN', lat: 15.3808, lon: 73.8314, popular: true },
  { code: 'GOX', name: 'Manohar International Airport', city: 'Goa (Mopa)', country: 'India', countryCode: 'IN', lat: 15.7674, lon: 73.8693, popular: true },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', countryCode: 'IN', lat: 10.1518, lon: 76.3930, popular: true },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', countryCode: 'IN', lat: 23.0734, lon: 72.6347, popular: true },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', countryCode: 'IN', lat: 18.5822, lon: 73.9197, popular: true },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', countryCode: 'IN', lat: 26.8242, lon: 75.8122, popular: true },
  { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', country: 'India', countryCode: 'IN', lat: 26.7606, lon: 80.8893, popular: true },
  { code: 'TRV', name: 'Thiruvananthapuram International Airport', city: 'Thiruvananthapuram', country: 'India', countryCode: 'IN', lat: 8.4821, lon: 76.9200, popular: false },
  { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', country: 'India', countryCode: 'IN', lat: 26.1061, lon: 91.5859, popular: false },
  { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', countryCode: 'IN', lat: 34.0086, lon: 74.7741, popular: true },
  { code: 'IXB', name: 'Bagdogra Airport', city: 'Bagdogra (Darjeeling)', country: 'India', countryCode: 'IN', lat: 26.6812, lon: 88.3286, popular: false },
  { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', country: 'India', countryCode: 'IN', lat: 31.7096, lon: 74.7973, popular: false },
  { code: 'IXC', name: 'Chandigarh Airport', city: 'Chandigarh', country: 'India', countryCode: 'IN', lat: 30.6735, lon: 76.7885, popular: false },
  { code: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', country: 'India', countryCode: 'IN', lat: 20.2444, lon: 85.8178, popular: false },
  { code: 'PAT', name: 'Jay Prakash Narayan Airport', city: 'Patna', country: 'India', countryCode: 'IN', lat: 25.5913, lon: 85.0880, popular: false },
  { code: 'VNS', name: 'Lal Bahadur Shastri International Airport', city: 'Varanasi', country: 'India', countryCode: 'IN', lat: 25.4524, lon: 82.8593, popular: false },
  { code: 'UDR', name: 'Maharana Pratap Airport', city: 'Udaipur', country: 'India', countryCode: 'IN', lat: 24.6177, lon: 73.8961, popular: false },
  { code: 'IXZ', name: 'Veer Savarkar International Airport', city: 'Port Blair', country: 'India', countryCode: 'IN', lat: 11.6410, lon: 92.7297, popular: false },

  // Middle East & Gulf
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2532, lon: 55.3657, popular: true },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', lat: 24.4330, lon: 54.6511, popular: true },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.3286, lon: 55.5172, popular: false },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA', lat: 25.2731, lon: 51.6081, popular: true },
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', countryCode: 'BH', lat: 26.2708, lon: 50.6336, popular: false },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', countryCode: 'OM', lat: 23.5933, lon: 58.2844, popular: false },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', lat: 29.2266, lon: 47.9689, popular: false },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.9576, lon: 46.6988, popular: false },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.6796, lon: 39.1565, popular: false },

  // Southeast & East Asia
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3644, lon: 103.9915, popular: true },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.6900, lon: 100.7501, popular: true },
  { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok (Don Mueang)', country: 'Thailand', countryCode: 'TH', lat: 13.9126, lon: 100.6067, popular: false },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', countryCode: 'TH', lat: 8.1132, lon: 98.3169, popular: true },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 2.7456, lon: 101.7072, popular: true },
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali (Denpasar)', country: 'Indonesia', countryCode: 'ID', lat: -8.7482, lon: 115.1672, popular: true },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.1256, lon: 106.6559, popular: false },
  { code: 'MLE', name: 'Velana International Airport', city: 'Male (Maldives)', country: 'Maldives', countryCode: 'MV', lat: 4.1918, lon: 73.5291, popular: true },
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', lat: 7.1808, lon: 79.8841, popular: true },
  { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', countryCode: 'NP', lat: 27.6966, lon: 85.3591, popular: false },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', lat: 22.3080, lon: 113.9185, popular: true },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo (Haneda)', country: 'Japan', countryCode: 'JP', lat: 35.5494, lon: 139.7798, popular: true },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo (Narita)', country: 'Japan', countryCode: 'JP', lat: 35.7647, lon: 140.3863, popular: true },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.4602, lon: 126.4407, popular: true },

  // Europe
  { code: 'LHR', name: 'Heathrow Airport', city: 'London (Heathrow)', country: 'United Kingdom', countryCode: 'GB', lat: 51.4700, lon: -0.4543, popular: true },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London (Gatwick)', country: 'United Kingdom', countryCode: 'GB', lat: 51.1537, lon: -0.1821, popular: false },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR', lat: 49.0097, lon: 2.5479, popular: true },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3105, lon: 4.7683, popular: true },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.0379, lon: 8.5622, popular: true },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', countryCode: 'DE', lat: 48.3537, lon: 11.7750, popular: false },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.4582, lon: 8.5555, popular: true },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.8003, lon: 12.2389, popular: true },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.2974, lon: 2.0833, popular: true },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4839, lon: -3.5680, popular: false },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.2753, lon: 28.7519, popular: true },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.1103, lon: 16.5697, popular: false },

  // Americas
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York (JFK)', country: 'United States', countryCode: 'US', lat: 40.6413, lon: -73.7781, popular: true },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York (Newark)', country: 'United States', countryCode: 'US', lat: 40.6895, lon: -74.1745, popular: false },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.6213, lon: -122.3790, popular: true },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 33.9416, lon: -118.4085, popular: true },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.9742, lon: -87.9073, popular: true },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6777, lon: -79.6248, popular: true },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.1967, lon: -123.1815, popular: false },

  // Australia & Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.9399, lon: 151.1753, popular: true },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.6690, lon: 144.8410, popular: true },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -37.0082, lon: 174.7850, popular: false },
];

// Helper to search airports by string (code, city, country, name)
export function searchAirports(query) {
  if (!query || query.trim() === '') {
    return AIRPORTS_DATABASE.filter(a => a.popular).slice(0, 8);
  }
  const q = query.trim().toLowerCase();
  return AIRPORTS_DATABASE.filter(a =>
    a.code.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q)
  ).slice(0, 8);
}

// Helper to get airport by code
export function getAirportByCode(code) {
  if (!code) return null;
  return AIRPORTS_DATABASE.find(a => a.code.toUpperCase() === code.toUpperCase()) || null;
}
