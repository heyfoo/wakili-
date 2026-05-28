import * as React from "react"

const InputOtp = React.forwardRef(({ className = "", maxLength = 6, ...props }, ref) => {
  const [values, setValues] = React.useState(Array(maxLength).fill(''))

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)
  }

  return (
    <div ref={ref} className={`flex gap-2 ${className}`} {...props}>
      {Array(maxLength).fill(0).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength="1"
          inputMode="numeric"
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          className="w-10 h-10 border border-input rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ))}
    </div>
  )
})

InputOtp.displayName = "InputOtp"

export { InputOtp }
