import React from "react";
import PaywallCard from "../components/PaywallCard";
import AppLayout from "./AppLayout";

export default function Pricing() {
  return (
    <AppLayout title="Pricing">
      <PaywallCard featureLabel="Full access" />
    </AppLayout>
  );
}
