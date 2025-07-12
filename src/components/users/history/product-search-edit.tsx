"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { api } from "@/lib/axiosInstance"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UnitMeasurement {
  id: number
  name: string
  description: string
}

interface ProductUnit {
  id: number
  productId: number
  unitMeasurementId: number
  unitMeasurement: UnitMeasurement
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  categoryId: number
  createdAt: string
  updatedAt: string
  productUnits: ProductUnit[]
}

interface ProductSearchEditProps {
  onAddProduct: (product: Product, selectedUnitId: number) => void
  disabled?: boolean
}

export function ProductSearchEdit({ onAddProduct, disabled = false }: ProductSearchEditProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedUnits, setSelectedUnits] = useState<Record<number, number>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/products")
        setProducts(response.data)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast.error("Error al cargar productos", {
          description: "No se pudieron cargar los productos para añadir al pedido.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredProducts([])
      return
    }

    const searchTerms = searchValue.toLowerCase().split(" ")
    const filtered = products.filter((product) => {
      const productText = `${product.name} ${product.description}`.toLowerCase()
      return searchTerms.every((term) => productText.includes(term))
    })

    setFilteredProducts(filtered.slice(0, 5)) // Limitar a 5 resultados para mejor rendimiento
  }, [searchValue, products])

  // Inicializar unidades seleccionadas para cada producto
  useEffect(() => {
    const initialUnits: Record<number, number> = {}
    filteredProducts.forEach((product) => {
      if (product.productUnits && product.productUnits.length > 0) {
        initialUnits[product.id] = product.productUnits[0].unitMeasurement.id
      }
    })
    setSelectedUnits(initialUnits)
  }, [filteredProducts])

  // Manejar cambios en el input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
  }

  // Manejar selección de unidad
  const handleUnitChange = (productId: number, unitId: number) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [productId]: unitId,
    }))
  }

  // Manejar adición de producto
  const handleAddProduct = (product: Product) => {
    const selectedUnitId = selectedUnits[product.id]
    if (!selectedUnitId) {
      toast.error("Selecciona una unidad", {
        description: "Debes seleccionar una unidad para añadir este producto.",
      })
      return
    }

    onAddProduct(product, selectedUnitId)
    toast.success("Producto añadido", {
      description: `${product.name} ha sido añadido al pedido.`,
    })
  }

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchValue("")
    setFilteredProducts([])
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Añadir más productos al pedido</h3>
      <div className="relative">
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
            placeholder="Buscar productos para añadir..."
            className="pl-9 pr-9 h-10 rounded-full border-border/60 focus-visible:ring-green-500/20 focus-visible:ring-offset-0 focus-visible:border-green-500/80"
            value={searchValue}
            onChange={handleSearch}
            disabled={disabled || isLoading}
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
              disabled={disabled || isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar búsqueda</span>
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando productos...</span>
          </div>
        )}

        {!isLoading && searchValue && filteredProducts.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="max-h-80">
                <ul className="divide-y">
                  {filteredProducts.map((product) => (
                    <li key={product.id} className="p-3 hover:bg-muted/50">
                      <div className="flex items-start gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>

                          <div className="mt-2 flex items-center justify-between">
                            <Select
                              value={selectedUnits[product.id]?.toString() || ""}
                              onValueChange={(value) => handleUnitChange(product.id, Number(value))}
                              disabled={disabled}
                            >
                              <SelectTrigger className="h-7 text-xs w-32 bg-background border-border/60">
                                <SelectValue placeholder="Seleccionar unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {product.productUnits?.map((pu) => (
                                  <SelectItem key={pu.id} value={pu.unitMeasurement.id.toString()}>
                                    {pu.unitMeasurement.name}
                                  </SelectItem>
                                )) || <SelectItem value="1">Unidad</SelectItem>}
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              className="h-7 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAddProduct(product)}
                              disabled={disabled || !selectedUnits[product.id]}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Añadir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {!isLoading && searchValue && filteredProducts.length === 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No se encontraron productos con {searchValue}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
