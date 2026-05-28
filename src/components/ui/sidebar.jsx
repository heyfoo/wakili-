import * as React from "react"

const Sidebar = React.forwardRef(({ className = "", ...props }, ref) => (
  <aside
    ref={ref}
    className={`flex flex-col h-full w-64 border-r bg-muted/50 ${className}`}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`border-b px-4 py-3 ${className}`} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`flex-1 overflow-y-auto px-2 py-4 ${className}`} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`border-t px-4 py-3 ${className}`} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter }
