"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Moon, Sun, Calendar as CalendarIcon, PanelLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { useMalfunctions } from "@/contexts/MalfunctionContext"
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

// Delete button for malfunction reports
function DeleteMalfunctionButton({ malfunctionId }: { malfunctionId: string }) {
  const { deleteMalfunction } = useMalfunctions()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    
    if (confirm("Are you sure you want to delete this malfunction report?")) {
      setIsDeleting(true)
      try {
        await deleteMalfunction(malfunctionId)
      } catch (error) {
        console.error("Error deleting malfunction:", error)
        alert("Failed to delete malfunction report")
      } finally {
        setIsDeleting(false)
      }
    }
  }
  
  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 rounded px-1.5 py-0.5"
    >
      {isDeleting ? "..." : "Delete"}
    </button>
  )
}

// Define types for emergency calibration items
interface EmergencyCalibrationItem {
  id: string;
  toolId: string;
  toolName: string;
  serialNumber: string;
  severity: string;
  description: string;
  reportedAt: string;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  
  // Get the active tab from URL search params
  const activeTab = searchParams.get("tab") || "calendar"
  
  // Define the type for deadline items
  interface DeadlineItem {
    id: number;
    tool: string;
    date: string;
    serial?: string;
    company?: string;
  }
  
  // Get malfunctions from context
  const { malfunctions } = useMalfunctions();
  const [isViewAllEmergenciesOpen, setIsViewAllEmergenciesOpen] = useState(false);
  
  // Generate upcoming deadlines based on current date
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Function to fetch calibration data from the API
    const fetchCalibrationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from the backend API
        const response = await fetch('/api/no1?get_data=true');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success' || !result.data) {
          throw new Error('Failed to fetch calibration data');
        }
        
        // Process the calibration data
        const calibrationData = result.data;
        const currentDate = new Date();
        const deadlines: DeadlineItem[] = [];
        let idCounter = 1;
        
        // Convert the data into our deadline format
        Object.entries(calibrationData).forEach(([dateStr, items]) => {
          const dueDate = new Date(dateStr);
          
          // Calculate days difference between current date and due date
          const daysDifference = Math.floor((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Only include upcoming deadlines within the next 14 days
          if (daysDifference >= 0 && daysDifference <= 13) {
            // @ts-ignore - We know items is an array based on the API response structure
            items.forEach((item: any) => {
              deadlines.push({
                id: idCounter++,
                tool: item.name,
                date: dueDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }),
                serial: item.serial,
                company: item.company
              });
            });
          }
        });
        
        // Sort by closest deadline first
        const sortedDeadlines = deadlines.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Store all deadlines within the 14-day window
        setUpcomingDeadlines(sortedDeadlines);
        
      } catch (error) {
        console.error('Error fetching calibration data:', error);
        // Don't set any fallback deadlines, just show the error state
        setUpcomingDeadlines([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call the function to fetch data
    fetchCalibrationData();
    
    // Set up an interval to refresh the data every hour
    const intervalId = setInterval(fetchCalibrationData, 60 * 60 * 1000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

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
            {/* Hell */}
            {/* lol */}
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
                  {isLoading ? (
                    <div className="p-2 text-center text-red-600 dark:text-red-400">
                      Loading deadlines...
                    </div>
                  ) : upcomingDeadlines.length > 0 ? (
                    <>
                      {upcomingDeadlines.slice(0, 3).map((deadline) => (
                        <div key={deadline.id} className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2">
                          <div className="font-medium text-red-700 dark:text-red-400">{deadline.tool}</div>
                          <div className="text-xs text-red-600 dark:text-red-300 font-semibold">{deadline.date}</div>
                          {deadline.serial && (
                            <div className="text-xs text-red-600 dark:text-red-300">S/N: {deadline.serial}</div>
                          )}
                          {deadline.company && (
                            <div className="text-xs text-red-600 dark:text-red-300">Calibrator: {deadline.company}</div>
                          )}
                        </div>
                      ))}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="w-full mt-2 text-xs flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 py-1 rounded-sm">
                            View More <span className="ml-1">↓</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>All Upcoming Deadlines</DialogTitle>
                            <DialogDescription>
                              All calibration deadlines in the next 14 days
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                              {upcomingDeadlines.map((deadline) => (
                                <div key={deadline.id} className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2">
                                  <div className="font-medium text-red-700 dark:text-red-400">{deadline.tool}</div>
                                  <div className="text-xs text-red-600 dark:text-red-300 font-semibold">{deadline.date}</div>
                                  {deadline.serial && (
                                    <div className="text-xs text-red-600 dark:text-red-300">S/N: {deadline.serial}</div>
                                  )}
                                  {deadline.company && (
                                    <div className="text-xs text-red-600 dark:text-red-300">Calibrator: {deadline.company}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <div className="p-2 text-center text-red-600 dark:text-red-400">
                      No upcoming deadlines
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Emergency Calibration Section */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="flex justify-between items-center text-sm font-bold text-amber-600 dark:text-amber-400">
                <span>EMERGENCY CALIBRATION</span>
                <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs font-bold">
                  {malfunctions.filter(item => item.severity === "Mild" || item.severity === "Medium" || item.severity === "Major").length}
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 text-sm">
                  {malfunctions.filter(item => item.severity === "Mild" || item.severity === "Medium" || item.severity === "Major").length > 0 ? (
                    <>
                      {malfunctions
                        .filter(item => item.severity === "Mild" || item.severity === "Medium" || item.severity === "Major")
                        .slice(0, 3)
                        .map(item => (
                          <div key={item.id} className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-2">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-amber-700 dark:text-amber-400">{item.toolName}</div>
                              <DeleteMalfunctionButton malfunctionId={item.id} />
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold">
                              Reported: {item.reportedAt}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-300">S/N: {item.serialNumber}</div>
                            <div className="text-xs text-amber-600 dark:text-amber-300">Severity: {item.severity}</div>
                          </div>
                        ))
                      }
                    </>
                  ) : (
                    <div className="p-2 text-center text-amber-600 dark:text-amber-400">
                      No emergency calibrations required
                    </div>
                  )}
                  
                  {/* View More button for emergency calibrations */}
                  <Dialog open={isViewAllEmergenciesOpen} onOpenChange={setIsViewAllEmergenciesOpen}>
                    <DialogTrigger asChild>
                      <button className="w-full mt-2 text-xs flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:text-amber-400 py-1 rounded-sm">
                        View More <span className="ml-1">↓</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>All Emergency Calibrations</DialogTitle>
                        <DialogDescription>
                          All tools requiring emergency calibration due to reported malfunctions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                          {malfunctions.filter(item => item.severity === "Mild" || item.severity === "Medium" || item.severity === "Major").length > 0 ? (
                            malfunctions
                              .filter(item => item.severity === "Mild" || item.severity === "Medium" || item.severity === "Major")
                              .map(item => (
                                <div key={item.id} className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-2">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium text-amber-700 dark:text-amber-400">{item.toolName}</div>
                                    <DeleteMalfunctionButton malfunctionId={item.id} />
                                  </div>
                                  <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold">
                                    Reported: {item.reportedAt}
                                  </div>
                                  <div className="text-xs text-amber-600 dark:text-amber-300">S/N: {item.serialNumber}</div>
                                  <div className="text-xs text-amber-600 dark:text-amber-300">Severity: {item.severity}</div>
                                  <div className="text-xs text-amber-600 dark:text-amber-300 mt-1">{item.description}</div>
                                </div>
                              ))
                          ) : (
                            <div className="p-2 text-center text-amber-600 dark:text-amber-400">
                              No emergency calibrations required
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
