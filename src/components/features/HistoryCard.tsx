import { useNavigate } from 'react-router-dom';
import { VerificationResult } from '@/types';
import { formatDate, getScoreColor, getStatusLabel } from '@/lib/utils';
import { FileText, Link as LinkIcon, Image, Video } from 'lucide-react';

interface HistoryCardProps {
  result: VerificationResult;
}

export default function HistoryCard({ result }: HistoryCardProps) {
  const navigate = useNavigate();

  const inputIcons = {
    text: FileText,
    url: LinkIcon,
    image: Image,
    video: Video
  };

  const InputIcon = inputIcons[result.inputType];

  const handleClick = () => {
    navigate(`/result/${result.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md bg-card"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <InputIcon className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
            {result.claim}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {formatDate(result.verifiedAt)}
          </p>
          
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${getScoreColor(result.truthScore)}`}>
              {result.truthScore}%
            </span>
            <span className="text-xs text-muted-foreground">
              {getStatusLabel(result.status)}
            </span>
            <span className="text-xs text-muted-foreground">
              {result.sources.length} sources
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
