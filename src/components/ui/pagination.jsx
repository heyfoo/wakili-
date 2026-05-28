import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

const Pagination = ({ className = "", ...props }) => (
  <nav role="navigation" aria-label="pagination" className={`flex w-full justify-center ${className}`} {...props} />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <ul ref={ref} className={`flex flex-row items-center gap-1 ${className}`} {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ ...props }, ref) => (
  <li ref={ref} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef(({ className = "", isActive = false, size = "icon", ...props }, ref) => (
  <a
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-muted ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"} ${size === "sm" ? "h-8 px-3" : "h-9 px-4"} ${className}`}
    {...props}
  />
))
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef(({ className = "", ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={`gap-1 pl-2.5 ${className}`}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
))
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef(({ className = "", ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={`gap-1 pr-2.5 ${className}`}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
))
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className = "", ...props }) => (
  <span className={`flex h-9 w-9 items-center justify-center ${className}`} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
