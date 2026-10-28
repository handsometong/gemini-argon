import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type PageResult,
} from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/admin/models')({
  component: AdminModelsPage,
});

type Resource = 'source' | 'price' | 'benchmark' | 'timeline' | 'comparison';

type Field = { name: string; placeholder: string; required?: boolean };

const RESOURCE_FIELDS: Record<Resource, Field[]> = {
  source: [
    { name: 'url', placeholder: 'https://...', required: true },
    { name: 'title', placeholder: 'Source title' },
    { name: 'publisher', placeholder: 'Publisher' },
    { name: 'sourceType', placeholder: 'official | independent | community' },
    { name: 'verifiedAt', placeholder: 'Verified at (YYYY-MM-DD)' },
    { name: 'status', placeholder: 'draft | published' },
  ],
  price: [
    { name: 'modelId', placeholder: 'Model ID', required: true },
    { name: 'inputPricePerMillion', placeholder: 'Input USD / 1M tokens' },
    { name: 'outputPricePerMillion', placeholder: 'Output USD / 1M tokens' },
    { name: 'contextThreshold', placeholder: 'Context threshold' },
    {
      name: 'inputPriceAboveThreshold',
      placeholder: 'Input price above threshold',
    },
    {
      name: 'outputPriceAboveThreshold',
      placeholder: 'Output price above threshold',
    },
    { name: 'sourceId', placeholder: 'Source ID' },
    { name: 'verifiedAt', placeholder: 'Verified at (YYYY-MM-DD)' },
    {
      name: 'evidenceStatus',
      placeholder: 'confirmed | reported | unverified',
    },
  ],
  benchmark: [
    { name: 'modelId', placeholder: 'Model ID', required: true },
    { name: 'benchmarkName', placeholder: 'Benchmark name', required: true },
    { name: 'score', placeholder: 'Score', required: true },
    { name: 'scoreUnit', placeholder: 'Score unit' },
    { name: 'methodology', placeholder: 'Test methodology', required: true },
    { name: 'sourceId', placeholder: 'Source ID' },
    { name: 'verifiedAt', placeholder: 'Verified at (YYYY-MM-DD)' },
    {
      name: 'evidenceStatus',
      placeholder: 'confirmed | reported | unverified',
    },
  ],
  timeline: [
    { name: 'modelId', placeholder: 'Model ID' },
    {
      name: 'eventType',
      placeholder: 'release | access | pricing | benchmark',
      required: true,
    },
    {
      name: 'eventDate',
      placeholder: 'Event date (YYYY-MM-DD)',
      required: true,
    },
    { name: 'title', placeholder: 'Event title', required: true },
    { name: 'description', placeholder: 'Description' },
    { name: 'sourceId', placeholder: 'Source ID' },
    {
      name: 'evidenceStatus',
      placeholder: 'confirmed | reported | unverified',
    },
    { name: 'status', placeholder: 'draft | published' },
  ],
  comparison: [
    {
      name: 'slug',
      placeholder: 'gemini-4-argon-vs-gpt-6-astra',
      required: true,
    },
    { name: 'leftModelId', placeholder: 'Left model ID', required: true },
    { name: 'rightModelId', placeholder: 'Right model ID', required: true },
    { name: 'locale', placeholder: 'en or zh' },
    { name: 'intro', placeholder: '独立的比较导语' },
    { name: 'decisionSummary', placeholder: '选择结论' },
    { name: 'status', placeholder: 'draft | published' },
  ],
};

function AdminModelsPage() {
  const queryClient = useQueryClient();
  const emptyForm = {
    name: '',
    slug: '',
    provider: '',
    status: 'draft',
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['admin-models'],
    queryFn: () =>
      apiGet<PageResult<Record<string, string>>>(
        '/api/admin/models?page=1&pageSize=100'
      ),
  });
  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        ...(editingId ? { id: editingId } : {}),
        family: '',
        description: '',
        availabilityStatus: 'unknown',
        isOpenSource: false,
        isReasoning: false,
      };
      return editingId
        ? apiPut('/api/admin/models', payload)
        : apiPost('/api/admin/models', payload);
    },
    onSuccess: () => {
      toast.success(m['admin.models.saved']());
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/models?id=${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const notifyMutation = useMutation({
    mutationFn: () => apiPost('/api/admin/subscribers/notify', {}),
    onSuccess: (result: any) => {
      toast.success(
        `Update email sent to ${result.sent} subscriber${result.sent === 1 ? '' : 's'}`
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{m['admin.models.title']()}</h1>
          <p className="text-muted-foreground">
            {m['admin.models.description']()}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={notifyMutation.isPending}
          onClick={() => {
            if (
              window.confirm(
                'Send the latest Argon update to confirmed subscribers?'
              )
            ) {
              notifyMutation.mutate();
            }
          }}
        >
          {notifyMutation.isPending ? 'Sending…' : 'Send update email'}
        </Button>
      </div>
      <Tabs defaultValue="models">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="price">Prices</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmarks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="source">Sources</TabsTrigger>
          <TabsTrigger value="comparison">Comparisons</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>{m['admin.models.save']()}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  mutation.mutate();
                }}
              >
                <Input
                  placeholder={m['admin.models.name']()}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  placeholder={m['admin.models.slug']()}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
                <Input
                  placeholder={m['admin.models.provider']()}
                  value={form.provider}
                  onChange={(e) =>
                    setForm({ ...form, provider: e.target.value })
                  }
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={mutation.isPending}>
                    {editingId ? 'Update' : m['admin.models.save']()}
                  </Button>
                  {editingId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm(emptyForm);
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {query.data?.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.slug} · {item.provider}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {item.status}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            name: item.name || '',
                            slug: item.slug || '',
                            provider: item.provider || '',
                            status: item.status || 'draft',
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${item.name}?`))
                            deleteMutation.mutate(item.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {query.data?.items?.length === 0 && (
                <p className="text-muted-foreground">No models yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {(Object.keys(RESOURCE_FIELDS) as Resource[]).map((resource) => (
          <TabsContent key={resource} value={resource}>
            <TrackerRecordPanel resource={resource} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function TrackerRecordPanel({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();
  const fields = RESOURCE_FIELDS[resource];
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryKey = ['admin-tracker', resource];
  const query = useQuery({
    queryKey,
    queryFn: () =>
      apiGet<Record<string, unknown>[]>(
        `/api/admin/models?resource=${resource}`
      ),
  });
  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        resource,
        ...form,
        ...(editingId ? { id: editingId } : {}),
      };
      return editingId
        ? apiPut('/api/admin/models', payload)
        : apiPost('/api/admin/models', payload);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Updated' : 'Saved');
      setForm({});
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/admin/models?resource=${resource}&id=${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const recordCount = useMemo(() => query.data?.length ?? 0, [query.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {resource}s{' '}
          <span className="text-muted-foreground text-sm font-normal">
            ({recordCount})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {fields.map((field) => (
            <Input
              key={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={form[field.name] ?? ''}
              onChange={(event) =>
                setForm({ ...form, [field.name]: event.target.value })
              }
            />
          ))}
          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {editingId ? `Update ${resource}` : `Save ${resource}`}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm({});
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
        <div className="divide-y rounded-lg border">
          {query.data?.map((record) => (
            <div
              key={String(record.id)}
              className="flex flex-wrap items-start justify-between gap-3 p-3"
            >
              <pre className="min-w-0 flex-1 overflow-x-auto text-xs whitespace-pre-wrap">
                {JSON.stringify(record, null, 2)}
              </pre>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(String(record.id));
                    const next: Record<string, string> = {};
                    for (const field of fields) {
                      const value = record[field.name];
                      if (value != null) next[field.name] = String(value);
                    }
                    setForm(next);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Delete this record?'))
                      deleteMutation.mutate(String(record.id));
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {!query.isPending && !query.data?.length ? (
            <p className="text-muted-foreground p-4 text-sm">No records yet.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
