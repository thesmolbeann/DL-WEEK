"use client"

import { useSearchParams } from "next/navigation"
import { Calendar } from "@/components/calendar"
import { CalibrationSchedule } from "@/components/calibration-schedule"
import { ToolPerformance } from "@/components/tool-performance"
import { ToolPerformanceDetail } from "@/components/tool-performance-detail"

export default function Home() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "calendar"
  
  return (
    <div>
      {tab === "calendar" && <Calendar />}
      {tab === "schedule" && <CalibrationSchedule />}
      {tab === "performance" && <ToolPerformance />}
      {tab === "detail" && <ToolPerformanceDetail />}
    </div>
  )
}
