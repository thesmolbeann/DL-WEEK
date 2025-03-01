"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function ToolPerformanceDetail() {
  const [reason, setReason] = useState("")

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-2xl font-bold mb-4">Tool Details</h2>

      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-medium">Status</div>
        <div className="bg-[#f5f6f7] text-[#5f5f5f] text-xs px-3 py-1 rounded-full">All</div>
      </div>

      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-[#5f5f5f]">Torque Wrench (TQ-504)</Label>
            <Input className="mt-1" value="Torque Wrench TQ-504" readOnly />
          </div>
          <div>
            <Label className="text-sm text-[#5f5f5f]">Calibrator: STANDARD</Label>
            <Input className="mt-1" value="STANDARD" readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-[#5f5f5f]">Manufacturer: STANDARD</Label>
            <Input className="mt-1" value="STANDARD" readOnly />
          </div>
          <div>
            <Label className="text-sm text-[#5f5f5f]">Calibration Interval: 3 Years</Label>
            <Input className="mt-1" value="3 Years" readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm text-[#5f5f5f]">Range: 10-50 Nm</Label>
            <Input className="mt-1" value="10-50 Nm" readOnly />
          </div>
          <div>
            <Label className="text-sm text-[#5f5f5f]">Last Calibration: 12/10/2024</Label>
            <Input className="mt-1" value="12/10/2024" readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-[#5f5f5f]">Tolerance: ±0.5% FS</Label>
            <Input className="mt-1" value="±0.5% FS" readOnly />
          </div>
          <div>
            <Label className="text-sm text-[#5f5f5f]">Calibration Number: 456-23-2044</Label>
            <Input className="mt-1" value="456-23-2044" readOnly />
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-4">
        <div>
          <Label className="text-sm text-[#5f5f5f]">Serial Number</Label>
          <Input className="mt-1" value="TW001-01" readOnly />
        </div>
        <div>
          <Label className="text-sm text-[#5f5f5f]">Fault</Label>
          <Input className="mt-1" value="Drift" readOnly />
        </div>
        <div>
          <Label className="text-sm text-[#5f5f5f]">Time</Label>
          <Input className="mt-1" value="10:00 AM" readOnly />
        </div>
        <div>
          <Label className="text-sm text-[#5f5f5f]">Reason</Label>
          <Input
            className="mt-1"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button className="bg-[#f5f6f7] text-[#5f5f5f] hover:bg-[#e5e5e5]">Submit</Button>
      </div>
    </div>
  )
}
