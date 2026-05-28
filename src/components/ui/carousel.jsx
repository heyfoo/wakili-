import * as React from "react"

const Carousel = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const [current, setCurrent] = React.useState(0)
  const items = React.Children.toArray(children)

  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} {...props}>
      <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items}
      </div>
      <button
        onClick={() => setCurrent((current - 1 + items.length) % items.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent((current + 1) % items.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 rounded-full"
      >
        ›
      </button>
    </div>
  )
})

Carousel.displayName = "Carousel"

const CarouselItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`min-w-full ${className}`} {...props} />
))

CarouselItem.displayName = "CarouselItem"

export { Carousel, CarouselItem }
