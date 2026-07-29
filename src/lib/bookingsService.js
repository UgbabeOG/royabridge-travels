import { db, doc, setDoc, getDoc, collection, query, where, getDocs, limit } from './firebase.js';

/**
 * Saves a flight booking reservation into Firestore database and local cache
 */
export async function saveBookingToDatabase(booking) {
  const pnrCode = booking.pnr ? booking.pnr.toUpperCase() : 'RB' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours hold

  const bookingRecord = {
    pnr: pnrCode,
    passengerName: booking.passengerName || 'Valued Passenger',
    passengerEmail: (booking.passengerEmail || '').toLowerCase().trim(),
    passengerPhone: booking.passengerPhone || '',
    flightNumber: booking.flightNumber || 'BA178',
    airline: booking.airline || 'British Airways',
    origin: booking.origin || 'JFK',
    originCity: booking.originCity || booking.origin || 'New York',
    destination: booking.destination || 'LHR',
    destinationCity: booking.destinationCity || booking.destination || 'London',
    departDate: booking.departDate || '2026-08-20',
    returnDate: booking.returnDate || null,
    tripType: booking.tripType || 'round',
    cabinClass: booking.cabinClass || 'Business Class',
    passengersCount: Number(booking.passengersCount) || 1,
    retailPrice: Number(booking.retailPrice) || 1200,
    royaPrice: Number(booking.royaPrice) || 840,
    savings: Number(booking.savings) || 360,
    aircraft: booking.aircraft || 'Boeing 787 Dreamliner',
    status: 'CONFIRMED_HOLD',
    createdAt: now.toISOString(),
    holdExpiresAt: expires.toISOString()
  };

  // 1. Save to Firestore DB
  try {
    const docRef = doc(db, 'bookings', pnrCode);
    await setDoc(docRef, bookingRecord);
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

function formatBookingResult(raw) {
  const expiresAt = raw.holdExpiresAt ? new Date(raw.holdExpiresAt) : new Date(Date.now() + 20 * 3600 * 1000);
  const now = new Date();
  const diffHours = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return {
    ...raw,
    pnr: raw.pnr,
    passenger: raw.passengerName,
    email: raw.passengerEmail,
    phone: raw.passengerPhone,
    route: `${raw.origin} (${raw.originCity || raw.origin}) → ${raw.destination} (${raw.destinationCity || raw.destination})`,
    flightNumber: raw.flightNumber,
    airline: raw.airline,
    departDate: raw.departDate,
    returnDate: raw.returnDate,
    cabin: raw.cabinClass,
    passengers: raw.passengersCount,
    status: raw.status || 'CONFIRMED_HOLD',
    holdExpires: `${diffHours > 0 ? diffHours : 1} Hours Remaining`,
    totalFare: raw.royaPrice,
    savedAmount: raw.savings,
    retailFare: raw.retailPrice
  };
}
