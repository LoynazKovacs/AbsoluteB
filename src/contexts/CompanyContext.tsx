import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  loading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCompanyPrompt, setShowCreateCompanyPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setCurrentCompany(null);
      setShowCreateCompanyPrompt(false);
      setLoading(false);
      return;
    }

    async function fetchCompanies() {
      try {
        setLoading(true);
        setError(null);

        const { data: companies, error: companiesError } = await supabase
          .rpc('get_user_companies');

        if (companiesError) throw companiesError;

        setCompanies(companies);

        // Get user's current company preference
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_company_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        if (companies.length === 0) {
          setShowCreateCompanyPrompt(true);
          setCurrentCompany(null);
        } else {
          const preferredCompany = profile?.current_company_id
            ? companies.find(c => c.id === profile.current_company_id)
            : null;
          setCurrentCompany(preferredCompany || companies[0]);
          setShowCreateCompanyPrompt(false);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();

    // Subscribe to company changes
    const companyChanges = supabase
      .channel('company_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        async (payload) => {
          // Refresh companies list
          const { data: companies } = await supabase.rpc('get_user_companies');
          setCompanies(companies || []);
        }
      )
      .subscribe();

    return () => {
      companyChanges.unsubscribe();
    };
  }, [user]);

  // Update user's current company preference when it changes
  useEffect(() => {
    if (user && currentCompany) {
      supabase
        .from('profiles')
        .update({ current_company_id: currentCompany.id })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Error updating current company:', error);
        });
    }
  }, [user, currentCompany]);

  return (
    <CompanyContext.Provider value={{ 
      companies, 
      currentCompany, 
      setCurrentCompany, 
      loading, 
      error,
      showCreateCompanyPrompt,
      setShowCreateCompanyPrompt
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}