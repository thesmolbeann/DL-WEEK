"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Moon, Sun, Calendar as CalendarIcon, PanelLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

// Button to reopen the sidebar when it's collapsed
function SidebarReopenButton() {
  const { state, toggleSidebar } = useSidebar()
  
  // Only show the button when the sidebar is collapsed
  if (state !== "collapsed") return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-7 w-7"
    >
      <PanelLeft />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  
  // Get the active tab from URL search params
  const activeTab = searchParams.get("tab") || "calendar"
  
  // Upcoming deadlines data (this would typically come from an API)
  const upcomingDeadlines = [
    { id: 1, tool: "Torque Wrench TQ-504", date: "Jan 14, 2025" },
    { id: 2, tool: "Drill Press DP-201", date: "Jan 21, 2025" },
    { id: 3, tool: "Caliper C-103", date: "Jan 28, 2025" }
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <h1 className="text-xl font-bold">Bosch Tools</h1>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "calendar" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => router.push("/?tab=calendar")}
                  data-active={activeTab === "calendar"}
                >
                  Calendar View
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "schedule" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => router.push("/?tab=schedule")}
                  data-active={activeTab === "schedule"}
                >
                  Calibration Schedule
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === "inventory" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => router.push("/?tab=inventory")}
                  data-active={activeTab === "inventory"}
                >
                  Tool Inventory
                </Button>
              </SidebarMenuItem>
              {/* Update Tool button removed */}
            </SidebarMenu>
            
            {/* Upcoming Deadlines Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="flex justify-between items-center text-sm font-bold text-red-600 dark:text-red-400">
                <span>UPCOMING DEADLINES</span>
                <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5 text-xs font-bold">
                  {upcomingDeadlines.length}
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 text-sm">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2">
                      <div className="font-medium text-red-700 dark:text-red-400">{deadline.tool}</div>
                      <div className="text-xs text-red-600 dark:text-red-300 font-semibold">{deadline.date}</div>
                    </div>
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Emergency Calibration Section */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="flex justify-between items-center text-sm font-bold text-amber-600 dark:text-amber-400">
                <span>EMERGENCY CALIBRATION</span>
                <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs font-bold">
                  2
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-2">
                    <div className="font-medium text-amber-700 dark:text-amber-400">Digital Caliper CL004-04</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Reported: Jan 2, 2025</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300">Severity: Major</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 mb-2">Calibration Place: Building C, Floor 1</div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="w-full text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300 py-1 rounded-sm"
                        >
                          Assign Worker
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Assign Worker</DialogTitle>
                          <DialogDescription>
                            Select a worker to handle the emergency calibration for Digital Caliper CL004-04
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="worker">Select Worker</Label>
                              <Select>
                                <SelectTrigger id="worker">
                                  <SelectValue placeholder="Select worker" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="HE">HE (Helen Evans)</SelectItem>
                                  <SelectItem value="FE">FE (Frank Edwards)</SelectItem>
                                  <SelectItem value="MA">MA (Michael Adams)</SelectItem>
                                  <SelectItem value="AP">AP (Alice Parker)</SelectItem>
                                  <SelectItem value="MY">MY (Mark Young)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Textarea id="notes" placeholder="Add any special instructions..." />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Confirm Assignment</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-2">
                    <div className="font-medium text-amber-700 dark:text-amber-400">Torque Wrench TQ-504</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Reported: Jan 1, 2025</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300">Severity: Medium</div>
                    <div className="text-xs text-amber-600 dark:text-amber-300 mb-2">Calibration Place: Building A, Floor 2</div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="w-full text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300 py-1 rounded-sm"
                        >
                          Assign Worker
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Assign Worker</DialogTitle>
                          <DialogDescription>
                            Select a worker to handle the emergency calibration for Torque Wrench TQ-504
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="worker2">Select Worker</Label>
                              <Select>
                                <SelectTrigger id="worker2">
                                  <SelectValue placeholder="Select worker" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="HE">HE (Helen Evans)</SelectItem>
                                  <SelectItem value="FE">FE (Frank Edwards)</SelectItem>
                                  <SelectItem value="MA">MA (Michael Adams)</SelectItem>
                                  <SelectItem value="AP">AP (Alice Parker)</SelectItem>
                                  <SelectItem value="MY">MY (Mark Young)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes2">Notes (Optional)</Label>
                              <Textarea id="notes2" placeholder="Add any special instructions..." />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Confirm Assignment</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="mx-auto"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="overflow-auto">
          <div className="flex justify-between items-center p-4">
            <SidebarReopenButton />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="container mx-auto p-4">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
