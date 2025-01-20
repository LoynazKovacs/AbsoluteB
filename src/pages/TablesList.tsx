import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Table, Key, Calendar, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TableInfo {
  name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    column_default: string | null;
  }>;
}

export default function TablesList() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTablesInfo() {
      try {
        setLoading(true);
        // Get all tables
        const { data: tableNames, error: tablesError } = await supabase.rpc('get_tables');
        if (tablesError) throw tablesError;

        // Filter system tables
        const userTables = tableNames.filter((table: string) => 
          !table.startsWith('_') && 
          table !== 'schema_migrations' &&
          table !== 'schema_version'
        );

        // Get columns for each table
        const tablesWithColumns = await Promise.all(
          userTables.map(async (tableName: string) => {
            const { data: columns, error: columnsError } = await supabase
              .rpc('get_table_columns', { p_table_name: tableName });
            
            if (columnsError) throw columnsError;

            return {
              name: tableName,
              columns: columns
            };
          })
        );

        setTables(tablesWithColumns);
      } catch (err) {
        console.error('Error fetching tables info:', err);
        setError('Failed to load tables information');
      } finally {
        setLoading(false);
      }
    }

    fetchTablesInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark dark:text-primary-light">
          Database Tables
        </h1>
        <Database className="h-6 w-6 text-primary-dark dark:text-primary-light" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Link
            key={table.name}
            to={`/settings/tables/${table.name}`}
            className="bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20 p-6 hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Table className="h-5 w-5 text-primary-dark dark:text-primary-light" />
                <h2 className="text-lg font-medium text-primary-dark dark:text-primary-light">
                  {table.name}
                </h2>
              </div>
              <span className="text-sm text-primary-dark/60 dark:text-primary-light/60">
                {table.columns.length} columns
              </span>
            </div>
            
            <div className="space-y-3">
              {table.columns.slice(0, 3).map((column) => (
                <div
                  key={column.column_name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    {column.column_name.includes('id') ? (
                      <Key className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                    ) : column.data_type.includes('timestamp') ? (
                      <Calendar className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                    ) : column.is_nullable ? (
                      <Unlock className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                    ) : (
                      <Lock className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                    )}
                    <span className="text-primary-dark/80 dark:text-primary-light/80">
                      {column.column_name}
                    </span>
                  </div>
                  <span className="text-primary-dark/60 dark:text-primary-light/60">
                    {column.data_type}
                  </span>
                </div>
              ))}
              {table.columns.length > 3 && (
                <div className="text-sm text-primary-dark/60 dark:text-primary-light/60 pt-2">
                  +{table.columns.length - 3} more columns
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}