import * as React from "react"
import { ChevronUp } from "lucide-react"

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = React.useState(false)

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  React.useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  ) : null
}

export { ScrollToTop }
