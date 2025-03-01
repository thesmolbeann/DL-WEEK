"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMalfunctions } from "@/contexts/MalfunctionContext"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Tool {
  id: string;
  description: string;
  serial_no: string;
  brand: string;
  div: string;
  calibrator: string;
  range: string;
  tolerance: string;
  calibration_date: string;
  calibration__due: string;
  calibration_interval: string;
  calibration_number: string;
  location: string;
  status: string;
}

// Available filter options
const filterOptions = {
  brand: ["All", "Bosch", "Makita", "Fluke", "Mitutoyo", "Keyence", "Other"],
  division: ["All", "FA", "Manufacturing", "Assembly", "Electrical", "Quality Control", "Other"],
  calibrator: ["All", "STANDARD", "PRECISION", "EXTERNAL", "OTHER"]
};

// Options for select fields when editing
const editOptions = {
  brand: ["Bosch", "Makita", "Fluke", "Mitutoyo", "Keyence", "Other"],
  division: ["FA", "Manufacturing", "Assembly", "Electrical", "Quality Control", "Maintenance", "Other"],
  calibrator: ["STANDARD", "PRECISION", "EXTERNAL", "OTHER"],
  status: ["Active", "Maintenance", "Repair", "Retired", "Lost"]
};

// Options for malfunction severity
const severityOptions = ["Mild", "Medium", "Major"];

export function ToolInventory() {
  // State for storing fetched tools data
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    brand: "All",
    division: "All",
    calibrator: "All",
    search: ""
  });
  
  // State for selected tool
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
// State for malfunction report
  const [malfunctionData, setMalfunctionData] = useState({
    severity: "Medium",
    description: ""
  });
  const [isMalfunctionDialogOpen, setIsMalfunctionDialogOpen] = useState(false);
  const [isMalfunctionSubmitting, setIsMalfunctionSubmitting] = useState(false);
  const [isMalfunctionSuccess, setIsMalfunctionSuccess] = useState(false);
  const [isEditingMalfunction, setIsEditingMalfunction] = useState(false);
  const [currentMalfunctionId, setCurrentMalfunctionId] = useState<string | null>(null);
  
  // State for view all malfunctions dialog
  const [isViewAllMalfunctionsOpen, setIsViewAllMalfunctionsOpen] = useState(false);

  // Fetch tools from backend when component mounts
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/tools-inventory")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch tools.");
        }
        return response.json();
      })
      .then(data => setTools(data.tools_inventory))
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Filter tools based on selected filters
  const filteredTools = tools.filter(tool => {
    // For debugging
    console.log("Filtering tool:", tool);
    console.log("Current filters:", filters);
    
    // Handle null/undefined values safely
    const toolBrand = tool.brand || '';
    const toolDiv = tool.div || '';
    const toolCalibrator = tool.calibrator || '';
    const toolDescription = tool.description || '';
    const toolSerialNo = tool.serial_no || '';
    
    // Case-insensitive comparison for text fields
    const brandMatch = filters.brand === "All" || 
                      toolBrand.toLowerCase() === filters.brand.toLowerCase() ||
                      (filters.brand === "Other" && !filterOptions.brand.slice(1).some(b => 
                        toolBrand.toLowerCase() === b.toLowerCase()));
                        
    const divisionMatch = filters.division === "All" || 
                         toolDiv.toLowerCase() === filters.division.toLowerCase() ||
                         (filters.division === "Other" && !filterOptions.division.slice(1).some(d => 
                           toolDiv.toLowerCase() === d.toLowerCase()));
                           
    const calibratorMatch = filters.calibrator === "All" || 
                           toolCalibrator.toLowerCase() === filters.calibrator.toLowerCase() ||
                           (filters.calibrator === "Other" && !filterOptions.calibrator.slice(1).some(c => 
                             toolCalibrator.toLowerCase() === c.toLowerCase()));
    
    const searchMatch = filters.search === "" || 
                       toolDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
                       toolSerialNo.toLowerCase().includes(filters.search.toLowerCase());
    
    return brandMatch && divisionMatch && calibratorMatch && searchMatch;
  });
  
  // Get selected tool details
  const selectedToolDetails = selectedTool 
    ? tools.find(tool => String(tool.id) === selectedTool) 
    : null;
    
  // Handle edit button click
  const handleEditClick = () => {
    if (selectedToolDetails) {
      console.log("Selected tool details:", selectedToolDetails);
      setEditFormData({ 
        ...selectedToolDetails,
        // Map database field names to form field names for clarity
        name: selectedToolDetails.description,
        serialNumber: selectedToolDetails.serial_no,
        division: selectedToolDetails.div,
        lastCalibration: selectedToolDetails.calibration_date,
        nextCalibration: selectedToolDetails.calibration__due,
        calibrationInterval: selectedToolDetails.calibration_interval,
        calibrationNumber: selectedToolDetails.calibration_number,
        // Ensure id is included
        id: selectedToolDetails.id
      });
      setIsEditing(true);
    }
  };
  
  // Handle edit form input changes
  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send the updated data to the backend
      const response = await fetch("http://127.0.0.1:5000/api/update-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tool");
      }
      
      // Update the tools list with the updated tool data
      setTools(prevTools => 
        prevTools.map(tool => 
          String(tool.id) === String(editFormData.id) 
            ? {
                ...tool,
                description: editFormData.name,
                serial_no: editFormData.serialNumber,
                brand: editFormData.brand,
                div: editFormData.division,
                calibrator: editFormData.calibrator,
                range: editFormData.range,
                tolerance: editFormData.tolerance,
                calibration_date: editFormData.lastCalibration,
                calibration__due: editFormData.nextCalibration,
                calibration_interval: editFormData.calibrationInterval,
                calibration_number: editFormData.calibrationNumber,
                location: editFormData.location,
                status: editFormData.status
              }
            : tool
        )
      );
      
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsEditing(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating tool:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle malfunction form input changes
  const handleMalfunctionChange = (field: string, value: string) => {
    setMalfunctionData(prev => ({ ...prev, [field]: value }));
  };
  
  // Get malfunction context functions
  const { 
    addMalfunction, 
    updateMalfunction, 
    deleteMalfunction, 
    getMalfunctionByToolId,
    malfunctions 
  } = useMalfunctions();
  
  // Check if the selected tool already has a malfunction report
  useEffect(() => {
    if (selectedTool && selectedToolDetails) {
      const existingMalfunction = getMalfunctionByToolId(selectedTool);
      
      if (existingMalfunction) {
        // If there's an existing report, set up for editing
        setMalfunctionData({
          severity: existingMalfunction.severity,
          description: existingMalfunction.description
        });
        setCurrentMalfunctionId(existingMalfunction.id);
        setIsEditingMalfunction(true);
      } else {
        // Reset for a new report
        setMalfunctionData({
          severity: "Medium",
          description: ""
        });
        setCurrentMalfunctionId(null);
        setIsEditingMalfunction(false);
      }
    }
  }, [selectedTool, selectedToolDetails, getMalfunctionByToolId]);
  
  // Handle malfunction form submission
  const handleMalfunctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMalfunctionSubmitting(true);
    
    try {
      if (selectedToolDetails) {
        if (isEditingMalfunction && currentMalfunctionId) {
          // Update existing malfunction report
          const success = await updateMalfunction(currentMalfunctionId, {
            severity: malfunctionData.severity,
            description: malfunctionData.description
          });
          
          if (success) {
            setIsMalfunctionSuccess(true);
            
            // Reset success message after 3 seconds
            setTimeout(() => {
              setIsMalfunctionSuccess(false);
              setIsMalfunctionDialogOpen(false);
              // Reset form
              setMalfunctionData({
                severity: "Medium",
                description: ""
              });
            }, 3000);
          } else {
            setError("Failed to update malfunction report");
            setTimeout(() => setError(null), 5000);
          }
        } else {
          // Create new malfunction report
          const result = await addMalfunction({
            toolId: String(selectedToolDetails.id),
            toolName: selectedToolDetails.description || 'Unknown Tool',
            serialNumber: selectedToolDetails.serial_no || 'N/A',
            severity: malfunctionData.severity,
            description: malfunctionData.description,
            reportedAt: new Date().toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            })
          });
          
          if (result.success) {
            setIsMalfunctionSuccess(true);
            
            // Reset success message after 3 seconds
            setTimeout(() => {
              setIsMalfunctionSuccess(false);
              setIsMalfunctionDialogOpen(false);
              // Reset form
              setMalfunctionData({
                severity: "Medium",
                description: ""
              });
            }, 3000);
          } else if (result.message && result.message.includes("already exists")) {
            // If a report already exists, set up for editing
            setError("A report already exists for this tool. You can edit the existing report.");
            
            if (result.reportId) {
              const existingMalfunction = malfunctions.find(m => m.id === result.reportId);
              if (existingMalfunction) {
                setMalfunctionData({
                  severity: existingMalfunction.severity,
                  description: existingMalfunction.description
                });
                setCurrentMalfunctionId(existingMalfunction.id);
                setIsEditingMalfunction(true);
              }
            }
            
            setTimeout(() => setError(null), 5000);
          } else {
            setError(result.message || "Failed to create malfunction report");
            setTimeout(() => setError(null), 5000);
          }
        }
      }
    } catch (error) {
      console.error("Error handling malfunction report:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsMalfunctionSubmitting(false);
    }
  };
  
  // Handle malfunction deletion
  const handleDeleteMalfunction = async () => {
    if (currentMalfunctionId) {
      setIsMalfunctionSubmitting(true);
      
      try {
        const success = await deleteMalfunction(currentMalfunctionId);
        
        if (success) {
          setIsMalfunctionSuccess(true);
          setCurrentMalfunctionId(null);
          setIsEditingMalfunction(false);
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            setIsMalfunctionSuccess(false);
            setIsMalfunctionDialogOpen(false);
            // Reset form
            setMalfunctionData({
              severity: "Medium",
              description: ""
            });
          }, 3000);
        } else {
          setError("Failed to delete malfunction report");
          setTimeout(() => setError(null), 5000);
        }
      } catch (error) {
        console.error("Error deleting malfunction report:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsMalfunctionSubmitting(false);
      }
    }
  };

  if (loading) return (
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Tool Inventory</h2>
      <p className="text-center py-8">Loading tools...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Tool Inventory</h2>
      <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <AlertDescription className="text-red-800 dark:text-red-400">
          Error: {error}
        </AlertDescription>
      </Alert>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Tool Inventory</h2>
      
      {selectedTool ? (
        // Tool details view
        <div>
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center gap-1"
            onClick={() => {
              setSelectedTool(null);
              setIsEditing(false);
              setIsSuccess(false);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to inventory
          </Button>
          
          <h3 className="text-xl font-semibold mb-4">{selectedToolDetails?.description || 'Unknown Tool'}</h3>
          
          {isSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-400">
                Tool information updated successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {isMalfunctionSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-400">
                Malfunction report submitted successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {isEditing ? (
            // Edit form
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tool Name</Label>
                    <Input
                      id="name"
                      value={editFormData.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={editFormData.serialNumber}
                      onChange={(e) => handleEditChange("serialNumber", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select 
                      value={editFormData.brand || ''} 
                      onValueChange={(value) => handleEditChange("brand", value)}
                    >
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {editOptions.brand.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="division">Division</Label>
                    <Select 
                      value={editFormData.division || ''} 
                      onValueChange={(value) => handleEditChange("division", value)}
                    >
                      <SelectTrigger id="division">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {editOptions.division.map((division) => (
                          <SelectItem key={division} value={division}>
                            {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="calibrator">Calibrator</Label>
                    <Select 
                      value={editFormData.calibrator || ''} 
                      onValueChange={(value) => handleEditChange("calibrator", value)}
                    >
                      <SelectTrigger id="calibrator">
                        <SelectValue placeholder="Select calibrator" />
                      </SelectTrigger>
                      <SelectContent>
                        {editOptions.calibrator.map((calibrator) => (
                          <SelectItem key={calibrator} value={calibrator}>
                            {calibrator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="range">Range</Label>
                    <Input
                      id="range"
                      value={editFormData.range || ''}
                      onChange={(e) => handleEditChange("range", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tolerance">Tolerance</Label>
                    <Input
                      id="tolerance"
                      value={editFormData.tolerance || ''}
                      onChange={(e) => handleEditChange("tolerance", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastCalibration">Last Calibration Date</Label>
                    <Input
                      id="lastCalibration"
                      type="text"
                      value={editFormData.lastCalibration || ''}
                      onChange={(e) => handleEditChange("lastCalibration", e.target.value)}
                      placeholder="DD-MMM-YY or DD/MM/YYYY"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: 06-Jun-25, 06/06/2025, 06-June-2025
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="nextCalibration">Next Calibration Date</Label>
                    <Input
                      id="nextCalibration"
                      type="text"
                      value={editFormData.nextCalibration || ''}
                      onChange={(e) => handleEditChange("nextCalibration", e.target.value)}
                      placeholder="DD-MMM-YY or DD/MM/YYYY"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: 06-Jun-25, 06/06/2025, 06-June-2025
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="calibrationInterval">Calibration Interval</Label>
                    <Input
                      id="calibrationInterval"
                      value={editFormData.calibrationInterval || ''}
                      onChange={(e) => handleEditChange("calibrationInterval", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="calibrationNumber">Calibration Number</Label>
                    <Input
                      id="calibrationNumber"
                      value={editFormData.calibrationNumber || ''}
                      onChange={(e) => handleEditChange("calibrationNumber", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editFormData.location || ''}
                      onChange={(e) => handleEditChange("location", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editFormData.status || 'Active'} 
                      onValueChange={(value) => handleEditChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {editOptions.status.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Tool"}
                </Button>
              </div>
            </form>
          ) : (
            // Tool details view
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Serial Number</Label>
                    <div className="font-medium">{selectedToolDetails?.serial_no || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Brand</Label>
                    <div className="font-medium">{selectedToolDetails?.brand || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Division</Label>
                    <div className="font-medium">{selectedToolDetails?.div || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibrator</Label>
                    <div className="font-medium">{selectedToolDetails?.calibrator || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Range</Label>
                    <div className="font-medium">{selectedToolDetails?.range || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Tolerance</Label>
                    <div className="font-medium">{selectedToolDetails?.tolerance || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Last Calibration</Label>
                    <div className="font-medium">{selectedToolDetails?.calibration_date || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Next Calibration</Label>
                    <div className="font-medium">{selectedToolDetails?.calibration__due || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibration Interval</Label>
                    <div className="font-medium">{selectedToolDetails?.calibration_interval || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibration Number</Label>
                    <div className="font-medium">{selectedToolDetails?.calibration_number || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Location</Label>
                    <div className="font-medium">{selectedToolDetails?.location || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Status</Label>
                    <div className={`font-medium ${
                      selectedToolDetails?.status === "Active" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {selectedToolDetails?.status || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Dialog open={isMalfunctionDialogOpen} onOpenChange={setIsMalfunctionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Report Malfunction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Tool Malfunction</DialogTitle>
                      <DialogDescription>
                        Report an issue with {selectedToolDetails?.description} (Serial: {selectedToolDetails?.serial_no})
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isMalfunctionSuccess ? (
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-400">
                          {isEditingMalfunction 
                            ? "Malfunction report updated successfully!" 
                            : "Malfunction report submitted successfully!"}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleMalfunctionSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="severity">Severity of Issue</Label>
                          <Select 
                            value={malfunctionData.severity} 
                            onValueChange={(value) => handleMalfunctionChange("severity", value)}
                          >
                            <SelectTrigger id="severity">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              {severityOptions.map((severity) => (
                                <SelectItem key={severity} value={severity}>
                                  {severity}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description of Fault</Label>
                          <Textarea
                            id="description"
                            value={malfunctionData.description}
                            onChange={(e) => handleMalfunctionChange("description", e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                        
                        <DialogFooter className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {isEditingMalfunction && (
                              <Button
                                type="button"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={handleDeleteMalfunction}
                                disabled={isMalfunctionSubmitting}
                              >
                                Delete Report
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsMalfunctionDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                          <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isMalfunctionSubmitting}
                          >
                            {isMalfunctionSubmitting 
                              ? "Submitting..." 
                              : isEditingMalfunction 
                                ? "Update Report" 
                                : "Submit Report"}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleEditClick}
                >
                  Edit Tool
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        // Inventory list view
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name or serial number"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select 
                value={filters.brand} 
                onValueChange={(value) => handleFilterChange("brand", value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.brand.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="division">Division</Label>
              <Select 
                value={filters.division} 
                onValueChange={(value) => handleFilterChange("division", value)}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.division.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="calibrator">Calibrator</Label>
              <Select 
                value={filters.calibrator} 
                onValueChange={(value) => handleFilterChange("calibrator", value)}
              >
                <SelectTrigger id="calibrator">
                  <SelectValue placeholder="Select calibrator" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.calibrator.map((calibrator) => (
                    <SelectItem key={calibrator} value={calibrator}>
                      {calibrator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Tool Name</th>
                  <th className="px-4 py-2 text-left">Serial Number</th>
                  <th className="px-4 py-2 text-left">Brand</th>
                  <th className="px-4 py-2 text-left">Division</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <tr 
                      key={String(tool.id)} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool(String(tool.id))}
                    >
                      <td className="px-4 py-3">{tool.description || 'Unnamed Tool'}</td>
                      <td className="px-4 py-3">{tool.serial_no || 'N/A'}</td>
                      <td className="px-4 py-3">{tool.brand || 'N/A'}</td>
                      <td className="px-4 py-3">{tool.div || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tool.status === "Active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {tool.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                      No tools found matching the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTools.length} of {tools.length} tools
          </div>

        </div>
      )}
    </div>
  );
}
