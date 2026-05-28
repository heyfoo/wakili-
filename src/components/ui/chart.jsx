import * as React from "react"

const Chart = React.forwardRef(({ data, type = "bar", className = "", ...props }, ref) => {
  return (
    <div ref={ref} className={`w-full h-64 flex items-center justify-center bg-muted rounded-lg ${className}`} {...props}>
      <p className="text-muted-foreground text-sm">Chart component - integrate with recharts or chart.js</p>
    </div>
  )
})

Chart.displayName = "Chart"

export { Chart }
