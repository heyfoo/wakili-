import * as React from "react"

// Sonner is a toast library - this is a simple wrapper
const Sonner = ({ message, type = "default" }) => {
  return (
    <div className={`p-3 rounded-md ${type === "success" ? "bg-green-50 text-green-900" : type === "error" ? "bg-red-50 text-red-900" : "bg-muted text-foreground"}`}>
      {message}
    </div>
  )
}

export { Sonner }
