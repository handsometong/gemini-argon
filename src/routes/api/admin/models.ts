import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  listComparisons,
  removeComparison,
  saveComparison,
} from '@/modules/comparisons/service';
import {
  listAdminModels,
  listTrackerRecords,
  removeModel,
  removeTrackerRecord,
  saveModel,
  saveTrackerRecord,
  type TrackerRecordKind,
} from '@/modules/models/service';
import { hasPermission } from '@/modules/rbac/service';
import {
  listSources,
  removeSource,
  saveSource,
} from '@/modules/sources/service';
import { respData, respErr, respOk, respPage } from '@/lib/resp';

async function checkAdmin(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user || !(await hasPermission(session.user.id, 'admin.*')))
    throw new Error('Forbidden');
  return session;
}

async function GET({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const url = new URL(request.url);
    const resource = url.searchParams.get('resource');
    if (resource === 'source') return respData(await listSources(true));
    if (resource === 'comparison') return respData(await listComparisons(true));
    if (
      resource === 'price' ||
      resource === 'benchmark' ||
      resource === 'timeline'
    ) {
      return respData(
        await listTrackerRecords(
          resource,
          url.searchParams.get('modelId') || undefined
        )
      );
    }
    const result = await listAdminModels({
      page: Number(url.searchParams.get('page') || 1),
      pageSize: Number(url.searchParams.get('pageSize') || 20),
      search: url.searchParams.get('search') || undefined,
      status: url.searchParams.get('status') || undefined,
    });
    return respPage(result.items, result.total);
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to load models'
    );
  }
}

async function POST({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const body = await request.json();
    if (body.resource === 'source') return respData(await saveSource(body));
    if (body.resource === 'comparison')
      return respData(await saveComparison(body));
    if (
      body.resource === 'price' ||
      body.resource === 'benchmark' ||
      body.resource === 'timeline'
    ) {
      return respData(
        await saveTrackerRecord(body.resource as TrackerRecordKind, body)
      );
    }
    return respData(await saveModel(body));
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to save model'
    );
  }
}

async function PUT({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const body = await request.json();
    if (body.resource === 'source') return respData(await saveSource(body));
    if (body.resource === 'comparison')
      return respData(await saveComparison(body));
    if (
      body.resource === 'price' ||
      body.resource === 'benchmark' ||
      body.resource === 'timeline'
    ) {
      return respData(
        await saveTrackerRecord(body.resource as TrackerRecordKind, body)
      );
    }
    return respData(await saveModel(body));
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to update model'
    );
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const resource = url.searchParams.get('resource');
    if (!id) return respErr('ID is required');
    if (resource === 'source') {
      await removeSource(id);
    } else if (resource === 'comparison') {
      await removeComparison(id);
    } else if (
      resource === 'price' ||
      resource === 'benchmark' ||
      resource === 'timeline'
    ) {
      await removeTrackerRecord(resource, id);
    } else {
      await removeModel(id);
    }
    return respOk();
  } catch (error) {
    return respErr(
      error instanceof Error ? error.message : 'Unable to delete model'
    );
  }
}

export const Route = createFileRoute('/api/admin/models')({
  server: { handlers: { GET, POST, PUT, DELETE } },
});
