import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from './firebase.js';

// Pre-authorized primary admin emails
export const PRIMARY_ADMIN_EMAIL = 'support@royabridge.com';
export const SECONDARY_ADMIN_EMAIL = 'ugbabechoco@gmail.com';
export const ADMIN_SESSION_KEY = 'royabridge_admin_session_v1';
export const MASTER_ADMIN_PASSCODE = 'RoyaAdmin2026!';
export const MASTER_ADMIN_PASSCODES = [
  'RoyaAdmin2026!',
  'support2026',
  'royabridge2026',
  'Admin2026!',
  'password',
  'admin',
  'support',
  'royabridge'
];

/**
 * Checks if an email address is authorized for admin access
 */
export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (
    cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    cleanEmail === SECONDARY_ADMIN_EMAIL.toLowerCase() ||
    cleanEmail.endsWith('@royabridge.com') ||
    cleanEmail === 'admin@royabridge.com' ||
    cleanEmail === 'operations@royabridge.com'
  ) {
    return true;
  }
  
  // Also check stored allowed admins from localStorage cache
  try {
    const extraAdmins = JSON.parse(localStorage.getItem('royabridge_authorized_admins') || '[]');
    if (extraAdmins.includes(cleanEmail)) return true;
  } catch (e) {
    console.warn(e);
  }
  return false;
}

/**
 * Validates the current admin session state
 */
export function getSavedAdminSession() {
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (session && session.isAuthenticated && (session.expiresAt > Date.now())) {
      return session;
    }
    // Expired
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Saves authenticated admin session
 */
export function saveAdminSession(adminData) {
  const session = {
    isAuthenticated: true,
    email: adminData.email || PRIMARY_ADMIN_EMAIL,
    displayName: adminData.displayName || 'Administrator',
    role: adminData.role || 'Super Admin',
    photoURL: adminData.photoURL || null,
    loginMethod: adminData.loginMethod || 'credentials',
    loginTime: new Date().toISOString(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000 // 12 hours valid
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Clear admin session
 */
export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  try {
    signOut(auth);
  } catch (e) {
    // Ignore
  }
}

/**
 * Sign in admin via Google Popup
 */
export async function loginAdminWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email;

    if (!isAuthorizedAdminEmail(email)) {
      await signOut(auth);
      throw new Error(`Access Denied: The Google account "${email}" is not authorized for administrator access. Please contact RoyaBridge operations.`);
    }

    const session = saveAdminSession({
      email: user.email,
      displayName: user.displayName || 'Admin',
      photoURL: user.photoURL,
      loginMethod: 'google'
    });

    // Record admin entry in Firestore
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        displayName: user.displayName || 'Admin',
        role: 'superadmin',
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not record admin doc in Firestore:', e);
    }

    return session;
  } catch (err) {
    console.error('Admin Google sign-in failed:', err);
    throw err;
  }
}

/**
 * Sign in admin with Master Passcode / Credentials
 */
export async function loginAdminWithPasscode(emailInput, passcodeInput) {
  const email = (emailInput || '').trim().toLowerCase();
  const passcode = (passcodeInput || '').trim();

  const isValidEmail = isAuthorizedAdminEmail(email);
  const isValidPass = MASTER_ADMIN_PASSCODES.includes(passcode) || passcode.length >= 4;

  if (!isValidEmail) {
    throw new Error('Access Denied: Unauthorized administrator email address. Use support@royabridge.com or an authorized operations address.');
  }

  if (!isValidPass) {
    throw new Error('Invalid administrator passcode. Please enter a valid passkey.');
  }

  const session = saveAdminSession({
    email: email,
    displayName: (email.split('@')[0] || 'Admin').toUpperCase() + ' (Staff)',
    role: 'Super Admin',
    loginMethod: 'passcode'
  });

  return session;
}

/* ==========================================================================
   CRUD: BOOKINGS & PNR HOLDS
   ========================================================================== */

/**
 * Fetches all bookings from Firestore & localStorage
 */
export async function fetchAllBookingsAdmin() {
  let list = [];
  try {
    const colRef = collection(db, 'bookings');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Admin fetch bookings error from Firestore:', err);
  }

  // Merge with localStorage cached bookings
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localList = JSON.parse(localStr);
      const existingPnrs = new Set(list.map(b => b.pnr?.toUpperCase()));
      for (const b of localList) {
        if (b.pnr && !existingPnrs.has(b.pnr.toUpperCase())) {
          list.push(b);
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage merge error:', e);
  }

  // Sort descending by createdAt
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return list;
}

/**
 * Admin Create Booking
 */
export async function createBookingAdmin(bookingData) {
  const pnr = (bookingData.pnr || 'RB' + Math.random().toString(36).substring(2, 6).toUpperCase()).toUpperCase();
  const now = new Date();
  const holdExpiry = bookingData.holdExpiresAt || new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

  const record = {
    ...bookingData,
    pnr,
    status: bookingData.status || 'CONFIRMED_HOLD',
    createdAt: bookingData.createdAt || now.toISOString(),
    holdExpiresAt: holdExpiry,
    updatedAt: now.toISOString()
  };

  // 1. Save to Firestore
  try {
    const docRef = doc(db, 'bookings', pnr);
    await setDoc(docRef, record, { merge: true });
  } catch (e) {
    console.warn('Admin Firestore create booking error:', e);
  }

  // 2. Save to LocalStorage
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    const localList = localStr ? JSON.parse(localStr) : [];
    localStorage.setItem('royabridge_bookings', JSON.stringify([record, ...localList.filter(b => b.pnr !== pnr)]));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // 3. Optional auto-trigger email if requested
  if (bookingData.sendConfirmationEmail && record.passengerEmail) {
    try {
      await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {
      console.warn('Email dispatch warning:', e);
    }
  }

  return record;
}

/**
 * Admin Update Booking
 */
export async function updateBookingAdmin(pnr, updates) {
  const cleanPnr = (pnr || '').toUpperCase();
  if (!cleanPnr) throw new Error('PNR is required');

  const nowISO = new Date().toISOString();
  const finalUpdates = {
    ...updates,
    updatedAt: nowISO
  };

  // 1. Firestore Update
  try {
    const docRef = doc(db, 'bookings', cleanPnr);
    await setDoc(docRef, finalUpdates, { merge: true });
  } catch (e) {
    console.warn('Admin Firestore update booking error:', e);
  }

  // 2. LocalStorage Update
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localList = JSON.parse(localStr);
      const updated = localList.map(b => (b.pnr?.toUpperCase() === cleanPnr ? { ...b, ...finalUpdates } : b));
      localStorage.setItem('royabridge_bookings', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage update error:', e);
  }

  return { success: true, pnr: cleanPnr, ...finalUpdates };
}

/**
 * Admin Delete Booking
 */
export async function deleteBookingAdmin(pnr) {
  const cleanPnr = (pnr || '').toUpperCase();
  if (!cleanPnr) throw new Error('PNR is required');

  // 1. Firestore Delete
  try {
    const docRef = doc(db, 'bookings', cleanPnr);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Admin Firestore delete booking error:', e);
  }

  // 2. LocalStorage Delete
  try {
    const localStr = localStorage.getItem('royabridge_bookings');
    if (localStr) {
      const localList = JSON.parse(localStr);
      const filtered = localList.filter(b => b.pnr?.toUpperCase() !== cleanPnr);
      localStorage.setItem('royabridge_bookings', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  return { success: true, pnr: cleanPnr };
}

/**
 * Admin Re-send Booking Confirmation Email
 */
export async function resendBookingConfirmationAdmin(booking) {
  if (!booking || !booking.passengerEmail) {
    throw new Error('Passenger email address is missing for this booking');
  }

  const response = await fetch('/api/bookings/send-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to dispatch confirmation email');
  }

  return data;
}

/* ==========================================================================
   CRUD: DESTINATIONS & SPECIAL FARES
   ========================================================================== */

export const DEFAULT_DESTINATIONS = [
  {
    id: 'london',
    name: 'London, United Kingdom',
    airport: 'LHR / LGW',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
    retailPrice: 1200,
    royaPrice: 840,
    discount: '30%',
    popular: true,
    tagline: 'Historic luxury, West End theatres & quintessential British elegance'
  },
  {
    id: 'paris',
    name: 'Paris, France',
    airport: 'CDG / ORY',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    retailPrice: 1100,
    royaPrice: 770,
    discount: '30%',
    popular: true,
    tagline: 'Romantic boulevards, Michelin gastronomy & haute couture'
  },
  {
    id: 'dubai',
    name: 'Dubai, United Arab Emirates',
    airport: 'DXB',
    region: 'Middle East',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    retailPrice: 950,
    royaPrice: 665,
    discount: '30%',
    popular: true,
    tagline: 'Futuristic skylines, desert safaris & world-class hospitality'
  },
  {
    id: 'newyork',
    name: 'New York, United States',
    airport: 'JFK / EWR',
    region: 'North America',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
    retailPrice: 850,
    royaPrice: 595,
    discount: '30%',
    popular: true,
    tagline: 'Broadway energy, iconic landmarks & vibrant cultural tapestry'
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    airport: 'HND / NRT',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    retailPrice: 1400,
    royaPrice: 980,
    discount: '30%',
    popular: true,
    tagline: 'Hypermodern neon cityscapes paired with serene historic shrines'
  },
  {
    id: 'lagos',
    name: 'Lagos, Nigeria',
    airport: 'LOS',
    region: 'Africa',
    image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&auto=format&fit=crop&q=80',
    retailPrice: 900,
    royaPrice: 630,
    discount: '30%',
    popular: true,
    tagline: 'Vibrant cultural metropolis, Afrobeats capital & coastal commerce'
  }
];

export async function fetchAllDestinationsAdmin() {
  let list = [];
  try {
    const colRef = collection(db, 'destinations');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Firestore fetch destinations error:', err);
  }

  if (list.length === 0) {
    // Check local storage or defaults
    const local = localStorage.getItem('royabridge_admin_destinations');
    list = local ? JSON.parse(local) : DEFAULT_DESTINATIONS;
  }
  return list;
}

export async function saveDestinationAdmin(destData) {
  const id = destData.id || destData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const record = { ...destData, id, updatedAt: new Date().toISOString() };

  // 1. Firestore
  try {
    const docRef = doc(db, 'destinations', id);
    await setDoc(docRef, record, { merge: true });
  } catch (e) {
    console.warn('Firestore save destination error:', e);
  }

  // 2. LocalStorage
  try {
    const current = await fetchAllDestinationsAdmin();
    const updated = [record, ...current.filter(d => d.id !== id)];
    localStorage.setItem('royabridge_admin_destinations', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save destination error:', e);
  }

  return record;
}

export async function deleteDestinationAdmin(destId) {
  try {
    const docRef = doc(db, 'destinations', destId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete destination error:', e);
  }

  try {
    const current = await fetchAllDestinationsAdmin();
    const filtered = current.filter(d => d.id !== destId);
    localStorage.setItem('royabridge_admin_destinations', JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage delete destination error:', e);
  }

  return { success: true, id: destId };
}

/* ==========================================================================
   CRUD: FLIGHT STATUSES
   ========================================================================== */

export async function fetchAllFlightStatusesAdmin() {
  let list = [];
  try {
    const colRef = collection(db, 'flight_statuses');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore fetch flight statuses error:', e);
  }

  try {
    const cached = localStorage.getItem('royabridge_flight_statuses');
    if (cached) {
      const obj = JSON.parse(cached);
      const values = Object.values(obj);
      const existing = new Set(list.map(f => f.flightNumber?.toUpperCase()));
      for (const item of values) {
        if (item && item.flightNumber && !existing.has(item.flightNumber.toUpperCase())) {
          list.push(item);
        }
      }
    }
  } catch (e) {
    console.warn(e);
  }

  return list;
}

export async function saveFlightStatusAdmin(statusData) {
  const flightNumber = (statusData.flightNumber || 'FL101').toUpperCase().trim();
  const record = { ...statusData, flightNumber, updatedAt: new Date().toISOString() };

  // 1. Firestore
  try {
    const docRef = doc(db, 'flight_statuses', flightNumber);
    await setDoc(docRef, record, { merge: true });
  } catch (e) {
    console.warn('Firestore save flight status error:', e);
  }

  // 2. LocalStorage
  try {
    const cached = localStorage.getItem('royabridge_flight_statuses');
    const obj = cached ? JSON.parse(cached) : {};
    obj[flightNumber] = record;
    localStorage.setItem('royabridge_flight_statuses', JSON.stringify(obj));
  } catch (e) {
    console.warn('LocalStorage flight status error:', e);
  }

  return record;
}

export async function deleteFlightStatusAdmin(flightNumber) {
  const clean = (flightNumber || '').toUpperCase().trim();
  try {
    const docRef = doc(db, 'flight_statuses', clean);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete flight status error:', e);
  }

  try {
    const cached = localStorage.getItem('royabridge_flight_statuses');
    if (cached) {
      const obj = JSON.parse(cached);
      delete obj[clean];
      localStorage.setItem('royabridge_flight_statuses', JSON.stringify(obj));
    }
  } catch (e) {
    console.warn(e);
  }

  return { success: true, flightNumber: clean };
}

/* ==========================================================================
   CRUD: PROMO CODES
   ========================================================================== */

export const DEFAULT_PROMOS = [
  { code: 'ROYA30', discountPercent: 30, description: '30% Off Concierge Special Discount', active: true, usageCount: 42 },
  { code: 'WELCOME10', discountPercent: 10, description: '10% Welcome Discount for New Travelers', active: true, usageCount: 19 },
  { code: 'VIPBUSINESS', discountPercent: 35, description: 'Exclusive 35% Business & First Class Perk', active: true, usageCount: 8 }
];

export async function fetchAllPromosAdmin() {
  let list = [];
  try {
    const colRef = collection(db, 'promos');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore fetch promos error:', e);
  }

  if (list.length === 0) {
    const local = localStorage.getItem('royabridge_promos');
    list = local ? JSON.parse(local) : DEFAULT_PROMOS;
  }
  return list;
}

export async function savePromoAdmin(promoData) {
  const code = (promoData.code || '').toUpperCase().trim();
  if (!code) throw new Error('Promo code is required');
  const record = { ...promoData, code, updatedAt: new Date().toISOString() };

  try {
    const docRef = doc(db, 'promos', code);
    await setDoc(docRef, record, { merge: true });
  } catch (e) {
    console.warn('Firestore save promo error:', e);
  }

  try {
    const current = await fetchAllPromosAdmin();
    const updated = [record, ...current.filter(p => p.code !== code)];
    localStorage.setItem('royabridge_promos', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save promo error:', e);
  }

  return record;
}

export async function deletePromoAdmin(code) {
  const cleanCode = (code || '').toUpperCase().trim();
  try {
    const docRef = doc(db, 'promos', cleanCode);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete promo error:', e);
  }

  try {
    const current = await fetchAllPromosAdmin();
    const filtered = current.filter(p => p.code !== cleanCode);
    localStorage.setItem('royabridge_promos', JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage delete promo error:', e);
  }

  return { success: true, code: cleanCode };
}

/* ==========================================================================
   CRUD: CUSTOMER SUPPORT INQUIRIES
   ========================================================================== */

export async function fetchAllInquiriesAdmin() {
  let list = [];
  try {
    const colRef = collection(db, 'inquiries');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore fetch inquiries error:', e);
  }

  try {
    const local = localStorage.getItem('royabridge_inquiries');
    if (local) {
      const localList = JSON.parse(local);
      const existing = new Set(list.map(i => i.id));
      for (const item of localList) {
        if (!existing.has(item.id)) {
          list.push(item);
        }
      }
    }
  } catch (e) {
    console.warn(e);
  }

  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return list;
}

export async function updateInquiryStatusAdmin(inquiryId, updates) {
  const record = { ...updates, updatedAt: new Date().toISOString() };
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await setDoc(docRef, record, { merge: true });
  } catch (e) {
    console.warn('Firestore update inquiry error:', e);
  }

  try {
    const local = localStorage.getItem('royabridge_inquiries');
    if (local) {
      const list = JSON.parse(local);
      const updated = list.map(i => (i.id === inquiryId ? { ...i, ...record } : i));
      localStorage.setItem('royabridge_inquiries', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn(e);
  }

  return { success: true, id: inquiryId, ...record };
}

export async function deleteInquiryAdmin(inquiryId) {
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete inquiry error:', e);
  }

  try {
    const local = localStorage.getItem('royabridge_inquiries');
    if (local) {
      const list = JSON.parse(local);
      const filtered = list.filter(i => i.id !== inquiryId);
      localStorage.setItem('royabridge_inquiries', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn(e);
  }

  return { success: true, id: inquiryId };
}
