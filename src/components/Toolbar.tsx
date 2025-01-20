import React from 'react';
import { Menu, Bell, Settings, LogOut, Sun, Moon, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCompany } from '../contexts/CompanyContext';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  full_name: string | null;
  email: string;
  role: string;
}

interface ToolbarProps {
  onMenuClick: () => void;
}

export default function Toolbar({ onMenuClick }: ToolbarProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { companies, currentCompany, setCurrentCompany, loading: companiesLoading, showCreateCompanyPrompt } = useCompany();
  const menuRef = useRef<HTMLDivElement>(null);
  const companySelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getProfile() {
      if (user) {
        try {
          // Try to get the existing profile
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('full_name, email, role')
            .eq('id', user.id)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email || '',
                full_name: null,
                role: 'user'
              })
              .select()
              .single();

            if (insertError) {
              console.error('Error upserting profile:', insertError);
              return;
            }
            setProfile(insertedProfile);
          } else {
            setProfile(existingProfile);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    }

    getProfile();
  }, [user]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : profile?.email
        ?.substring(0, 2)
        .toUpperCase() || 'AB';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companySelectRef.current && !companySelectRef.current.contains(event.target as Node)) {
        setCompanySelectOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-background-light dark:bg-background-dark border-b border-primary-light/20 dark:border-primary-dark/20 fixed w-full z-20 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="text-primary-dark dark:text-primary-light hover:text-primary-dark/80 dark:hover:text-primary-light/80 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-light focus:ring-offset-2 dark:focus:ring-offset-background-dark p-2 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="ml-4 flex items-center space-x-2">
              <Settings className="h-8 w-8 text-primary-light dark:text-primary-light animate-spin-slow" />
              <span className="text-2xl font-bold text-primary-dark dark:text-primary-light">AbdoluteB</span>
            </Link>
            {!companiesLoading && (
              <div className="ml-8 relative" ref={companySelectRef}>
                <button
                  onClick={() => setCompanySelectOpen(!companySelectOpen)}
                  className={`flex items-center justify-between w-[200px] bg-white/90 dark:bg-white/5 border border-primary-light/20 dark:border-primary-dark/20 rounded-md px-3 py-1.5 text-sm ${
                    showCreateCompanyPrompt ? 'text-primary-light animate-pulse' : 'text-primary-dark dark:text-primary-light'
                  }`}
                >
                  <span className="truncate">
                    {currentCompany?.name || (showCreateCompanyPrompt ? 'Create your first company' : 'Select a company')}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                
                {companySelectOpen && (
                  <div className="absolute left-0 mt-1 w-[200px] bg-white dark:bg-background-dark rounded-md shadow-lg border border-primary-light/20 dark:border-primary-dark/20 py-1 z-50">
                    {companies.map(company => (
                      <button
                        key={company.id}
                        onClick={() => {
                          setCurrentCompany(company);
                          setCompanySelectOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm ${
                          company.id === currentCompany?.id
                            ? 'bg-primary-light/20 dark:bg-primary-light/10 text-primary-dark dark:text-primary-light'
                            : 'text-primary-dark/70 dark:text-primary-light/70 hover:bg-primary-light/10 dark:hover:bg-primary-light/5'
                        }`}
                      >
                        {company.name}
                      </button>
                    ))}
                    <div className="border-t border-primary-light/20 dark:border-primary-dark/20 mt-1 pt-1">
                      <Link
                        to="/companies"
                        className="flex items-center px-3 py-2 text-sm text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/5"
                        onClick={() => setCompanySelectOpen(false)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {companies.length === 0 ? 'Create your first company' : 'Create new company'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <button
              onClick={toggleTheme}
              className="text-primary-dark dark:text-primary-light hover:text-primary-dark/80 dark:hover:text-primary-light/80 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-light focus:ring-offset-2 dark:focus:ring-offset-background-dark p-2 rounded-md"
            >
              {theme === 'light' ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
            </button>
            <button
              className="text-primary-dark dark:text-primary-light hover:text-primary-dark/80 dark:hover:text-primary-light/80 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-light focus:ring-offset-2 dark:focus:ring-offset-background-dark p-2 rounded-md relative"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-primary-light ring-2 ring-background-light dark:ring-background-dark" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-8 w-8 rounded-full bg-primary-light/20 dark:bg-primary-light/10 flex items-center justify-center hover:bg-primary-light/30 dark:hover:bg-primary-light/20 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-light focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                <span className="text-sm font-medium text-primary-dark dark:text-primary-light">{initials}</span>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-light dark:bg-background-dark ring-1 ring-primary-light/20 dark:ring-primary-dark/20">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-primary-light/20 dark:border-primary-dark/20">
                      <p className="text-sm font-medium text-primary-dark dark:text-primary-light">
                        {profile?.full_name || 'User'}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-light/10 dark:bg-primary-light/5">
                          {profile?.role || 'user'}
                        </span>
                      </p>
                      <p className="text-sm text-primary-dark/70 dark:text-primary-light/70 truncate">
                        {profile?.email || user?.email || ''}
                      </p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-primary-dark dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/10"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-primary-dark dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/10"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}