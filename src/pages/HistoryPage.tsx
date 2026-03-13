import { useState, useEffect } from 'react';
import { getVerificationHistory, deleteVerification, deleteAllVerifications } from '@/lib/api';
import { VerificationResult } from '@/types';
import HistoryCard from '@/components/features/HistoryCard';
import { History, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/stores/authStore';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getVerificationHistory();
      console.log('Loading verification history:', data.length, 'items');
      setHistory(data);
    } catch (error: any) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load verification history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteVerification(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success('Verification deleted');
    } catch (error: any) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete verification');
    }
  };

  const handleClearAllHistory = async () => {
    setDeletingAll(true);
    try {
      await deleteAllVerifications();
      setHistory([]);
      setShowDeleteAllConfirm(false);
      toast.success('All verification history deleted');
    } catch (error: any) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear verification history');
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Verification History</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {user ? 'Your verifications synced across all devices' : 'Your past fact-checks and verification results'}
            </p>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Delete All History?</h3>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete all {history.length} verification{history.length !== 1 ? 's' : ''} from your history. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  disabled={deletingAll}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllHistory}
                  disabled={deletingAll}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingAll ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map(result => (
              <HistoryCard 
                key={result.id} 
                result={result}
                onDelete={() => handleDeleteItem(result.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Verification History</h3>
            <p className="text-muted-foreground mb-6">
              Start verifying claims to see your history here
            </p>
            <a 
              href="/verify"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Verify Your First Claim
            </a>
          </div>
        )}

        {/* Stats */}
        {history.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {history.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Verifications</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {history.filter(h => h.truthScore >= 60).length}
              </div>
              <div className="text-xs text-muted-foreground">True/Mostly True</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-danger mb-1">
                {history.filter(h => h.truthScore < 40).length}
              </div>
              <div className="text-xs text-muted-foreground">False/Mostly False</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {history.filter(h => h.truthScore >= 40 && h.truthScore < 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Disputed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
