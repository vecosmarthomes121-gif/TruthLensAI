import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTeams, createTeam, Team } from '@/lib/team-api';
import { useAuth } from '@/stores/authStore';
import { Users, Plus, Building2, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to access team workspaces');
      navigate('/');
      return;
    }

    if (user) {
      loadTeams();
    }
  }, [user, authLoading, navigate]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await getMyTeams();
      setTeams(data);
    } catch (error: any) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setCreating(true);
    try {
      const team = await createTeam(newTeam.name, newTeam.description);
      toast.success('Team created successfully!');
      setTeams(prev => [team, ...prev]);
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
      navigate(`/teams/${team.id}`);
    } catch (error: any) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Team Workspaces</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Collaborate with your newsroom and research teams on fact-checking projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            <Plus className="h-5 w-5" />
            Create Team
          </button>
        </div>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Create New Team</h3>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Team Name</label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., News Verification Team"
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your team's purpose..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                    Active
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {team.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Team</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progress</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first team workspace to start collaborating with your colleagues on fact-checking projects
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              <Plus className="h-5 w-5" />
              Create Your First Team
            </button>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-6">
            <CheckCircle className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-bold mb-2">Role-Based Access</h4>
            <p className="text-sm text-muted-foreground">
              Assign owners, admins, editors, and viewers with granular permissions
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl p-6">
            <Users className="h-8 w-8 text-purple-600 mb-3" />
            <h4 className="font-bold mb-2">Task Assignment</h4>
            <p className="text-sm text-muted-foreground">
              Assign fact-checking tasks to team members and track progress
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-bold mb-2">Collaborative Progress</h4>
            <p className="text-sm text-muted-foreground">
              Comment on verifications and monitor team performance metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
