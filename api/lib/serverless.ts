import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";
import firebaseConfig from "../../firebase-applet-config.json";

let aiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

let adminApp: any = null;
export function getAdminApp(): any {
  if (!adminApp) {
    try {
      const appsList = admin.apps || (admin as any).default?.apps || [];
      if (appsList.length === 0) {
        adminApp = admin.initializeApp({
          projectId: firebaseConfig.projectId
        });
      } else {
        adminApp = appsList[0];
      }
    } catch (e: any) {
      console.warn("[Firebase Admin Init Warning]", e?.message || e);
    }
  }
  return adminApp;
}

export function getAdminAuth(): any {
  try {
    const app = getAdminApp();
    if (app && typeof admin.auth === "function") return admin.auth();
    if (app && (admin as any).default && typeof (admin as any).default.auth === "function") {
      return (admin as any).default.auth();
    }
  } catch (e) {
    // Auth service uninitialized
  }
  return null;
}

export function getAdminFirestore(): any {
  try {
    const app = getAdminApp();
    if (app && typeof admin.firestore === "function") return admin.firestore();
    if (app && (admin as any).default && typeof (admin as any).default.firestore === "function") {
      return (admin as any).default.firestore();
    }
  } catch (e) {
    // Firestore uninitialized
  }
  return null;
}

export const adminClaimsStore = new Map<string, boolean>();

export const AIRLINES = [
  { name: "Emirates", code: "EK", logo: "✈️", color: "#D71921" },
  { name: "British Airways", code: "BA", logo: "🇬🇧", color: "#EB2226" },
  { name: "Delta Air Lines", code: "DL", logo: "🔺", color: "#E01931" },
  { name: "Air France", code: "AF", logo: "🇫🇷", color: "#002157" },
  { name: "Qatar Airways", code: "QR", logo: "🇶🇦", color: "#5C0632" },
  { name: "Lufthansa", code: "LH", logo: "🇩🇪", color: "#05164D" },
  { name: "United Airlines", code: "UA", logo: "🇺🇸", color: "#005DAA" },
  { name: "Singapore Airlines", code: "SQ", logo: "🇸🇬", color: "#FDB813" },
  { name: "Virgin Atlantic", code: "VS", logo: "🔴", color: "#C8102E" }
];

export function estimateBasePrice(origin: string, destination: string, cabin: string): number {
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

export function formatFlightResponse(f: any, origin: string, destination: string, cabinClass: string, passengers: number, tripType: string, segments: any[]): any {
  const airlineInfo = AIRLINES.find(a => a.name.toLowerCase().includes(f.airline?.toLowerCase() || "")) || AIRLINES[0];
  const retailPrice = Number(f.retailPrice) || estimateBasePrice(origin, destination, cabinClass) * passengers;
  return {
    id: f.id || `live-flight-${Math.random()}`,
    flightNumber: f.flightNumber || `${airlineInfo.code}${200 + Math.floor(Math.random() * 99)}`,
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
    royaPrice: Math.round(retailPrice * 0.70),
    savings: Math.round(retailPrice * 0.30),
    discountPercent: 30,
    seatsRemaining: f.seatsRemaining || 4,
    cabinClass: f.cabinClass || cabinClass,
    baggageIncluded: f.baggageIncluded || "Standard Concierge Allowance",
    holdAvailable: true,
    holdFeeUSD: 0,
    pnrHoldDurationHours: 24,
    multiCitySegments: tripType === "multi" ? segments : null
  };
}

export function generateFallbackFlights(origin: string, destination: string, cabinClass: string, passengers: number, tripType: string, segments: any[]): any[] {
  let basePrice = estimateBasePrice(origin, destination, cabinClass);
  if (tripType === "multi" && Array.isArray(segments) && segments.length > 0) {
    let multiSum = 0;
    segments.forEach((seg: any) => {
      multiSum += estimateBasePrice(seg.origin || "JFK", seg.destination || "LHR", cabinClass);
    });
    basePrice = Math.round(multiSum * 0.90);
  }
  const schedules = [
    { dep: "08:15 AM", arr: "08:25 PM", dur: tripType === "multi" ? "14h 30m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: tripType === "multi" ? "Stopover Hub" : null, craft: "Boeing 787-10 Dreamliner", timeSlot: "Multi-City Express" },
    { dep: "11:45 AM", arr: "11:55 PM", dur: tripType === "multi" ? "16h 10m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: tripType === "multi" ? "Hub Transfer" : null, craft: "Airbus A350-1000", timeSlot: "Midday Luxury" },
    { dep: "04:30 PM", arr: "06:15 AM (+1)", dur: tripType === "multi" ? "18h 45m" : "8h 45m", stops: 2, stopLoc: "DUB", craft: "Boeing 777-300ER", timeSlot: "Afternoon Saver" },
    { dep: "07:50 PM", arr: "08:00 AM (+1)", dur: tripType === "multi" ? "15h 20m" : "7h 10m", stops: tripType === "multi" ? 1 : 0, stopLoc: null, craft: "Airbus A380-800", timeSlot: "Night Clipper" },
    { dep: "10:15 PM", arr: "12:30 PM (+1)", dur: tripType === "multi" ? "19h 15m" : "9h 15m", stops: 2, stopLoc: "AMS", craft: "Boeing 787-9", timeSlot: "Red-Eye Flex" }
  ];
  const firstOrigin = tripType === "multi" && segments.length > 0 ? segments[0].origin : origin;
  const lastDest = tripType === "multi" && segments.length > 0 ? segments[segments.length - 1].destination : destination;
  return schedules.map((sched, idx) => {
    const airline = AIRLINES[idx % AIRLINES.length];
    const priceVariance = idx === 0 ? 1.05 : (idx === 1 ? 1.15 : (idx === 2 ? 0.88 : (idx === 3 ? 1.0 : 0.92)));
    const tripMultiplier = tripType === "round" ? 1.85 : (tripType === "multi" ? 1.5 : 1.0);
    const retailPrice = Math.round(basePrice * priceVariance * passengers * tripMultiplier);
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
      royaPrice: Math.round(retailPrice * 0.70),
      savings: Math.round(retailPrice * 0.30),
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
}