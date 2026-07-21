import { notFound } from "next/navigation";

import { ENABLE_RECOMMENDATION_DEMO } from "@/lib/feature-flags";

import { DemandForecastView } from "./demand-forecast-view";

export default function DemandForecastPage() {
  if (!ENABLE_RECOMMENDATION_DEMO) {
    notFound();
  }

  return <DemandForecastView />;
}
