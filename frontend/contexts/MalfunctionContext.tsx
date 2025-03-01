"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the type for malfunction items
export interface MalfunctionItem {
  id: string;
  toolId: string;
  toolName: string;
  serialNumber: string;
  severity: string;
  description: string;
  reportedAt: string;
}

// Define the context type
interface MalfunctionContextType {
  malfunctions: MalfunctionItem[];
  loading: boolean;
  error: string | null;
  addMalfunction: (malfunction: Omit<MalfunctionItem, 'id'>) => Promise<{ success: boolean, reportId?: string, message?: string }>;
  updateMalfunction: (id: string, updates: Pick<MalfunctionItem, 'severity' | 'description'>) => Promise<boolean>;
  deleteMalfunction: (id: string) => Promise<boolean>;
  refreshMalfunctions: () => Promise<void>;
  getMalfunctionByToolId: (toolId: string) => MalfunctionItem | undefined;
}

// Create the context with a default value
const MalfunctionContext = createContext<MalfunctionContextType>({
  malfunctions: [],
  loading: false,
  error: null,
  addMalfunction: async () => ({ success: false }),
  updateMalfunction: async () => false,
  deleteMalfunction: async () => false,
  refreshMalfunctions: async () => {},
  getMalfunctionByToolId: () => undefined,
});

// Create a provider component
export function MalfunctionProvider({ children }: { children: ReactNode }) {
  const [malfunctions, setMalfunctions] = useState<MalfunctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all malfunction reports from the API
  const refreshMalfunctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/api/malfunction-reports');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch malfunction reports: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the API response to our MalfunctionItem interface
      const reports: MalfunctionItem[] = data.malfunction_reports.map((report: any) => ({
        id: report.id,
        toolId: report.tool_id,
        toolName: report.tool_name,
        serialNumber: report.serial_number,
        severity: report.severity,
        description: report.description,
        reportedAt: report.reported_at
      }));
      
      setMalfunctions(reports);
    } catch (err) {
      console.error('Error fetching malfunction reports:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new malfunction report
  const addMalfunction = async (malfunction: Omit<MalfunctionItem, 'id'>): Promise<{ success: boolean, reportId?: string, message?: string }> => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/malfunction-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(malfunction),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.status === 'success') {
          // If the report was created successfully, refresh the list
          await refreshMalfunctions();
          return { success: true, reportId: data.report_id };
        } else if (data.status === 'exists') {
          // If a report already exists for this tool, return the existing report ID
          return { success: false, reportId: data.report_id, message: data.message };
        }
      }
      
      throw new Error(data.error || 'Failed to create malfunction report');
    } catch (err) {
      console.error('Error adding malfunction report:', err);
      return { success: false, message: err instanceof Error ? err.message : 'An unknown error occurred' };
    }
  };

  // Function to update an existing malfunction report
  const updateMalfunction = async (id: string, updates: Pick<MalfunctionItem, 'severity' | 'description'>): Promise<boolean> => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/malfunction-reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update malfunction report: ${response.status}`);
      }
      
      // If the update was successful, refresh the list
      await refreshMalfunctions();
      return true;
    } catch (err) {
      console.error('Error updating malfunction report:', err);
      return false;
    }
  };

  // Function to delete a malfunction report
  const deleteMalfunction = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/malfunction-reports/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete malfunction report: ${response.status}`);
      }
      
      // If the deletion was successful, refresh the list
      await refreshMalfunctions();
      return true;
    } catch (err) {
      console.error('Error deleting malfunction report:', err);
      return false;
    }
  };

  // Function to get a malfunction report by tool ID
  const getMalfunctionByToolId = (toolId: string): MalfunctionItem | undefined => {
    return malfunctions.find(malfunction => malfunction.toolId === toolId);
  };

  // Fetch malfunction reports when the component mounts
  useEffect(() => {
    refreshMalfunctions();
  }, []);

  return (
    <MalfunctionContext.Provider 
      value={{ 
        malfunctions, 
        loading, 
        error, 
        addMalfunction, 
        updateMalfunction, 
        deleteMalfunction, 
        refreshMalfunctions,
        getMalfunctionByToolId
      }}
    >
      {children}
    </MalfunctionContext.Provider>
  );
}

// Create a hook to use the context
export function useMalfunctions() {
  return useContext(MalfunctionContext);
}
