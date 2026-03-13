import { useState, useEffect } from 'react';
import { 
  getVerificationComments, 
  addComment, 
  updateComment, 
  deleteComment,
  VerificationComment 
} from '@/lib/team-api';
import { useAuth } from '@/stores/authStore';
import { MessageSquare, Send, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  verificationId: string;
}

export default function VerificationComments({ verificationId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<VerificationComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [verificationId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getVerificationComments(verificationId);
      setComments(data);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      // Silently fail if user doesn't have access
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await addComment(verificationId, newComment);
      setNewComment('');
      toast.success('Comment added');
      loadComments();
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await updateComment(commentId, editText);
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
      loadComments();
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
      loadComments();
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const startEdit = (comment: VerificationComment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Don't show comments section if user doesn't have access (not in team)
  if (!user || (comments.length === 0 && loading)) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Team Comments</h3>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {comment.user_profile?.username?.[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{comment.user_profile?.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {user.id === comment.user_id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(comment)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
            
            {editingId === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-3 py-1 text-sm rounded bg-primary text-white hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{comment.comment}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}
    </div>
  );
}
