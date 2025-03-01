"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Moon, Sun, Calendar as CalendarIcon, PanelLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
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
                  className="w-full justify-start"
                  onClick={() => router.push("/?tab=calendar")}
                  data-active={activeTab === "calendar"}
                >
                  Calendar View
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/?tab=schedule")}
                  data-active={activeTab === "schedule"}
                >
                  Calibration Schedule
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/?tab=performance")}
                  data-active={activeTab === "performance"}
                >
                  Tool Performance
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/?tab=detail")}
                  data-active={activeTab === "detail"}
                >
                  Tool Details
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
            
            {/* Upcoming Deadlines Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel>Upcoming Deadlines</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 text-sm">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="rounded-md bg-sidebar-accent p-2">
                      <div className="font-medium">{deadline.tool}</div>
                      <div className="text-xs text-muted-foreground">{deadline.date}</div>
                    </div>
                  ))}
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
