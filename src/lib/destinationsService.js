import { db, doc, setDoc, getDoc, collection, getDocs, query } from './firebase';
import { DESTINATIONS as SEED_DESTINATIONS, POPULAR_AIRPORTS as SEED_AIRPORTS } from '../data/destinations';

/**
 * Seeds all destination data into Firebase Firestore if not already present
 */
export async function seedDestinationsToFirestore() {
  console.log('[Firestore] Seeding destinations and airports data to Firebase Store...');
  let destinationsSeeded = 0;
  let airportsSeeded = 0;

  // 1. Seed Destinations
  try {
    for (const dest of SEED_DESTINATIONS) {
      const docRef = doc(db, 'destinations', dest.id);
      await setDoc(docRef, dest, { merge: true });
      destinationsSeeded++;
    }
    console.log(`[Firestore] Successfully seeded ${destinationsSeeded} destinations.`);
  } catch (err) {
    console.warn('[Firestore Seed Destinations Warning]:', err);
  }

  // 2. Seed Airports
  try {
    for (const airport of SEED_AIRPORTS) {
      const docRef = doc(db, 'airports', airport.code);
      await setDoc(docRef, airport, { merge: true });
      airportsSeeded++;
    }
    console.log(`[Firestore] Successfully seeded ${airportsSeeded} airports.`);
  } catch (err) {
    console.warn('[Firestore Seed Airports Warning]:', err);
  }

  return { destinationsSeeded, airportsSeeded };
}

/**
 * Fetches all destination records directly from Firebase Firestore
 */
export async function fetchDestinationsFromFirestore() {
  try {
    const colRef = collection(db, 'destinations');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const list = snap.docs.map(d => d.data());
      console.log(`[Firestore] Retrieved ${list.length} destinations directly from Firebase Store.`);
      return list;
    } else {
      // If collection is empty, trigger auto-seed and return seed list
      await seedDestinationsToFirestore();
      return SEED_DESTINATIONS;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching destinations, using server API fallback:', err);
    try {
      const apiRes = await fetch('/api/destinations');
      const apiData = await apiRes.json();
      if (apiData.success && Array.isArray(apiData.destinations)) {
        return apiData.destinations;
      }
    } catch (e) {
      console.warn('API fallback error:', e);
    }
    return SEED_DESTINATIONS;
  }
}

/**
 * Fetches all popular airports directly from Firebase Firestore
 */
export async function fetchAirportsFromFirestore() {
  try {
    const colRef = collection(db, 'airports');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const list = snap.docs.map(d => d.data());
      console.log(`[Firestore] Retrieved ${list.length} popular airports directly from Firebase Store.`);
      return list;
    } else {
      await seedDestinationsToFirestore();
      return SEED_AIRPORTS;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching airports:', err);
    return SEED_AIRPORTS;
  }
}
