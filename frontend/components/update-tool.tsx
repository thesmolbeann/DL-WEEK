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

// Sample tool data for the form
const initialToolData = {
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
  status: "Active",
  notes: "Regular maintenance required every 6 months."
};

// Options for select fields
const options = {
  brand: ["Bosch", "Makita", "Fluke", "Mitutoyo", "Keyence", "Other"],
  division: ["Manufacturing", "Assembly", "Electrical", "Quality Control", "Maintenance", "Other"],
  calibrator: ["STANDARD", "PRECISION", "EXTERNAL", "OTHER"],
  status: ["Active", "Maintenance", "Repair", "Retired", "Lost"]
};

export function UpdateTool() {
  const [formData, setFormData] = useState(initialToolData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/update-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update tool.");
      }
  
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating tool:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Update Tool</h2>
      
      {isSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-400">
            Tool information updated successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tool Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select 
                value={formData.brand} 
                onValueChange={(value) => handleChange("brand", value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {options.brand.map((brand) => (
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
                value={formData.division} 
                onValueChange={(value) => handleChange("division", value)}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {options.division.map((division) => (
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
                value={formData.calibrator} 
                onValueChange={(value) => handleChange("calibrator", value)}
              >
                <SelectTrigger id="calibrator">
                  <SelectValue placeholder="Select calibrator" />
                </SelectTrigger>
                <SelectContent>
                  {options.calibrator.map((calibrator) => (
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
                value={formData.range}
                onChange={(e) => handleChange("range", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="tolerance">Tolerance</Label>
              <Input
                id="tolerance"
                value={formData.tolerance}
                onChange={(e) => handleChange("tolerance", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="lastCalibration">Last Calibration Date</Label>
              <Input
                id="lastCalibration"
                type="text"
                value={formData.lastCalibration}
                onChange={(e) => handleChange("lastCalibration", e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            
            <div>
              <Label htmlFor="nextCalibration">Next Calibration Date</Label>
              <Input
                id="nextCalibration"
                type="text"
                value={formData.nextCalibration}
                onChange={(e) => handleChange("nextCalibration", e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
            
            <div>
              <Label htmlFor="calibrationInterval">Calibration Interval</Label>
              <Input
                id="calibrationInterval"
                value={formData.calibrationInterval}
                onChange={(e) => handleChange("calibrationInterval", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="calibrationNumber">Calibration Number</Label>
              <Input
                id="calibrationNumber"
                value={formData.calibrationNumber}
                onChange={(e) => handleChange("calibrationNumber", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {options.status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData(initialToolData)}
          >
            Reset
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
    </div>
  )
}
