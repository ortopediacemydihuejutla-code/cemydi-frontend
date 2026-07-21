export { ENABLE_RECOMMENDATION_DEMO } from "@/lib/feature-flags";

export type DemoRecommendationRule = {
  currentProductIds: number[];
  recommendedProductIds: number[];
};

export type DemoRecommendationSource = {
  id: number;
  nombre: string;
  clasificacion?: string | null;
  descripcion?: string | null;
};

export const demoRecommendationRules: DemoRecommendationRule[] = [
  {
    // Sillas de ruedas disponibles actualmente en el catálogo.
    currentProductIds: [7, 8, 56, 57],
    // Refacciones y accesorios compatibles del catálogo actual.
    recommendedProductIds: [22, 23, 35, 36, 37, 38, 39, 43],
  },
];

export function getMatchingDemoRules(sources: DemoRecommendationSource[]) {
  const sourceIds = new Set(sources.map((source) => source.id));

  return demoRecommendationRules.filter((rule) =>
    rule.currentProductIds.some((productId) => sourceIds.has(productId)),
  );
}

export function selectDemoRecommendations<T extends DemoRecommendationSource>(
  sources: DemoRecommendationSource[],
  candidates: T[],
) {
  const rules = getMatchingDemoRules(sources);
  if (rules.length === 0) return [];

  const excludedIds = new Set(sources.map((source) => source.id));
  const candidatesById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const recommendationIds = rules.flatMap((rule) => rule.recommendedProductIds);

  return recommendationIds.reduce<T[]>((selected, productId) => {
    const candidate = candidatesById.get(productId);
    if (
      candidate &&
      !excludedIds.has(candidate.id) &&
      !selected.some((product) => product.id === candidate.id)
    ) {
      selected.push(candidate);
    }
    return selected;
  }, []);
}
