export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (isNaN(value) || value <= 0) {
    return `${fieldName} must be a positive number.`;
  }
  return null;
}

export function validateMinRequiredBid(bidAmount: number, currentHighestBid: number, minIncrement: number, startingPrice: number): string | null {
  const minRequired = currentHighestBid > 0 ? currentHighestBid + minIncrement : startingPrice;
  if (bidAmount < minRequired) {
    return `Bid must be at least BDT ${minRequired}/kg.`;
  }
  return null;
}

