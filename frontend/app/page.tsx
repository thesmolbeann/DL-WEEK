"use client"

import { useSearchParams } from "next/navigation"
import { Calendar } from "@/components/calendar"
import { CalibrationSchedule } from "@/components/calibration-schedule"
import { ToolInventory } from "@/components/tool-inventory"

export default function Home() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "calendar"
  
  return (
    <div>
      {tab === "calendar" && <Calendar />}
      {tab === "schedule" && <CalibrationSchedule />}
      {tab === "inventory" && <ToolInventory />}
    </div>
  )
}
