import { createClient } from '@/utils/supabase/server';
import SchemaBuilder from '@/components/schema/SchemaBuilder';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditApiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: api, error } = await supabase
    .from('apis')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !api) {
    notFound();
  }

  return (
    <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/api/${api.id}`}
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to API Details
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit API: {api.name}</h1>
        <p className="mt-2 text-slate-600">Modify your API schema and settings.</p>
      </div>

      <SchemaBuilder initialData={api} enableAI={!!process.env.OPENAI_API_KEY} />
    </div>
  );
}
