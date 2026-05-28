import * as React from "react"

const Breadcrumb = React.forwardRef(({ ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props} />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef(({ className = "", ...props }, ref) => (
  <ol
    ref={ref}
    className={`flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5 ${className}`}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <li ref={ref} className={`inline-flex items-center gap-1.5 ${className}`} {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(({ className = "", ...props }, ref) => (
  <a
    ref={ref}
    className={`transition-colors hover:text-foreground ${className}`}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef(({ className = "", ...props }, ref) => (
  <span
    ref={ref}
    role="doc-pagebreak"
    aria-current="page"
    aria-disabled="true"
    className={`font-normal text-foreground ${className}`}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({ children, className = "", ...props }) => (
  <li role="presentation" aria-hidden="true" className={`flex items-center [&>svg]:h-3.5 [&>svg]:w-3.5 ${className}`} {...props}>
    {children ?? "/"}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
