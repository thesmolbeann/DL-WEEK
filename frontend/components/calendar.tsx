import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 2, 1)) // March 1, 2025

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)

    const days = []

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${daysInPrevMonth - i}`} className="text-gray-400 p-2">
          {daysInPrevMonth - i}
        </div>,
      )
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isEvent = [3, 7, 14, 18, 21].includes(day)
      const isToday = day === 7 // Assuming March 7 is "today" for this example

      days.push(
        <div key={day} className={`p-2 ${isEvent ? "bg-blue-100" : ""} ${isToday ? "border-2 border-blue-500" : ""}`}>
          <div className="font-bold">{day}</div>
          {isEvent && (
            <div className="text-xs mt-1">
              {day === 3 && <div>Blade Micrometers</div>}
              {day === 7 && <div>3 Calibrations</div>}
              {day === 14 && <div>Blade Micrometers</div>}
              {day === 18 && <div>5 Calibrations</div>}
              {day === 21 && <div>Dial Comparator</div>}
            </div>
          )}
        </div>,
      )
    }

    // Next month's days
    const totalDays = days.length
    for (let i = 1; totalDays + i <= 42; i++) {
      days.push(
        <div key={`next-${i}`} className="text-gray-400 p-2">
          {i}
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#202020]">Bosch Tools</h2>
          <div className="text-sm text-[#5f5f5f]">Dashboard</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{monthNames[currentDate.getMonth()]}</div>
          <div className="text-sm text-[#5f5f5f]">7:10 PM IST</div>
          <div className="text-sm text-[#5f5f5f]">Singapore Timezone</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center font-semibold py-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TriangleAlert className="h-5 w-5 text-[#ba1717]" />
          <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        </div>
        <div className="bg-blue-100 p-3 rounded-md">
          <div className="font-semibold">Tuesday, 3 March 2025</div>
          <div>Upcoming Event</div>
          <div className="font-semibold mt-2">7 MAR (3 Calibrations)</div>
          <div>Due Today</div>
        </div>
      </div>

      <Button className="w-full mb-4">View Calibration Schedule</Button>

      <div>
        <h3 className="text-lg font-semibold mb-2">In the next 5 days</h3>
        <div className="space-y-2">
          {[
            { name: "Dial Push Pull Gauge", serial: "126881", company: "Key Solutions" },
            { name: "Dial Test Indicators", serial: "22050743", company: "Key Solutions" },
            { name: "Dial Test Indicator", serial: "91030861", company: "OrchidCal" },
            { name: "Dial Test Indicator", serial: "DAS567", company: "Key Solutions" },
            { name: "Dial Test Indicator", serial: "FGS562", company: "Key Solutions" },
          ].map((item, index) => (
            <Alert key={index} className="bg-gray-100">
              <AlertDescription>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm">Serial No. {item.serial}</div>
                <div className="text-sm text-blue-600">{item.company}</div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  )
}

