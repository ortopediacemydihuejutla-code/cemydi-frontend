export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercent: number,
) {
  return Number(
    (originalPrice * (1 - discountPercent / 100)).toFixed(2),
  );
}

export function getSavingsAmount(
  originalPrice: number,
  discountedPrice: number,
) {
  return Number(Math.max(0, originalPrice - discountedPrice).toFixed(2));
}
