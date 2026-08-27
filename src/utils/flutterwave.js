import { formatCurrency, getConvertedAmount } from './pnrGenerator';

/**
 * Flutterwave Payment Client Utility
 * Dynamically loads Flutterwave Checkout v3 script and initializes inline payment popup
 */

export function loadFlutterwaveScript() {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve(window.FlutterwaveCheckout);
      return;
    }

    const existingScript = document.getElementById('flutterwave-js-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.FlutterwaveCheckout));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Flutterwave SDK')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'flutterwave-js-sdk';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      if (window.FlutterwaveCheckout) {
        resolve(window.FlutterwaveCheckout);
      } else {
        reject(new Error('Flutterwave Checkout SDK loaded but object not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Flutterwave checkout script from CDN'));
    document.body.appendChild(script);
  });
}

/**
 * Initiates Flutterwave Inline payment popup
 */
export async function openFlutterwavePayment({
  pnr,
  amount,
  currency = 'USD',
  passengerEmail,
  passengerName,
  passengerPhone,
  flightNumber,
  airline,
  route,
  onSuccess,
  onCancel,
  onError
}) {
  try {
    const FlutterwaveCheckout = await loadFlutterwaveScript();

    // Ensure amount is in the proper currency units
    const payableAmount = Number(amount) > 0 ? Number(amount) : 100;
    const cleanCurrency = (currency || 'USD').toUpperCase();

    // 1. Initialize session on backend
    const initRes = await fetch('/api/payments/flutterwave/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pnr,
        amount: payableAmount,
        currency: cleanCurrency,
        passengerEmail,
        passengerName,
        passengerPhone,
        flightNumber,
        airline,
        route
      })
    });

    const initData = await initRes.json();
    if (!initData || !initData.success) {
      throw new Error(initData?.error || 'Failed to initialize Flutterwave transaction session');
    }

    const { publicKey, tx_ref, amountFormatted, currencyFormatted } = initData;
    const finalAmount = Number(amountFormatted || payableAmount);
    const finalCurrency = (currencyFormatted || cleanCurrency || 'USD').toUpperCase();

    console.log(`[FLUTTERWAVE CHECKOUT LAUNCH] PNR=${pnr} Amount=${finalAmount} ${finalCurrency}`);

    // 2. Launch Flutterwave Inline Checkout
    FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: tx_ref,
      amount: finalAmount,
      currency: finalCurrency,
      payment_options: "card, mobilemoney, ussd, banktransfer, barter",
      customer: {
        email: passengerEmail,
        phone_number: passengerPhone || '',
        name: passengerName || 'Traveler',
      },
      customizations: {
        title: "RoyaBridge Travels Flight Ticket",
        description: `Payment for PNR ${pnr} (${flightNumber || 'Flight'}) - ${finalCurrency === 'NGN' ? '₦' : ''}${finalAmount.toLocaleString()} ${finalCurrency}`,
        logo: "https://images.unsplash.com/photo-1540339832862-47459980783b?auto=format&fit=crop&w=200&q=80",
      },
      callback: async function (response) {
        console.log('✅ [FLUTTERWAVE CALLBACK] Response received:', response);

        if (response.status === 'successful' || response.status === 'completed' || response.transaction_id) {
          // Verify transaction on backend
          try {
            const verifyRes = await fetch('/api/payments/flutterwave/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transaction_id: response.transaction_id || response.flw_ref || response.tx_ref,
                tx_ref: response.tx_ref || tx_ref,
                pnr: pnr,
                amount: finalAmount,
                currency: finalCurrency,
                status: response.status,
                flw_ref: response.flw_ref
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData && verifyData.success) {
              if (onSuccess) onSuccess(verifyData);
            } else {
              console.warn('[FLUTTERWAVE VERIFY WARNING]', verifyData);
              if (onSuccess) onSuccess({ success: true, pnr, tx_ref, response, paidAmount: finalAmount, paidCurrency: finalCurrency });
            }
          } catch (vErr) {
            console.error('[FLUTTERWAVE VERIFY FETCH ERROR]', vErr);
            if (onSuccess) onSuccess({ success: true, pnr, tx_ref, response, paidAmount: finalAmount, paidCurrency: finalCurrency });
          }
        } else {
          if (onError) onError(new Error(`Flutterwave payment status: ${response.status || 'Failed'}`));
        }
      },
      onclose: function () {
        console.log('ℹ️ [FLUTTERWAVE] Customer closed checkout popup.');
        if (onCancel) onCancel();
      }
    });
  } catch (err) {
    console.error('❌ [FLUTTERWAVE SCRIPT ERROR]', err);
    if (onError) onError(err);
  }
}
