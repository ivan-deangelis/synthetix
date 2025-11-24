import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Server, Clock, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import DashboardSearch from '@/components/dashboard/DashboardSearch';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const query = params?.query || '';

  let apiQuery = supabase
    .from('apis')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (query) {
    apiQuery = apiQuery.ilike('name', `%${query}%`);
  }

  const { data: apis } = await apiQuery;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:text-left sm:flex sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Welcome back,</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  {user.user_metadata?.username || user.user_metadata?.full_name || 'Developer'}
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-xl text-zinc-400">
                Manage your AI-powered APIs and data sources.
              </p>
            </div>
            <div className="mt-8 sm:mt-0">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-black bg-white hover:bg-zinc-200 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-5 h-5" />
                Create New API
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <DashboardSearch />
        </div>

        {!apis || apis.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-zinc-800/50 bg-[#09090b]/50">
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-indigo-500/20">
              <Server className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100">
              {query ? 'No APIs found matching your search' : 'No APIs created yet'}
            </h3>
            <p className="mt-2 text-zinc-400 max-w-md mx-auto">
              {query ? 'Try adjusting your search terms.' : 'Get started by creating your first API schema. It only takes a few minutes to generate realistic data.'}
            </p>
            {!query && (
              <div className="mt-8">
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 px-6 py-3 text-indigo-400 bg-indigo-500/10 font-medium rounded-full hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                >
                  Create your first API
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apis.map((api) => (
              <div key={api.id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group border border-zinc-800 bg-[#09090b]/50 hover:border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Server className="w-24 h-24 text-indigo-500 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors backdrop-blur-sm border border-indigo-500/20">
                    <Server className="w-6 h-6 text-indigo-400" />
                  </div>
                  {/* Status Badge */}
                  {api.status === 'generating' && (
                    <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md whitespace-nowrap">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  )}
                  {api.status === 'active' && (
                    <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md whitespace-nowrap">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  )}
                  {api.status === 'failed' && (
                    <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md whitespace-nowrap">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Failed
                    </span>
                  )}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors">{api.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 line-clamp-2 h-10">{api.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(api.created_at).toLocaleDateString()}
                    </div>
                    <div className="font-mono bg-black/40 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                      /api/v1/{user.user_metadata?.username || 'user'}/{api.endpoint_slug}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/api/${api.id}`}
                    className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-zinc-300 bg-black/40 border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all shadow-sm"
                  >
                    Manage API
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
