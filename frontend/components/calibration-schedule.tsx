"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Worker data type
interface WorkerData {
  pic: string;
  old_workload: number;
  optimizedLoad?: number;
}

// Sample worker data for fallback
const sampleWorkerData: WorkerData[] = [
  { pic: "HE", old_workload: 75 },
  { pic: "FE", old_workload: 90 },
  { pic: "MA", old_workload: 80 },
  { pic: "AP", old_workload: 65 },
  { pic: "MY", old_workload: 55 },
];

export function CalibrationSchedule() {
  const [isOptimized, setIsOptimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workerData, setWorkerData] = useState<WorkerData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useBackend, setUseBackend] = useState(true);

  // Find the maximum value for scaling
  const maxCurrentValue = Math.max(...workerData.map(worker => worker.old_workload));
  const maxOptimizedValue = Math.max(...workerData.map(worker => worker.optimizedLoad || 0));
  const maxValue = Math.max(maxCurrentValue, maxOptimizedValue, 100); // Ensure we have a minimum scale

  // Fetch initial worker data
  useEffect(() => {
    fetchWorkerData();
  }, []);

  // Function to fetch worker data from the backend
  const fetchWorkerData = async () => {
    if (!useBackend) {
      setWorkerData(sampleWorkerData);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/worker-allocation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch worker data');
      }
      
      const data = await response.json();
      
      // Process the worker_allocation data
      // Group by PIC and use old_workload
      const picGroups: Record<string, any> = {};
      
      console.log("Backend response:", data);
      
      if (data.worker_allocation && Array.isArray(data.worker_allocation)) {
        data.worker_allocation.forEach((item: any) => {
          if (item.pic && !picGroups[item.pic]) {
            picGroups[item.pic] = {
              pic: item.pic,
              old_workload: item.old_workload || 0
            };
          }
        });
        
        // Convert to array format
        const processedData = Object.values(picGroups);
        console.log("Processed worker data:", processedData);
        
        if (processedData.length > 0) {
          setWorkerData(processedData);
          return;
        }
      }
      
      console.warn("Using sample data as fallback");
      setError('No valid worker data received from backend. Using sample data as fallback.');
      setUseBackend(false);
      setWorkerData(sampleWorkerData);
    } catch (err) {
      console.error('Error fetching worker data:', err);
      setError('Failed to load worker data from backend. Using sample data as fallback.');
      setUseBackend(false); // Switch to fallback mode
      setWorkerData(sampleWorkerData);
    }
  };

  // Function to optimize worker allocation
  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    
    if (!useBackend) {
      // Use sample optimized data
      setTimeout(() => {
        const optimizedData = workerData.map(worker => ({
          ...worker,
          optimizedLoad: Math.max(50, Math.min(90, worker.old_workload * (0.9 + 0.2 * Math.random())))
        }));
        setWorkerData(optimizedData);
        setIsOptimized(true);
        setIsLoading(false);
      }, 1000); // Simulate API delay
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/optimize-worker-allocation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to optimize worker allocation');
      }
      
      const data = await response.json();
      
      console.log("Optimize response:", data);
      
      if (data.optimized_worker_allocation && Array.isArray(data.optimized_worker_allocation)) {
        // Process the optimized data
        const optimizedData = workerData.map(worker => {
          // Find the optimized load for this worker
          const optimized = data.optimized_worker_allocation.find((item: any) => 
            item[0] === worker.pic
          );
          
          return {
            ...worker,
            optimizedLoad: optimized ? optimized[1] : worker.old_workload
          };
        });
        
        console.log("Processed optimized data:", optimizedData);
        setWorkerData(optimizedData);
        setIsOptimized(true);
      } else {
        throw new Error("Invalid optimized data format");
      }
    } catch (err) {
      console.error('Error optimizing worker allocation:', err);
      setError('Failed to optimize worker allocation. Using sample optimized data.');
      
      // Use sample optimized data
      const optimizedData = workerData.map(worker => ({
        ...worker,
        optimizedLoad: Math.max(50, Math.min(90, worker.old_workload * (0.9 + 0.2 * Math.random())))
      }));
      setWorkerData(optimizedData);
      setIsOptimized(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to confirm changes
  const handleConfirmChanges = async () => {
    setIsLoading(true);
    setError(null);
    
    if (!useBackend) {
      // Simulate update with optimized data
      setTimeout(() => {
        const updatedData = workerData.map(worker => ({
          pic: worker.pic,
          old_workload: worker.optimizedLoad || worker.old_workload
        }));
        
        setWorkerData(updatedData);
        setIsOptimized(false);
        setIsLoading(false);
        alert("Changes confirmed! (Simulated update with optimized data)");
      }, 1000); // Simulate API delay
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update-worker-allocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update worker allocation');
      }
      
      // Refresh worker data
      await fetchWorkerData();
      setIsOptimized(false);
      alert("Changes confirmed! Database updated with new work allocation.");
    } catch (err) {
      console.error('Error confirming changes:', err);
      setError('Failed to update worker allocation. Simulating update with optimized data.');
      setUseBackend(false); // Switch to fallback mode
      
      // Simulate update with optimized data
      const updatedData = workerData.map(worker => ({
        pic: worker.pic,
        old_workload: worker.optimizedLoad || worker.old_workload
      }));
      
      setWorkerData(updatedData);
      setIsOptimized(false);
      alert("Changes confirmed! (Simulated update with optimized data)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Calibration Schedule</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Work Allocation Among Workers</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isOptimized 
            ? "Comparison between current and optimized work allocation" 
            : "Current work allocation among workers"}
        </p>
        
        <div className="h-64 flex items-end justify-between mb-6">
          {workerData.map((worker, index) => (
            <div key={index} className="flex flex-col items-center">
              {isOptimized ? (
                // Show both current and optimized bars when optimized
                <div className="flex items-end gap-1">
                  <div
                    className="w-6 rounded-t-md bg-blue-300 dark:bg-blue-700 opacity-50"
                    style={{
                      height: `${(worker.old_workload / maxValue) * 200}px`,
                    }}
                  ></div>
                  <div
                    className="w-6 rounded-t-md"
                    style={{
                      height: `${((worker.optimizedLoad || 0) / maxValue) * 200}px`,
                      backgroundColor: getBarColor(index),
                    }}
                  ></div>
                </div>
              ) : (
                // Show only current bar when not optimized
                <div
                  className="w-12 rounded-t-md"
                  style={{
                    height: `${(worker.old_workload / maxValue) * 200}px`,
                    backgroundColor: getBarColor(index),
                  }}
                ></div>
              )}
              <div className="mt-2 text-sm font-medium">{worker.pic}</div>
              {isOptimized && (
                <div className="text-xs mt-1">
                  {worker.old_workload} → {worker.optimizedLoad}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isOptimized && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700 opacity-50"></div>
              <span className="text-sm">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500"></div>
              <span className="text-sm">Optimized</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-2">
          {!isOptimized ? (
            <Button
              onClick={handleOptimize}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Optimizing..." : "Optimize Allocation"}
            </Button>
          ) : (
            <Button
              onClick={handleConfirmChanges}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Confirming..." : "Confirm Changes"}
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mt-4">
          <AlertDescription>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </AlertDescription>
        </Alert>
      )}
      
      {isOptimized && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mt-4">
          <AlertDescription>
            <p className="font-medium">Optimization Results</p>
            <p className="text-sm mt-1">
              The heuristic model has redistributed the workload to balance it more evenly among workers,
              while considering location grouping and deadline grouping. This optimization can improve
              efficiency and reduce bottlenecks.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function getBarColor(index: number): string {
  const colors = ["#7a85e4", "#f67de6", "#79f26b", "#f6363a", "#f6aa36"]
  return colors[index % colors.length]
}
