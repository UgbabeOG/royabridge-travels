import { db, doc, setDoc, getDoc, collection, query, where, getDocs, limit } from './firebase.js';

export function extractAirportCode(val, fallback = 'JFK') {
  if (!val) return fallback;
  if (typeof val === 'string') return val.trim().toUpperCase();
  if (typeof val === 'object') {
    return (val.code || val.airport || val.iata || val.id || fallback).toString().toUpperCase();
  }
  return fallback;
}

export function extractAirportCity(val, codeFallback = '') {
  if (!val) return codeFallback;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    return val.city || val.name || val.cityName || val.location || codeFallback;
  }
  return codeFallback;
}

/**
 * Saves a flight booking reservation into Firestore database and local cache
 */
export async function saveBookingToDatabase(booking) {
  const pnrCode = booking.pnr ? booking.pnr.toUpperCase() : 'RB' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours hold

  const originCode = extractAirportCode(booking.origin, 'JFK');
  const originCity = extractAirportCity(booking.originCity, extractAirportCity(booking.origin, originCode));
  const destCode = extractAirportCode(booking.destination, 'LHR');
  const destCity = extractAirportCity(booking.destinationCity, extractAirportCity(booking.destination, destCode));

  const bookingRecord = {
    pnr: pnrCode,
    passengerName: booking.passengerName || 'Valued Passenger',
    passengerEmail: (booking.passengerEmail || '').toLowerCase().trim(),
    passengerPhone: booking.passengerPhone || '',
    passengerDob: booking.passengerDob || '',
    passengerPassport: booking.passengerPassport || '',
    passengersList: booking.passengersList || [],
    adultsCount: Number(booking.adultsCount) || 1,
    childrenCount: Number(booking.childrenCount) || 0,
    infantsCount: Number(booking.infantsCount) || 0,
    flightNumber: booking.flightNumber || 'FL' + Math.floor(100 + Math.random() * 900),
    airline: booking.airline || 'Partner Airline',
    origin: originCode,
    originCity: originCity,
    destination: destCode,
    destinationCity: destCity,
    departDate: booking.departDate || new Date().toISOString().split('T')[0],
    returnDate: booking.returnDate || null,
    tripType: booking.tripType || 'round',
    cabinClass: booking.cabinClass || 'Business Class',
    passengersCount: Number(booking.passengersCount) || 1,
    retailPrice: Number(booking.retailPrice) || 1200,
    royaPrice: Number(booking.royaPrice) || 840,
    savings: Number(booking.savings) || 360,
    aircraft: booking.aircraft || 'Boeing 787 Dreamliner',
    status: booking.status || 'CONFIRMED_HOLD',
    createdAt: booking.createdAt || now.toISOString(),
    holdExpiresAt: booking.holdExpiresAt || expires.toISOString()
  };

  // 1. Save to Firestore DB
  try {
    const docRef = doc(db, 'bookings', pnrCode);
    await setDoc(docRef, bookingRecord, { merge: true });
    console.log(`[Firestore] Successfully persisted booking PNR ${pnrCode}`);
  } catch (err) {
    console.warn(`[Firestore DB Warning] Could not reach remote database, utilizing local storage cache:`, err);
  }

  // 2. Local cache fallback
  try {
    const existingStr = localStorage.getItem('royabridge_bookings');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const updated = [bookingRecord, ...existing.filter(b => b.pnr !== pnrCode)];
    localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    localStorage.setItem('royabridge_latest_pnr', pnrCode);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // 3. Dispatch confirmation email to passenger if email provided
  if (booking.passengerEmail && booking.passengerEmail.trim()) {
    try {
      const emailRes = await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingRecord,
          seatPreference: booking.seatPreference,
          mealPreference: booking.mealPreference,
          selectedAddOns: booking.selectedAddOns
        })
      });
      const emailData = await emailRes.json();
      if (emailData && emailData.success) {
        console.log(`[Email Confirmation] Successfully triggered confirmation email for PNR ${pnrCode}`);
        bookingRecord.emailSent = true;
        bookingRecord.emailDetails = emailData;
      }
    } catch (emailErr) {
      console.warn(`[Email Confirmation Warning] Email endpoint request error:`, emailErr);
    }
  }

  return bookingRecord;
}

/**
 * Searches Firestore database for a booking by PNR code, email, or passenger name
 */
export async function lookupBookingFromDatabase(searchInput) {
  if (!searchInput || !searchInput.trim()) {
    throw new Error('Please enter a PNR reference code, full name, or email address.');
  }

  const clean = searchInput.trim();
  const cleanUpper = clean.toUpperCase();
  const cleanLower = clean.toLowerCase();

  // 1. Direct Firestore doc lookup by PNR
  try {
    const docRef = doc(db, 'bookings', cleanUpper);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return formatBookingResult(docSnap.data());
    }
  } catch (e) {
    console.warn('Firestore doc lookup error:', e);
  }

  // 2. Query Firestore collection by email or name
  try {
    const colRef = collection(db, 'bookings');
    
    // Query email
    const emailQ = query(colRef, where('passengerEmail', '==', cleanLower), limit(1));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return formatBookingResult(emailSnap.docs[0].data());
    }

    // Query name
    const nameQ = query(colRef, where('passengerName', '==', clean), limit(1));
    const nameSnap = await getDocs(nameQ);
    if (!nameSnap.empty) {
      return formatBookingResult(nameSnap.docs[0].data());
    }
  } catch (e) {
    console.warn('Firestore collection query error:', e);
  }

  // 3. Fallback check in localStorage
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localBookings = JSON.parse(localStr);
      const matched = localBookings.find(b => 
        b.pnr?.toUpperCase() === cleanUpper || 
        b.passengerEmail?.toLowerCase() === cleanLower ||
        b.passengerName?.toLowerCase().includes(cleanLower)
      );
      if (matched) {
        return formatBookingResult(matched);
      }
    }
  } catch (e) {
    console.warn('LocalStorage lookup error:', e);
  }

  return null;
}

/**
 * Updates a booking's payment status to PAID with Flutterwave transaction details
 */
export async function updateBookingPaymentStatus(pnr, paymentData) {
  const pnrCode = (pnr || '').toUpperCase();
  if (!pnrCode) throw new Error('PNR reference is required');

  const nowISO = new Date().toISOString();
  const paymentRecord = {
    status: 'PAID_TICKET_ISSUED',
    isPaid: true,
    paymentMethod: 'Flutterwave',
    flwTransactionId: paymentData?.transaction_id || paymentData?.flw_ref || 'FLW-' + Date.now(),
    flwTxRef: paymentData?.tx_ref || 'RB-FLW-' + pnrCode,
    paidAt: nowISO,
    paidAmount: paymentData?.amount || null,
    paidCurrency: paymentData?.currency || 'USD'
  };

  // 1. Update Firestore DB
  try {
    const docRef = doc(db, 'bookings', pnrCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const updatedData = {
        ...docSnap.data(),
        ...paymentRecord,
        updatedAt: nowISO
      };
      await setDoc(docRef, updatedData, { merge: true });
      console.log(`[Firestore DB] Updated payment status for PNR ${pnrCode} to PAID via Flutterwave`);
    }
  } catch (err) {
    console.warn(`[Firestore DB Warning] Could not update payment status in remote database:`, err);
  }

  // 2. Update LocalStorage
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localBookings = JSON.parse(localStr);
      const updatedList = localBookings.map(b => {
        if (b.pnr?.toUpperCase() === pnrCode) {
          return {
            ...b,
            ...paymentRecord,
            updatedAt: nowISO
          };
        }
        return b;
      });
      localStorage.setItem('royabridge_bookings', JSON.stringify(updatedList));
    }
  } catch (e) {
    console.warn('LocalStorage payment update error:', e);
  }

  return { success: true, pnr: pnrCode, ...paymentRecord };
}

function formatBookingResult(raw) {
  const expiresAt = raw.holdExpiresAt ? new Date(raw.holdExpiresAt) : new Date(Date.now() + 20 * 3600 * 1000);
  const now = new Date();
  const diffHours = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const originCode = extractAirportCode(raw.origin, 'JFK');
  const originCity = extractAirportCity(raw.originCity, originCode);
  const destCode = extractAirportCode(raw.destination, 'LHR');
  const destCity = extractAirportCity(raw.destinationCity, destCode);

  return {
    ...raw,
    pnr: raw.pnr,
    passenger: raw.passengerName || 'Valued Passenger',
    email: raw.passengerEmail || '',
    phone: raw.passengerPhone || '',
    dob: raw.passengerDob || '',
    passport: raw.passengerPassport || '',
    origin: originCode,
    originCity: originCity,
    destination: destCode,
    destinationCity: destCity,
    route: `${originCode} (${originCity}) → ${destCode} (${destCity})`,
    flightNumber: raw.flightNumber || 'FL101',
    airline: raw.airline || 'Partner Airline',
    departDate: raw.departDate,
    returnDate: raw.returnDate,
    cabin: raw.cabinClass,
    passengers: raw.passengersCount || 1,
    status: raw.status || 'CONFIRMED_HOLD',
    holdExpires: `${diffHours > 0 ? diffHours : 1} Hours Remaining`,
    totalFare: raw.royaPrice,
    savedAmount: raw.savings,
    retailFare: raw.retailPrice
  };
}

/**
 * Build a flight status object directly from an existing booking record
 */
function buildStatusFromBooking(b) {
  const originCode = extractAirportCode(b.origin, 'JFK');
  const originCity = extractAirportCity(b.originCity, originCode);
  const destCode = extractAirportCode(b.destination, 'LHR');
  const destCity = extractAirportCity(b.destinationCity, destCode);
  const airlineCode = (b.flightNumber || 'FL').substring(0, 2).toUpperCase();

  return {
    flightNumber: b.flightNumber || 'FL101',
    pnr: b.pnr,
    passengerName: b.passengerName,
    airline: b.airline || 'Partner Airline',
    airlineCode: airlineCode,
    origin: originCode,
    originCity: originCity,
    destination: destCode,
    destinationCity: destCity,
    status: b.isPaid || b.status === 'PAID_TICKET_ISSUED' ? 'Ticket Issued / Scheduled' : 'Confirmed Hold / En Route',
    departureTerminal: 'Terminal ' + ((Math.abs(b.pnr?.charCodeAt(0) || 1) % 4) + 1),
    departureGate: 'Gate ' + String.fromCharCode(65 + ((b.flightNumber?.length || 3) % 6)) + (12 + ((b.pnr?.length || 6) * 3) % 30),
    scheduledDeparture: b.departDate ? `${b.departDate} 08:30 AM` : '08:30 AM',
    estimatedArrival: b.departDate ? `${b.departDate} 08:45 PM` : '08:45 PM',
    aircraft: b.aircraft || 'Boeing 787 Dreamliner',
    altitude: '38,000 ft',
    speed: '540 mph',
    progressPercent: 68,
    royaPrice: b.royaPrice || 840,
    retailPrice: b.retailPrice || 1200,
    pnrVerified: true,
    isPersistedBooking: true
  };
}

/**
 * Generates a realistic flight status record based on carrier codes and route digits
 */
export function generateRealisticFlightStatus(flightNumber, dateStr) {
  const cleaned = (flightNumber || 'FL101').trim().toUpperCase();
  const carrierCode = cleaned.substring(0, 2);
  const numPart = parseInt(cleaned.replace(/\D/g, '') || '101', 10);

  const CARRIER_MAP = {
    EK: { name: 'Emirates', origin: 'DXB', originCity: 'Dubai', dest: 'JFK', destCity: 'New York', aircraft: 'Airbus A380-800' },
    BA: { name: 'British Airways', origin: 'LHR', originCity: 'London', dest: 'JFK', destCity: 'New York', aircraft: 'Boeing 787-9' },
    QR: { name: 'Qatar Airways', origin: 'DOH', originCity: 'Doha', dest: 'LHR', destCity: 'London', aircraft: 'Airbus A350-1000' },
    DL: { name: 'Delta Air Lines', origin: 'JFK', originCity: 'New York', dest: 'LAX', destCity: 'Los Angeles', aircraft: 'Boeing 767-400' },
    UA: { name: 'United Airlines', origin: 'ORD', originCity: 'Chicago', dest: 'LHR', destCity: 'London', aircraft: 'Boeing 777-300ER' },
    SQ: { name: 'Singapore Airlines', origin: 'SIN', originCity: 'Singapore', dest: 'LHR', destCity: 'London', aircraft: 'Airbus A380-800' },
    LH: { name: 'Lufthansa', origin: 'FRA', originCity: 'Frankfurt', dest: 'JFK', destCity: 'New York', aircraft: 'Boeing 747-8' },
    AF: { name: 'Air France', origin: 'CDG', originCity: 'Paris', dest: 'JFK', destCity: 'New York', aircraft: 'Boeing 777-300ER' },
    EY: { name: 'Etihad Airways', origin: 'AUH', originCity: 'Abu Dhabi', dest: 'LHR', destCity: 'London', aircraft: 'Boeing 787-10' },
    VS: { name: 'Virgin Atlantic', origin: 'LHR', originCity: 'London', dest: 'JFK', destCity: 'New York', aircraft: 'Airbus A350-1000' },
    TK: { name: 'Turkish Airlines', origin: 'IST', originCity: 'Istanbul', dest: 'JFK', destCity: 'New York', aircraft: 'Boeing 787-9' },
    ET: { name: 'Ethiopian Airlines', origin: 'ADD', originCity: 'Addis Ababa', dest: 'LHR', destCity: 'London', aircraft: 'Airbus A350-900' },
    P4: { name: 'Air Peace', origin: 'LOS', originCity: 'Lagos', dest: 'LHR', destCity: 'London', aircraft: 'Boeing 777-200ER' },
    AT: { name: 'Royal Air Maroc', origin: 'CMN', originCity: 'Casablanca', dest: 'JFK', destCity: 'New York', aircraft: 'Boeing 787-9' }
  };

  const carrier = CARRIER_MAP[carrierCode] || {
    name: 'Global Partner Airline',
    origin: (numPart % 2 === 0 ? 'LOS' : 'JFK'),
    originCity: (numPart % 2 === 0 ? 'Lagos' : 'New York'),
    dest: (numPart % 2 === 0 ? 'DXB' : 'LHR'),
    destCity: (numPart % 2 === 0 ? 'Dubai' : 'London'),
    aircraft: 'Boeing 787 Dreamliner'
  };

  const depHour = (8 + (numPart % 10)).toString().padStart(2, '0');
  const arrHour = (16 + (numPart % 6)).toString().padStart(2, '0');
  const dateVal = dateStr || new Date().toISOString().split('T')[0];

  return {
    flightNumber: cleaned,
    airline: carrier.name,
    airlineCode: carrierCode,
    origin: carrier.origin,
    originCity: carrier.originCity,
    destination: carrier.dest,
    destinationCity: carrier.destCity,
    status: 'En Route',
    departureTerminal: 'Terminal ' + ((numPart % 4) + 1),
    departureGate: 'Gate ' + String.fromCharCode(65 + (numPart % 5)) + (10 + (numPart % 20)),
    scheduledDeparture: `${dateVal} ${depHour}:30 AM`,
    estimatedArrival: `${dateVal} ${arrHour}:45 PM`,
    aircraft: carrier.aircraft,
    altitude: `${34000 + (numPart % 5) * 1000} ft`,
    speed: `${520 + (numPart % 4) * 15} mph`,
    progressPercent: 40 + (numPart % 50),
    royaPrice: 650 + (numPart % 30) * 10,
    retailPrice: 950 + (numPart % 40) * 10,
    pnrVerified: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Looks up flight status dynamically by checking saved bookings first in Firestore and local storage,
 * and caching generated/persisted statuses so real routes are returned instead of static defaults.
 */
export async function lookupFlightStatusFromDatabase(flightInput, dateStr) {
  if (!flightInput) return null;
  const clean = flightInput.trim().toUpperCase();
  if (!clean) return null;

  // 1. Check if there is an existing booking in Firestore with matching flightNumber or PNR
  try {
    const colRef = collection(db, 'bookings');
    const flightQ = query(colRef, where('flightNumber', '==', clean), limit(1));
    const flightSnap = await getDocs(flightQ);
    if (!flightSnap.empty) {
      return buildStatusFromBooking(flightSnap.docs[0].data());
    }
    const pnrQ = query(colRef, where('pnr', '==', clean), limit(1));
    const pnrSnap = await getDocs(pnrQ);
    if (!pnrSnap.empty) {
      return buildStatusFromBooking(pnrSnap.docs[0].data());
    }
  } catch (e) {
    console.warn('Firestore flight status query warning:', e);
  }

  // 2. Check localStorage bookings
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localBookings = JSON.parse(localStr);
      const matched = localBookings.find(b => 
        b.flightNumber?.toUpperCase() === clean || 
        b.pnr?.toUpperCase() === clean
      );
      if (matched) {
        return buildStatusFromBooking(matched);
      }
    }
  } catch (e) {
    console.warn('LocalStorage flight status booking check warning:', e);
  }

  // 3. Check persistent flight status collection in Firestore
  try {
    const docRef = doc(db, 'flight_statuses', clean);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.warn('Firestore flight status doc lookup warning:', e);
  }

  // 4. Check localStorage flight statuses cache
  try {
    const cachedStatusesStr = localStorage.getItem('royabridge_flight_statuses');
    if (cachedStatusesStr) {
      const cache = JSON.parse(cachedStatusesStr);
      if (cache[clean]) {
        return cache[clean];
      }
    }
  } catch (e) {
    console.warn('LocalStorage flight status cache lookup warning:', e);
  }

  return null;
}

/**
 * Saves or updates a flight status record in Firestore and localStorage
 */
export async function saveFlightStatusToDatabase(flightStatusRecord) {
  if (!flightStatusRecord || !flightStatusRecord.flightNumber) return flightStatusRecord;
  const cleanKey = flightStatusRecord.flightNumber.toUpperCase();

  // 1. Save to Firestore
  try {
    const docRef = doc(db, 'flight_statuses', cleanKey);
    await setDoc(docRef, {
      ...flightStatusRecord,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore saveFlightStatus error:', e);
  }

  // 2. Save to LocalStorage
  try {
    const cachedStatusesStr = localStorage.getItem('royabridge_flight_statuses');
    const cache = cachedStatusesStr ? JSON.parse(cachedStatusesStr) : {};
    cache[cleanKey] = {
      ...flightStatusRecord,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('royabridge_flight_statuses', JSON.stringify(cache));
  } catch (e) {
    console.warn('LocalStorage saveFlightStatus error:', e);
  }

  return flightStatusRecord;
}
