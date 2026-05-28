import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"

const Toast = ToastPrimitives.Root

const ToastAction = ToastPrimitives.Action

const ToastClose = ToastPrimitives.Close

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className = "", ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] ${className}`}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const ToastTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={`text-sm font-semibold ${className}`} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
}
