import { useNavigate } from 'react-router-dom';
import { VerificationResult } from '@/types';
import { formatDate, getScoreColor, getStatusLabel } from '@/lib/utils';
import { FileText, Link as LinkIcon, Image, Video, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HistoryCardProps {
  result: VerificationResult;
  onDelete?: () => void;
}

export default function HistoryCard({ result, onDelete }: HistoryCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
