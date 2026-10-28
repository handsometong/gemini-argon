import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateModelCost,
  filterModels,
  type ModelForComparison,
} from '../src/lib/model-utils';

const models: ModelForComparison[] = [
  {
    slug: 'argon',
    name: 'Gemini 4 Argon',
    provider: 'Google',
    contextWindow: 1_000_000,
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
    isOpenSource: false,
    isReasoning: true,
    availabilityStatus: 'limited',
    releaseDate: '2026-09-30',
    updatedAt: '2026-10-01',
    evidenceStatus: 'reported',
  },
  {
    slug: 'open-model',
    name: 'Open Model',
    provider: 'OpenAI',
    contextWindow: 128_000,
    inputPricePerMillion: 1,
    outputPricePerMillion: 4,
    isOpenSource: true,
    isReasoning: false,
    availabilityStatus: 'public',
    releaseDate: '2026-08-01',
    updatedAt: '2026-09-20',
    evidenceStatus: 'confirmed',
  },
];

test('calculates token cost with a context price tier', () => {
  const estimate = calculateModelCost({
    requestsPerMonth: 100,
    inputTokensPerRequest: 300_000,
    outputTokensPerRequest: 10_000,
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
    contextThreshold: 200_000,
    inputPriceAboveThreshold: 4,
    outputPriceAboveThreshold: 20,
  });

  assert.equal(estimate.monthlyInputCost, 120);
  assert.equal(estimate.monthlyOutputCost, 20);
  assert.equal(estimate.monthlyTotalCost, 140);
});

test('handles zero token inputs without producing NaN', () => {
  const estimate = calculateModelCost({
    requestsPerMonth: 0,
    inputTokensPerRequest: 0,
    outputTokensPerRequest: 0,
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
  });

  assert.equal(estimate.monthlyTotalCost, 0);
  assert.deepEqual(estimate.assumptions, []);
});

test('filters and sorts models by newest and evidence status', () => {
  assert.deepEqual(
    filterModels(models, { isOpenSource: true }).map((model) => model.slug),
    ['open-model']
  );
  assert.deepEqual(
    filterModels(models, { sort: 'newest' }).map((model) => model.slug),
    ['argon', 'open-model']
  );
  assert.deepEqual(
    filterModels(models, { evidenceStatus: 'confirmed' }).map(
      (model) => model.slug
    ),
    ['open-model']
  );
});
