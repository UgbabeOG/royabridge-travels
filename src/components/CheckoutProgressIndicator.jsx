import React from 'react';
import { Search, CheckCircle2, ShieldCheck, CreditCard, Check, ArrowRight } from 'lucide-react';

export default function CheckoutProgressIndicator({ 
  currentStep = 3, 
  isConfirmed = false, 
  isPaid = false,
  onStepClick 
}) {
  // 4 Core Flow Steps: Search -> Selection -> PNR Hold -> Payment
  const steps = [
    {
      id: 1,
      title: 'Search',
      subtitle: 'Flight Search',
      icon: Search,
      status: 'completed' // User completed search to reach checkout
    },
    {
      id: 2,
      title: 'Selection',
      subtitle: 'Cabin & Route',
      icon: CheckCircle2,
      status: 'completed' // User selected flight & cabin
    },
    {
      id: 3,
      title: 'PNR Hold',
      subtitle: 'Passenger & Hold',
      icon: ShieldCheck,
      status: isConfirmed ? 'completed' : currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: 'Payment',
      subtitle: 'Ticket Issuance',
      icon: CreditCard,
      status: isPaid ? 'completed' : isConfirmed && currentStep >= 4 ? 'active' : currentStep === 4 ? 'active' : 'pending'
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'rgba(7, 11, 20, 0.75)',
      border: '1px solid rgba(229, 193, 88, 0.25)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 18px',
      marginBottom: '22px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Step Header Title & Active Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 800, 
            letterSpacing: '0.08em', 
            color: 'var(--color-gold-bright)',
            textTransform: 'uppercase'
          }}>
            Checkout Process
          </span>
          <span style={{ color: '#475569', fontSize: '0.8rem' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: '#E2E8F0', fontWeight: 600 }}>
            Step {Math.min(currentStep, 4)} of 4: <strong style={{ color: '#FFF' }}>{steps[Math.min(currentStep - 1, 3)].title}</strong>
          </span>
        </div>

        {isPaid ? (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Check size={12} /> Ticket Issued & Confirmed
          </span>
        ) : isConfirmed ? (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#6EE7B7',
            background: 'rgba(110, 231, 183, 0.12)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} /> 24-Hour Hold Active
          </span>
        ) : (
          <span style={{
            fontSize: '0.73rem',
            color: '#94A3B8',
            fontWeight: 500
          }}>
            Guaranteed $0 Upfront Hold Available
          </span>
        )}
      </div>

      {/* Multi-Step Bar Container */}
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Connecting Track Line */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '12.5%',
          right: '12.5%',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1,
          borderRadius: '2px'
        }} />

        {/* Active Progress Line Fill */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '12.5%',
          width: isPaid 
            ? '75%' 
            : isConfirmed || currentStep >= 4 
            ? '75%' 
            : currentStep === 3 
            ? '50%' 
            : '25%',
          height: '3px',
          background: 'linear-gradient(90deg, #E5C158 0%, #F59E0B 100%)',
          zIndex: 2,
          borderRadius: '2px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />

        {/* Render Each Step Node */}
        {steps.map((step, index) => {
          const IconComp = step.icon;
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';
          const isClickable = Boolean(onStepClick);

          let circleBg = 'rgba(15, 23, 42, 0.9)';
          let circleBorder = '1px solid rgba(255, 255, 255, 0.2)';
          let circleColor = '#64748B';

          if (isDone) {
            circleBg = 'linear-gradient(135deg, #E5C158 0%, #B8860B 100%)';
            circleBorder = '1px solid #F59E0B';
            circleColor = '#070B14';
          } else if (isActive) {
            circleBg = 'rgba(229, 193, 88, 0.18)';
            circleBorder = '2px solid var(--color-gold-bright)';
            circleColor = 'var(--color-gold-bright)';
          }

          return (
            <div 
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 3,
                cursor: isClickable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {/* Step Circle Node */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: circleBg,
                border: circleBorder,
                color: circleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: isActive ? '0 0 12px rgba(229, 193, 88, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isDone ? (
                  <Check size={18} strokeWidth={2.5} color="#070B14" />
                ) : (
                  <IconComp size={16} />
                )}
              </div>

              {/* Step Title Labels */}
              <div style={{ 
                marginTop: '8px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: isActive || isDone ? 700 : 500, 
                  color: isDone ? 'var(--color-gold-bright)' : isActive ? '#FFF' : '#64748B',
                  lineHeight: 1.2
                }}>
                  {step.title}
                </span>
                <span className="hidden-mobile-sm" style={{ 
                  fontSize: '0.68rem', 
                  color: isActive ? '#CBD5E1' : '#475569',
                  marginTop: '2px'
                }}>
                  {step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
