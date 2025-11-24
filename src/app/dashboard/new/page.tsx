import SchemaBuilder from '@/components/schema/SchemaBuilder';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewApiPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Create New API</h1>
        <p className="mt-2 text-slate-600">Define your data structure and deploy a REST API in seconds.</p>
      </div>

      <SchemaBuilder enableAI={!!process.env.OPENAI_API_KEY} />
    </div>
  );
}
