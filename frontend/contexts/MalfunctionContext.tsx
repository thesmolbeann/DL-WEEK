"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addMalfunction: (malfunction: MalfunctionItem) => void;
  clearMalfunctions: () => void;
}

// Create the context with a default value
const MalfunctionContext = createContext<MalfunctionContextType>({
  malfunctions: [],
  addMalfunction: () => {},
  clearMalfunctions: () => {},
});

// Create a provider component
export function MalfunctionProvider({ children }: { children: ReactNode }) {
  const [malfunctions, setMalfunctions] = useState<MalfunctionItem[]>([]);

  const addMalfunction = (malfunction: MalfunctionItem) => {
    setMalfunctions(prev => [malfunction, ...prev]);
  };

  const clearMalfunctions = () => {
    setMalfunctions([]);
  };

  return (
    <MalfunctionContext.Provider value={{ malfunctions, addMalfunction, clearMalfunctions }}>
      {children}
    </MalfunctionContext.Provider>
  );
}

// Create a hook to use the context
export function useMalfunctions() {
  return useContext(MalfunctionContext);
}
