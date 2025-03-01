import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Define types for our data
interface CalibrationItem {
  name: string;
  serial: string;
  company: string;
  date?: string;
}

interface CalibrationData {
  [key: string]: CalibrationItem[];
}

interface BoschEquipment {
  index: number;
  div: string;
  equipment_name: string;
  serial_number: string;
  calibration__due: string;
  calibrator_company: string;
  [key: string]: any;
}

// Sample calibration data as fallback
const sampleCalibrationData: CalibrationData = {
  "2025-03-03": [
    { name: "Blade Micrometers", serial: "BM001", company: "Key Solutions" }
  ],
  "2025-03-07": [
    { name: "Digital Caliper", serial: "DC002", company: "OrchidCal" },
    { name: "Torque Wrench", serial: "TW003", company: "Key Solutions" },
    { name: "Pressure Gauge", serial: "PG004", company: "OrchidCal" }
  ],
  "2025-03-14": [
    { name: "Blade Micrometers", serial: "BM005", company: "Key Solutions" }
  ],
  "2025-03-18": [
    { name: "Dial Indicator", serial: "DI006", company: "Key Solutions" },
    { name: "Height Gauge", serial: "HG007", company: "OrchidCal" },
    { name: "Feeler Gauge", serial: "FG008", company: "Key Solutions" },
    { name: "Depth Micrometer", serial: "DM009", company: "OrchidCal" },
    { name: "Thread Gauge", serial: "TG010", company: "Key Solutions" }
  ],
  "2025-03-21": [
    { name: "Dial Comparator", serial: "DC011", company: "OrchidCal" }
  ]
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 2, 1)) // March 1, 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateItems, setSelectedDateItems] = useState<CalibrationItem[]>([])
  const [nextFiveDaysItems, setNextFiveDaysItems] = useState<CalibrationItem[]>([])
  const [calibrationData, setCalibrationData] = useState<CalibrationData>(sampleCalibrationData) // Use sample data initially
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    // Clear any existing notification
    setNotification(null);
    
    // Send POST request to the endpoint
    fetch(`http://127.0.0.1:5000/api/no1?date=${date}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Date selection response:', data);
      
      // Display notification based on response status
      if (data.status === 'success') {
        const equipmentCount = data.details?.equipment_count || 0;
        setNotification({
          message: `Date selected: ${date}. ${equipmentCount} equipment items due for calibration on this date.`,
          type: 'success'
        });
      } else if (data.status === 'partial_success') {
        setNotification({
          message: `Date selected: ${date}. Note: ${data.error || 'Some operations could not be completed.'}`,
          type: 'info'
        });
      } else {
        setNotification({
          message: data.message || `Date selected: ${date}`,
          type: 'info'
        });
      }
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    })
    .catch(error => {
      console.error('Error sending date selection:', error);
      setNotification({
        message: `Error selecting date: ${error.message}`,
        type: 'error'
      });
    });
  };
  
  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(parseInt(value))
    setCurrentDate(newDate)
  }

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(value))
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Fetch calibration data from backend using the same /api/no1 endpoint
  useEffect(() => {
    const fetchCalibrationData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch data from the backend using the /api/no1 endpoint with get_data=true
        try {
          const response = await fetch('http://127.0.0.1:5000/api/no1?get_data=true', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            if (data.data && Object.keys(data.data).length > 0) {
              setCalibrationData(data.data);
              console.log('Calibration data loaded from database:', Object.keys(data.data).length, 'dates');
            } else {
              console.warn('No calibration data found in database');
              setNotification({
                message: 'No calibration data found in the database. Using sample dataset.',
                type: 'info'
              });
              // Use sample data as fallback
              setCalibrationData(sampleCalibrationData);
            }
            setIsLoading(false);
          } else {
            throw new Error(data.message || 'Invalid data format received from API');
          }
        } catch (error) {
          const apiError = error as Error;
          console.error('API error:', apiError);
          setError(`Failed to load calibration data: ${apiError.message || 'Unknown error'}`);
          // Use sample data as fallback
          setCalibrationData(sampleCalibrationData);
          setIsLoading(false);
          
          // Show notification about the error
          setNotification({
            message: `Error loading calibration data: ${apiError.message || 'Unknown error'}. Using sample data instead.`,
            type: 'error'
          });
        }
      } catch (err) {
        console.error('Error in data processing:', err);
        setError(`Error processing data: ${err instanceof Error ? err.message : String(err)}`);
        // Use sample data as fallback
        setCalibrationData(sampleCalibrationData);
        setIsLoading(false);
      }
      
      // Auto-hide notification after 5 seconds if it exists
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };
    
    fetchCalibrationData();
  }, []);

  // Update selected date items and next five days items when selected date changes
  useEffect(() => {
    if (selectedDate) {
      // Set selected date items
      setSelectedDateItems(calibrationData[selectedDate] || []);
      
      // Calculate next five days items
      const nextFiveDays: CalibrationItem[] = [];
      const selectedDateObj = new Date(selectedDate);
      
      for (let i = 1; i <= 5; i++) {
        const nextDate = new Date(selectedDateObj);
        nextDate.setDate(selectedDateObj.getDate() + i);
        
        const nextDateStr = nextDate.toISOString().split('T')[0];
        const items = calibrationData[nextDateStr];
        
        if (items) {
          items.forEach((item: CalibrationItem) => {
            nextFiveDays.push({
              ...item,
              date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          });
        }
      }
      
      setNextFiveDaysItems(nextFiveDays);
    }
  }, [selectedDate, calibrationData]);

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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isEvent = calibrationData[dateStr] !== undefined
      const isToday = day === 7 // Assuming March 7 is "today" for this example
      const isSelected = selectedDate === dateStr
      
      // Check if date is within 5 days after the selected date
      let isWithinFiveDays = false
      if (selectedDate) {
        const selectedDay = new Date(selectedDate)
        const currentDay = new Date(dateStr)
        // Only highlight dates after the selected date (not before)
        if (currentDay > selectedDay) {
          const diffTime = currentDay.getTime() - selectedDay.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          isWithinFiveDays = diffDays <= 5
        }
      }

      days.push(
        <div 
          key={day} 
          className={`p-2 cursor-pointer transition-colors
            ${isEvent ? "bg-blue-100" : ""} 
            ${isToday ? "border-2 border-blue-500" : ""}
            ${isSelected ? "bg-blue-500 text-white" : ""}
            ${isWithinFiveDays ? "bg-blue-200" : ""}
            hover:bg-blue-100`}
          onClick={() => handleDateSelect(dateStr)}
        >
          <div className="font-bold">{day}</div>
          {isEvent && (
            <div className="text-xs mt-1">
              {calibrationData[dateStr].length} Calibration{calibrationData[dateStr].length > 1 ? 's' : ''}
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
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Calendar View</h2>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Select defaultValue={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue>{currentDate.getFullYear()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>{monthNames[currentDate.getMonth()]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground text-right">
            <div>7:10 PM IST</div>
            <div>Singapore Timezone</div>
          </div>
        </div>
      </div>

      {/* Notification area */}
      {notification && (
        <Alert className={`mb-4 transition-opacity duration-300 ${
          notification.type === 'success' ? 'bg-green-100 dark:bg-green-900' : 
          notification.type === 'error' ? 'bg-red-100 dark:bg-red-900' : 
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          <AlertTitle className={`${
            notification.type === 'success' ? 'text-green-800 dark:text-green-200' : 
            notification.type === 'error' ? 'text-red-800 dark:text-red-200' : 
            'text-blue-800 dark:text-blue-200'
          }`}>
            {notification.type === 'success' ? 'Success' : 
             notification.type === 'error' ? 'Error' : 
             'Information'}
          </AlertTitle>
          <AlertDescription className="text-gray-700 dark:text-gray-300">
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-7 gap-1 mb-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center font-semibold py-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">Loading calibration data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg">
          <div className="text-red-700">{error}</div>
          <div className="text-sm mt-2">Please try refreshing the page.</div>
        </div>
      ) : selectedDate ? (
        <div className="space-y-4">
          {/* Selected date section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            {selectedDateItems.length > 0 ? (
              <div className="space-y-2">
                {selectedDateItems.map((item, index) => (
                  <Alert key={`selected-${index}`} className="bg-gray-100 dark:bg-gray-700">
                    <AlertDescription>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm">Serial No. {item.serial}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{item.company}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert className="bg-gray-100 dark:bg-gray-700">
                <AlertDescription>No calibrations scheduled for this date.</AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Next 5 days section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">In the next 5 days</h3>
            {nextFiveDaysItems.length > 0 ? (
              <div className="space-y-2">
                {nextFiveDaysItems.map((item, index) => (
                  <Alert key={`next-${index}`} className="bg-gray-100 dark:bg-gray-700">
                    <AlertDescription>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm">Serial No. {item.serial}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">{item.company}</div>
                      <div className="text-xs text-gray-500 mt-1">Due: {item.date}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert className="bg-gray-100 dark:bg-gray-700">
                <AlertDescription>No calibrations scheduled in the next 5 days.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-2">Select a date to view calibration details</h3>
          <Alert className="bg-gray-100 dark:bg-gray-700">
            <AlertDescription>
              Click on a date in the calendar to view calibration details for that date and the next 5 days.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
