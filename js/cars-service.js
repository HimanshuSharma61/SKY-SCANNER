// Car Hire Search Service with diverse vehicle categories & suppliers

export const CARS_DATABASE = [
  {
    id: 'CAR_1',
    name: 'Maruti Suzuki Swift or similar',
    category: 'Small / Compact',
    passengers: 4,
    doors: 4,
    luggage: 2,
    transmission: 'Manual',
    airConditioning: true,
    supplier: 'Avis',
    supplierRating: 8.6,
    dailyPriceINR: 1850,
    fuelPolicy: 'Full to Full',
    mileage: 'Unlimited mileage',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=700&q=80',
    freeCancellation: true
  },
  {
    id: 'CAR_2',
    name: 'Hyundai Verna / Honda City or similar',
    category: 'Medium / Sedan',
    passengers: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    airConditioning: true,
    supplier: 'Hertz',
    supplierRating: 8.8,
    dailyPriceINR: 2750,
    fuelPolicy: 'Full to Full',
    mileage: 'Unlimited mileage',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=700&q=80',
    freeCancellation: true
  },
  {
    id: 'CAR_3',
    name: 'Hyundai Creta / Kia Seltos or similar',
    category: 'SUV',
    passengers: 5,
    doors: 5,
    luggage: 4,
    transmission: 'Automatic',
    airConditioning: true,
    supplier: 'Enterprise',
    supplierRating: 9.1,
    dailyPriceINR: 3600,
    fuelPolicy: 'Full to Full',
    mileage: 'Unlimited mileage',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
    freeCancellation: true
  },
  {
    id: 'CAR_4',
    name: 'Toyota Fortuner 4x4 or similar',
    category: 'Large SUV',
    passengers: 7,
    doors: 5,
    luggage: 5,
    transmission: 'Automatic',
    airConditioning: true,
    supplier: 'Zoomcar',
    supplierRating: 8.4,
    dailyPriceINR: 5200,
    fuelPolicy: 'Full to Full',
    mileage: 'Unlimited mileage',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80',
    freeCancellation: true
  },
  {
    id: 'CAR_5',
    name: 'Mercedes-Benz C-Class / BMW 3 Series',
    category: 'Luxury',
    passengers: 5,
    doors: 4,
    luggage: 3,
    transmission: 'Automatic',
    airConditioning: true,
    supplier: 'Sixt',
    supplierRating: 9.4,
    dailyPriceINR: 9800,
    fuelPolicy: 'Full to Full',
    mileage: 'Unlimited mileage',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=700&q=80',
    freeCancellation: true
  }
];

export function searchCars({ location = '', category = 'all', days = 3 }) {
  let list = [...CARS_DATABASE];
  if (category !== 'all') {
    list = list.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
  }

  return list.map(car => ({
    ...car,
    totalPriceINR: car.dailyPriceINR * days,
    rentalDays: days,
    pickupLocation: location || 'Airport Terminal / Meet & Greet'
  }));
}
