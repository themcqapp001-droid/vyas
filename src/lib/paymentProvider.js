/**
 * paymentProvider.js — Razorpay goes HERE and nowhere else.
 * Every upgrade button in the UI calls startCheckout(); when you are ready,
 * implement this one file and no component needs to change.
 */
export const PAYMENTS_ENABLED = false;

export async function startCheckout(plan /* "pro" | "premium" | "gold" */) {
  if (!PAYMENTS_ENABLED) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }
  // TODO Razorpay:
  //   1. POST /api/payments/create-order { plan }  -> { order_id, amount, currency }
  //   2. new window.Razorpay({ key, order_id, handler }).open()
  //   3. handler -> POST /api/payments/verify { razorpay_signature, ... }
  //   4. backend verifies HMAC, writes tier to Firestore users/{uid}
  throw new Error("NOT_IMPLEMENTED");
}
