import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getWidget } from '../widgets';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  raw_value: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { currentCompany, companies, loading: companyLoading } = useCompany();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async (company_id: string) => {
    try {
      setLoading(true);
      const query = supabase
        .from('iot_devices')
        .select('*')
        .eq('company_id', company_id);

      const { data, error } = await query.order('name');

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  // Group devices by type
  const devicesByType = useMemo(() => {
    const grouped = devices.reduce((acc, device) => {
      const type = device.type.replace(/_/g, ' ').toUpperCase();
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(device);
      return acc;
    }, {} as Record<string, IoTDevice[]>);

    // Sort device types
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    
    // Initialize expanded sections with all device types
    if (expandedSections.length === 0 && sortedGroups.length > 0) {
      setExpandedSections(sortedGroups.map(([type]) => type));
    }
    
    return sortedGroups;
  }, [devices]);

  const toggleSection = (type: string) => {
    setExpandedSections(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  useEffect(() => {
    if (companyLoading) {
      return;
    }

    if (currentCompany) {
      fetchDevices(currentCompany.id);

      if (!user) return;

      // Set up real-time subscription
      const channel = supabase
        .channel('iot_devices_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'iot_devices',
            filter: `company_id=eq.${currentCompany.id}`
          },
          (payload) => {
          if (payload.eventType === 'INSERT') {
            setDevices(current => [...current, payload.new as IoTDevice]);
          } else if (payload.eventType === 'UPDATE') {
            setDevices(current =>
              current.map(device =>
                device.id === payload.new.id ? { ...device, ...payload.new } : device
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDevices(current =>
              current.filter(device => device.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else {
      setDevices([]);
    }
  }, [user?.id, currentCompany, companyLoading, fetchDevices]);

  // Show loading state while company context is initializing
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center max-w-md mx-auto p-6 bg-white/90 dark:bg-white/5 rounded-lg shadow-lg border border-primary-light/20 dark:border-primary-dark/20">
          <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-2">
            No Company Selected
          </h2>
          <p className="text-primary-dark/60 dark:text-primary-light/60 mb-6">
            {companies.length === 0 
              ? "You haven't created or joined any companies yet. Create your first company to get started!"
              : "Please select a company from the dropdown in the top bar to view its devices."}
          </p>
          {companies.length === 0 && (
            <RouterLink
              to="/companies"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-light hover:bg-primary-light/90 text-white rounded-md shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Create Company</span>
            </RouterLink>
          )}
        </div>
      </div>
    );
  }

  if (loading && currentCompany) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light" />
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

  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-2">
            No IoT Devices Found in {currentCompany.name}
          </h2>
          <p className="text-primary-dark/60 dark:text-primary-light/60">
            Add some devices to start monitoring them.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark dark:text-primary-light">
          IoT Device Dashboard
        </h1>
        <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
          {devices.length} device{devices.length === 1 ? '' : 's'} connected
        </div>
      </div>

      <div className="space-y-6">
        {devicesByType.map(([type, typeDevices]) => (
          <div key={type} className="bg-white/50 dark:bg-white/5 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection(type)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-light/5 dark:hover:bg-primary-light/2"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg font-medium text-primary-dark dark:text-primary-light">
                  {type}
                </span>
                <span className="text-sm text-primary-dark/60 dark:text-primary-light/60">
                  ({typeDevices.length} device{typeDevices.length === 1 ? '' : 's'})
                </span>
              </div>
              {expandedSections.includes(type) ? (
                <ChevronDown className="h-5 w-5 text-primary-dark/60 dark:text-primary-light/60" />
              ) : (
                <ChevronRight className="h-5 w-5 text-primary-dark/60 dark:text-primary-light/60" />
              )}
            </button>

            {expandedSections.includes(type) && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeDevices.map(device => {
                    const Widget = getWidget(device.type);
                    
                    if (!Widget) {
                      return (
                        <div key={device.id} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
                          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                            {device.name}
                          </h3>
                          <p className="text-sm text-red-500 dark:text-red-400">
                            Unknown device type: {device.type}
                          </p>
                        </div>
                      );
                    }

                    return <Widget key={device.id} {...device} />;
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}