/**
 * plans.js — pricing + entitlements.
 * PRICES ARE PLACEHOLDERS. Send me your real numbers and daily limits and I'll swap them.
 */
export const PLANS = [
  {
    id: "pro",
    name: "Pro",
    price: 199,
    period: "/month",
    tagline: "Serious daily practice",
    features: [
      "Unlimited PYQ practice",
      "100 AI-generated questions / day",
      "Full test analytics & rank",
      "Study notes library",
    ],
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 499,
    period: "/month",
    tagline: "Prelims + Mains together",
    features: [
      "Everything in Pro",
      "300 AI questions / day",
      "AI Vyas — 20 answer evaluations / month",
      "Lecture portal access",
      "Priority question-flag review",
    ],
    highlight: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 999,
    period: "/month",
    tagline: "Full mentorship stack",
    features: [
      "Everything in Premium",
      "Unlimited AI questions",
      "Unlimited AI Vyas evaluations",
      "RANNITI mentorship test series",
      "1:1 strategy call (monthly)",
    ],
    highlight: false,
  },
];

/** Feature gate matrix — which tier unlocks which feature key. */
export const TIER_ORDER = ["free", "pro", "premium", "gold"];

export const FEATURE_MIN_TIER = {
  "ai-generator": "pro",
  "vyas":         "premium",
  "notes":        "pro",
  "courses":      "premium",
  "mentorship":   "gold",
};

export function tierMeets(userTier, requiredTier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
}
