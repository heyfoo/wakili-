import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

const Resizable = ResizablePrimitive.PanelGroup

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = React.forwardRef(({ withHandle = true, className = "", ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    ref={ref}
    className={`relative flex w-px select-none touch-none bg-border after:absolute after:left-1/2 after:top-1/2 after:h-8 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-border ${className}`}
    {...props}
  />
))
ResizableHandle.displayName = "ResizableHandle"

export { Resizable, ResizablePanel, ResizableHandle }
