import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const listeners = []

let memoryToasts = []

function dispatch(action) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryToasts = [action.toast, ...memoryToasts].slice(0, TOAST_LIMIT)
      break
    case "UPDATE_TOAST":
      memoryToasts = memoryToasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )
      break
    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effect ! - This could be simplified.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        memoryToasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      memoryToasts = memoryToasts.map((t) =>
        t.id === toastId || toastId === undefined
          ? {
              ...t,
              open: false,
            }
          : t
      )
      break
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        memoryToasts = []
      } else {
        memoryToasts = memoryToasts.filter((t) => t.id !== action.toastId)
      }
      break
  }

  listeners.forEach((listener) => {
    listener(memoryToasts)
  })
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export function useToast() {
  const [toasts, setToasts] = React.useState(memoryToasts)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [toasts])

  return {
    toasts,
    toast: (props) => {
      const id = genId()

      const update = (props) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        })
      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss()
          },
        },
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export const toast = (props) => {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}
