'use client';

import { Upload, Edit3, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NoticeSource } from '@/types';

interface SourceBadgeProps {
  source?: NoticeSource;
  showLabel?: boolean;
}

export function SourceBadge({ source, showLabel = false }: SourceBadgeProps) {
  if (!source) return null;

  const config = {
    upload: {
      icon: Upload,
      label: 'Uploaded',
      tooltip: 'Uploaded by user',
      className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    manual: {
      icon: Edit3,
      label: 'Manual',
      tooltip: 'Manually created',
      className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    },
    gstn_portal: {
      icon: Zap,
      label: 'GST Portal',
      tooltip: 'Auto-fetched from GST Portal',
      className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    },
  };

  const sourceConfig = config[source] || config.upload;
  const Icon = sourceConfig.icon;

  const badge = (
    <Badge variant="outline" className={sourceConfig.className}>
      <Icon className="h-3 w-3" />
      {showLabel && <span className="ml-1">{sourceConfig.label}</span>}
    </Badge>
  );

  if (showLabel) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{sourceConfig.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
