import { createFileRoute } from '@tanstack/react-router';

import { getModelBySlug } from '@/modules/models/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ params }: { params: { slug: string } }) {
  try {
    const item = await getModelBySlug(params.slug);
    if (!item) return respErr('Model not found');
    return respData(item);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to load model'
    );
  }
}

export const Route = createFileRoute('/api/models/$slug')({
  server: { handlers: { GET } },
});
