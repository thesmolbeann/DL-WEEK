"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

// Sample tool data
const toolsData = [
  {
    id: "TW001",
    name: "Torque Wrench TQ-504",
    brand: "Bosch",
    division: "Manufacturing",
    calibrator: "STANDARD",
    serialNumber: "TW001-01",
    range: "10-50 Nm",
    tolerance: "±0.5% FS",
    lastCalibration: "12/10/2024",
    nextCalibration: "12/10/2027",
    calibrationInterval: "3 Years",
    calibrationNumber: "456-23-2044",
    location: "Building A, Floor 2",
    status: "Active"
  },
  {
    id: "DP002",
    name: "Drill Press DP-201",
    brand: "Makita",
    division: "Assembly",
    calibrator: "PRECISION",
    serialNumber: "DP002-02",
    range: "N/A",
    tolerance: "±0.1mm",
    lastCalibration: "05/15/2024",
    nextCalibration: "05/15/2025",
    calibrationInterval: "1 Year",
    calibrationNumber: "456-23-2045",
    location: "Building B, Floor 1",
    status: "Active"
  },
  {
    id: "MM003",
    name: "Digital Multimeter",
    brand: "Fluke",
    division: "Electrical",
    calibrator: "PRECISION",
    serialNumber: "MM003-03",
    range: "0-1000V, 0-10A",
    tolerance: "±0.5%",
    lastCalibration: "02/20/2024",
    nextCalibration: "02/20/2025",
    calibrationInterval: "1 Year",
    calibrationNumber: "456-23-2046",
    location: "Building A, Floor 3",
    status: "Active"
  },
  {
    id: "CL004",
    name: "Digital Caliper",
    brand: "Mitutoyo",
    division: "Quality Control",
    calibrator: "STANDARD",
    serialNumber: "CL004-04",
    range: "0-150mm",
    tolerance: "±0.02mm",
    lastCalibration: "03/10/2024",
    nextCalibration: "03/10/2025",
    calibrationInterval: "1 Year",
    calibrationNumber: "456-23-2047",
    location: "Building C, Floor 1",
    status: "Maintenance"
  },
  {
    id: "LM005",
    name: "Laser Micrometer",
    brand: "Keyence",
    division: "Quality Control",
    calibrator: "PRECISION",
    serialNumber: "LM005-05",
    range: "0-25mm",
    tolerance: "±0.001mm",
    lastCalibration: "01/05/2024",
    nextCalibration: "01/05/2025",
    calibrationInterval: "1 Year",
    calibrationNumber: "456-23-2048",
    location: "Building A, Floor 1",
    status: "Active"
  }
];

// Available filter options
const filterOptions = {
  brand: ["All", "Bosch", "Makita", "Fluke", "Mitutoyo", "Keyence"],
  division: ["All", "Manufacturing", "Assembly", "Electrical", "Quality Control"],
  calibrator: ["All", "STANDARD", "PRECISION"]
};

// Options for select fields when editing
const editOptions = {
  brand: ["Bosch", "Makita", "Fluke", "Mitutoyo", "Keyence", "Other"],
  division: ["Manufacturing", "Assembly", "Electrical", "Quality Control", "Maintenance", "Other"],
  calibrator: ["STANDARD", "PRECISION", "EXTERNAL", "OTHER"],
  status: ["Active", "Maintenance", "Repair", "Retired", "Lost"]
};

// Options for malfunction severity
const severityOptions = ["Mild", "Medium", "Major"];

export function ToolInventory() {
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
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Filter tools based on selected filters
  const filteredTools = toolsData.filter(tool => {
    return (
      (filters.brand === "All" || tool.brand === filters.brand) &&
      (filters.division === "All" || tool.division === filters.division) &&
      (filters.calibrator === "All" || tool.calibrator === filters.calibrator) &&
      (filters.search === "" || 
        tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tool.serialNumber.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });
  
  // Get selected tool details
  const selectedToolDetails = selectedTool 
    ? toolsData.find(tool => tool.id === selectedTool) 
    : null;
    
  // Handle edit button click
  const handleEditClick = () => {
    if (selectedToolDetails) {
      setEditFormData({ ...selectedToolDetails });
      setIsEditing(true);
    }
  };
  
  // Handle edit form input changes
  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Update the tool data (in a real app, this would be done via API)
      const updatedToolsData = toolsData.map(tool => 
        tool.id === selectedTool ? { ...editFormData } : tool
      );
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsEditing(false);
      }, 3000);
    }, 1500);
  };
  
  // Handle malfunction form input changes
  const handleMalfunctionChange = (field: string, value: string) => {
    setMalfunctionData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle malfunction form submission
  const handleMalfunctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMalfunctionSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsMalfunctionSubmitting(false);
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
    }, 1500);
  };
  
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
          
          <h3 className="text-xl font-semibold mb-4">{selectedToolDetails?.name}</h3>
          
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
                      value={editFormData.brand} 
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
                      value={editFormData.division} 
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
                      value={editFormData.calibrator} 
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
                      value={editFormData.range}
                      onChange={(e) => handleEditChange("range", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tolerance">Tolerance</Label>
                    <Input
                      id="tolerance"
                      value={editFormData.tolerance}
                      onChange={(e) => handleEditChange("tolerance", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastCalibration">Last Calibration Date</Label>
                    <Input
                      id="lastCalibration"
                      type="text"
                      value={editFormData.lastCalibration}
                      onChange={(e) => handleEditChange("lastCalibration", e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nextCalibration">Next Calibration Date</Label>
                    <Input
                      id="nextCalibration"
                      type="text"
                      value={editFormData.nextCalibration}
                      onChange={(e) => handleEditChange("nextCalibration", e.target.value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="calibrationInterval">Calibration Interval</Label>
                    <Input
                      id="calibrationInterval"
                      value={editFormData.calibrationInterval}
                      onChange={(e) => handleEditChange("calibrationInterval", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="calibrationNumber">Calibration Number</Label>
                    <Input
                      id="calibrationNumber"
                      value={editFormData.calibrationNumber}
                      onChange={(e) => handleEditChange("calibrationNumber", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editFormData.location}
                      onChange={(e) => handleEditChange("location", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editFormData.status} 
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
                    <div className="font-medium">{selectedToolDetails?.serialNumber}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Brand</Label>
                    <div className="font-medium">{selectedToolDetails?.brand}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Division</Label>
                    <div className="font-medium">{selectedToolDetails?.division}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibrator</Label>
                    <div className="font-medium">{selectedToolDetails?.calibrator}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Range</Label>
                    <div className="font-medium">{selectedToolDetails?.range}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Tolerance</Label>
                    <div className="font-medium">{selectedToolDetails?.tolerance}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Last Calibration</Label>
                    <div className="font-medium">{selectedToolDetails?.lastCalibration}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Next Calibration</Label>
                    <div className="font-medium">{selectedToolDetails?.nextCalibration}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibration Interval</Label>
                    <div className="font-medium">{selectedToolDetails?.calibrationInterval}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Calibration Number</Label>
                    <div className="font-medium">{selectedToolDetails?.calibrationNumber}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Location</Label>
                    <div className="font-medium">{selectedToolDetails?.location}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 dark:text-gray-400">Status</Label>
                    <div className={`font-medium ${
                      selectedToolDetails?.status === "Active" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {selectedToolDetails?.status}
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
                        Report an issue with {selectedToolDetails?.name} (Serial: {selectedToolDetails?.serialNumber})
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isMalfunctionSuccess ? (
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-400">
                          Malfunction report submitted successfully!
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
                        
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsMalfunctionDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isMalfunctionSubmitting}
                          >
                            {isMalfunctionSubmitting ? "Submitting..." : "Submit Report"}
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
                      key={tool.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <td className="px-4 py-3">{tool.name}</td>
                      <td className="px-4 py-3">{tool.serialNumber}</td>
                      <td className="px-4 py-3">{tool.brand}</td>
                      <td className="px-4 py-3">{tool.division}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tool.status === "Active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {tool.status}
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
            Showing {filteredTools.length} of {toolsData.length} tools
          </div>
        </div>
      )}
    </div>
  )
}
