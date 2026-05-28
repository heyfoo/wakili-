import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

const ToggleGroup = React.forwardRef(({ className = "", ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={`inline-flex items-center justify-center rounded-[0.185rem] px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm ${className}`}
    {...props}
  />
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
