"use client"

import { useState } from "react"
import { Calendar } from "@/components/calendar"
import { CalibrationSchedule } from "@/components/calibration-schedule"
import { ToolPerformance } from "@/components/tool-performance"
import { ToolPerformanceDetail } from "@/components/tool-performance-detail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function Home() {
  const [view, setView] = useState<"calendar" | "schedule" | "performance" | "detail">("calendar")
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Bosch Tools</h1>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <Tabs defaultValue="calendar" className="w-full" onValueChange={(value) => setView(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="schedule">Calibration Schedule</TabsTrigger>
            <TabsTrigger value="performance">Tool Performance</TabsTrigger>
            <TabsTrigger value="detail">Tool Details</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Calendar />
          </TabsContent>

          <TabsContent value="schedule">
            <CalibrationSchedule />
          </TabsContent>

          <TabsContent value="performance">
            <ToolPerformance />
          </TabsContent>

          <TabsContent value="detail">
            <ToolPerformanceDetail />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

