import { supabase } from './supabase';

export interface SourceRequirements {
  minimumSources: number;
  requiredSourceTypes: string[];
  minimumCredibility: number;
  preferredDomains: string[];
}

export interface VerificationCriterion {
  id: string;
  label: string;
  required: boolean;
  checked?: boolean;
}

export interface ReportingFormat {
  sections: string[];
  includeTimeline: boolean;
  includeExpertQuotes: boolean;
  requireSourceDiversity?: boolean;
  warningRequired?: boolean;
  disclaimerRequired?: boolean;
}

export interface VerificationTemplate {
  id: string;
  team_id: string | null;
  name: string;
  description: string;
  category: 'political' | 'health' | 'financial' | 'science' | 'social' | 'environmental' | 'custom';
  is_public: boolean;
  source_requirements: SourceRequirements;
  verification_criteria: VerificationCriterion[];
  reporting_format: ReportingFormat;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Get all templates (public + team templates)
export async function getTemplates(teamId?: string): Promise<VerificationTemplate[]> {
  let query = supabase
    .from('verification_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (teamId) {
    query = query.or(`is_public.eq.true,team_id.eq.${teamId}`);
  } else {
    query = query.eq('is_public', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Get template by ID
export async function getTemplateById(templateId: string): Promise<VerificationTemplate> {
  const { data, error } = await supabase
    .from('verification_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

// Create new template
export async function createTemplate(
  template: Omit<VerificationTemplate, 'id' | 'created_by' | 'created_at' | 'updated_at'>
): Promise<VerificationTemplate> {
  const { data, error } = await supabase
    .from('verification_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update template
export async function updateTemplate(
  templateId: string,
  updates: Partial<VerificationTemplate>
): Promise<VerificationTemplate> {
  const { data, error } = await supabase
    .from('verification_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete template
export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('verification_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}

// Update assignment checklist progress
export async function updateChecklistProgress(
  assignmentId: string,
  checklistProgress: VerificationCriterion[]
): Promise<void> {
  const { error } = await supabase
    .from('verification_assignments')
    .update({ 
      checklist_progress: checklistProgress,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId);

  if (error) throw error;
}

// Get templates by category
export async function getTemplatesByCategory(
  category: VerificationTemplate['category'],
  teamId?: string
): Promise<VerificationTemplate[]> {
  let query = supabase
    .from('verification_templates')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (teamId) {
    query = query.or(`is_public.eq.true,team_id.eq.${teamId}`);
  } else {
    query = query.eq('is_public', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Duplicate template for customization
export async function duplicateTemplate(
  templateId: string,
  teamId: string,
  newName?: string
): Promise<VerificationTemplate> {
  const original = await getTemplateById(templateId);
  
  const duplicate = {
    ...original,
    id: undefined,
    team_id: teamId,
    name: newName || `${original.name} (Copy)`,
    is_public: false,
    created_by: undefined,
    created_at: undefined,
    updated_at: undefined,
  };

  return createTemplate(duplicate as any);
}
