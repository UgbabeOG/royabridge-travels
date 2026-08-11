import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlightSearchForm from './components/FlightSearchForm';
import RealTimeFlightResults from './components/RealTimeFlightResults';
import FeatureGrid from './components/FeatureGrid';
import DestinationExplorer from './components/DestinationExplorer';
import UserReviews from './components/UserReviews';
import ReserveModal from './components/ReserveModal';
import BookingTracker from './components/BookingTracker';
import ConciergeChat from './components/ConciergeChat';
import ContactModal from './components/ContactModal';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import AnimatedSection from './components/AnimatedSection';
import { POPULAR_AIRPORTS } from './data/destinations';
import { generateClientSideFlights, generateClientSidePriceTrend } from './utils/pnrGenerator';
import { CacheManager } from './utils/cacheManager';

export default function App() {
  const [currency, setCurrency] = useState('USD');
  const [reserveModalData, setReserveModalData] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = 'success', title, message, pnr, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message, pnr, duration }]);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real-time Flight Search API State
  const [searchQuery, setSearchQuery] = useState({
    origin: 'JFK',
    destination: 'LHR',
    departDate: '2026-08-15',
    returnDate: '2026-08-29',
    tripType: 'round',
    cabinClass: 'Business',
    passengers: 1
  });
  const [flights, setFlights] = useState([]);
  const [priceTrend, setPriceTrend] = useState(null);
  const [groundingSources, setGroundingSources] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Perform initial search on load
  useEffect(() => {
    executeFlightSearch(searchQuery);
  }, []);

  const executeFlightSearch = async (query) => {
    setSearchLoading(true);
    setSearchError('');
    setSearchQuery(query);

    try {
      // Parallel API requests with forceFresh bypass to guarantee fresh grounded Google Flights & price data
      const isFresh = query.forceFresh !== false;
      const [searchRes, trendRes] = await Promise.all([
        CacheManager.cachedFetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...query, forceFresh: isFresh })
        }, isFresh ? 0 : 60),
        CacheManager.cachedFetch('/api/flights/price-trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: query.origin,
            destination: query.destination,
            cabinClass: query.cabinClass,
            departDate: query.departDate,
            returnDate: query.returnDate,
            forceFresh: isFresh
          })
        }, isFresh ? 0 : 300)
      ]);

      const searchData = searchRes.data;
      const trendData = trendRes.data;

      if (searchData && searchData.success && searchData.flights) {
        setFlights(searchData.flights);
        if (searchData.groundingSources && Array.isArray(searchData.groundingSources)) {
          setGroundingSources(searchData.groundingSources);
        }
      } else {
        throw new Error(searchData?.error || 'No flights found for this route');
      }

      if (trendData && trendData.success) {
        setPriceTrend(trendData);
        if ((!searchData?.groundingSources || searchData.groundingSources.length === 0) && trendData.groundingSources) {
          setGroundingSources(trendData.groundingSources);
        }
      }

    } catch (err) {
      console.warn("Flight search API failed, falling back to local simulation engine:", err);
      try {
        const fallbackFlights = generateClientSideFlights(query).map(f => ({
          ...f,
          source: 'client_simulation',
          isLive: false
        }));
        const fallbackTrend = generateClientSidePriceTrend(query.origin, query.destination, query.cabinClass);
        setFlights(fallbackFlights);
        setPriceTrend(fallbackTrend);
        setGroundingSources(fallbackTrend.groundingSources || []);
      } catch (fallbackErr) {
        console.error("Fallback generator also failed:", fallbackErr);
        setSearchError("Failed to connect to real-time flight search API.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFlights = (queryData) => {
    executeFlightSearch(queryData);
    
    // Smooth scroll down to real-time results
    setTimeout(() => {
      const el = document.getElementById('realtime-results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleSelectFlight = (flight) => {
    const originObj = POPULAR_AIRPORTS.find(a => a.code === flight.origin) || { code: flight.origin, city: flight.origin, name: flight.origin };
    const destObj = POPULAR_AIRPORTS.find(a => a.code === flight.destination) || { code: flight.destination, city: flight.destination, name: flight.destination };

    setReserveModalData({
      tripType: searchQuery.tripType || 'round',
      origin: originObj,
      destination: destObj,
      departDate: searchQuery.departDate || '2026-08-15',
      returnDate: searchQuery.returnDate || '2026-08-29',
      passengers: searchQuery.passengers || 1,
      cabinClass: flight.cabinClass || searchQuery.cabinClass || 'Business',
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      aircraft: flight.aircraft,
      timeSlot: flight.timeSlot || 'Live Grounded Flight',
      groundingSources: groundingSources && groundingSources.length > 0 ? groundingSources : [
        { title: `Google Flights - ${flight.origin} to ${flight.destination}`, url: `https://www.google.com/travel/flights?q=flights+from+${flight.origin}+to+${flight.destination}` },
        { title: 'IATA Global Distribution Systems (GDS)', url: 'https://www.iata.org' }
      ],
      isGrounded: true,
      reserveBeforePayment: true,
      savings: {
        originalPrice: flight.retailPrice,
        discountAmount: flight.savings || Math.round(flight.retailPrice * 0.30),
        finalPrice: flight.royaPrice,
        savingsPercentage: 30
      }
    });
  };

  const handleSelectDestination = (dest) => {
    const code = dest.airport.split(' ')[0];
    const newQuery = {
      origin: 'JFK',
      destination: code,
      departDate: '2026-08-20',
      returnDate: '2026-09-03',
      tripType: 'round',
      cabinClass: 'Business',
      passengers: 1
    };
    executeFlightSearch(newQuery);

    const el = document.getElementById('realtime-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSearch = () => {
    const el = document.getElementById('reserve');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Navigation */}
      <Navbar 
        onOpenSearch={scrollToSearch}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main id="main-content" style={{ flex: 1 }}>
        {/* Main Hero */}
        <AnimatedSection>
          <Hero 
            onStartSearch={scrollToSearch}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </AnimatedSection>

        {/* Core Concierge Booking Search Engine */}
        <AnimatedSection>
          <FlightSearchForm 
            onSearchFlights={handleSearchFlights}
            loading={searchLoading}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </AnimatedSection>

        {/* Real-Time Live Flight Search Results & Price Comparison */}
        <AnimatedSection>
          <RealTimeFlightResults 
            flights={flights}
            searchQuery={searchQuery}
            loading={searchLoading}
            error={searchError}
            priceTrend={priceTrend}
            groundingSources={groundingSources}
            onSelectFlight={handleSelectFlight}
            currency={currency}
          />
        </AnimatedSection>

        {/* Brand Value Grid (Save up to 30%, Reserve before payment, etc.) */}
        <AnimatedSection>
          <FeatureGrid 
            onOpenSearch={scrollToSearch}
            onOpenChat={() => setIsChatOpen(true)}
          />
        </AnimatedSection>

        {/* Destination & Savings Visualizer */}
        <AnimatedSection>
          <DestinationExplorer 
            onSelectDestination={handleSelectDestination}
            currency={currency}
          />
        </AnimatedSection>

        {/* Customer Feedback & Reviews Section */}
        <AnimatedSection>
          <UserReviews 
            onOpenChat={() => setIsChatOpen(true)}
          />
        </AnimatedSection>

        {/* FAQ Section with SEO JSON-LD Microdata support */}
        <AnimatedSection>
          <FAQSection />
        </AnimatedSection>
      </main>

      {/* Footer */}
      <Footer 
        onOpenChat={() => setIsChatOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />


      {/* Reserve Before Payment Itinerary Hold Modal */}
      {reserveModalData && (
        <ReserveModal 
          data={reserveModalData}
          currency={currency}
          showToast={showToast}
          onClose={() => setReserveModalData(null)}
          onOpenChat={() => {
            setReserveModalData(null);
            setIsChatOpen(true);
          }}
        />
      )}

      {/* PNR Booking Tracker & Live Flight Status Modal */}
      <BookingTracker 
        isOpen={isTrackerOpen}
        currency={currency}
        showToast={showToast}
        onClose={() => setIsTrackerOpen(false)}
        onOpenChat={() => {
          setIsTrackerOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Contact Us Dialog (Phone & Email options) */}
      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenChat={() => {
          setIsContactOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Concierge Messaging Assistant ("Send us a message") */}
      <ConciergeChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastNotification 
        toasts={toasts} 
        onDismiss={handleDismissToast} 
      />

    </div>
  );
}
