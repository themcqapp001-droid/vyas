/**
 * RequirePro.jsx — feature gate.
 * <RequirePro feature="ai-generator"><AiGenerator/></RequirePro>
 * Free users see the paywall instead of the feature. Admin emails always pass.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useSubscription from "../hooks/useSubscription";
import PaywallCard from "./PaywallCard";
import AppLayout from "../pages/AppLayout";

const LABELS = {
  "ai-generator": "AI Question Generator",
  "vyas": "AI Vyas Evaluator",
  "notes": "Study Notes Library",
  "courses": "Lecture Portal",
  "mentorship": "RANNITI Mentorship",
};

export default function RequirePro({ feature = "ai-generator", children }) {
  const { user, loading: authLoading } = useAuth();
  const { can, loading } = useSubscription();
  const location = useLocation();

  if (authLoading || loading) return null;

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (!can(feature)) {
    return (
      <AppLayout title="Upgrade">
        <PaywallCard featureLabel={LABELS[feature] || "This feature"} />
      </AppLayout>
    );
  }

  return children;
}
