import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { supabase } from '../lib/supabase';
import TableModal from '../components/TableModal';

interface RealtimeChange {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
}

interface TableInfo {
  name: string;
  schema: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}
export default function Settings() {
  const { tableName } = useParams();
  const [selectedTable, setSelectedTable] = useState<TableInfo>();
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const navigate = useNavigate();

  // Update selectedTable when URL parameter changes
  useEffect(() => {
    if (tableName) {
      setSelectedTable({ name: tableName, schema: 'public' });
    } else {
      // If no table is selected, redirect to the tables list
      navigate('/settings/tables');
    }
  }, [tableName]);

  useEffect(() => {
    async function fetchTableData() {
      if (!selectedTable) return;

      setLoading(true);
      setError(null);

      try {
        // First, get the table structure
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_table_columns', { p_table_name: selectedTable.name });

        if (columnsError) throw columnsError;
        
        setColumns(columns);

        // Create column definitions from the schema
        const colDefs: ColDef[] = columns.map((col: any) => ({
          field: col.column_name,
          headerName: col.column_name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          sortable: true,
          filter: true,
        }));
        
        // Add action column for edit/delete
        colDefs.push({
          headerName: 'Actions',
          field: 'actions',
          sortable: false,
          filter: false,
          width: 100,
          cellRenderer: (params: any) => (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/settings/tables/${tableName}/${params.data.id}`);
                }}
                className="text-primary-dark/70 dark:text-primary-light/70 hover:text-primary-dark dark:hover:text-primary-light p-1"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(params.data);
                }}
                className="text-primary-dark/70 dark:text-primary-light/70 hover:text-primary-dark dark:hover:text-primary-light p-1"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(params.data);
                }}
                className="text-red-500/70 hover:text-red-500 p-1"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ),
        });

        setColumnDefs(colDefs);

        // Then fetch the actual data
        const { data, error: dataError } = await supabase
          .from(selectedTable.name)
          .select('*')
          .limit(100);

        if (dataError) throw dataError;

        setRowData(data || []);
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError('Failed to load table data');
      } finally {
        setLoading(false);
      }
    }

    fetchTableData();
  }, [selectedTable]);

  useEffect(() => {
    if (!selectedTable) return;

    // Set up real-time subscription
    const channel = supabase
      .channel(`table_changes_${selectedTable.name}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: selectedTable.name
        },
        (payload: RealtimeChange) => {
          if (payload.eventType === 'INSERT') {
            setRowData(current => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setRowData(current =>
              current.map(row =>
                row.id === payload.new.id ? { ...row, ...payload.new } : row
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRowData(current =>
              current.filter(row => row.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when table changes
    return () => {
      channel.unsubscribe();
    };
  }, [selectedTable]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedRow(null);
    setModalOpen(true);
  };

  const handleEdit = (row: any) => {
    setModalMode('edit');
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!selectedTable || !window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from(selectedTable.name)
        .delete()
        .match({ id: row.id });

      if (error) throw error;

      // Refresh the data
      const { data, error: fetchError } = await supabase
        .from(selectedTable.name)
        .select('*')
        .limit(100);

      if (fetchError) throw fetchError;
      setRowData(data || []);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete record');
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!selectedTable) return;

    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from(selectedTable.name)
          .insert([data]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(selectedTable.name)
          .update(data)
          .match({ id: selectedRow.id });

        if (error) throw error;
      }

      // Refresh the data
      // No need to refresh manually as real-time subscription will handle it
    } catch (err) {
      console.error('Error saving record:', err);
      throw new Error('Failed to save record');
    }
  };

  return (
    !tableName ? (
      <Navigate to="/settings/tables" replace />
    ) : (
    <div className="space-y-4 relative z-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-primary-dark dark:text-primary-light">
          Table: {tableName}
        </h1>
      </div>
      <div className="bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20 p-6 h-[calc(100vh-12rem)] relative">
        <button
          onClick={handleCreate}
          className="absolute left-7 bottom-7 w-10 h-10 flex items-center justify-center text-white bg-primary-light hover:bg-primary-light/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 z-20"
          title="Add New Record"
        >
          <Plus className="h-5 w-5" />
        </button>
        {!loading && !error && rowData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-primary-dark/70 dark:text-primary-light/70 mb-4">
                No records found in this table
              </p>
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-primary-light hover:bg-primary-light/90 rounded-md shadow-lg mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Add First Record</span>
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400 p-4">
            {error}
          </div>
        ) : (
          <div className="ag-theme-alpine-dark h-full w-full">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                flex: 1,
                minWidth: 100,
                sortable: true,
                filter: true,
                resizable: true,
              }}
              pagination={true}
              paginationPageSize={20}
              animateRows={true}
              onGridReady={onGridReady}
            />
          </div>
        )}
      </div>
      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        columns={columns}
        initialData={selectedRow}
        mode={modalMode}
      />
    </div>
    )
  );
}