import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Users, Settings, FileText, HelpCircle, Database, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TableInfo {
  name: string;
  schema: string;
}

const getNavigation = (isAdmin: boolean) => [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Analytics', to: '/analytics', icon: BarChart2 },
  { name: 'Companies', to: '/companies', icon: Building2 },
  { name: 'Users', to: '/users', icon: Users },
  { name: 'Documents', to: '/documents', icon: FileText },
  ...(isAdmin ? [{
    name: 'Settings',
    to: '/settings',
    icon: Settings,
    children: [
      { name: 'Tables', to: '/settings/tables', icon: Database }
    ]
  }] : []),
  { name: 'Help', to: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { isAdmin } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Settings']);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = getNavigation(isAdmin);

  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true);
        const { data: tables, error } = await supabase.rpc('get_tables');

        if (error) throw error;

        const userTables = tables
          .filter((table: string) => 
            !table.startsWith('_') && 
            table !== 'schema_migrations' &&
            table !== 'schema_version'
          )
          .map((table: string) => ({
            schema: 'public',
            name: table
          }));

        setTables(userTables);
      } catch (err) {
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };
  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background-light dark:bg-background-dark border-r border-primary-light/20 dark:border-primary-dark/20 transition-transform duration-300 ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto`}
    >
      <nav className="h-full py-4" onClick={(e) => e.stopPropagation()}>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li key={item.name} className="space-y-1">
                <div className="flex items-center">
                  <NavLink
                    to={item.to}
                    end={hasChildren}
                    className={({ isActive }) =>
                      `flex items-center flex-1 px-4 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-primary-light/20 dark:bg-primary-light/10 text-primary-dark dark:text-primary-light'
                          : 'text-primary-dark/70 dark:text-primary-light/70 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 hover:text-primary-dark dark:hover:text-primary-light'
                      }`
                    }
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="p-2 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-md"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <ul className="ml-6 space-y-1">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      return (
                        <li key={child.name}>
                          <NavLink
                            to={child.to}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 text-sm font-medium ${
                                isActive
                                  ? 'bg-primary-light/20 dark:bg-primary-light/10 text-primary-dark dark:text-primary-light'
                                  : 'text-primary-dark/70 dark:text-primary-light/70 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 hover:text-primary-dark dark:hover:text-primary-light'
                              }`
                            }
                          >
                            <ChildIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {child.name}
                          </NavLink>
                          {child.name === 'Tables' && isExpanded && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {loading ? (
                                <li className="px-4 py-2 text-sm text-primary-dark/50 dark:text-primary-light/50">
                                  Loading tables...
                                </li>
                              ) : (
                                tables.map(table => (
                                  <li key={table.name}>
                                    <NavLink
                                      to={`/settings/tables/${table.name}`}
                                      className={({ isActive }) =>
                                        `flex items-center px-4 py-2 text-sm font-medium ${
                                          isActive
                                            ? 'bg-primary-light/20 dark:bg-primary-light/10 text-primary-dark dark:text-primary-light'
                                            : 'text-primary-dark/70 dark:text-primary-light/70 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 hover:text-primary-dark dark:hover:text-primary-light'
                                        }`
                                      }
                                    >
                                      <Database className="mr-3 h-4 w-4 flex-shrink-0" />
                                      {table.name}
                                    </NavLink>
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}