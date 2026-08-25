import React, { useState, useEffect } from 'react';
import { Home, ChevronRight, Compass, Plane, ShieldCheck, RefreshCw, PhoneCall, Search, Ticket } from 'lucide-react';

export default function BreadcrumbNav({ 
  searchQuery, 
  activeModal, // 'reserve' | 'tracker' | 'contact' | 'terms' | 'refunds' | null
  onNavigateHome,
  onNavigateSearch,
  onNavigateSection
}) {
  const [currentSection, setCurrentSection] = useState('concierge');

  // Track active page section via scroll observer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const destinationsEl = document.getElementById('destinations');
      const reviewsEl = document.getElementById('reviews');
      const faqEl = document.getElementById('faq');
      const resultsEl = document.getElementById('realtime-results');
      const reserveEl = document.getElementById('reserve');

      if (faqEl && scrollPos >= faqEl.offsetTop) {
        setCurrentSection('faq');
      } else if (reviewsEl && scrollPos >= reviewsEl.offsetTop) {
        setCurrentSection('reviews');
      } else if (destinationsEl && scrollPos >= destinationsEl.offsetTop) {
        setCurrentSection('destinations');
      } else if (resultsEl && scrollPos >= resultsEl.offsetTop) {
        setCurrentSection('results');
      } else if (reserveEl && scrollPos >= reserveEl.offsetTop) {
        setCurrentSection('search');
      } else {
        setCurrentSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Build breadcrumb items based on state
  const getBreadcrumbItems = () => {
    const items = [
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        url: 'https://www.royabridgetravels.com/',
        onClick: (e) => {
          e.preventDefault();
          if (onNavigateHome) onNavigateHome();
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    ];

    if (activeModal === 'reserve') {
      items.push(
        {
          id: 'search',
          label: `Search (${searchQuery?.origin || 'JFK'} → ${searchQuery?.destination || 'LHR'})`,
          icon: Plane,
          url: 'https://www.royabridgetravels.com/#realtime-results',
          onClick: (e) => {
            e.preventDefault();
            if (onNavigateSearch) onNavigateSearch();
          }
        },
        {
          id: 'reserve-checkout',
          label: 'PNR Reserve & Hold Checkout',
          icon: Ticket,
          url: 'https://www.royabridgetravels.com/#checkout',
          isCurrent: true
        }
      );
    } else if (activeModal === 'tracker') {
      items.push({
        id: 'tracker',
        label: 'Booking Tracker & PNR Status',
        icon: Ticket,
        url: 'https://www.royabridgetravels.com/#tracker',
        isCurrent: true
      });
    } else if (activeModal === 'contact') {
      items.push({
        id: 'contact',
        label: 'Concierge Customer Support',
        icon: PhoneCall,
        url: 'https://www.royabridgetravels.com/#contact',
        isCurrent: true
      });
    } else if (activeModal === 'terms') {
      items.push(
        { id: 'legal', label: 'Legal & Compliance', url: 'https://www.royabridgetravels.com/#legal' },
        { id: 'terms', label: 'Terms of Service', icon: ShieldCheck, url: 'https://www.royabridgetravels.com/#terms', isCurrent: true }
      );
    } else if (activeModal === 'refunds') {
      items.push(
        { id: 'legal', label: 'Legal & Compliance', url: 'https://www.royabridgetravels.com/#legal' },
        { id: 'refunds', label: 'Cancellation & Refund Policy', icon: RefreshCw, url: 'https://www.royabridgetravels.com/#refunds', isCurrent: true }
      );
    } else {
      // Dynamic section crumbs
      if (currentSection === 'destinations') {
        items.push({
          id: 'destinations',
          label: 'Popular Worldwide Destinations',
          icon: Compass,
          url: 'https://www.royabridgetravels.com/#destinations',
          isCurrent: true
        });
      } else if (currentSection === 'reviews') {
        items.push({
          id: 'reviews',
          label: 'Traveler Reviews & Ratings',
          url: 'https://www.royabridgetravels.com/#reviews',
          isCurrent: true
        });
      } else if (currentSection === 'faq') {
        items.push({
          id: 'faq',
          label: 'Frequently Asked Questions',
          url: 'https://www.royabridgetravels.com/#faq',
          isCurrent: true
        });
      } else if (currentSection === 'results' || currentSection === 'search') {
        items.push({
          id: 'search',
          label: `Flight Search (${searchQuery?.origin || 'JFK'} ✈ ${searchQuery?.destination || 'LHR'})`,
          icon: Plane,
          url: 'https://www.royabridgetravels.com/#realtime-results',
          isCurrent: true
        });
      } else {
        items.push({
          id: 'concierge',
          label: 'Luxury Flight Concierge',
          icon: Plane,
          url: 'https://www.royabridgetravels.com/#reserve',
          isCurrent: true
        });
      }
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbItems();

  return (
    <nav 
      aria-label="Breadcrumb Navigation"
      style={{
        width: '100%',
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 193, 88, 0.15)',
        padding: '8px 16px',
        position: 'relative',
        zIndex: 90
      }}
    >
      <div 
        className="max-w-7xl"
        style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <ol 
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontSize: '0.8rem'
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const IconComponent = crumb.icon;
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li 
                key={crumb.id || index}
                itemProp="itemListElement" 
                itemScope 
                itemType="https://schema.org/ListItem"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {index > 0 && (
                  <ChevronRight 
                    size={13} 
                    style={{ color: '#64748B', flexShrink: 0 }} 
                    aria-hidden="true"
                  />
                )}

                {crumb.isCurrent ? (
                  <span 
                    aria-current="page"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--color-gold-bright)',
                      fontWeight: 700,
                      background: 'rgba(229, 193, 88, 0.1)',
                      border: '1px solid rgba(229, 193, 88, 0.25)',
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}
                  >
                    {IconComponent && <IconComponent size={13} color="var(--color-gold-bright)" />}
                    <span itemProp="name">{crumb.label}</span>
                  </span>
                ) : (
                  <a 
                    href={crumb.url}
                    itemProp="item"
                    onClick={crumb.onClick}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#94A3B8',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold-bright)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                  >
                    {IconComponent && <IconComponent size={13} color="#94A3B8" />}
                    <span itemProp="name">{crumb.label}</span>
                  </a>
                )}

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
