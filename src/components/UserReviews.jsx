import React, { useState } from 'react';
import { REVIEWS, REVIEW_STATS } from '../data/reviews';
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus, Sparkles, CheckCircle2, X } from 'lucide-react';

export default function UserReviews({ onOpenChat }) {
  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: 'Traveler',
    location: '',
    rating: 5,
    title: '',
    comment: '',
    route: ''
  });
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const created = {
      id: Date.now(),
      name: newReview.name,
      role: newReview.role || 'Verified Traveler',
      location: newReview.location || 'Worldwide',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
      rating: newReview.rating,
      date: 'Just now',
      verified: true,
      title: newReview.title || 'Exceptional Concierge Experience!',
      comment: newReview.comment,
      route: newReview.route || 'Worldwide Route'
    };

    setReviewsList([created, ...reviewsList]);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setNewReview({ name: '', role: 'Traveler', location: '', rating: 5, title: '', comment: '', route: '' });
    }, 2000);
  };

  return (
    <section id="reviews" style={{ padding: '80px 0', position: 'relative' }}>
      <div className="container">
        
        <div className="section-header">
          <span className="gold-badge">
            <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
            Verified Customer Feedback
          </span>
          <h2>What Travelers Say About RoyaBridge</h2>
          <p>
            Read authentic reviews from thousands of global travelers who locked in up to 30% airfare savings and reserved flights before payment.
          </p>
        </div>

        {/* Aggregate Stats Bar */}
        <div className="glass-card" style={{
          padding: '24px 32px',
          marginBottom: '48px',
          background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.15) 0%, rgba(14, 21, 38, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          border: '1.5px solid var(--border-gold-glow)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={20} fill="var(--color-gold)" color="var(--color-gold)" />
              ))}
            </div>
            <strong style={{ fontSize: '1.8rem', color: '#FFF', display: 'block' }}>{REVIEW_STATS.averageRating} / 5.0</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Based on {REVIEW_STATS.totalReviews.toLocaleString()} Verified Reviews</span>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
            <strong style={{ fontSize: '1.8rem', color: 'var(--color-gold-bright)', display: 'block' }}>{REVIEW_STATS.recommendationPercentage}%</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Customer Satisfaction Rate</span>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
            <strong style={{ fontSize: '1.8rem', color: '#6EE7B7', display: 'block' }}>{REVIEW_STATS.savingsTotal}</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Saved By Our Clients</span>
          </div>

          <div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-gold"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              <MessageSquarePlus size={16} />
              Write A Review
            </button>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {reviewsList.map(rev => (
            <div key={rev.id} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                
                {/* Header: User Info & Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img 
                    src={rev.avatar} 
                    alt={rev.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--color-gold)'
                    }}
                  />
                  <div>
                    <h4 style={{ color: '#FFF', fontSize: '1.05rem', fontWeight: 700 }}>{rev.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {rev.role} • {rev.location}
                    </span>
                  </div>
                </div>

                {/* Rating & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="var(--color-gold)" color="var(--color-gold)" />
                    ))}
                  </div>

                  {rev.verified && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6EE7B7',
                      background: 'rgba(16,185,129,0.12)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldCheck size={12} />
                      Verified Reservation
                    </span>
                  )}
                </div>

                {/* Review Title & Comment */}
                <h5 style={{ color: 'var(--color-gold-bright)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                  "{rev.title}"
                </h5>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  {rev.comment}
                </p>

              </div>

              {/* Route Footer Tag */}
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.78rem',
                color: 'var(--color-gold)',
                fontWeight: 600
              }}>
                Route: {rev.route}
              </div>

            </div>
          ))}
        </div>

        {/* Submit Review Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(7, 11, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              maxWidth: '500px',
              width: '100%',
              background: '#0E1526',
              border: '1.5px solid var(--border-gold-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="font-royal" style={{ color: '#FFF', fontSize: '1.3rem' }}>
                  Share Your RoyaBridge Experience
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {submittedMessage ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
                  <h4 style={{ color: '#FFF', fontSize: '1.2rem' }}>Thank You For Your Review!</h4>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', marginTop: '8px' }}>
                    Your feedback helps thousands of travelers discover luxury concierge flights.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={reviewLabelStyle}>Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      style={reviewInputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={reviewLabelStyle}>City / Country</label>
                      <input 
                        type="text" 
                        placeholder="e.g. London, UK"
                        value={newReview.location}
                        onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                        style={reviewInputStyle}
                      />
                    </div>
                    <div>
                      <label style={reviewLabelStyle}>Flight Route</label>
                      <input 
                        type="text" 
                        placeholder="e.g. London to Dubai"
                        value={newReview.route}
                        onChange={(e) => setNewReview({ ...newReview, route: e.target.value })}
                        style={reviewInputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={reviewLabelStyle}>Review Headline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Saved 30% on my Business Class flight!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      style={reviewInputStyle}
                    />
                  </div>

                  <div>
                    <label style={reviewLabelStyle}>Your Review Comments</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Tell us about your flight booking experience..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      style={{ ...reviewInputStyle, resize: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: '10px', padding: '12px' }}>
                    Submit Verified Review
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

const reviewLabelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  color: 'var(--color-gold-bright)',
  fontWeight: '600',
  marginBottom: '4px'
};

const reviewInputStyle = {
  background: 'rgba(7, 11, 20, 0.8)',
  border: '1px solid var(--border-gold)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: '#FFF',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none'
};
