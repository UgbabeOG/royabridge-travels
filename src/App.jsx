import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlightSearchForm from './components/FlightSearchForm';
import RealTimeFlightResults from './components/RealTimeFlightResults';
import FeatureGrid from './components/FeatureGrid';
import DestinationExplorer from './components/DestinationExplorer';
import FlightStatusSection from './components/FlightStatusSection';
import UserReviews from './components/UserReviews';
import ReserveModal from './components/ReserveModal';
import BookingTracker from './components/BookingTracker';
import ConciergeChat from './components/ConciergeChat';
import ContactModal from './components/ContactModal';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import { POPULAR_AIRPORTS } from './data/destinations';

export default function App() {
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
      // Parallel API requests to flight search & price trends
      const [searchRes, trendRes] = await Promise.all([
        fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query)
        }),
        fetch('/api/flights/price-trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: query.origin, destination: query.destination, cabinClass: query.cabinClass })
        })
      ]);

      const searchData = await searchRes.json();
      const trendData = await trendRes.json();

      if (searchData.success && searchData.flights) {
        setFlights(searchData.flights);
      } else {
        setSearchError(searchData.error || 'No flights found for this route');
      }

      if (trendData.success) {
        setPriceTrend(trendData);
      }

    } catch (err) {
      console.error("Flight search API failed:", err);
      setSearchError("Failed to connect to real-time flight search API.");
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

      {/* Main Hero */}
      <Hero 
        onStartSearch={scrollToSearch}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Core Concierge Booking Search Engine */}
      <FlightSearchForm 
        onSearchFlights={handleSearchFlights}
        loading={searchLoading}
      />

      {/* Real-Time Live Flight Search Results & Price Comparison */}
      <RealTimeFlightResults 
        flights={flights}
        searchQuery={searchQuery}
        loading={searchLoading}
        error={searchError}
        priceTrend={priceTrend}
        onSelectFlight={handleSelectFlight}
      />

      {/* Brand Value Grid (Save up to 30%, Reserve before payment, etc.) */}
      <FeatureGrid 
        onOpenSearch={scrollToSearch}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Destination & Savings Visualizer */}
      <DestinationExplorer 
        onSelectDestination={handleSelectDestination}
      />

      {/* Flight Status Lookup Section */}
      <FlightStatusSection 
        onSelectFlight={handleSelectFlight}
      />

      {/* Customer Feedback & Reviews Section */}
      <UserReviews 
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* FAQ Section with SEO JSON-LD Microdata support */}
      <FAQSection />

      {/* Footer */}
      <Footer 
        onOpenChat={() => setIsChatOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Reserve Before Payment Itinerary Hold Modal */}
      {reserveModalData && (
        <ReserveModal 
          data={reserveModalData}
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
