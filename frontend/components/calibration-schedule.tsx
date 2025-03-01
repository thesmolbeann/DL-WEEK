"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CalibrationSchedule() {
  const [viewType, setViewType] = useState<"percentage" | "monthly">("percentage")

  // Sample data for the chart
  const chartData = [
    { label: "HE", value: viewType === "percentage" ? 75 : 35 },
    { label: "FE", value: viewType === "percentage" ? 90 : 42 },
    { label: "MA", value: viewType === "percentage" ? 80 : 38 },
    { label: "AP", value: viewType === "percentage" ? 65 : 30 },
    { label: "MY", value: viewType === "percentage" ? 55 : 25 },
  ]

  // Find the maximum value for scaling
  const maxValue = Math.max(...chartData.map((item) => item.value))

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#202020]">Bosch Tools</h2>
          <div className="text-sm text-[#5f5f5f]">Calibration Schedule</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Calibration Schedule</h2>

      <div className="h-64 flex items-end justify-between mb-6">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-12 rounded-t-md"
              style={{
                height: `${(item.value / maxValue) * 200}px`,
                backgroundColor: getBarColor(index),
              }}
            ></div>
            <div className="mt-2 text-sm font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          className={`rounded-full px-6 ${viewType === "percentage" ? "bg-[#f5f6f7]" : ""}`}
          onClick={() => setViewType("percentage")}
        >
          Percentage
        </Button>
        <Button
          variant="outline"
          className={`rounded-full px-6 ${viewType === "monthly" ? "bg-[#f5f6f7]" : ""}`}
          onClick={() => setViewType("monthly")}
        >
          Monthly
        </Button>
      </div>
    </div>
  )
}

function getBarColor(index: number): string {
  const colors = ["#7a85e4", "#f67de6", "#79f26b", "#f6363a", "#f6aa36"]
  return colors[index % colors.length]
}

