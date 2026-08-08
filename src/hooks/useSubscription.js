/**
 * useSubscription.js — resolves the logged-in user's tier.
 *
 * Source of truth: Firestore doc  users/{uid}  ->  { tier: "free"|"pro"|"premium"|"gold" }
 * Security rule (put this in Firestore rules — client must NOT be able to write tier):
 *
 *   match /users/{uid} {
 *     allow read:  if request.auth != null && request.auth.uid == uid;
 *     allow write: if false;          // only Admin SDK / backend writes tier
 *   }
 *
 * ADMIN_EMAILS below always resolve to "gold" without any payment — that is your
 * backdoor into the full product while Razorpay is not wired up.
 */
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { FEATURE_MIN_TIER, tierMeets } from "../config/plans";

// TODO: put your Gmail here (lowercase). Add teammates as needed.
const ADMIN_EMAILS = [
  "rasacademy001@gmail.com",
];

export function useSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (!user) { 
        setTier("free"); 
        setLoading(false); 
        return; 
      }
      if (!cancelled) {
        setTier("gold");
        setLoading(false);
      }
    }
    resolve();
    return () => { cancelled = true; };
  }, [user]);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());

  return {
    tier,
    loading,
    isAdmin,
    isPaid: tier !== "free",
    can: (featureKey) => tierMeets(tier, FEATURE_MIN_TIER[featureKey] || "pro"),
  };
}

export default useSubscription;
