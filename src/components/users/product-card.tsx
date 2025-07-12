"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ShoppingCart, Star, Tag, Clock, Award, Plus, Minus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

// Interfaz base del producto (sin propiedades del carrito)
interface BaseProduct {
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
  rating?: number
}

// Interfaz extendida para productos en el carrito
interface CartProduct extends BaseProduct {
  quantity: number
  selectedUnitId: number
  cartItemId?: string
}

interface ProductCardProps {
  product: BaseProduct
  isNew?: boolean
  isFeatured?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  // Funciones del carrito que reciben BaseProduct
  onAddToCart?: (product: CartProduct, selectedUnitId: number) => void
  onAddToCartAsDuplicate?: (product: CartProduct, selectedUnitId: number) => void
  onUpdateCartItemQuantity?: (productId: number, selectedUnitId: number, quantity: number, cartItemId?: string) => void
}

// Constantes para mejor mantenimiento - Actualizado a 2 decimales
const QUANTITY_LIMITS = {
  MIN: 0.01,
  MAX: 999.99,
  STEP: 0.01,
  DECIMALS: 2,
} as const

const QUANTITY_PRESETS = [0.01, 0.1, 0.5, 1, 5, 10] as const

// Componente para mostrar estrellas de valoración
const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const safeRating = Math.min(5, Math.max(0, rating))
  const sizeClasses = size === "md" ? "h-4 w-4 mr-1" : "h-3 w-3 mr-0.5"

  return (
    <div className="flex items-center" role="img" aria-label={`${safeRating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            sizeClasses,
            index < safeRating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// Hook personalizado para manejo de cantidad - Actualizado a 2 decimales
const useQuantityManager = (initialQuantity = 1) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity)
  const [quantityInput, setQuantityInput] = useState<string>(initialQuantity.toString())

  const formatQuantity = useCallback((qty: number): string => {
    if (qty % 1 === 0) {
      return qty.toFixed(0)
    }
    return Number.parseFloat(qty.toFixed(QUANTITY_LIMITS.DECIMALS)).toString().replace(".", ",")
  }, [])

  const updateQuantity = useCallback(
    (newQuantity: number) => {
      if (newQuantity >= QUANTITY_LIMITS.MIN && newQuantity <= QUANTITY_LIMITS.MAX) {
        const roundedQuantity = Math.round(newQuantity * 100) / 100
        setQuantity(roundedQuantity)
        setQuantityInput(formatQuantity(roundedQuantity))
        return true
      }
      return false
    },
    [formatQuantity],
  )

  const handleInputChange = useCallback((value: string) => {
    const normalizedValue = value.replace(",", ".")
    const regex = /^\d*\.?\d{0,2}$/

    if (regex.test(normalizedValue) || value === "") {
      setQuantityInput(value)

      if (value !== "") {
        const numValue = Number.parseFloat(normalizedValue)
        if (!isNaN(numValue) && numValue > 0) {
          const roundedValue = Math.round(numValue * 100) / 100
          setQuantity(roundedValue)
        }
      }
    }
  }, [])

  const handleInputBlur = useCallback(() => {
    const normalizedValue = quantityInput.replace(",", ".")
    const numValue = Number.parseFloat(normalizedValue)

    if (!isNaN(numValue) && numValue > 0) {
      updateQuantity(numValue)
    } else {
      setQuantityInput(formatQuantity(quantity))
    }
  }, [quantityInput, quantity, updateQuantity, formatQuantity])

  const increment = useCallback(() => {
    updateQuantity(quantity + QUANTITY_LIMITS.STEP)
  }, [quantity, updateQuantity])

  const decrement = useCallback(() => {
    if (quantity > QUANTITY_LIMITS.MIN) {
      updateQuantity(quantity - QUANTITY_LIMITS.STEP)
    }
  }, [quantity, updateQuantity])

  return {
    quantity,
    quantityInput,
    formatQuantity,
    updateQuantity,
    handleInputChange,
    handleInputBlur,
    increment,
    decrement,
  }
}

// Hook para detección de dispositivo móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640)

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}

// Componente del modal de cantidad para móvil
const MobileQuantityModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  quantityInput,
  unitName,
  onQuantityChange,
  onInputChange,
  onInputBlur,
  onIncrement,
  onDecrement,
  disabled,
}: {
  isOpen: boolean
  onClose: () => void
  product: BaseProduct
  quantity: number
  quantityInput: string
  unitName: string
  onQuantityChange: (qty: number) => void
  onInputChange: (value: string) => void
  onInputBlur: () => void
  onIncrement: () => void
  onDecrement: () => void
  disabled: boolean
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quantity-modal-title"
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="quantity-modal-title" className="text-lg font-semibold">
            Editar cantidad
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Cerrar modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 text-center line-clamp-2">
          {product.name} • {unitName}
        </p>

        <div className="flex items-center justify-center mb-6">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onDecrement}
            disabled={disabled || quantity <= QUANTITY_LIMITS.MIN}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-5 w-5" />
          </Button>

          <div className="mx-4 w-28">
            <Input
              type="text"
              value={quantityInput}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={onInputBlur}
              className="h-14 text-center text-xl font-semibold border-2"
              autoFocus
              disabled={disabled}
              inputMode="decimal"
              aria-label="Cantidad"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onIncrement}
            disabled={disabled}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {QUANTITY_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              className="text-sm font-medium"
              onClick={() => onQuantityChange(preset)}
              disabled={disabled}
            >
              {preset % 1 === 0 ? preset.toString() : preset.toString().replace(".", ",")}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => {
              onInputBlur()
              onClose()
            }}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProductCard({
  product,
  isNew = false,
  isFeatured = false,
  disabled = false,
  loading = false,
  className,
  onAddToCart,
  onAddToCartAsDuplicate,
  onUpdateCartItemQuantity,
}: ProductCardProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(
    product.productUnits.length > 0 ? product.productUnits[0].unitMeasurement.id : 0,
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)

  const isMobile = useIsMobile()
  const {
    quantity,
    quantityInput,
    formatQuantity,
    updateQuantity,
    handleInputChange,
    handleInputBlur,
    increment,
    decrement,
  } = useQuantityManager(1)

  // Memoizar valores calculados
  const productRating = useMemo(() => product.rating || 5.0, [product.rating])

  const selectedUnitName = useMemo(() => {
    const selectedUnit = product.productUnits.find((pu) => pu.unitMeasurement.id === selectedUnitId)
    return selectedUnit?.unitMeasurement.name || "Unidad"
  }, [product.productUnits, selectedUnitId])

  const isOutOfStock = useMemo(() => product.stock <= 0, [product.stock])
  const isAddToCartDisabled = useMemo(
    () => disabled || loading || product.productUnits.length === 0 || quantity <= 0 || isOutOfStock,
    [disabled, loading, product.productUnits.length, quantity, isOutOfStock],
  )

  // Determinar si un producto es nuevo (menos de 7 días)
  const isNewProduct = useCallback((createdAt: string) => {
    const productDate = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - productDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }, [])

  // Determinar si un producto es destacado
  const isFeaturedProduct = useCallback((id: number) => {
    return id % 5 === 0
  }, [])

  // Función para convertir BaseProduct a CartProduct
  const createCartProduct = useCallback(
    (baseProduct: BaseProduct, selectedUnitId: number, quantity: number): CartProduct => {
      return {
        ...baseProduct,
        quantity,
        selectedUnitId,
      }
    },
    [],
  )

  // Callbacks memoizados
  const handleAddToCart = useCallback(
    (product: BaseProduct, selectedUnitId: number, quantity: number, allowDuplicate = false) => {
      if (!onAddToCart || !onAddToCartAsDuplicate) return

      const cartProduct = createCartProduct(product, selectedUnitId, quantity)

      if (allowDuplicate) {
        // Para duplicados, agregar directamente con la cantidad especificada
        onAddToCartAsDuplicate(cartProduct, selectedUnitId)
      } else {
        // Para items normales, agregar y luego actualizar cantidad si es necesario
        onAddToCart(cartProduct, selectedUnitId)
        if (quantity !== 1 && onUpdateCartItemQuantity) {
          // Pequeño delay para asegurar que el item se agregó primero
          setTimeout(() => {
            onUpdateCartItemQuantity(product.id, selectedUnitId, quantity)
          }, 50)
        }
      }

      const selectedUnit = product.productUnits.find((pu) => pu.unitMeasurement.id === selectedUnitId)
      const unitName = selectedUnit?.unitMeasurement.name || ""

      toast.success("Producto agregado", {
        description: `${formatQuantity(quantity)} ${product.name} (${unitName}) agregado al carrito${allowDuplicate ? " como elemento separado" : ""}.`,
      })
    },
    [onAddToCart, onAddToCartAsDuplicate, onUpdateCartItemQuantity, formatQuantity, createCartProduct],
  )

  const showMobileQuantityEditor = useCallback(() => {
    if (isMobile && !disabled) {
      setIsEditingQuantity(true)
    }
  }, [isMobile, disabled])

  const closeMobileEditor = useCallback(() => {
    setIsEditingQuantity(false)
  }, [])

  // Usar isNew y isFeatured props si se proporcionan, de lo contrario calcularlos
  const showAsNew = isNew || isNewProduct(product.createdAt)
  const showAsFeatured = isFeatured || isFeaturedProduct(product.id)

  return (
    <>
      <Card
        className={cn(
          // Estructura base optimizada para móvil
          "overflow-hidden border border-border/40 transition-all duration-200 flex flex-col bg-white",
          // Altura automática que se adapta al contenido
          "min-h-[380px]",
          // Efectos hover solo en desktop
          !isMobile && isHovered && !disabled ? "shadow-lg border-border/80" : "shadow-sm",
          disabled && "opacity-60 cursor-not-allowed",
          loading && "animate-pulse",
          className,
        )}
        onMouseEnter={() => !disabled && !isMobile && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagen del producto - Proporción fija */}
        <div className="relative w-full aspect-square bg-gray-50">
          <Image
            src={product.imageUrl || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              !isMobile && isHovered && !disabled ? "scale-105" : "",
            )}
            width={300}
            height={300}
            loading="lazy"
          />

          {loading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Badges superiores */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showAsNew && (
              <Badge className="bg-blue-600 text-white font-medium text-xs px-2 py-1 flex items-center shadow-sm">
                <Clock className="h-3 w-3 mr-1" />
                NUEVO
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-red-600 text-white font-medium text-xs px-2 py-1 shadow-sm">SIN STOCK</Badge>
            )}
          </div>

          {showAsFeatured && (
            <Badge className="absolute right-2 top-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium text-xs px-2 py-1 flex items-center shadow-sm">
              <Award className="h-3 w-3 mr-1" />
              PREMIUM
            </Badge>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <CardContent className="p-3 flex-1 flex flex-col">
          {/* Título del producto */}
          <div className="mb-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-2">
            <StarRating rating={productRating} />
            <span className="text-xs text-green-600 font-medium">{productRating.toFixed(1)} • Excelente</span>
          </div>

          {/* Descripción */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

          {/* Badge de selección especial */}
          {showAsFeatured && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200">
                👑 Selección especial
              </span>
            </div>
          )}

          {/* Sección de cantidad y presentación - Simplificada para móvil */}
          <div className="mt-auto">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground mb-2 flex items-center font-medium">
                <Tag className="h-3 w-3 mr-1" />
                <span>Cantidad y Presentación</span>
              </div>

              {/* Cantidad - Layout vertical en móvil */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Cantidad
                  </label>
                  {isMobile ? (
                    <div
                      className="flex items-center justify-between bg-white rounded-md border p-2 h-9 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={showMobileQuantityEditor}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          showMobileQuantityEditor()
                        }
                      }}
                      aria-label={`Cantidad: ${formatQuantity(quantity)}. Toca para editar`}
                    >
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            decrement()
                          }}
                          disabled={disabled || quantity <= QUANTITY_LIMITS.MIN}
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>

                        <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                          {formatQuantity(quantity)}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            increment()
                          }}
                          disabled={disabled}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">Editar</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-white rounded-md border overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none hover:bg-gray-50"
                        onClick={decrement}
                        disabled={disabled || quantity <= QUANTITY_LIMITS.MIN}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <Input
                        type="text"
                        value={quantityInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleInputBlur()
                          }
                        }}
                        className="h-8 border-0 text-center text-xs font-semibold bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                        disabled={disabled}
                        inputMode="decimal"
                        aria-label="Cantidad"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none hover:bg-gray-50"
                        onClick={increment}
                        disabled={disabled}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Presentación */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                    Presentación
                  </label>
                  <Select
                    value={selectedUnitId.toString()}
                    onValueChange={(value) => setSelectedUnitId(Number.parseInt(value))}
                    disabled={disabled}
                  >
                    <SelectTrigger className="text-xs bg-white border h-9 focus:ring-green-500/20 focus:border-green-500/80">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.productUnits.map((pu) => (
                        <SelectItem key={pu.id} value={pu.unitMeasurement.id.toString()}>
                          <span className="font-medium text-xs">{pu.unitMeasurement.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumen de selección */}
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {formatQuantity(quantity)} {selectedUnitName}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer con botón de agregar al carrito */}
        <CardFooter className="p-3 pt-0">
          <div className="flex gap-2">
            <Button
              size="sm"
              className={cn(
                "flex-1 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-xs h-10",
                isOutOfStock
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
              )}
              onClick={() => handleAddToCart(product, selectedUnitId, quantity, false)}
              disabled={isAddToCartDisabled}
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              <span className="truncate">{isOutOfStock ? "Sin stock" : "Agregar"}</span>
            </Button>

            {!isOutOfStock && (
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => handleAddToCart(product, selectedUnitId, quantity, true)}
                disabled={isAddToCartDisabled}
                title="Agregar como elemento separado"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <MobileQuantityModal
        isOpen={isEditingQuantity}
        onClose={closeMobileEditor}
        product={product}
        quantity={quantity}
        quantityInput={quantityInput}
        unitName={selectedUnitName}
        onQuantityChange={updateQuantity}
        onInputChange={handleInputChange}
        onInputBlur={handleInputBlur}
        onIncrement={increment}
        onDecrement={decrement}
        disabled={disabled}
      />
    </>
  )
}
