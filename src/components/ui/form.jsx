import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { createContext, useContext } from "react"

const Form = ({ ...props }) => <form {...props} />

const FormFieldContext = createContext(undefined)

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      {props.children}
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }
  return fieldContext
}

const FormItemContext = createContext(undefined)

const FormItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <FormItemContext.Provider value={{ id: React.useId() }}>
    <div ref={ref} className={`space-y-2 ${className}`} {...props} />
  </FormItemContext.Provider>
))
FormItem.displayName = "FormItem"

const useFormItem = () => {
  const itemContext = useContext(FormItemContext)
  if (!itemContext) {
    throw new Error("useFormItem should be used within <FormItem>")
  }
  return itemContext
}

const FormLabel = React.forwardRef(({ className = "", ...props }, ref) => {
  const { id } = useFormItem()
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={id}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { id } = useFormItem()
  return (
    <Slot
      ref={ref}
      id={id}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm font-medium text-destructive ${className}`}
    {...props}
  />
))
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
}
