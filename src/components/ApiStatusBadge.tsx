'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface ApiStatusBadgeProps {
  apiId: string;
  initialStatus: string;
}

export default function ApiStatusBadge({ apiId, initialStatus }: ApiStatusBadgeProps) {
  const [status, setStatus] = useState(initialStatus);
  const supabase = createClient();

  useEffect(() => {
    if (status !== 'generating') return;

    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('apis')
        .select('status')
        .eq('id', apiId)
        .single();

      if (!error && data) {
        setStatus(data.status);
        if (data.status !== 'generating') {
          clearInterval(pollInterval);
          // Refresh the page to show updated data
          if (data.status === 'active') {
            window.location.reload();
          }
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [apiId, status, supabase]);

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Active',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400'
        };
      case 'generating':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Generating AI Data...',
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/30',
          textColor: 'text-indigo-400'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Generation Failed',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Active',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
}
