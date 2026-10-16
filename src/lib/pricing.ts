export const DEALER_DISCOUNT = 0.04;
export const GST_RATE = 0.18;
export const ADVANCE_RATE = 0.3;

export function priceQuote(unitPrice: number, qty: number) {
  const subtotal = unitPrice * qty;
  const discount = Math.round(subtotal * DEALER_DISCOUNT);
  const gst = Math.round((subtotal - discount) * GST_RATE);
  const total = subtotal - discount + gst;
  return { unitPrice, subtotal, discount, gst, total, advance: Math.round(total * ADVANCE_RATE) };
}
