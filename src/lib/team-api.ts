import { supabase } from './supabase';

export interface Team {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
  user_profile?: {
    username: string;
    email: string;
  };
}

export interface VerificationAssignment {
  id: string;
  verification_id: string;
  team_id: string;
  assigned_to: string | null;
  assigned_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  notes: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    username: string;
    email: string;
  };
  verification?: any;
}

export interface VerificationComment {
  id: string;
  verification_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    email: string;
  };
}

// Team Management
export async function createTeam(name: string, description: string): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, description })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTeamById(teamId: string): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) throw error;
}

// Team Members Management
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      user_profile:user_profiles(username, email)
    `)
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addTeamMember(
  teamId: string,
  userEmail: string,
  role: TeamMember['role']
): Promise<TeamMember> {
  // First, find user by email
  const { data: userProfile, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError || !userProfile) {
    throw new Error('User not found with this email');
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userProfile.id,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeamMemberRole(
  memberId: string,
  role: TeamMember['role']
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function getMyTeamRole(teamId: string): Promise<TeamMember['role'] | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data.role;
}

// Verification Assignments
export async function assignVerification(
  verificationId: string,
  teamId: string,
  assignedTo: string | null,
  notes?: string
): Promise<VerificationAssignment> {
  const { data, error } = await supabase
    .from('verification_assignments')
    .insert({
      verification_id: verificationId,
      team_id: teamId,
      assigned_to: assignedTo,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTeamAssignments(teamId: string): Promise<VerificationAssignment[]> {
  const { data, error } = await supabase
    .from('verification_assignments')
    .select(`
      *,
      assignee:user_profiles!verification_assignments_assigned_to_fkey(username, email),
      verification:verifications(*)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMyAssignments(teamId: string): Promise<VerificationAssignment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('verification_assignments')
    .select(`
      *,
      verification:verifications(*)
    `)
    .eq('team_id', teamId)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: VerificationAssignment['status']
): Promise<VerificationAssignment> {
  const { data, error } = await supabase
    .from('verification_assignments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('verification_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) throw error;
}

// Verification Comments
export async function addComment(
  verificationId: string,
  comment: string
): Promise<VerificationComment> {
  const { data, error } = await supabase
    .from('verification_comments')
    .insert({
      verification_id: verificationId,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVerificationComments(
  verificationId: string
): Promise<VerificationComment[]> {
  const { data, error } = await supabase
    .from('verification_comments')
    .select(`
      *,
      user_profile:user_profiles(username, email)
    `)
    .eq('verification_id', verificationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateComment(
  commentId: string,
  comment: string
): Promise<VerificationComment> {
  const { data, error } = await supabase
    .from('verification_comments')
    .update({ comment, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('verification_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Team Analytics
export async function getTeamStats(teamId: string) {
  const assignments = await getTeamAssignments(teamId);
  const members = await getTeamMembers(teamId);

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'verified').length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length;

  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  return {
    totalMembers: members.length,
    totalAssignments,
    completedAssignments,
    pendingAssignments,
    inProgressAssignments,
    completionRate,
  };
}
