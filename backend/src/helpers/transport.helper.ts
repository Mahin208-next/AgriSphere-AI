export function estimateTransportCost(
  quantityKg: number,
  distanceKm: number,
  isPerishable: boolean = true
): { transportCost: number; handlingCost: number; totalCost: number } {
  const baseHandling = Math.max(250, Math.round(quantityKg * 0.35));

  let transportRate = 0;
  if (distanceKm <= 15) {
    transportRate = Math.max(300, quantityKg * 0.4);
  } else {
    const tonne = quantityKg / 1000;
    const baseTrip = 1200;
    const perKmRate = Math.max(12, tonne * 9.5);
    transportRate = Math.round(baseTrip + distanceKm * perKmRate);
  }

  const perishabilityFactor = isPerishable ? 1.1 : 1.0;
  const transportCost = Math.round(transportRate * perishabilityFactor);
  const handlingCost = baseHandling;

  return {
    transportCost,
    handlingCost,
    totalCost: transportCost + handlingCost,
  };
}

