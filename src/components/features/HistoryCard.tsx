import { useNavigate } from 'react-router-dom';
import { VerificationResult } from '@/types';
import { formatDate, getScoreColor, getStatusLabel } from '@/lib/utils';
import { FileText, Link as LinkIcon, Image, Video, Mic, Trash2, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface HistoryCardProps {
  result: VerificationResult;
  onDelete?: () => void;
}

export default function HistoryCard({ result, onDelete }: HistoryCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const inputIcons: Record<string, any> = {
    text: FileText,
    url: LinkIcon,
    image: Image,
    video: Video,
    audio: Mic,
  };

  const InputIcon = inputIcons[result.inputType] ?? FileText;

  const isAudio = result.inputType === 'audio';
  const isImage = result.inputType === 'image';
  const isVideo = result.inputType === 'video';
  const isMedia = isAudio || isImage || isVideo;

  // Extract Reality Defender verdict from contentAnalysis for audio
  const rdVerdict: string | null = (result.contentAnalysis as any)?.audioAnalysis?.realityDefender?.result ?? null;
  const suspicionScore: number | null = (result.contentAnalysis as any)?.audioAnalysis?.suspicionScore ?? (result.contentAnalysis as any)?.imageAnalysis?.suspicionScore ?? null;

  const handleClick = () => {
    navigate(`/result/${result.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    if (onDelete) {
      await onDelete();
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative">
      <div 
        onClick={handleClick}
        className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md bg-card"
      >
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isAudio ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-primary/10'}`}>
            <InputIcon className={`h-5 w-5 ${isAudio ? 'text-violet-600 dark:text-violet-400' : 'text-primary'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isAudio && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-700">
                  <Mic className="h-3 w-3" /> Audio Deepfake
                </span>
              )}
              {isImage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-700">
                  <Image className="h-3 w-3" /> Image Check
                </span>
              )}
              {isVideo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-700">
                  <Video className="h-3 w-3" /> Video Check
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-foreground">
              {result.claim}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {formatDate(result.verifiedAt)}
            </p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-lg font-bold ${getScoreColor(result.truthScore)}`}>
                {result.truthScore}%
              </span>
              {/* Audio: show Reality Defender verdict instead of standard label */}
              {isAudio && rdVerdict ? (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  rdVerdict === 'FAKE' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                  rdVerdict === 'REAL' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {rdVerdict === 'FAKE' ? <ShieldAlert className="h-3 w-3" /> : rdVerdict === 'REAL' ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  RD: {rdVerdict}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {isMedia && suspicionScore !== null ? `Suspicion: ${suspicionScore}/100` : getStatusLabel(result.status)}
                </span>
              )}
              {!isMedia && (
                <span className="text-xs text-muted-foreground">
                  {result.sources.length} sources
                </span>
              )}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center text-red-600 transition-colors flex-shrink-0"
              title="Delete verification"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Delete Verification?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this verification? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
