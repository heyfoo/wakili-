import * as React from "react"
import { useToast as useToastOriginal } from "./use-toast"

export function useToast() {
  return useToastOriginal()
}

export const toast = (props) => {
  // We can't easily implement a functional global toast without a provider or event emitter
  // but we can at least return something that doesn't break.
  console.log("Toast:", props)
  return {
    id: Math.random().toString(),
    dismiss: () => {},
    update: () => {},
  }
}
