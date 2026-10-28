import { createFileRoute } from '@tanstack/react-router';

import { listModels } from '@/modules/models/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const evidence = url.searchParams.get('evidenceStatus') || undefined;
    const availability = url.searchParams.get('availability') || undefined;
    const provider = url.searchParams.get('provider') || undefined;
    const sort = (url.searchParams.get('sort') || 'newest') as any;
    const models = await listModels({
      filter: {
        provider,
        availabilityStatus: availability,
        evidenceStatus: evidence as any,
        sort,
      },
    });
    return respData(models);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to load models'
    );
  }
}

export const Route = createFileRoute('/api/models')({
  server: { handlers: { GET } },
});
