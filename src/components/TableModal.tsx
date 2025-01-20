import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  columns: ColumnInfo[];
  initialData?: Record<string, any>;
  mode: 'create' | 'edit';
}

export default function TableModal({ isOpen, onClose, onSubmit, columns, initialData, mode }: TableModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredColumns, setFilteredColumns] = useState<ColumnInfo[]>([]);

  useEffect(() => {
    const systemColumns = ['id', 'created_at', 'updated_at'];
    const filtered = columns.filter(col => {
      // Always exclude system columns
      if (systemColumns.includes(col.column_name)) return false;
      
      // In create mode, also exclude columns with defaults
      if (mode === 'create' && col.column_default !== null) return false;
      
      return true;
    });
    
    setFilteredColumns(filtered);

    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultData: Record<string, any> = {};
      filtered.forEach(col => defaultData[col.column_name] = null);
      setFormData(defaultData);
    }
  }, [initialData, columns, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (column: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [column]: value === '' ? null : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
      <div className="bg-white dark:bg-background-dark rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-primary-light/20 dark:border-primary-dark/20">
          <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light">
            {mode === 'create' ? 'Add New Record' : 'Edit Record'}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-dark/70 dark:text-primary-light/70 hover:text-primary-dark dark:hover:text-primary-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-3 rounded-md">
              {error}
            </div>
          )}

          {filteredColumns.map(column => (
            <div key={column.column_name}>
              <label
                htmlFor={column.column_name}
                className="block text-sm font-medium text-primary-dark dark:text-primary-light mb-1"
              >
                {column.column_name}
                {!column.is_nullable && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {column.data_type === 'boolean' ? (
                <select
                  id={column.column_name}
                  value={formData[column.column_name]?.toString() ?? ''}
                  onChange={e => handleChange(column.column_name, e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  required={!column.is_nullable}
                >
                  <option value="">Select...</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : column.data_type.includes('timestamp') ? (
                <input
                  type="datetime-local"
                  id={column.column_name}
                  value={formData[column.column_name] || ''}
                  onChange={e => handleChange(column.column_name, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  required={!column.is_nullable}
                />
              ) : column.data_type === 'integer' || column.data_type === 'numeric' ? (
                <input
                  type="number"
                  id={column.column_name}
                  value={formData[column.column_name] || ''}
                  onChange={e => handleChange(column.column_name, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  required={!column.is_nullable}
                />
              ) : (
                <input
                  type="text"
                  id={column.column_name}
                  value={formData[column.column_name] || ''}
                  onChange={e => handleChange(column.column_name, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark text-primary-dark dark:text-primary-light"
                  required={!column.is_nullable}
                />
              )}
              
              <p className="mt-1 text-xs text-primary-dark/60 dark:text-primary-light/60">
                Type: {column.data_type}
                {column.column_default && ` (Default: ${column.column_default})`}
              </p>
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4 border-t border-primary-light/20 dark:border-primary-dark/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-primary-dark dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-light hover:bg-primary-light/90 rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}