"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Category {
  id: number
  name: string
}

interface ProductFilterProps {
  categories: Category[]
  activeFilter: number | null
  onFilterChange: (categoryId: number | null) => void
  disabled?: boolean
}

export function ProductFilter({ categories, activeFilter, onFilterChange, disabled = false }: ProductFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)

  // Verificar si el contenedor es desplazable
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current
      if (container) {
        const isScrollableNow = container.scrollWidth > container.clientWidth
        setIsScrollable(isScrollableNow)
        setShowRightArrow(isScrollableNow)
      }
    }

    checkScrollable()
    window.addEventListener("resize", checkScrollable)
    return () => window.removeEventListener("resize", checkScrollable)
  }, [categories])

  // Manejar el desplazamiento
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Desplazar a la izquierda
  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  // Desplazar a la derecha
  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center mb-2 text-sm font-medium text-foreground/90">
        <Filter className="h-4 w-4 mr-1.5" />
        Filtrar por categoría
      </div>

      <div className="relative flex items-center">
        {showLeftArrow && isScrollable && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/40"
            onClick={scrollLeft}
            disabled={disabled}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Desplazar a la izquierda</span>
          </Button>
        )}

        <ScrollArea className="w-full">
          <div
            className="flex gap-2 pb-1 px-1 overflow-x-auto scrollbar-hide"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(null)}
              disabled={disabled}
              className={cn(
                "rounded-full px-4 text-xs font-medium whitespace-nowrap transition-all",
                activeFilter === null
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-border/60 hover:bg-background/80 hover:text-foreground/90",
              )}
            >
              Todos los productos
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeFilter === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(category.id)}
                disabled={disabled}
                className={cn(
                  "rounded-full px-4 text-xs font-medium whitespace-nowrap transition-all",
                  activeFilter === category.id
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-border/60 hover:bg-background/80 hover:text-foreground/90",
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>

        {showRightArrow && isScrollable && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/40"
            onClick={scrollRight}
            disabled={disabled}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Desplazar a la derecha</span>
          </Button>
        )}
      </div>
    </div>
  )
}
