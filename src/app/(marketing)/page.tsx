'use client';

import Link from 'next/link';
import { ArrowRight, Check, Code2, Database, Zap, Sparkles, Globe } from 'lucide-react';
import SchemaBuilder from '@/components/schema/SchemaBuilder';
import { motion } from 'framer-motion';
import Features from '@/components/marketing/Features';
import HowItWorks from '@/components/marketing/HowItWorks';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0613] text-white overflow-hidden">
      {/* Hero Section */}
      <section
        className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32"
        style={{
          background: 'linear-gradient(135deg, #0a0613 0%, #150d27 100%)',
        }}
      >
        {/* Background Effects */}
        <div
          className="absolute top-0 right-0 h-1/2 w-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(13, 10, 25, 0) 60%)',
          }}
        />
        <div
          className="absolute top-0 left-0 h-1/2 w-1/2 -scale-x-100 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(13, 10, 25, 0) 60%)',
          }}
        />

        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl mx-auto"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Next Generation API Development
            </span>
            
            <h1 className="mx-auto mb-6 text-5xl font-light md:text-6xl lg:text-7xl tracking-tight leading-tight">
              Build <span className="text-indigo-400 font-normal">AI-Powered</span> APIs <br className="hidden md:block" />
              in Seconds
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
              Synthetix combines artificial intelligence with instant deployment to help you 
              generate production-ready backend schemas and mock data with precision and ease.
            </p>

            <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:mb-20 sm:flex-row">
              <Link
                prefetch={false}
                href="/signup"
                className="relative w-full sm:w-auto overflow-hidden rounded-full border border-white/10 bg-linear-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 group"
              >
                <span className="relative z-10 font-medium flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="flex w-full items-center justify-center gap-2 text-zinc-400 transition-colors hover:text-white sm:w-auto px-8 py-4 font-medium"
              >
                <span>See how it works</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Earth Background Effect */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] opacity-40 pointer-events-none -z-10">
               <img
                src="https://i.postimg.cc/5NwYwdTn/earth.webp"
                alt="Earth"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Schema Builder Visual */}
            <div className="relative rounded-2xl border border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
              
              {/* Window Controls */}
              <div className="h-10 border-b border-zinc-800 bg-black/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <div className="ml-4 px-3 py-1 rounded-md bg-zinc-900/50 border border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  synthetix.dev/schema-builder
                </div>
              </div>

              {/* Interactive Demo Area - Read Only Mode */}
              <div className="p-2 md:p-6 text-left max-h-[600px] overflow-y-auto custom-scrollbar">
                <SchemaBuilder 
                  readOnly={true}
                  initialData={{
                    status: 'active',
                    id: 'demo',
                    name: 'E-commerce Product API',
                    description: 'A comprehensive API for managing product inventory with variants and pricing.',
                    endpoint_slug: 'products',
                    is_public: true,
                    headers: {},
                    mock_data: [],
                    schema_definition: [
                      { id: '1', name: 'id', type: 'string', required: true, fakerType: 'string.uuid' },
                      { id: '2', name: 'name', type: 'string', required: true, fakerType: 'commerce.productName' },
                      { id: '3', name: 'price', type: 'number', required: true, fakerType: 'commerce.price' },
                      { id: '4', name: 'inStock', type: 'boolean', required: true, fakerType: 'datatype.boolean' },
                      { 
                        id: '5', 
                        name: 'details', 
                        type: 'object', 
                        required: true, 
                        children: [
                          { id: '5a', name: 'material', type: 'string', required: true, fakerType: 'commerce.productMaterial' },
                          { id: '5b', name: 'brand', type: 'string', required: true, fakerType: 'company.name' }
                        ]
                      }
                    ]
                  }} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* How it Works Section */}
      <HowItWorks />
    </div>
  );
}
