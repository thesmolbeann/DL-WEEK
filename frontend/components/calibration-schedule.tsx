"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Worker data type
interface WorkerData {
  name: string;
  currentLoad: number;
  optimizedLoad?: number;
}

export function CalibrationSchedule() {
  const [isOptimized, setIsOptimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for workers and their workloads
  const workerData: WorkerData[] = [
    { name: "HE", currentLoad: 75, optimizedLoad: 65 },
    { name: "FE", currentLoad: 90, optimizedLoad: 70 },
    { name: "MA", currentLoad: 80, optimizedLoad: 75 },
    { name: "AP", currentLoad: 65, optimizedLoad: 80 },
    { name: "MY", currentLoad: 55, optimizedLoad: 75 },
  ];

  // Find the maximum value for scaling
  const maxCurrentValue = Math.max(...workerData.map(worker => worker.currentLoad));
  const maxOptimizedValue = Math.max(...workerData.map(worker => worker.optimizedLoad || 0));
  const maxValue = Math.max(maxCurrentValue, maxOptimizedValue);

  // Function to simulate optimization
  const handleOptimize = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsOptimized(true);
      setIsLoading(false);
    }, 1500);
  };

  // Function to confirm changes
  const handleConfirmChanges = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Here we would update the database with the new allocation
      alert("Changes confirmed! Database updated with new work allocation.");
      setIsLoading(false);
    }, 1500);
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
                      height: `${(worker.currentLoad / maxValue) * 200}px`,
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
                    height: `${(worker.currentLoad / maxValue) * 200}px`,
                    backgroundColor: getBarColor(index),
                  }}
                ></div>
              )}
              <div className="mt-2 text-sm font-medium">{worker.name}</div>
              {isOptimized && (
                <div className="text-xs mt-1">
                  {worker.currentLoad} → {worker.optimizedLoad}
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
      
      {isOptimized && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
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
