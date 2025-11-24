import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import DeleteApiButton from '@/components/DeleteApiButton';
import { generateMockData } from '@/utils/dataGeneration';
import { SchemaField } from '@/types/schema';
import ApiStatusBadge from '@/components/ApiStatusBadge';
import CopyButton from '@/components/CopyButton';

export default async function ApiDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: api } = await supabase
    .from('apis')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!api) {
    notFound();
  }

  const username = user.user_metadata?.username || 'user';
  const endpointUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/${username}/${api.endpoint_slug}`;
  
  const sampleData = generateMockData(api.schema_definition as unknown as SchemaField[], 1);

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{api.name}</h1>
              <ApiStatusBadge apiId={api.id} initialStatus={api.status || 'active'} />
            </div>
            <p className="mt-2 text-zinc-400">{api.description || 'No description provided.'}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/api/${api.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-black/40 border border-zinc-800 rounded-md hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Edit API
            </Link>
            <DeleteApiButton apiId={api.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-zinc-800 bg-[#09090b]/50">
            <h2 className="text-lg font-semibold text-white mb-4">Endpoint Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Base URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-black/40 rounded-md text-sm font-mono text-zinc-300 border border-zinc-800">
                    {endpointUrl}
                  </code>
                  <div className='flex items-center gap-2'>

                  <a
                    href={endpointUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-500 hover:text-indigo-400 transition-colors"
                    title="Open in new tab"
                    >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <CopyButton textToCopy={endpointUrl} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Example Usage (cURL)</label>
                <div className="relative group">
                  <pre className="p-4 bg-black/60 rounded-md text-sm font-mono text-emerald-400 overflow-x-auto border border-zinc-800">
                    curl -X GET "{endpointUrl}?limit=5"
                  </pre>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Example Usage (JavaScript)</label>
                <div className="relative group">
                  <pre className="p-4 bg-black/60 rounded-md text-sm font-mono text-blue-400 overflow-x-auto border border-zinc-800">
{`fetch('${endpointUrl}?limit=5')
  .then(response => response.json())
  .then(data => console.log(data));`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-zinc-800 bg-[#09090b]/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Response Preview</h2>
              <span className="text-xs text-zinc-500 font-mono">application/json</span>
            </div>
            <div className="bg-black/40 rounded-lg border border-zinc-800 p-4 overflow-auto max-h-[400px] relative group">
              <pre className="text-sm text-zinc-300 font-mono">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              This is an example of the data structure your API will return. The actual data will be generated dynamically.
            </p>
          </div>


        </div>

        <div className="space-y-6">
          <div className="bg-indigo-500/10 p-6 rounded-xl border border-indigo-500/20">
            <h3 className="font-semibold text-indigo-400 mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-indigo-300">
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <div>
                Use the <code>limit</code> query parameter to control the number of records (max 100).
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                Data is generated deterministically based on the schema.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
