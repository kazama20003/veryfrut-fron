"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProductSearchProps {
  onSearch: (query: string) => void
  disabled?: boolean
}

export function ProductSearch({ onSearch, disabled = false }: ProductSearchProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Memoizar clearSearch para evitar recreaciones
  const clearSearch = useCallback(() => {
    setSearchValue("")
    onSearch("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [onSearch])

  // Manejar cambios en el input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch(value)
  }

  // Manejar tecla Escape para limpiar la búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchValue) {
        clearSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchValue, clearSearch]) // Añadida la dependencia clearSearch

  return (
    <div className="relative w-full max-w-md">
      <div
        className={`
        relative flex items-center transition-all duration-200 rounded-full
        ${isFocused ? "ring-2 ring-green-500/20" : ""}
      `}
      >
        <Search
          className={`
            absolute left-3 h-4 w-4 transition-colors duration-200
            ${searchValue || isFocused ? "text-green-600" : "text-muted-foreground"}
          `}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Buscar productos..."
          className="pl-9 pr-9 h-10 rounded-full border-border/60 focus-visible:ring-green-500/20 focus-visible:ring-offset-0 focus-visible:border-green-500/80"
          value={searchValue}
          onChange={handleSearch}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>
      {searchValue && (
        <div className="absolute right-3 -bottom-5 text-xs text-muted-foreground">Presiona ESC para limpiar</div>
      )}
    </div>
  )
}
