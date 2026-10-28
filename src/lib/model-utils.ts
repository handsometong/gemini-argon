export type EvidenceStatus = 'confirmed' | 'reported' | 'unverified';

export type ModelForComparison = {
  slug: string;
  name: string;
  provider: string;
  contextWindow: number | null;
  inputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  isOpenSource: boolean;
  isReasoning: boolean;
  availabilityStatus: string;
  releaseDate: string | null;
  updatedAt: string;
  evidenceStatus: EvidenceStatus;
};

export type CostEstimateInput = {
  requestsPerMonth: number;
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  inputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  contextThreshold?: number | null;
  inputPriceAboveThreshold?: number | null;
  outputPriceAboveThreshold?: number | null;
};

export type CostEstimate = {
  monthlyInputCost: number;
  monthlyOutputCost: number;
  monthlyTotalCost: number;
  currency: string;
  assumptions: string[];
};

export function calculateModelCost(input: CostEstimateInput): CostEstimate {
  const requests = Math.max(0, Number(input.requestsPerMonth) || 0);
  const inputTokens = Math.max(0, Number(input.inputTokensPerRequest) || 0);
  const outputTokens = Math.max(0, Number(input.outputTokensPerRequest) || 0);
  const assumptions: string[] = [];

  const overThreshold =
    typeof input.contextThreshold === 'number' &&
    input.contextThreshold > 0 &&
    inputTokens + outputTokens > input.contextThreshold;

  const inputPrice =
    overThreshold && input.inputPriceAboveThreshold != null
      ? input.inputPriceAboveThreshold
      : input.inputPricePerMillion;
  const outputPrice =
    overThreshold && input.outputPriceAboveThreshold != null
      ? input.outputPriceAboveThreshold
      : input.outputPricePerMillion;

  if (inputPrice == null) assumptions.push('Input price is not available.');
  if (outputPrice == null) assumptions.push('Output price is not available.');
  if (overThreshold)
    assumptions.push('Tiered pricing above the context threshold was applied.');

  const monthlyInputCost =
    inputPrice == null ? 0 : (requests * inputTokens * inputPrice) / 1_000_000;
  const monthlyOutputCost =
    outputPrice == null
      ? 0
      : (requests * outputTokens * outputPrice) / 1_000_000;

  return {
    monthlyInputCost: roundCurrency(monthlyInputCost),
    monthlyOutputCost: roundCurrency(monthlyOutputCost),
    monthlyTotalCost: roundCurrency(monthlyInputCost + monthlyOutputCost),
    currency: 'USD',
    assumptions,
  };
}

export type ModelFilter = {
  provider?: string;
  minContextWindow?: number;
  maxInputPrice?: number;
  maxOutputPrice?: number;
  isOpenSource?: boolean;
  isReasoning?: boolean;
  availabilityStatus?: string;
  evidenceStatus?: EvidenceStatus;
  sort?: 'newest' | 'input-price' | 'output-price' | 'context' | 'updated';
};

export function filterModels(
  models: ModelForComparison[],
  filter: ModelFilter = {}
): ModelForComparison[] {
  const result = models.filter((model) => {
    if (filter.provider && model.provider !== filter.provider) return false;
    if (
      filter.minContextWindow != null &&
      (model.contextWindow ?? 0) < filter.minContextWindow
    )
      return false;
    if (
      filter.maxInputPrice != null &&
      (model.inputPricePerMillion ?? Number.POSITIVE_INFINITY) >
        filter.maxInputPrice
    )
      return false;
    if (
      filter.maxOutputPrice != null &&
      (model.outputPricePerMillion ?? Number.POSITIVE_INFINITY) >
        filter.maxOutputPrice
    )
      return false;
    if (
      filter.isOpenSource != null &&
      model.isOpenSource !== filter.isOpenSource
    )
      return false;
    if (filter.isReasoning != null && model.isReasoning !== filter.isReasoning)
      return false;
    if (
      filter.availabilityStatus &&
      model.availabilityStatus !== filter.availabilityStatus
    )
      return false;
    if (filter.evidenceStatus && model.evidenceStatus !== filter.evidenceStatus)
      return false;
    return true;
  });

  return result.sort((a, b) => {
    switch (filter.sort) {
      case 'input-price':
        return compareNullableNumbers(
          a.inputPricePerMillion,
          b.inputPricePerMillion
        );
      case 'output-price':
        return compareNullableNumbers(
          a.outputPricePerMillion,
          b.outputPricePerMillion
        );
      case 'context':
        return compareNullableNumbers(b.contextWindow, a.contextWindow);
      case 'updated':
        return compareDates(b.updatedAt, a.updatedAt);
      case 'newest':
      default:
        return compareDates(b.releaseDate, a.releaseDate);
    }
  });
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function compareNullableNumbers(a: number | null, b: number | null) {
  return (a ?? Number.POSITIVE_INFINITY) - (b ?? Number.POSITIVE_INFINITY);
}

function compareDates(a: string | null, b: string | null) {
  return new Date(a ?? 0).getTime() - new Date(b ?? 0).getTime();
}
