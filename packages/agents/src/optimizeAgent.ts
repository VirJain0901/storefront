// v1 optimizer — intentionally rules-based, not a live learning loop.
// Rationale: real-time AI pricing/conversion optimization is a "Should-have"
// in the product spec but is the highest-risk feature to fake convincingly.
// This module runs simple, explainable A/B rules against PricingExperiment
// rows so the UI can show real (if simple) behavior from day one, with a
// clear seam to swap in a learned policy later without changing the schema
// or the calling code.

export type ExperimentResult = {
  variantA: number;
  variantB: number;
  conversionsA: number;
  viewsA: number;
  conversionsB: number;
  viewsB: number;
};

export function evaluateExperiment(r: ExperimentResult): { winner: "A" | "B" | null; confidence: number } {
  const rateA = r.viewsA > 0 ? r.conversionsA / r.viewsA : 0;
  const rateB = r.viewsB > 0 ? r.conversionsB / r.viewsB : 0;

  // Minimum sample size guard — do not call a winner on noise.
  const MIN_VIEWS = 50;
  if (r.viewsA < MIN_VIEWS || r.viewsB < MIN_VIEWS) {
    return { winner: null, confidence: 0 };
  }

  const diff = Math.abs(rateA - rateB);
  const confidence = Math.min(diff / Math.max(rateA, rateB, 0.001), 1);

  if (confidence < 0.1) return { winner: null, confidence };
  return { winner: rateA > rateB ? "A" : "B", confidence };
}
