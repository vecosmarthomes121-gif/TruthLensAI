import { ExternalLink, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { Source } from '@/types';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const stanceIcon = {
    supports: CheckCircle2,
    contradicts: XCircle,
    neutral: MinusCircle
  };

  const stanceColor = {
    supports: 'text-success',
    contradicts: 'text-danger',
    neutral: 'text-warning'
  };

  const StanceIcon = stanceIcon[source.stance];

  return (
    <div className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-card">
      {/* Image Header */}
      {source.imageUrl && (
        <div className="relative h-32 bg-gray-100 overflow-hidden">
          <img 
            src={source.imageUrl} 
            alt={source.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.parentElement!.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2">
            <StanceIcon className={cn("h-5 w-5 drop-shadow-lg", stanceColor[source.stance])} />
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{source.name}</h3>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                <span className="text-xs text-muted-foreground">{source.credibilityScore}% credible</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{source.publishedDate}</p>
          </div>
          {!source.imageUrl && (
            <StanceIcon className={cn("h-5 w-5 flex-shrink-0", stanceColor[source.stance])} />
          )}
        </div>

        <p className="text-sm text-foreground/80 mb-3 line-clamp-3">
          {source.excerpt}
        </p>

        <a 
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Read full article
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
