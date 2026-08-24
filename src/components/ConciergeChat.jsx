import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ShieldCheck, Check, Phone, Loader2 } from 'lucide-react';

export default function ConciergeChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Welcome to RoyaBridge Travels! I'm your Senior Flight Concierge Assistant. How can I help you reserve your flight hold ($0 today), check 30% discount fares, or verify visa requirements?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "How does $0 Flight Hold work?",
    "Can I use this PNR for a Visa?",
    "Check Business Class discounts",
    "How to manage my booking?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg = { sender: 'user', text: query, time: timeStr };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: updatedMessages.map(m => ({
            sender: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      const data = await response.json();
      const botReply = data.reply || "Thank you for contacting RoyaBridge Travels! A senior flight agent is reviewing your request. Feel free to lock your flight hold ($0 today) directly on our homepage.";

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error('Concierge Chat error:', err);
      // Smart offline fallback
      let botResponse = "Thank you for reaching out to RoyaBridge Travels! A senior flight concierge agent is reviewing your inquiry. You can lock in a 24-hour flight hold with zero upfront payment on our homepage.";
      const q = query.toLowerCase();

      if (q.includes('reserve') || q.includes('hold') || q.includes('payment') || q.includes('free')) {
        botResponse = "With our 'Reserve Before Payment' feature, we lock your flight seats with an official airline PNR reference for 24-48 hours with $0 upfront. Zero payment needed until you inspect and approve your itinerary!";
      } else if (q.includes('price') || q.includes('discount') || q.includes('30%')) {
        botResponse = "RoyaBridge Travels accesses wholesale consolidated airline fares up to 30% lower than standard online search engines for Economy, Business, and First Class seats.";
      } else if (q.includes('visa')) {
        botResponse = "Yes! Our official flight reservation hold provides a verifiable PNR itinerary that fulfills all embassy and consulate requirements for visa applications.";
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 350,
      width: 'min(370px, calc(100vw - 28px))',
      height: '490px',
      background: '#0E1526',
      border: '1.5px solid var(--border-gold-glow)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Chat Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.2) 0%, rgba(14, 21, 38, 0.95) 100%)',
        borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#070B14'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ color: '#FFF', fontSize: '0.92rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              RoyaBridge Live Concierge
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              24/7 AI Flight Agent • Active
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #F5D77F 0%, #E5C158 100%)' : 'rgba(15, 23, 42, 0.9)',
              color: msg.sender === 'user' ? '#070B14' : '#F1F5F9',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: msg.sender === 'user' ? 'none' : '1px solid rgba(229, 193, 88, 0.2)',
              fontSize: '0.84rem',
              lineHeight: 1.45,
              fontWeight: msg.sender === 'user' ? '600' : '400'
            }}
          >
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>
            <span style={{
              fontSize: '0.68rem',
              display: 'block',
              textAlign: 'right',
              marginTop: '4px',
              opacity: 0.7
            }}>
              {msg.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(229, 193, 88, 0.2)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-gold-bright)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Loader2 className="animate-spin" size={14} /> Concierge is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Suggestions */}
      <div style={{
        padding: '6px 10px',
        background: 'rgba(7, 11, 20, 0.8)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            style={{
              whiteSpace: 'nowrap',
              padding: '5px 10px',
              borderRadius: '10px',
              border: '1px solid var(--border-gold)',
              background: 'rgba(229,193,88,0.08)',
              color: 'var(--color-gold-bright)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              opacity: isTyping ? 0.6 : 1
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: '10px 12px',
          background: '#070B14',
          borderTop: '1px solid rgba(229, 193, 88, 0.2)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <input 
          type="text"
          placeholder="Ask flight concierge..."
          value={input}
          disabled={isTyping}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            color: '#FFF',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit"
          disabled={isTyping || !input.trim()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: input.trim() ? 'var(--color-gold)' : '#334155',
            border: 'none',
            color: '#070B14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
}

