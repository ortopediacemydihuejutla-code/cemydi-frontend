import { notFound } from "next/navigation";

import { ENABLE_RECOMMENDATION_DEMO } from "@/lib/feature-flags";

import { ProductSegmentationView } from "./product-segmentation-view";

export default function ProductSegmentationPage() {
  if (!ENABLE_RECOMMENDATION_DEMO) {
    notFound();
  }

  return <ProductSegmentationView />;
}
