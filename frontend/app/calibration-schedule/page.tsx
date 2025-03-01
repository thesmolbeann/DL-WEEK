"use client"

import { CalibrationSchedule } from "@/components/calibration-schedule"

export default function CalibrationSchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Calibration Schedule</h1>
      <CalibrationSchedule />
    </div>
  )
}
