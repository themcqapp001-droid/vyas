export function loadRazorpay(){
  return new Promise((res) => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}
export async function pay(order, user, onSuccess, onFail){
  const ok = await loadRazorpay();
  if (!ok) return onFail && onFail("Could not load Razorpay.");
  const rzp = new window.Razorpay({
    key: order.key_id, amount: order.amount, currency: order.currency,
    name: "VYAS · TheMCQApp", description: `${order.pack.name} — ${order.pack.checks} checks`,
    order_id: order.order_id,
    prefill: { email: (user && user.email) || "", name: (user && user.name) || "" },
    theme: { color: "#5C0F14" }, handler: onSuccess,
  });
  rzp.on("payment.failed", (r) => onFail && onFail((r.error && r.error.description) || "Payment failed"));
  rzp.open();
}
