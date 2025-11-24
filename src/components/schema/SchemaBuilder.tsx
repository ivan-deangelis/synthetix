'use client'

import { useState, useEffect } from 'react';
import { SchemaField, ApiSchema } from '@/types/schema';
import FieldRow from './FieldRow';
import { Database, Plus, Save, Trash2, Wand2, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { validateSchema } from '@/utils/schemaValidation';
import { generateSchemaFromPrompt } from '@/actions/ai';
import { generateHybridData } from '@/actions/generateHybridData';
import { generateDataAction } from '@/actions/generateDataAction';
import { X, Eye, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { generateMockData } from '@/utils/dataGeneration';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SchemaBuilderProps {
  initialData?: {
    id: string;
    name: string;
    description: string;
    endpoint_slug: string;
    schema_definition: SchemaField[];
    is_public: boolean;
    mock_data: any[];
    headers: Record<string, string>;
    status: string;
  };
  readOnly?: boolean;
  enableAI?: boolean;
}

export default function SchemaBuilder({ initialData, readOnly = false, enableAI = true }: SchemaBuilderProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [schema, setSchema] = useState<ApiSchema>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    endpointSlug: initialData?.endpoint_slug || '',
    fields: initialData?.schema_definition || []
  });
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [loading, setLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>(initialData?.mock_data || []);
  const [isGeneratingAiData, setIsGeneratingAiData] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    initialData?.headers 
      ? Object.entries(initialData.headers).map(([key, value]) => ({ key, value })) 
      : []
  );
  const [generationCount, setGenerationCount] = useState(10);
  const [isExpanded, setIsExpanded] = useState(false);
  const [username, setUsername] = useState<string>('user');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      }
    };
    fetchUser();
  }, []);

  const addHeader = () => {
    if (readOnly) return;
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    if (readOnly) return;
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    if (readOnly) return;
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addField = () => {
    if (readOnly) return;
    const newField: SchemaField = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      required: true
    };
    setSchema(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    if (readOnly) return;
    // Recursive update function to handle nested fields
    const updateRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        if (field.children) {
          return { ...field, children: updateRecursive(field.children) };
        }
        return field;
      });
    };

    setSchema(prev => ({ ...prev, fields: updateRecursive(prev.fields) }));
  };

  const deleteField = (id: string) => {
    if (readOnly) return;
    const deleteRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.filter(field => field.id !== id).map(field => {
        if (field.children) {
          return { ...field, children: deleteRecursive(field.children) };
        }
        return field;
      });
    };

    setSchema(prev => ({ ...prev, fields: deleteRecursive(prev.fields) }));
  };

  const addChildField = (parentId: string) => {
    if (readOnly) return;
    const newField: SchemaField = {
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      required: true
    };

    const addRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.map(field => {
        if (field.id === parentId) {
          return { ...field, children: [...(field.children || []), newField] };
        }
        if (field.children) {
          return { ...field, children: addRecursive(field.children) };
        }
        return field;
      });
    };

    setSchema(prev => ({ ...prev, fields: addRecursive(prev.fields) }));
  };

  const handleAiGenerate = async () => {
    if (readOnly || !aiPrompt.trim()) return;
    
    setAiLoading(true);
    
    // Show loading toast
    toast({
      title: "Generating schema...",
      description: "AI is processing your request.",
    });
    
    try {
      const generated = await generateSchemaFromPrompt(aiPrompt);
      if (generated) {
        // We need to ensure all fields have valid UUIDs
        const processFields = (fields: any[]): SchemaField[] => {
          return fields.map(f => ({
            ...f,
            id: crypto.randomUUID(),
            children: f.children ? processFields(f.children) : undefined
          }));
        };

        setSchema({
          name: generated.name || '',
          description: generated.description || '',
          endpointSlug: generated.endpointSlug || '',
          fields: processFields(generated.fields || [])
        });
        setShowAiModal(false);
        
        toast({
          variant: "success",
          title: "Schema generated!",
          description: "Your API schema has been created successfully.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Failed to generate schema. Please try again.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handlePreview = () => {
    // Always use Faker for quick preview of structure
    const data = generateMockData(schema.fields, 3);
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (readOnly) return;
    setLoading(true);
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to save an API.",
      });
      setLoading(false);
      return;
    }

    // Only generate data for NEW APIs, not updates (to save AI tokens)
    const isNewApi = !initialData;
    
    // Check if schema has changed and has new AI-instructed fields
    const schemaChanged = initialData && JSON.stringify(initialData.schema_definition) !== JSON.stringify(schema.fields);
    const shouldGenerateData = isNewApi || schemaChanged;
    
    const initialStatus = shouldGenerateData ? 'generating' : (initialData?.status || 'active');

    const apiData = {
      user_id: user.id,
      name: schema.name,
      description: schema.description,
      endpoint_slug: schema.endpointSlug,
      schema_definition: schema.fields,
      is_public: isPublic,
      mock_data: isNewApi ? [] : (initialData?.mock_data || []),
      headers: headers.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
      status: initialStatus
    };
    
    let error;
    let savedApiId;
    
    if (initialData) {
      const { error: updateError } = await supabase
        .from('apis')
        .update(apiData)
        .eq('id', initialData.id);
      error = updateError;
      savedApiId = initialData.id;
    } else {
      const { data: insertedApi, error: insertError } = await supabase
        .from('apis')
        .insert([apiData])
        .select()
        .single();
      error = insertError;
      savedApiId = insertedApi?.id;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving API:', error);
      toast({
        variant: "destructive",
        title: "Failed to save API",
        description: error.message || "An error occurred while saving your API.",
      });
      return;
    }
    
    toast({
      variant: "success",
      title: isNewApi ? "API deployed successfully!" : "API updated successfully!",
      description: shouldGenerateData
        ? "Data is generating in the background." 
        : "Your API changes have been saved.",
    });
    
    // Trigger background hybrid generation for new APIs or schema changes
    if (shouldGenerateData && savedApiId) {
      generateDataAction({
        apiId: savedApiId,
        schema: schema,
        generationCount,
        aiContext,
        isSchemaUpdate: !isNewApi,
        oldSchema: initialData?.schema_definition || []
      }).catch(err => console.error('Background generation trigger failed:', err));
    }
    
    // Navigate to API details page
    setTimeout(() => {
      router.push(savedApiId ? `/dashboard/api/${savedApiId}` : '/dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* API Details Header */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800/50 bg-[#09090b]/50">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">API Name</label>
              <input
                type="text"
                value={schema.name}
                onChange={(e) => setSchema({ ...schema, name: e.target.value })}
                placeholder="e.g. User Profile API"
                disabled={readOnly || aiLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Endpoint Slug</label>
              <div className={`flex rounded-xl bg-black/40 border border-zinc-800 overflow-hidden transition-all ${!readOnly ? 'focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50' : 'opacity-50 cursor-not-allowed'}`}>
                <span className="inline-flex items-center px-4 text-zinc-500 border-r border-zinc-800 bg-zinc-900/30 text-sm">
                  /api/v1/{username}/
                </span>
                <input
                  type="text"
                  value={schema.endpointSlug}
                  onChange={(e) => {
                    // Convert to lowercase, replace spaces with hyphens, remove invalid chars
                    const formatted = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    setSchema({ ...schema, endpointSlug: formatted });
                  }}
                  placeholder="users"
                  disabled={readOnly || aiLoading}
                  className="flex-1 px-4 py-2.5 bg-transparent border-none text-zinc-100 placeholder-zinc-600 focus:ring-0 text-sm disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={schema.description}
              onChange={(e) => setSchema({ ...schema, description: e.target.value })}
              placeholder="Describe what this API does..."
              rows={4}
              disabled={readOnly || aiLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Global Headers</label>
            <button
              onClick={addHeader}
              disabled={readOnly}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Add Header
            </button>
          </div>
          
          <div className="space-y-3">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Key (e.g. Authorization)"
                  disabled={readOnly}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="Value"
                  disabled={readOnly}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => removeHeader(index)}
                  disabled={readOnly}
                  className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {headers.length === 0 && (
              <p className="text-sm text-zinc-600 italic">No custom headers configured.</p>
            )}
          </div>
        </div>
      </div>

      <div className={isExpanded ? 'space-y-8' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'}>
        {/* Schema Definition - First when expanded */}
        {isExpanded && (
          <div className="w-full">
            <div className="glass-card rounded-2xl border border-zinc-800/50 bg-[#09090b]/50 overflow-hidden min-h-[600px] flex flex-col relative">
              {/* Loading Overlay */}
              {aiLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-sm text-zinc-300 font-medium">AI is generating your schema...</p>
                  </div>
                </div>
              )}
              
              <div className="px-6 py-4 border-b border-zinc-800 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Schema Definition</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-6 flex-1 space-y-4">
                {schema.fields.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 min-h-[300px]">
                    <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
                      <Database className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-sm">No fields defined yet.</p>
                    <button
                      onClick={addField}
                      disabled={readOnly || aiLoading}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add your first field manually
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schema.fields.map((field) => (
                      <FieldRow
                        key={field.id}
                        field={field}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onDelete={() => deleteField(field.id)}
                        readOnly={readOnly}
                        enableAI={enableAI}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={addField}
                  disabled={readOnly || aiLoading}
                  className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all flex items-center justify-center gap-2 group text-sm font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left Column: AI & Settings */}
        <div className={isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'lg:col-span-5 space-y-6'}>
          {/* AI Input Panel */}
          {enableAI && (
          <div className="glass-card rounded-2xl border border-indigo-500/20 bg-[#09090b]/80 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <div className="p-6 space-y-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Schema Generator</h3>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Describe your API</label>
                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Create a user profile API with realistic data including full name, email, avatar URL, job title, and subscription status."
                    disabled={readOnly}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-indigo-500/30 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all h-32 resize-none text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={handleAiGenerate}
                      disabled={readOnly || aiLoading || !aiPrompt.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
          
          {!enableAI && (
            <div className="glass-card rounded-2xl border border-zinc-800/50 bg-[#09090b]/50 overflow-hidden relative">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-400">AI Features Disabled</h3>
                </div>
                
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-sm leading-relaxed">
                  <p>
                    AI generation features are currently disabled because the OpenAI API key is missing. 
                    You can still define your schema manually and generate mock data using Faker JS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generation Settings Panel */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-800/50 bg-[#09090b]/50 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Data Generation Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800">
                <span className="text-sm text-zinc-400">Row Count</span>
                <select
                  value={generationCount}
                  onChange={(e) => setGenerationCount(Number(e.target.value))}
                  disabled={readOnly}
                  className="bg-transparent border-none text-indigo-400 font-mono text-sm font-bold focus:ring-0 text-right cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={3}>3 items</option>
                  <option value={10}>10 items</option>
                  <option value={25}>25 items</option>
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                </select>
              </div>

              {enableAI && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Data Context</label>
                    <input
                      type="text"
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      placeholder="e.g. Tech Startup Employees"
                      disabled={readOnly}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
              )}


              </div>

            <div className="pt-4 border-t border-zinc-800/50 flex flex-col gap-3">
               <button
                onClick={handlePreview}
                disabled={schema.fields.length === 0 || aiLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-zinc-300 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Preview Data
              </button>
              
              <button
                onClick={handleSave}
                disabled={readOnly || loading || schema.fields.length === 0 || aiLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 fill-current" />
                )}
                Deploy API
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Schema Definition - Only shown when collapsed */}
        {!isExpanded && (
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl border border-zinc-800/50 bg-[#09090b]/50 overflow-hidden min-h-[600px] flex flex-col relative">
            {/* Loading Overlay */}
            {aiLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm text-zinc-300 font-medium">AI is generating your schema...</p>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 border-b border-zinc-800 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Schema Definition</h3>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-6 flex-1 space-y-4">
              {schema.fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 min-h-[300px]">
                  <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800">
                    <Database className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-sm">No fields defined yet.</p>
                  <button
                    onClick={addField}
                    disabled={readOnly || aiLoading}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add your first field manually
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {schema.fields.map((field) => (
                    <FieldRow
                      key={field.id}
                      field={field}
                      onUpdate={(updates) => updateField(field.id, updates)}
                      onDelete={() => deleteField(field.id)}
                      readOnly={readOnly}
                      enableAI={enableAI}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={addField}
                disabled={readOnly || aiLoading}
                className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all flex items-center justify-center gap-2 group text-sm font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Add Field
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-card bg-[#09090b] rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col border border-zinc-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-100">Data Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-zinc-500 hover:text-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-black/50 rounded-lg p-4 border border-zinc-800">
              <pre className="text-sm text-emerald-400 font-mono">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
