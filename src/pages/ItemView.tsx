import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TableModal from '../components/TableModal';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
}

export default function ItemView() {
  const { tableName, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referencedData, setReferencedData] = useState<Record<string, any>>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!tableName || !id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch table structure
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_table_columns', { p_table_name: tableName });

        if (columnsError) throw columnsError;
        setColumns(columns);

        // Fetch item data
        const { data, error: dataError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (dataError) throw dataError;
        setItem(data);

        // Fetch referenced data for foreign keys
        const referencedDataPromises = columns
          .filter(col => col.foreign_table_name && data[col.column_name])
          .map(async col => {
            try {
              const { data: refData, error: refError } = await supabase
                .from(col.foreign_table_name!)
                .select('*')
                .eq('id', data[col.column_name])
                .single();

              if (refError) throw refError;
              
              return [col.column_name, refData];
            } catch (err) {
              console.error(`Error fetching referenced data for ${col.column_name}:`, err);
              return [col.column_name, null];
            }
          });

        const referencedResults = await Promise.all(referencedDataPromises);
        const referencedDataMap = Object.fromEntries(referencedResults);
        setReferencedData(referencedDataMap);

      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName, id]);

  const handleEdit = () => {
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!tableName || !window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .match({ id });

      if (error) throw error;
      navigate(`/settings/tables/${tableName}`);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!tableName) return;

    try {
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .match({ id });

      if (error) throw error;

      // Refresh the data
      const { data: refreshedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setItem(refreshedData);
    } catch (err) {
      console.error('Error updating item:', err);
      throw new Error('Failed to update item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
        {error || 'Item not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6" >
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/settings/tables/${tableName}`)}
          className="flex items-center text-primary-dark/70 dark:text-primary-light/70 hover:text-primary-dark dark:hover:text-primary-light"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Table
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-dark dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-md"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20 p-6">
        <h1 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">
          {item.name || item.title || `${tableName} Details`}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map(column => (
            <div key={column.column_name} className="space-y-1">
              <dt className="text-sm font-medium text-primary-dark/70 dark:text-primary-light/70">
                {column.column_name
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </dt>
              <dd className="text-primary-dark dark:text-primary-light">
                {item[column.column_name] === null ? (
                  <span className="text-primary-dark/40 dark:text-primary-light/40">Not set</span>
                ) : column.foreign_table_name ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      {item[column.column_name]}
                    </div>
                    {referencedData[column.column_name] && (
                      <div className="bg-primary-light/5 dark:bg-primary-light/2 p-3 rounded-md border border-primary-light/10 dark:border-primary-light/5">
                        {Object.entries(referencedData[column.column_name])
                          .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium">
                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                              </span>
                              <span className="ml-2">
                                {value === null
                                  ? 'Not set'
                                  : typeof value === 'boolean'
                                  ? value ? 'Yes' : 'No'
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : column.data_type === 'boolean' ? (
                  item[column.column_name] ? 'Yes' : 'No'
                ) : column.data_type.includes('timestamp') ? (
                  new Date(item[column.column_name]).toLocaleString()
                ) : (
                  String(item[column.column_name])
                )}
              </dd>
            </div>
          ))}
        </div>
      </div>

      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        columns={columns}
        initialData={item}
        mode="edit"
      />
    </div>
  );
}