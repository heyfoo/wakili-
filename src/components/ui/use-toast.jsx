const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export function useToast() {
  const [toasts, setToasts] = React.useState([])

  const addToast = (toast) => {
    const id = genId()
    const newToast = { ...toast, id }
    setToasts((state) => [newToast, ...state].slice(0, TOAST_LIMIT)])
    return {
      id: id,
      dismiss: () => removeToast(id),
      update: (props) => updateToast(id, props),
    }
  }

  const updateToast = (toastId, props) => {
    setToasts((state) =>
      state.map((toast) =>
        toast.id === toastId ? { ...toast, ...props } : toast
      )
    )
  }

  const removeToast = (toastId) => {
    setToasts((state) => state.filter((toast) => toast.id !== toastId))
  }

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  }
}

import * as React from "react"
