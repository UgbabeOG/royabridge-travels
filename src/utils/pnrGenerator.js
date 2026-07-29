export function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'RB';
  for (let i = 0; i < 4; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export function calculateSavings(baseFare, cabinClass = 'Economy') {
  let multiplier = 0.25; // 25% average
  if (cabinClass === 'Business') multiplier = 0.30;
  if (cabinClass === 'First') multiplier = 0.32;
  
  const discountAmount = Math.round(baseFare * multiplier);
  const finalPrice = baseFare - discountAmount;
  
  return {
    originalPrice: baseFare,
    discountAmount,
    finalPrice,
    savingsPercentage: Math.round(multiplier * 100)
  };
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}
