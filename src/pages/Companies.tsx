import React, { useState } from 'react';
import { Building2, Plus, Users, Trash2, Edit2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { supabase } from '../lib/supabase';

export default function Companies() {
  const { companies, setCurrentCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDescription, setNewCompanyDescription] = useState('');

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const { data: company, error } = await supabase
        .from('companies')
        .insert([{
          name: newCompanyName.trim(),
          description: newCompanyDescription.trim() || null
        }])
        .select()
        .single();

      if (error) throw error;

      setShowCreateModal(false);
      setNewCompanyName('');
      setNewCompanyDescription('');
      setCurrentCompany(company);
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary-dark dark:text-primary-light" />
          <h1 className="text-2xl font-semibold text-primary-dark dark:text-primary-light">
            Companies
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-light hover:bg-primary-light/90 text-white rounded-md shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Company</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div
            key={company.id}
            className="bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20 p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-primary-dark dark:text-primary-light">
                  {company.name}
                </h3>
                {company.description && (
                  <p className="mt-1 text-sm text-primary-dark/60 dark:text-primary-light/60">
                    {company.description}
                  </p>
                )}
              </div>
              {company.is_owner && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-1 text-primary-dark/60 dark:text-primary-light/60 hover:text-primary-dark dark:hover:text-primary-light"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    className="p-1 text-red-500/60 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-primary-dark/60 dark:text-primary-light/60">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
              <span className="px-2 py-1 bg-primary-light/10 dark:bg-primary-light/5 rounded-full text-xs font-medium">
                {company.is_owner ? 'Owner' : 'Member'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleCreateCompany} className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light">
                Create New Company
              </h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-dark dark:text-primary-light">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-dark dark:text-primary-light">
                  Description (Optional)
                </label>
                <textarea
                  value={newCompanyDescription}
                  onChange={(e) => setNewCompanyDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-primary-dark dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-light hover:bg-primary-light/90 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}