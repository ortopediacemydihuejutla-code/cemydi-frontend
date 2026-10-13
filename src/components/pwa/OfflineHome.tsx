"use client";

import { HomeHero } from "@/components/home/HomeHero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeRentalProcess } from "@/components/home/HomeRentalProcess";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { PromotionsShowcase } from "@/components/home/promotions-showcase";
import TestimonialsSection from "@/components/ui/testimonial-v2";

export default function OfflineHome() {
  return <><HomeHero offline /><HomeCategories /><PromotionsShowcase promotions={[]} /><HomeRentalProcess /><HomeFeatures /><TestimonialsSection testimonials={[]} /></>;
}
