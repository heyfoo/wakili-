import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

const Toggle = React.forwardRef(({ className = "", variant = "default", size = "md", ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground ${size === "sm" ? "h-8 px-2" : "h-9 px-3"} ${className}`}
    {...props}
  />
))
Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
