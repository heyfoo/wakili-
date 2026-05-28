import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const Calendar = React.forwardRef(({ className = "", ...props }, ref) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div ref={ref} className={`p-3 ${className}`} {...props}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-muted-foreground text-center py-2">
            {day.slice(0, 1)}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`text-center py-2 text-sm rounded-md hover:bg-accent ${!day ? 'opacity-0' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
})

Calendar.displayName = "Calendar"

export { Calendar }
