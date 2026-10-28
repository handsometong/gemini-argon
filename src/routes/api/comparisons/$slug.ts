import { createFileRoute } from '@tanstack/react-router';

import { getComparisonBySlug } from '@/modules/comparisons/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ params }: { params: { slug: string } }) {
  try {
    const item = await getComparisonBySlug(params.slug);
    if (!item) return respErr('Comparison not found');
    return respData(item);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to load comparison'
    );
  }
}

export const Route = createFileRoute('/api/comparisons/$slug')({
  server: { handlers: { GET } },
});
