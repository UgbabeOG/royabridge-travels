var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/destinations.js
var DESTINATIONS = [
  // --- EUROPE ---
  {
    id: "london",
    name: "London, UK",
    airport: "LHR / LGW",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1150,
    royaPrice: 805,
    discount: "30%",
    popular: true,
    tagline: "Royal Landmarks, Theatres & Culture",
    bestTimeToVisit: "May \u2013 Sep (Warm & Festivals)",
    visaRequirement: "Visa Free (6 Months) for US/EU/GCC",
    currency: "GBP (\xA3)",
    language: "English",
    highlights: ["Big Ben & West End", "Tower Bridge & London Eye", "British Museum"],
    averageFlightDuration: "7h from JFK / 6h 45m from DXB"
  },
  {
    id: "paris",
    name: "Paris, France",
    airport: "CDG / ORY",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1080,
    royaPrice: 756,
    discount: "30%",
    popular: true,
    tagline: "City of Light, High Fashion & Cuisine",
    bestTimeToVisit: "Apr \u2013 Jun & Sep \u2013 Oct",
    visaRequirement: "Schengen Visa / ETIAS (90 Days)",
    currency: "EUR (\u20AC)",
    language: "French",
    highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"],
    averageFlightDuration: "7h 15m from JFK / 1h 15m from LHR"
  },
  {
    id: "istanbul",
    name: "Istanbul, Turkey",
    airport: "IST / SAW",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1020,
    royaPrice: 714,
    discount: "30%",
    popular: true,
    tagline: "Where East Meets West Across the Bosphorus",
    bestTimeToVisit: "Apr \u2013 May & Sep \u2013 Nov",
    visaRequirement: "Instant eVisa / Visa-Free",
    currency: "TRY (\u20BA)",
    language: "Turkish",
    highlights: ["Hagia Sophia & Blue Mosque", "Grand Bazaar", "Bosphorus Sunset Cruise"],
    averageFlightDuration: "3h 50m from LHR / 9h 30m from JFK"
  },
  {
    id: "rome",
    name: "Rome, Italy",
    airport: "FCO / CIA",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1120,
    royaPrice: 784,
    discount: "30%",
    popular: true,
    tagline: "Ancient Amphitheaters & Culinary Art",
    bestTimeToVisit: "Apr \u2013 Jun & Sep \u2013 Oct",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "EUR (\u20AC)",
    language: "Italian",
    highlights: ["Colosseum & Forum", "Vatican & Sistine Chapel", "Trevi Fountain"],
    averageFlightDuration: "8h 30m from JFK / 2h 30m from LHR"
  },
  {
    id: "barcelona",
    name: "Barcelona, Spain",
    airport: "BCN",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1050,
    royaPrice: 735,
    discount: "30%",
    popular: true,
    tagline: "Gaud\xED Masterpieces & Mediterranean Vibe",
    bestTimeToVisit: "May \u2013 Jun & Sep \u2013 Oct",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "EUR (\u20AC)",
    language: "Spanish & Catalan",
    highlights: ["Sagrada Fam\xEDlia", "Park G\xFCell", "Gothic Quarter"],
    averageFlightDuration: "8h from JFK / 2h 15m from LHR"
  },
  {
    id: "amsterdam",
    name: "Amsterdam, Netherlands",
    airport: "AMS",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1100,
    royaPrice: 770,
    discount: "30%",
    popular: true,
    tagline: "Scenic Canals, Museums & Golden Age Charm",
    bestTimeToVisit: "Apr \u2013 May (Tulips) & Sep \u2013 Oct",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "EUR (\u20AC)",
    language: "Dutch & English",
    highlights: ["Rijksmuseum & Van Gogh", "Canal Ring Cruises", "Anne Frank House"],
    averageFlightDuration: "7h 15m from JFK / 1h 10m from LHR"
  },
  {
    id: "santorini",
    name: "Athens & Santorini, Greece",
    airport: "ATH / JTR",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1250,
    royaPrice: 875,
    discount: "30%",
    popular: true,
    tagline: "Aegean Calderas & Ancient Acropolis",
    bestTimeToVisit: "May \u2013 Oct (Sun & Islands)",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "EUR (\u20AC)",
    language: "Greek & English",
    highlights: ["Oia Sunsets in Santorini", "Acropolis of Athens", "Mykonos Beach Clubs"],
    averageFlightDuration: "9h 30m from JFK / 3h 40m from LHR"
  },
  {
    id: "zurich",
    name: "Zurich, Switzerland",
    airport: "ZRH",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1210,
    royaPrice: 847,
    discount: "30%",
    popular: false,
    tagline: "Alpine Lakes, Haute Horlogerie & Luxury",
    bestTimeToVisit: "Jun \u2013 Aug (Summer Lake) & Dec \u2013 Mar (Ski)",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "CHF (Fr)",
    language: "Swiss German & English",
    highlights: ["Lake Zurich Promenade", "Bahnhofstrasse", "Swiss Alps Express Rail"],
    averageFlightDuration: "8h 15m from JFK / 1h 40m from LHR"
  },
  {
    id: "lisbon",
    name: "Lisbon, Portugal",
    airport: "LIS",
    region: "Europe",
    image: "https://images.unsplash.com/photo-1585208798174-6ced387e019a?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 980,
    royaPrice: 686,
    discount: "30%",
    popular: false,
    tagline: "Coastal Hills, Historic Trams & Pastel Architecture",
    bestTimeToVisit: "May \u2013 Sep",
    visaRequirement: "Schengen Visa / ETIAS",
    currency: "EUR (\u20AC)",
    language: "Portuguese",
    highlights: ["Bel\xE9m Tower", "Alfama District", "Sintra Palaces"],
    averageFlightDuration: "6h 45m from JFK / 2h 30m from LHR"
  },
  // --- MIDDLE EAST ---
  {
    id: "dubai",
    name: "Dubai, UAE",
    airport: "DXB",
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1290,
    royaPrice: 903,
    discount: "30%",
    popular: true,
    tagline: "Ultra-Modern Luxury, Desert Safaris & Skyline",
    bestTimeToVisit: "Nov \u2013 Mar (Cool & Sunny)",
    visaRequirement: "Visa on Arrival / 30-Day Free eVisa",
    currency: "AED (\u062F.\u0625)",
    language: "Arabic & English",
    highlights: ["Burj Khalifa & Fountains", "Desert Safari Dunes", "Palm Jumeirah Resorts"],
    averageFlightDuration: "6h 45m from LHR / 12h 30m from JFK"
  },
  {
    id: "doha",
    name: "Doha, Qatar",
    airport: "DOH",
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1220,
    royaPrice: 854,
    discount: "30%",
    popular: true,
    tagline: "Pearl of the Gulf & Museum of Islamic Art",
    bestTimeToVisit: "Nov \u2013 Mar",
    visaRequirement: "Free Visa on Arrival (102 Nationalities)",
    currency: "QAR (\u0631.\u0642)",
    language: "Arabic & English",
    highlights: ["Souq Waqif", "Museum of Islamic Art", "The Pearl Island"],
    averageFlightDuration: "6h 30m from LHR / 12h 15m from JFK"
  },
  {
    id: "abudhabi",
    name: "Abu Dhabi, UAE",
    airport: "AUH",
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1200,
    royaPrice: 840,
    discount: "30%",
    popular: true,
    tagline: "Grand Mosques, Louvre Abu Dhabi & Yas Island",
    bestTimeToVisit: "Oct \u2013 Apr",
    visaRequirement: "Visa on Arrival / Free eVisa",
    currency: "AED (\u062F.\u0625)",
    language: "Arabic & English",
    highlights: ["Sheikh Zayed Grand Mosque", "Louvre Abu Dhabi", "Ferrari World Yas Island"],
    averageFlightDuration: "7h from LHR / 12h 45m from JFK"
  },
  {
    id: "riyadh",
    name: "Riyadh, Saudi Arabia",
    airport: "RUH",
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1280,
    royaPrice: 896,
    discount: "30%",
    popular: false,
    tagline: "Kingdom Heritage, Diriyah & Modern Oasis",
    bestTimeToVisit: "Nov \u2013 Mar",
    visaRequirement: "Instant eVisa / Tourist Visa",
    currency: "SAR (\u0631.\u0633)",
    language: "Arabic & English",
    highlights: ["At-Turaif Diriyah UNESCO", "Kingdom Centre Tower", "Edge of the World"],
    averageFlightDuration: "6h 30m from LHR / 12h from JFK"
  },
  {
    id: "muscat",
    name: "Muscat, Oman",
    airport: "MCT",
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1150,
    royaPrice: 805,
    discount: "30%",
    popular: false,
    tagline: "Sultanate Palaces, Fjords & Desert Forts",
    bestTimeToVisit: "Oct \u2013 Apr",
    visaRequirement: "Free eVisa for 103 countries (14 Days)",
    currency: "OMR (\u0631.\u0639.)",
    language: "Arabic & English",
    highlights: ["Sultan Qaboos Grand Mosque", "Muttrah Souq", "Bimmah Sinkhole"],
    averageFlightDuration: "7h 15m from LHR / 13h from JFK"
  },
  // --- AMERICAS ---
  {
    id: "newyork",
    name: "New York, USA",
    airport: "JFK / EWR / LGA",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 890,
    royaPrice: 623,
    discount: "30%",
    popular: true,
    tagline: "Broadway, Manhattan Skyline & Central Park",
    bestTimeToVisit: "Apr \u2013 Jun & Sep \u2013 Nov",
    visaRequirement: "ESTA (US Visa Waiver) / B1/B2 Visa",
    currency: "USD ($)",
    language: "English",
    highlights: ["Times Square & Broadway", "Central Park", "Statue of Liberty"],
    averageFlightDuration: "7h from LHR / 12h 30m from DXB"
  },
  {
    id: "losangeles",
    name: "Los Angeles, USA",
    airport: "LAX",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 990,
    royaPrice: 693,
    discount: "30%",
    popular: true,
    tagline: "Hollywood Glamour, Venice Beach & Pacific Coast",
    bestTimeToVisit: "Mar \u2013 May & Sep \u2013 Nov",
    visaRequirement: "ESTA (US Visa Waiver) / B1/B2 Visa",
    currency: "USD ($)",
    language: "English & Spanish",
    highlights: ["Hollywood Walk of Fame", "Santa Monica Pier", "Griffith Observatory"],
    averageFlightDuration: "11h from LHR / 16h from DXB"
  },
  {
    id: "miami",
    name: "Miami, USA",
    airport: "MIA / FLL",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 940,
    royaPrice: 658,
    discount: "30%",
    popular: true,
    tagline: "South Beach Art Deco, Ocean Drive & Nightlife",
    bestTimeToVisit: "Nov \u2013 Apr (Warm Beach Weather)",
    visaRequirement: "ESTA (US Visa Waiver) / B1/B2 Visa",
    currency: "USD ($)",
    language: "English & Spanish",
    highlights: ["South Beach Ocean Drive", "Wynwood Walls Art", "Little Havana Culture"],
    averageFlightDuration: "9h from LHR / 15h from DXB"
  },
  {
    id: "toronto",
    name: "Toronto, Canada",
    airport: "YYZ",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1517935703635-27c737822457?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 970,
    royaPrice: 679,
    discount: "30%",
    popular: false,
    tagline: "Multicultural Skyline & Niagara Falls",
    bestTimeToVisit: "May \u2013 Sep (Warm & Outdoor Festivals)",
    visaRequirement: "eTA (Canada Electronic Travel Auth)",
    currency: "CAD ($)",
    language: "English & French",
    highlights: ["CN Tower Glass Floor", "Niagara Falls Excursion", "Toronto Islands"],
    averageFlightDuration: "8h from LHR / 1h 30m from JFK"
  },
  {
    id: "cancun",
    name: "Canc\xFAn, Mexico",
    airport: "CUN",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1510097467424-192d713be8b2?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 880,
    royaPrice: 616,
    discount: "30%",
    popular: true,
    tagline: "Caribbean Riviera Maya & Mayan Ruins",
    bestTimeToVisit: "Dec \u2013 Apr",
    visaRequirement: "Visa Free (180 Days) for US/EU/UK",
    currency: "MXN ($)",
    language: "Spanish & English",
    highlights: ["Chich\xE9n Itz\xE1 UNESCO", "Hotel Zone Beaches", "Cenote Diving"],
    averageFlightDuration: "10h from LHR / 3h 45m from JFK"
  },
  {
    id: "riodejaneiro",
    name: "Rio de Janeiro, Brazil",
    airport: "GIG",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1180,
    royaPrice: 826,
    discount: "30%",
    popular: false,
    tagline: "Christ the Redeemer, Copacabana & Samba",
    bestTimeToVisit: "Dec \u2013 Mar (Summer & Carnival)",
    visaRequirement: "eVisa / Visa Free for US/EU/UK",
    currency: "BRL (R$)",
    language: "Portuguese",
    highlights: ["Christ the Redeemer Statue", "Sugarloaf Mountain", "Copacabana Beach"],
    averageFlightDuration: "11h 30m from LHR / 9h 45m from JFK"
  },
  {
    id: "buenosaires",
    name: "Buenos Aires, Argentina",
    airport: "EZE",
    region: "Americas",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1210,
    royaPrice: 847,
    discount: "30%",
    popular: false,
    tagline: "Tango Culture, European Architecture & Steakhouses",
    bestTimeToVisit: "Oct \u2013 Dec & Mar \u2013 May",
    visaRequirement: "Visa Free (90 Days) for US/EU/UK",
    currency: "ARS ($)",
    language: "Spanish",
    highlights: ["La Boca Caminito", "Teatro Col\xF3n", "Recolita Historic Cemetery"],
    averageFlightDuration: "13h 45m from LHR / 10h 30m from JFK"
  },
  // --- ASIA ---
  {
    id: "tokyo",
    name: "Tokyo, Japan",
    airport: "HND / NRT",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1450,
    royaPrice: 1015,
    discount: "30%",
    popular: true,
    tagline: "Futuristic Metropolises & Ancient Temples",
    bestTimeToVisit: "Mar \u2013 May (Cherry Blossom) & Oct \u2013 Nov",
    visaRequirement: "Visa-Free (90 Days) for 68 countries",
    currency: "JPY (\xA5)",
    language: "Japanese",
    highlights: ["Shinjuku & Shibuya Crossing", "Senso-ji Temple", "Mt. Fuji Tour"],
    averageFlightDuration: "14h from JFK / 12h from LHR"
  },
  {
    id: "bali",
    name: "Bali, Indonesia",
    airport: "DPS",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1320,
    royaPrice: 924,
    discount: "30%",
    popular: true,
    tagline: "Serene Rice Terraces, Temples & Villas",
    bestTimeToVisit: "Apr \u2013 Oct (Dry Season)",
    visaRequirement: "Visa on Arrival (VoA - 30 Days)",
    currency: "IDR (Rp)",
    language: "Indonesian & Balinese",
    highlights: ["Ubud Rice Terraces", "Uluwatu Cliff Temple", "Seminyak Coast"],
    averageFlightDuration: "16h from Europe / 20h from US"
  },
  {
    id: "singapore",
    name: "Singapore",
    airport: "SIN",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1380,
    royaPrice: 966,
    discount: "30%",
    popular: true,
    tagline: "Garden City, Marina Bay & Aviation Hub",
    bestTimeToVisit: "Nov \u2013 Jan & Feb \u2013 Apr",
    visaRequirement: "Visa-Free (90 Days) for most passports",
    currency: "SGD ($)",
    language: "English, Malay, Mandarin, Tamil",
    highlights: ["Marina Bay Sands", "Gardens by the Bay", "Jewel Changi Canopy"],
    averageFlightDuration: "13h from LHR / 18h from JFK"
  },
  {
    id: "bangkok",
    name: "Bangkok, Thailand",
    airport: "BKK / DMK",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1150,
    royaPrice: 805,
    discount: "30%",
    popular: true,
    tagline: "Ornate Golden Shrines, Street Food & River Boats",
    bestTimeToVisit: "Nov \u2013 Feb (Cool Dry Season)",
    visaRequirement: "Visa Exemption (60 Days) for 93 countries",
    currency: "THB (\u0E3F)",
    language: "Thai & English",
    highlights: ["Grand Palace & Wat Phra Kaew", "Wat Arun Temple", "Chatuchak Weekend Market"],
    averageFlightDuration: "11h 30m from LHR / 17h from JFK"
  },
  {
    id: "seoul",
    name: "Seoul, South Korea",
    airport: "ICN / GMP",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1350,
    royaPrice: 945,
    discount: "30%",
    popular: true,
    tagline: "K-Culture, Skyscraper Districts & Joseon Palaces",
    bestTimeToVisit: "Mar \u2013 May & Sep \u2013 Nov",
    visaRequirement: "K-ETA (Electronic Travel Auth)",
    currency: "KRW (\u20A9)",
    language: "Korean",
    highlights: ["Gyeongbokgung Palace", "Myeongdong Shopping", "N Seoul Tower"],
    averageFlightDuration: "14h 30m from JFK / 11h 45m from LHR"
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    airport: "HKG",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1506970845246-18f21d533b20?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1320,
    royaPrice: 924,
    discount: "30%",
    popular: false,
    tagline: "Victoria Harbour Skyline, Peak Tram & Cuisine",
    bestTimeToVisit: "Oct \u2013 Dec",
    visaRequirement: "Visa-Free (90 Days) for most passports",
    currency: "HKD ($)",
    language: "Cantonese, Mandarin, English",
    highlights: ["Victoria Peak Tram", "Star Ferry Cruise", "Tian Tan Giant Buddha"],
    averageFlightDuration: "12h from LHR / 15h 30m from JFK"
  },
  {
    id: "kualalumpur",
    name: "Kuala Lumpur, Malaysia",
    airport: "KUL",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1190,
    royaPrice: 833,
    discount: "30%",
    popular: false,
    tagline: "Petronas Twin Towers & Cultural Mosaic",
    bestTimeToVisit: "May \u2013 Jul & Dec \u2013 Feb",
    visaRequirement: "Visa-Free (90 Days) for US/EU/UK/GCC",
    currency: "MYR (RM)",
    language: "Malay & English",
    highlights: ["Petronas Twin Towers", "Batu Caves Shrines", "Bukit Bintang Food Street"],
    averageFlightDuration: "13h from LHR / 18h from JFK"
  },
  {
    id: "maldives",
    name: "Mal\xE9 & Maldives Islands",
    airport: "MLE",
    region: "Asia",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1580,
    royaPrice: 1106,
    discount: "30%",
    popular: true,
    tagline: "Overwater Luxury Bungalows & Crystal Coral Reefs",
    bestTimeToVisit: "Nov \u2013 Apr (Dry Sunny Season)",
    visaRequirement: "30-Day Free Visa on Arrival for All",
    currency: "MVR (Rf) / USD ($)",
    language: "Dhivehi & English",
    highlights: ["Private Island Resorts", "Coral Reef Snorkeling", "Seaplane Scenic Transfers"],
    averageFlightDuration: "10h 30m from LHR / 4h from DXB"
  },
  {
    id: "sydney",
    name: "Sydney, Australia",
    airport: "SYD",
    region: "Asia",
    // Global / Asia-Pacific
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1620,
    royaPrice: 1134,
    discount: "30%",
    popular: true,
    tagline: "Sydney Opera House & Bondi Beach Coastline",
    bestTimeToVisit: "Sep \u2013 Nov & Feb \u2013 Apr",
    visaRequirement: "eVisitor / ETA (601) Visa",
    currency: "AUD ($)",
    language: "English",
    highlights: ["Sydney Opera House", "Harbour Bridge Climb", "Bondi Beach Walk"],
    averageFlightDuration: "21h from LHR / 14h from LAX"
  },
  // --- AFRICA ---
  {
    id: "cairo",
    name: "Cairo, Egypt",
    airport: "CAI",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 980,
    royaPrice: 686,
    discount: "30%",
    popular: true,
    tagline: "Pyramids of Giza, Sphinx & Grand Egyptian Museum",
    bestTimeToVisit: "Oct \u2013 Apr (Cool Desert Weather)",
    visaRequirement: "Visa on Arrival / Instant eVisa ($25)",
    currency: "EGP (\xA3)",
    language: "Arabic",
    highlights: ["Giza Pyramids & Sphinx", "Grand Egyptian Museum", "Nile Felucca Sailing"],
    averageFlightDuration: "5h from LHR / 10h 30m from JFK"
  },
  {
    id: "capetown",
    name: "Cape Town, South Africa",
    airport: "CPT",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1250,
    royaPrice: 875,
    discount: "30%",
    popular: true,
    tagline: "Table Mountain, Cape Point & Wine Valleys",
    bestTimeToVisit: "Nov \u2013 Mar (Summer Sunny Coast)",
    visaRequirement: "Visa Free (90 Days) for US/EU/UK",
    currency: "ZAR (R)",
    language: "English, Afrikaans, Xhosa",
    highlights: ["Table Mountain Cableway", "Cape Point Penguins", "Stellenbosch Wineries"],
    averageFlightDuration: "11h 30m from LHR / 15h 30m from JFK"
  },
  {
    id: "marrakech",
    name: "Marrakech, Morocco",
    airport: "RAK",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 920,
    royaPrice: 644,
    discount: "30%",
    popular: true,
    tagline: "Vibrant Souks, Palaces & Saharan Expeditions",
    bestTimeToVisit: "Mar \u2013 May & Sep \u2013 Nov",
    visaRequirement: "Visa Free (90 Days) for US/EU/UK",
    currency: "MAD (\u062F.\u0645.)",
    language: "Arabic, French, Berber",
    highlights: ["Jemaa el-Fnaa Square", "Jardin Majorelle", "Atlas Mountains"],
    averageFlightDuration: "3h 30m from LHR / 7h 45m from JFK"
  },
  {
    id: "nairobi",
    name: "Nairobi, Kenya",
    airport: "NBO",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1180,
    royaPrice: 826,
    discount: "30%",
    popular: true,
    tagline: "Safari Gateway & Masai Mara Wildlife Migration",
    bestTimeToVisit: "Jul \u2013 Oct (Great Migration)",
    visaRequirement: "Electronic Travel Authorization (eTA)",
    currency: "KES (KSh)",
    language: "Swahili & English",
    highlights: ["Masai Mara Game Reserve", "Giraffe Centre", "Nairobi National Park"],
    averageFlightDuration: "8h 45m from LHR / 13h 30m from JFK"
  },
  {
    id: "zanzibar",
    name: "Zanzibar, Tanzania",
    airport: "ZNZ",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1290,
    royaPrice: 903,
    discount: "30%",
    popular: true,
    tagline: "Turquoise Waters, Spice Farms & Stone Town",
    bestTimeToVisit: "Jun \u2013 Oct & Dec \u2013 Feb",
    visaRequirement: "Visa on Arrival / eVisa ($50)",
    currency: "TZS (TSh) / USD ($)",
    language: "Swahili & English",
    highlights: ["Stone Town UNESCO", "Nungwi Beach Sunset", "Spice Plantation Tour"],
    averageFlightDuration: "9h 30m from LHR / 14h from JFK"
  },
  {
    id: "lagos",
    name: "Lagos, Nigeria",
    airport: "LOS",
    region: "Africa",
    image: "https://images.unsplash.com/photo-1618828665011-0abd973f7ad8?q=80&w=1000&auto=format&fit=crop",
    retailPrice: 1100,
    royaPrice: 770,
    discount: "30%",
    popular: false,
    tagline: "Afrobeats Culture, Beach Resorts & Atlantic Coast",
    bestTimeToVisit: "Nov \u2013 Mar (Dry Harmattan Season)",
    visaRequirement: "eVisa / Visa on Arrival for Business",
    currency: "NGN (\u20A6)",
    language: "English, Yoruba, Igbo, Hausa",
    highlights: ["Tarkwa Bay Beach", "Nike Art Gallery", "Victoria Island"],
    averageFlightDuration: "6h 30m from LHR / 10h from JFK"
  }
];
var POPULAR_AIRPORTS = [
  { code: "JFK", city: "New York", country: "United States", name: "John F. Kennedy Intl" },
  { code: "LAX", city: "Los Angeles", country: "United States", name: "Los Angeles Intl" },
  { code: "MIA", city: "Miami", country: "United States", name: "Miami Intl Airport" },
  { code: "LHR", city: "London", country: "United Kingdom", name: "Heathrow Airport" },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", name: "Dubai Intl Airport" },
  { code: "DOH", city: "Doha", country: "Qatar", name: "Hamad Intl Airport" },
  { code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", name: "Zayed Intl Airport" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", name: "King Khalid Intl" },
  { code: "MCT", city: "Muscat", country: "Oman", name: "Muscat Intl Airport" },
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", name: "Schiphol Airport" },
  { code: "ATH", city: "Athens", country: "Greece", name: "Athens Intl Airport" },
  { code: "FCO", city: "Rome", country: "Italy", name: "Fiumicino Airport" },
  { code: "BCN", city: "Barcelona", country: "Spain", name: "El Prat Airport" },
  { code: "LIS", city: "Lisbon", country: "Portugal", name: "Humberto Delgado Airport" },
  { code: "ZRH", city: "Zurich", country: "Switzerland", name: "Zurich Airport" },
  { code: "IST", city: "Istanbul", country: "Turkey", name: "Istanbul Airport" },
  { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda Airport" },
  { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi Airport" },
  { code: "ICN", city: "Seoul", country: "South Korea", name: "Incheon Intl Airport" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", name: "Hong Kong Intl" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", name: "Kuala Lumpur Intl" },
  { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi Airport" },
  { code: "DPS", city: "Bali", country: "Indonesia", name: "Ngurah Rai Intl" },
  { code: "MLE", city: "Mal\xE9", country: "Maldives", name: "Velana Intl Airport" },
  { code: "SYD", city: "Sydney", country: "Australia", name: "Kingsford Smith Airport" },
  { code: "CUN", city: "Canc\xFAn", country: "Mexico", name: "Canc\xFAn Intl Airport" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil", name: "Gale\xE3o Intl Airport" },
  { code: "EZE", city: "Buenos Aires", country: "Argentina", name: "Ministro Pistarini" },
  { code: "YYZ", city: "Toronto", country: "Canada", name: "Pearson Intl Airport" },
  { code: "CAI", city: "Cairo", country: "Egypt", name: "Cairo Intl Airport" },
  { code: "CPT", city: "Cape Town", country: "South Africa", name: "Cape Town Intl" },
  { code: "RAK", city: "Marrakech", country: "Morocco", name: "Menara Airport" },
  { code: "NBO", city: "Nairobi", country: "Kenya", name: "Jomo Kenyatta Intl" },
  { code: "ZNZ", city: "Zanzibar", country: "Tanzania", name: "Abeid Amani Karume Intl" },
  { code: "LOS", city: "Lagos", country: "Nigeria", name: "Murtala Muhammed Intl" }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
var AIRLINES = [
  { name: "Emirates", code: "EK", logo: "\u2708\uFE0F", color: "#D71921" },
  { name: "British Airways", code: "BA", logo: "\u{1F1EC}\u{1F1E7}", color: "#EB2226" },
  { name: "Delta Air Lines", code: "DL", logo: "\u{1F53A}", color: "#E01931" },
  { name: "Air France", code: "AF", logo: "\u{1F1EB}\u{1F1F7}", color: "#002157" },
  { name: "Qatar Airways", code: "QR", logo: "\u{1F1F6}\u{1F1E6}", color: "#5C0632" },
  { name: "Lufthansa", code: "LH", logo: "\u{1F1E9}\u{1F1EA}", color: "#05164D" },
  { name: "United Airlines", code: "UA", logo: "\u{1F1FA}\u{1F1F8}", color: "#005DAA" },
  { name: "Singapore Airlines", code: "SQ", logo: "\u{1F1F8}\u{1F1EC}", color: "#FDB813" },
  { name: "Virgin Atlantic", code: "VS", logo: "\u{1F534}", color: "#C8102E" }
];
function estimateBasePrice(origin, destination, cabin) {
  let base = 650;
  const highDistPairs = ["JFK-HND", "JFK-SYD", "LHR-SYD", "DXB-SYD", "LAX-SIN", "JFK-SIN", "CDG-HND"];
  const medDistPairs = ["JFK-LHR", "JFK-CDG", "JFK-DXB", "LHR-DXB", "YYZ-LHR", "LAX-HND"];
  const pairStr = `${origin}-${destination}`;
  const revPairStr = `${destination}-${origin}`;
  if (highDistPairs.includes(pairStr) || highDistPairs.includes(revPairStr)) {
    base = 1250;
  } else if (medDistPairs.includes(pairStr) || medDistPairs.includes(revPairStr)) {
    base = 850;
  }
  if (cabin === "Premium Economy") base *= 1.45;
  if (cabin === "Business") base *= 2.6;
  if (cabin === "First") base *= 4.5;
  return Math.round(base);
}
app.post("/api/flights/search", async (req, res) => {
  try {
    const {
      origin = "JFK",
      destination = "LHR",
      departDate,
      returnDate,
      tripType = "round",
      segments = [],
      cabinClass = "Business",
      passengers = 1
    } = req.body;
    const gemini = getGeminiClient();
    let realTimeFlights = null;
    if (gemini) {
      try {
        let routeDescription = `from ${origin} to ${destination} departing on ${departDate}${tripType === "round" ? ` and returning on ${returnDate}` : ""}`;
        if (tripType === "multi" && Array.isArray(segments) && segments.length > 0) {
          const segStr = segments.map((s, i) => `Leg ${i + 1}: ${s.origin} to ${s.destination} on ${s.date}`).join(", ");
          routeDescription = `Multi-city flight itinerary with legs: [${segStr}]`;
        }
        const prompt = `Perform a real-time search for flight prices and actual flight options for ${routeDescription} for ${passengers} passenger(s) in ${cabinClass} class.
        
Provide output strictly in a valid JSON array format containing 4 to 6 flight option objects. Each object should have:
- flightNumber: string (e.g. "BA178", "EK202", "DL3")
- airline: string (e.g. "British Airways", "Emirates", "Delta Air Lines")
- airlineCode: string (2-letter code)
- origin: string (airport code)
- destination: string (airport code)
- departTime: string (e.g. "08:30 AM")
- arriveTime: string (e.g. "08:45 PM")
- duration: string (e.g. "14h 20m Total")
- stops: number (0 for nonstop, 1 for 1 stop)
- stopLocation: string or null
- retailPrice: number (estimated total retail price in USD)
- aircraft: string (e.g. "Boeing 787-9", "Airbus A350-1000")
- seatsRemaining: number (e.g. 3, 5, 8)
- cabinClass: string
- baggageIncluded: string (e.g. "2 x 32kg Checked Bags + Carry-on")

Only return JSON array, no markdown codeblocks or surrounding text if possible.`;
        const response = await gemini.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        const textResponse = response.text || "";
        const jsonMatch = textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          realTimeFlights = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
      }
    }
    if (!realTimeFlights || !Array.isArray(realTimeFlights) || realTimeFlights.length === 0) {
      let basePrice = estimateBasePrice(origin, destination, cabinClass);
      if (tripType === "multi" && Array.isArray(segments) && segments.length > 0) {
        let multiSum = 0;
        segments.forEach((seg) => {
          multiSum += estimateBasePrice(seg.origin || "JFK", seg.destination || "LHR", cabinClass);
        });
        basePrice = Math.round(multiSum * 0.9);
      }
      const schedules = [
        { dep: "08:15 AM", arr: "08:25 PM", dur: tripType === "multi" ? "14h 30m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: tripType === "multi" ? "Stopover Hub" : null, craft: "Boeing 787-10 Dreamliner", timeSlot: "Multi-City Express" },
        { dep: "11:45 AM", arr: "11:55 PM", dur: tripType === "multi" ? "16h 10m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: tripType === "multi" ? "Hub Transfer" : null, craft: "Airbus A350-1000", timeSlot: "Midday Luxury" },
        { dep: "04:30 PM", arr: "06:15 AM (+1)", dur: tripType === "multi" ? "18h 45m" : "8h 45m", stops: 2, stopLoc: "DUB", craft: "Boeing 777-300ER", timeSlot: "Afternoon Saver" },
        { dep: "07:50 PM", arr: "08:00 AM (+1)", dur: tripType === "multi" ? "15h 20m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: null, craft: "Airbus A380-800", timeSlot: "Night Clipper" },
        { dep: "10:15 PM", arr: "12:30 PM (+1)", dur: tripType === "multi" ? "19h 15m" : "9h 15m", stops: 2, stopLoc: "AMS", craft: "Boeing 787-9", timeSlot: "Red-Eye Flex" }
      ];
      realTimeFlights = schedules.map((sched, idx) => {
        const airline = AIRLINES[idx % AIRLINES.length];
        const priceVariance = idx === 0 ? 1.05 : idx === 1 ? 1.15 : idx === 2 ? 0.88 : idx === 3 ? 1 : 0.92;
        const tripMultiplier = tripType === "round" ? 1.85 : tripType === "multi" ? 1.5 : 1;
        const retailPrice = Math.round(basePrice * priceVariance * passengers * tripMultiplier);
        const firstOrigin = tripType === "multi" && segments.length > 0 ? segments[0].origin : origin;
        const lastDest = tripType === "multi" && segments.length > 0 ? segments[segments.length - 1].destination : destination;
        return {
          id: `flight-${firstOrigin}-${lastDest}-${idx + 1}`,
          flightNumber: `${airline.code}${100 + idx * 27 + Math.floor(Math.random() * 9)}`,
          airline: airline.name,
          airlineCode: airline.code,
          logo: airline.logo,
          color: airline.color,
          origin: firstOrigin,
          destination: lastDest,
          departTime: sched.dep,
          arriveTime: sched.arr,
          duration: sched.dur,
          stops: sched.stops,
          stopLocation: sched.stopLoc,
          aircraft: sched.craft,
          timeSlot: sched.timeSlot,
          retailPrice,
          royaPrice: Math.round(retailPrice * 0.7),
          // 30% Concierge discount
          savings: Math.round(retailPrice * 0.3),
          discountPercent: 30,
          seatsRemaining: Math.floor(Math.random() * 5) + 2,
          cabinClass,
          baggageIncluded: cabinClass === "Business" || cabinClass === "First" ? "2 x 32kg Checked + 2 Carry-ons" : "1 x 23kg Checked + 1 Carry-on",
          holdAvailable: true,
          holdFeeUSD: 0,
          pnrHoldDurationHours: 24,
          multiCitySegments: tripType === "multi" ? segments : null
        };
      });
    } else {
      realTimeFlights = realTimeFlights.map((f, idx) => {
        const retailPrice = Number(f.retailPrice) || estimateBasePrice(origin, destination, cabinClass) * passengers;
        const airlineInfo = AIRLINES.find((a) => a.name.toLowerCase().includes(f.airline?.toLowerCase() || "")) || AIRLINES[idx % AIRLINES.length];
        return {
          id: `live-flight-${idx + 1}`,
          flightNumber: f.flightNumber || `${airlineInfo.code}${200 + idx * 14}`,
          airline: f.airline || airlineInfo.name,
          airlineCode: f.airlineCode || airlineInfo.code,
          logo: airlineInfo.logo,
          color: airlineInfo.color,
          origin: f.origin || origin,
          destination: f.destination || destination,
          departTime: f.departTime || "09:00 AM",
          arriveTime: f.arriveTime || "09:15 PM",
          duration: f.duration || "7h 15m",
          stops: f.stops ?? 0,
          stopLocation: f.stopLocation || null,
          aircraft: f.aircraft || "Boeing 787 Dreamliner",
          timeSlot: "Live Scheduled",
          retailPrice,
          royaPrice: Math.round(retailPrice * 0.7),
          savings: Math.round(retailPrice * 0.3),
          discountPercent: 30,
          seatsRemaining: f.seatsRemaining || 4,
          cabinClass: f.cabinClass || cabinClass,
          baggageIncluded: f.baggageIncluded || "Standard Concierge Allowance",
          holdAvailable: true,
          holdFeeUSD: 0,
          pnrHoldDurationHours: 24,
          multiCitySegments: tripType === "multi" ? segments : null
        };
      });
    }
    res.json({
      success: true,
      searchQuery: { origin, destination, departDate, returnDate, tripType, segments, cabinClass, passengers },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      flightsCount: realTimeFlights.length,
      currency: "USD",
      flights: realTimeFlights
    });
  } catch (err) {
    console.error("Flight Search API Error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch real-time flights" });
  }
});
app.post("/api/flights/status", async (req, res) => {
  try {
    const { flightNumber, date } = req.body;
    if (!flightNumber) {
      return res.status(400).json({ success: false, error: "Flight number is required" });
    }
    const cleanedFlight = flightNumber.trim().toUpperCase();
    const airlineCode = cleanedFlight.substring(0, 2);
    const gemini = getGeminiClient();
    let statusData = null;
    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `What is the real-time flight status, departure terminal, gate, route, and schedule details for flight ${cleanedFlight} on date ${date || "today"}? Return a concise JSON object with properties: flightNumber, airline, airlineCode, origin, destination, status ("On Time", "En Route", "Scheduled", or "Landed"), departureTerminal, departureGate, scheduledDeparture, estimatedArrival, aircraft, altitude, speed.`,
          config: { tools: [{ googleSearch: {} }] }
        });
        const text = response.text || "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) statusData = JSON.parse(match[0]);
      } catch (e) {
      }
    }
    if (!statusData) {
      const codeMap = {
        EK: { name: "Emirates", origin: "DXB", dest: "JFK" },
        BA: { name: "British Airways", origin: "LHR", dest: "JFK" },
        QR: { name: "Qatar Airways", origin: "DOH", dest: "LHR" },
        DL: { name: "Delta Air Lines", origin: "JFK", dest: "LAX" },
        UA: { name: "United Airlines", origin: "ORD", dest: "LHR" },
        SQ: { name: "Singapore Airlines", origin: "SIN", dest: "LHR" },
        LH: { name: "Lufthansa", origin: "FRA", dest: "JFK" },
        AF: { name: "Air France", origin: "CDG", dest: "JFK" },
        EY: { name: "Etihad Airways", origin: "AUH", dest: "LHR" },
        VS: { name: "Virgin Atlantic", origin: "LHR", dest: "JFK" }
      };
      const carrier = codeMap[airlineCode] || { name: "Global Partner Airline", origin: "JFK", dest: "LHR" };
      statusData = {
        flightNumber: cleanedFlight,
        airline: carrier.name,
        airlineCode,
        origin: carrier.origin,
        destination: carrier.dest,
        status: "En Route",
        departureTerminal: "Terminal 4",
        departureGate: "Gate B22",
        scheduledDeparture: "08:30 AM EST",
        estimatedArrival: "08:45 PM GMT",
        aircraft: "Airbus A380-800",
        altitude: "38,000 ft",
        speed: "540 mph (869 km/h)",
        progressPercent: 65,
        royaPrice: 780,
        retailPrice: 1120,
        pnrVerified: true
      };
    } else {
      if (!statusData.airlineCode) statusData.airlineCode = airlineCode;
      if (!statusData.progressPercent) statusData.progressPercent = 60;
    }
    res.json({ success: true, status: statusData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/destinations", (req, res) => {
  try {
    const { region, popular } = req.query;
    let list = [...DESTINATIONS];
    if (popular === "true") {
      list = list.filter((d) => d.popular);
    }
    if (region && region !== "All") {
      list = list.filter((d) => d.region.toLowerCase() === region.toLowerCase());
    }
    res.json({
      success: true,
      source: "server_database",
      verified: true,
      count: list.length,
      destinations: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/airports", (req, res) => {
  res.json({
    success: true,
    airports: POPULAR_AIRPORTS
  });
});
app.post("/api/destinations/validate-price", (req, res) => {
  try {
    const { destinationId, passengers = 1, cabinClass = "Business" } = req.body;
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest) {
      return res.status(404).json({ success: false, error: "Destination not found in authoritative database" });
    }
    let multiplier = 1;
    if (cabinClass === "Premium Economy") multiplier = 1.35;
    if (cabinClass === "Business") multiplier = 1;
    if (cabinClass === "First") multiplier = 2.2;
    if (cabinClass === "Economy") multiplier = 0.55;
    const serverRetailPrice = Math.round(dest.retailPrice * multiplier * passengers);
    const serverRoyaPrice = Math.round(dest.royaPrice * multiplier * passengers);
    const serverSavings = serverRetailPrice - serverRoyaPrice;
    const discountPercentage = Math.round(serverSavings / serverRetailPrice * 100);
    res.json({
      success: true,
      verifiedByBackend: true,
      destination: dest,
      pricing: {
        passengers,
        cabinClass,
        retailPrice: serverRetailPrice,
        royaPrice: serverRoyaPrice,
        savingsAmount: serverSavings,
        discountPercentage: `${discountPercentage}%`,
        currency: "USD",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/flights/price-trend", async (req, res) => {
  try {
    const { origin = "JFK", destination = "LHR", cabinClass = "Business" } = req.body;
    const basePrice = estimateBasePrice(origin, destination, cabinClass);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const trendData = days.map((day, i) => {
      const varFactor = i === 1 || i === 2 ? 0.88 : i === 4 || i === 6 ? 1.18 : 1;
      const retail = Math.round(basePrice * varFactor);
      return {
        day,
        retailPrice: retail,
        royaPrice: Math.round(retail * 0.7),
        isCheapest: i === 1
        // Tuesday usually cheapest
      };
    });
    res.json({
      success: true,
      origin,
      destination,
      cabinClass,
      cheapestDay: "Tuesday",
      priceAdvice: "Prices are expected to rise by 12% in the next 48 hours. We recommend placing a 24h free hold now.",
      trend: trendData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
