import { SchemaField, FieldType } from '@/types/schema';
import { Trash2, Plus, ChevronRight, ChevronDown, Sparkles, GripVertical } from 'lucide-react';
import { FAKER_TYPES } from '@/constants/fakerTypes';
import { useState } from 'react';

interface FieldRowProps {
  field: SchemaField;
  onUpdate: (updates: Partial<SchemaField>) => void;
  onDelete: () => void;
  readOnly?: boolean;
  generationMode?: 'faker' | 'ai';
  enableAI?: boolean;
}

export default function FieldRow({ field, onUpdate, onDelete, readOnly = false, generationMode = 'faker', enableAI = true }: FieldRowProps) {
  const [showAiInstruction, setShowAiInstruction] = useState(false);

  return (
    <div className={`group relative bg-black/40 border border-zinc-800 rounded-xl p-4 transition-all ${!readOnly ? 'hover:border-indigo-500/30 hover:bg-zinc-900/50' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-3 text-zinc-600 transition-colors ${!readOnly ? 'hover:text-zinc-400' : 'cursor-default opacity-50'}`}>
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Field Name</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g. username"
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Data Type</label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          {/* Faker Type Selector - Show for all non-object/array types */}
          {field.type !== 'object' && field.type !== 'array' && (
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Faker Type (Runtime Data)</label>
              <select
                value={field.fakerType || ''}
                onChange={(e) => onUpdate({ fakerType: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a type...</option>
                {/* @ts-ignore */}
                {FAKER_TYPES[field.type]?.map((ft: any) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Array Item Type Selector */}
          {field.type === 'array' && (
             <div className="md:col-span-4">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Array Item Type</label>
                <select
                  value={field.arrayItemType || 'string'}
                  onChange={(e) => onUpdate({ arrayItemType: e.target.value as FieldType })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                </select>
             </div>
          )}

           {/* Array Item Faker Type Selector */}
           {field.type === 'array' && field.arrayItemType !== 'object' && (
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Item Faker Type</label>
              <select
                value={field.fakerType || ''}
                onChange={(e) => onUpdate({ fakerType: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a type...</option>
                {/* @ts-ignore */}
                {FAKER_TYPES[field.arrayItemType || 'string']?.map((ft: any) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2 flex items-end justify-end gap-2 pb-1">
             {enableAI && (
               <button
                  onClick={() => setShowAiInstruction(!showAiInstruction)}
                  disabled={readOnly}
                  className={`p-2 rounded-lg transition-all ${showAiInstruction || field.aiInstruction ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800'} ${readOnly ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-500' : ''}`}
                  title="Add AI Instruction"
               >
                  <Sparkles className="w-4 h-4" />
               </button>
             )}
            <button
              onClick={onDelete}
              disabled={readOnly}
              className={`p-2 text-zinc-500 rounded-lg transition-all ${!readOnly ? 'hover:text-red-400 hover:bg-red-500/10' : 'opacity-50 cursor-not-allowed'}`}
              title="Remove Field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Instruction Input - Show when toggle is active */}
      {showAiInstruction && (
        <div className="mt-3 ml-9 pl-4 border-l-2 border-indigo-500/30 animate-in slide-in-from-top-1 duration-200">
            <label className="block text-xs font-medium text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                AI Generation Instruction
            </label>
            <input
                type="text"
                value={field.aiInstruction || ''}
                onChange={(e) => onUpdate({ aiInstruction: e.target.value })}
                placeholder="e.g. 'Must be a valid UK phone number' or 'Format: YYYY-MM'"
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-indigo-100 placeholder-indigo-400/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
      )}

      {/* Nested Fields for Objects */}
      {(field.type === 'object' || (field.type === 'array' && field.arrayItemType === 'object')) && (
        <div className="mt-4 ml-8 pl-4 border-l border-zinc-800 space-y-4">
          {field.children?.map((child) => (
            <FieldRow
              key={child.id}
              field={child}
              onUpdate={(updates) => {
                const updatedChildren = field.children?.map((c) =>
                  c.id === child.id ? { ...c, ...updates } : c
                );
                onUpdate({ children: updatedChildren });
              }}
              onDelete={() => {
                const updatedChildren = field.children?.filter((c) => c.id !== child.id);
                onUpdate({ children: updatedChildren });
              }}
              readOnly={readOnly}
              generationMode={generationMode}
              enableAI={enableAI}
            />
          ))}
          <button
            onClick={() => {
              const newField: SchemaField = {
                id: crypto.randomUUID(),
                name: '',
                type: 'string',
                required: true,
              };
              onUpdate({ children: [...(field.children || []), newField] });
            }}
            disabled={readOnly}
            className={`text-sm text-indigo-400 font-medium flex items-center gap-1 py-2 ${!readOnly ? 'hover:text-indigo-300' : 'opacity-50 cursor-not-allowed hover:text-indigo-400'}`}
          >
            <Plus className="w-3 h-3" /> Add Nested Field
          </button>
        </div>
      )}
    </div>
  );
}
