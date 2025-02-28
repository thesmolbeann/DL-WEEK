"use client"
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const [faultData, setFaultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const fetchFAData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/view-fault-data');
      const data = await response.json();
      setFaultData(data.data);
      
      // Initialize column filters based on data structure
      if (data.data && data.data.length > 0) {
        const initialColumnFilters = {};
        Object.keys(data.data[0]).forEach(key => {
          initialColumnFilters[key] = "";
        });
        setColumnFilters(initialColumnFilters);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!faultData) return null;
    
    return faultData.filter(row => {
      // Global search across all fields
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      
      // Column-specific filters
      for (const [column, filterValue] of Object.entries(columnFilters)) {
        if (filterValue && row[column]) {
          const cellValue = String(row[column]).toLowerCase();
          const filterLower = filterValue.toLowerCase();
          if (!cellValue.includes(filterLower)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [faultData, searchQuery, columnFilters]);

  // Count active filters
  useEffect(() => {
    if (!columnFilters) return;
    
    const active = Object.entries(columnFilters)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([key, _]) => key);
      
    setActiveFilters(active);
  }, [columnFilters]);

  // Handle column filter change
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    if (faultData && faultData.length > 0) {
      const resetFilters = {};
      Object.keys(faultData[0]).forEach(key => {
        resetFilters[key] = "";
      });
      setColumnFilters(resetFilters);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/95">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11h6m-6 4h6" />
              </svg>
              Fault Analysis Data
            </h2>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                View and analyze fault data from the backend API.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={fetchFAData}
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm h-10 px-5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      View Fault Data
                    </>
                  )}
                </button>
                
                {faultData && (
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`rounded-lg border font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm h-10 px-5 ${
                      activeFilters.length > 0 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {faultData && showFilterPanel && (
              <div className="mb-6 mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
                
                {/* Global search */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search all columns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Column filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(faultData[0] || {}).map((column) => (
                    <div key={column} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        {column}
                      </label>
                      <input
                        type="text"
                        placeholder={`Filter ${column}...`}
                        value={columnFilters[column] || ""}
                        onChange={(e) => handleColumnFilterChange(column, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {faultData && (
              <div className="mt-6">
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                          {Object.keys(faultData[0] || {}).map((header) => (
                            <th key={header} className="px-6 py-4 text-left text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                        {(filteredData || []).map((row, index) => (
                          <tr 
                            key={index} 
                            className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/30'} hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-150`}
                          >
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {filteredData && filteredData.length === 0 && (
                          <tr>
                            <td 
                              colSpan={Object.keys(faultData[0] || {}).length} 
                              className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              No matching records found. Try adjusting your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    {activeFilters.length > 0 && (
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md">
                        Filtered
                      </span>
                    )}
                  </div>
                  <p>
                    {filteredData ? filteredData.length : 0} of {faultData.length} {faultData.length === 1 ? 'record' : 'records'} shown
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      
    </div>
  );
}
