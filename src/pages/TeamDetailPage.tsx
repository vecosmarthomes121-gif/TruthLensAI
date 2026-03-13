import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTeamById,
  getTeamMembers,
  getTeamAssignments,
  getMyTeamRole,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  assignVerification,
  updateAssignmentStatus,
  getTeamStats,
  Team,
  TeamMember,
  VerificationAssignment,
} from '@/lib/team-api';
import { getVerificationHistory } from '@/lib/api';
import { useAuth } from '@/stores/authStore';
import {
  Users,
  UserPlus,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Shield,
  Edit3,
  Eye,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabType = 'assignments' | 'members' | 'analytics';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<VerificationAssignment[]>([]);
  const [myRole, setMyRole] = useState<TeamMember['role'] | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('editor');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const [teamData, membersData, assignmentsData, role, statsData] = await Promise.all([
        getTeamById(teamId),
        getTeamMembers(teamId),
        getTeamAssignments(teamId),
        getMyTeamRole(teamId),
        getTeamStats(teamId),
      ]);

      setTeam(teamData);
      setMembers(membersData);
      setAssignments(assignmentsData);
      setMyRole(role);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load team:', error);
      toast.error('Failed to load team data');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !newMemberEmail.trim()) return;

    setAddingMember(true);
    try {
      await addTeamMember(teamId, newMemberEmail, newMemberRole);
      toast.success('Team member added successfully');
      setShowAddMember(false);
      setNewMemberEmail('');
      loadTeamData();
    } catch (error: any) {
      console.error('Failed to add member:', error);
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: TeamMember['role']) => {
    try {
      await updateTeamMemberRole(memberId, role);
      toast.success('Member role updated');
      loadTeamData();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeTeamMember(memberId);
      toast.success('Member removed from team');
      loadTeamData();
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateAssignmentStatus = async (
    assignmentId: string,
    status: VerificationAssignment['status']
  ) => {
    try {
      await updateAssignmentStatus(assignmentId, status);
      toast.success('Assignment status updated');
      loadTeamData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update assignment status');
    }
  };

  const canManageMembers = myRole === 'owner' || myRole === 'admin';
  const canAssignTasks = myRole === 'owner' || myRole === 'admin' || myRole === 'editor';

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading team...</p>
      </div>
    );
  }

  if (!team) return null;

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'admin': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'editor': return <Edit3 className="h-4 w-4 text-green-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: VerificationAssignment['status']) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
          <p className="text-lg text-muted-foreground">{team.description}</p>
          <div className="flex items-center gap-2 mt-3">
            {getRoleIcon(myRole || 'viewer')}
            <span className="text-sm font-semibold capitalize">{myRole}</span>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">Members</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-muted-foreground">Total Tasks</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-muted-foreground">Completed</span>
              </div>
              <div className="text-2xl font-bold">{stats.completedAssignments}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-semibold text-muted-foreground">Completion Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('assignments')}
              className={cn(
                "pb-3 border-b-2 font-semibold transition-colors",
                activeTab === 'assignments'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Assignments ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                "pb-3 border-b-2 font-semibold transition-colors",
                activeTab === 'members'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "pb-3 border-b-2 font-semibold transition-colors",
                activeTab === 'analytics'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Team Assignments</h2>
              {canAssignTasks && (
                <button
                  onClick={() => navigate('/verify')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  Create Assignment
                </button>
              )}
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-card border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {assignment.verification?.claim || 'Verification'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            Assigned to: {assignment.assignee?.username || 'Unassigned'}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(assignment.status))}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground mb-3">{assignment.notes}</p>
                    )}
                    <div className="flex gap-2">
                      {canAssignTasks && (
                        <>
                          {assignment.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(assignment.id, 'in_progress')}
                              className="text-sm px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Start
                            </button>
                          )}
                          {assignment.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(assignment.id, 'completed')}
                              className="text-sm px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Complete
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/result/${assignment.verification_id}`)}
                        className="text-sm px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No assignments yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Team Members</h2>
              {canManageMembers && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </button>
              )}
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
                  <form onSubmit={handleAddMember}>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">User Email</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">Role</label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as TeamMember['role'])}
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        disabled={addingMember}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingMember}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        {addingMember ? 'Adding...' : 'Add Member'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {member.user_profile?.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{member.user_profile?.username}</div>
                      <div className="text-sm text-muted-foreground">{member.user_profile?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {canManageMembers && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamMember['role'])}
                        className="px-3 py-1 rounded border bg-background text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted">
                        {getRoleIcon(member.role)}
                        <span className="text-sm font-semibold capitalize">{member.role}</span>
                      </div>
                    )}
                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Team Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-bold mb-4">Assignment Status Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-semibold">{stats.completedAssignments}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${stats.totalAssignments > 0 ? (stats.completedAssignments / stats.totalAssignments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">In Progress</span>
                      <span className="text-sm font-semibold">{stats.inProgressAssignments}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${stats.totalAssignments > 0 ? (stats.inProgressAssignments / stats.totalAssignments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-semibold">{stats.pendingAssignments}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-600"
                        style={{ width: `${stats.totalAssignments > 0 ? (stats.pendingAssignments / stats.totalAssignments) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-bold mb-4">Team Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Completion Rate</span>
                    <span className="text-2xl font-bold text-primary">{stats.completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Members</span>
                    <span className="text-2xl font-bold">{stats.totalMembers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Verifications</span>
                    <span className="text-2xl font-bold">{stats.totalAssignments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
