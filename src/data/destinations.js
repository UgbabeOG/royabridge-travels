export const DESTINATIONS = [
  {
    id: 'london',
    name: 'London, UK',
    airport: 'LHR / LGW',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1150,
    royaPrice: 805,
    discount: '30%',
    popular: true,
    tagline: 'Experience Royal Landmarks & Culture'
  },
  {
    id: 'dubai',
    name: 'Dubai, UAE',
    airport: 'DXB',
    region: 'Middle East',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1290,
    royaPrice: 903,
    discount: '30%',
    popular: true,
    tagline: 'Luxury Shopping & Desert Adventures'
  },
  {
    id: 'paris',
    name: 'Paris, France',
    airport: 'CDG',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1080,
    royaPrice: 778,
    discount: '28%',
    popular: true,
    tagline: 'City of Light & Romance'
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    airport: 'HND / NRT',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1450,
    royaPrice: 1015,
    discount: '30%',
    popular: true,
    tagline: 'Futuristic Metropolises & Heritage'
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    airport: 'DPS',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1320,
    royaPrice: 924,
    discount: '30%',
    popular: true,
    tagline: 'Serene Beaches & Tropical Villas'
  },
  {
    id: 'newyork',
    name: 'New York, USA',
    airport: 'JFK / EWR',
    region: 'Americas',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 890,
    royaPrice: 630,
    discount: '29%',
    popular: false,
    tagline: 'The Center of the World'
  },
  {
    id: 'toronto',
    name: 'Toronto, Canada',
    airport: 'YYZ',
    region: 'Americas',
    image: 'https://images.unsplash.com/photo-1517935703635-27c737822457?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 970,
    royaPrice: 689,
    discount: '29%',
    popular: false,
    tagline: 'Multicultural Skyline & Niagara Falls'
  },
  {
    id: 'sydney',
    name: 'Sydney, Australia',
    airport: 'SYD',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop',
    retailPrice: 1620,
    royaPrice: 1134,
    discount: '30%',
    popular: true,
    tagline: 'Harbour Wonders & Coastal Magic'
  }
];

export const POPULAR_AIRPORTS = [
  { code: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy Intl' },
  { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow Airport' },
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai Intl Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Pearson Intl Airport' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', name: 'Ngurah Rai Intl Airport' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Kingsford Smith Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles Intl' }
];
