import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  VerificationTemplate,
} from '@/lib/template-api';
import { getMyTeams, Team } from '@/lib/team-api';
import { useAuth } from '@/stores/authStore';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit,
  Lock,
  Users,
  Globe,
  Shield,
  Heart,
  DollarSign,
  Microscope,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryIcons = {
  political: Shield,
  health: Heart,
  financial: DollarSign,
  science: Microscope,
  social: Users,
  environmental: Globe,
  custom: FileText,
};

const categoryColors = {
  political: 'from-blue-600 to-indigo-600',
  health: 'from-red-600 to-pink-600',
  financial: 'from-green-600 to-emerald-600',
  science: 'from-purple-600 to-violet-600',
  social: 'from-orange-600 to-amber-600',
  environmental: 'from-teal-600 to-cyan-600',
  custom: 'from-gray-600 to-slate-600',
};

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<VerificationTemplate[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to access templates');
      navigate('/');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate, selectedTeam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, teamsData] = await Promise.all([
        getTemplates(selectedTeam === 'all' ? undefined : selectedTeam),
        getMyTeams(),
      ]);
      setTemplates(templatesData);
      setTeams(teamsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (template: VerificationTemplate) => {
    if (teams.length === 0) {
      toast.error('Please create a team first to save custom templates');
      return;
    }

    try {
      await duplicateTemplate(template.id, teams[0].id);
      toast.success('Template duplicated successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to duplicate template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Delete this template? This action cannot be undone.')) return;

    try {
      await deleteTemplate(templateId);
      toast.success('Template deleted');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Verification Templates</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Pre-built and custom templates for consistent fact-checking
            </p>
          </div>
          <button
            onClick={() => navigate('/templates/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            <Plus className="h-5 w-5" />
            Create Template
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="political">Political</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
                <option value="science">Science</option>
                <option value="social">Social</option>
                <option value="environmental">Environmental</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Team Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="all">All Templates</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category];
              const colorClass = categoryColors[template.category];

              return (
                <div
                  key={template.id}
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Header */}
                  <div className={cn("h-3 bg-gradient-to-r", colorClass)} />
                  
                  <div className="p-6">
                    {/* Icon & Category */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center", colorClass)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_public ? (
                          <Globe className="h-4 w-4 text-blue-600" title="Public Template" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-600" title="Team Template" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-muted-foreground">Min. Sources</div>
                        <div className="font-bold text-sm">
                          {template.source_requirements.minimumSources}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-muted-foreground">Criteria</div>
                        <div className="font-bold text-sm">
                          {template.verification_criteria.length}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/templates/${template.id}`)}
                        className="flex-1 px-3 py-2 rounded-lg border hover:bg-accent transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-2 rounded-lg border hover:bg-accent transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {!template.is_public && (
                        <>
                          <button
                            onClick={() => navigate(`/templates/${template.id}/edit`)}
                            className="p-2 rounded-lg border hover:bg-accent transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="p-2 rounded-lg border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first custom template to get started'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <button
                onClick={() => navigate('/templates/create')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
              >
                <Plus className="h-5 w-5" />
                Create Your First Template
              </button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-4">Why Use Verification Templates?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Consistency</h4>
              <p className="text-sm text-muted-foreground">
                Ensure all team members follow the same verification standards
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Efficiency</h4>
              <p className="text-sm text-muted-foreground">
                Pre-defined checklists speed up the verification process
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Quality</h4>
              <p className="text-sm text-muted-foreground">
                Standardized reporting formats maintain high fact-checking quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
