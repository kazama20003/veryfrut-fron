"use client"
import Image from "next/image"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ShoppingCart, Star, Tag, Clock, Award, Plus, Minus, X, Package, Layers } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Interfaces
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

interface CartProduct extends BaseProduct {
  quantity: number
  selectedUnitId: number
  cartItemId?: string
}

// Nueva interfaz para información detallada del carrito
interface CartItemInfo {
  cartItemId: string
  quantity: number
  unitId: number
  unitName: string
}

interface DetailedCartInfo {
  isInCart: boolean
  totalQuantity: number
  cartItems: CartItemInfo[]
  hasMultipleUnits: boolean
  hasMultipleItems: boolean
}

interface ProductCardProps {
  product: BaseProduct
  isNew?: boolean
  isFeatured?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
  cartInfo: DetailedCartInfo
  onAddToCart?: (product: CartProduct, selectedUnitId: number) => void
  onAddToCartAsDuplicate?: (product: CartProduct, selectedUnitId: number) => void
  onUpdateCartItemQuantity?: (productId: number, selectedUnitId: number, quantity: number, cartItemId?: string) => void
}

// Constants
const QUANTITY_LIMITS = {
  MIN: 0.01,
  MAX: 999.99,
  STEP: 0.25, // Cambiar de 0.01 a 0.25
  DECIMALS: 2,
} as const

const QUANTITY_PRESETS = [0.1, 0.25, 0.5, 1, 5, 10, 100] as const // Nuevos presets

// Star Rating Component
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

// Quantity Manager Hook
const useQuantityManager = (initialQuantity = 1) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity)
  const [quantityInput, setQuantityInput] = useState<string>(initialQuantity.toString())

  const formatQuantity = useCallback((qty: number): string => {
    if (qty % 1 === 0) {
      return qty.toFixed(0)
    }
    // Mostrar hasta 2 decimales para cantidades como 0.25, 0.5, etc.
    return Number.parseFloat(qty.toFixed(QUANTITY_LIMITS.DECIMALS)).toString().replace(".", ",")
  }, [])

  const updateQuantity = useCallback(
    (newQuantity: number) => {
      if (newQuantity >= QUANTITY_LIMITS.MIN && newQuantity <= QUANTITY_LIMITS.MAX) {
        const roundedQuantity = Math.round(newQuantity * 1000) / 1000 // Redondear a 3 decimales
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
    const regex = /^\d*\.?\d{0,3}$/ // Permitir hasta 3 decimales
    if (regex.test(normalizedValue) || value === "") {
      setQuantityInput(value)
      if (value !== "") {
        const numValue = Number.parseFloat(normalizedValue)
        if (!isNaN(numValue) && numValue > 0) {
          const roundedValue = Math.round(numValue * 1000) / 1000 // Redondear a 3 decimales
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

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640)
    checkIfMobile()
    const handleResize = () => checkIfMobile()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { isMobile: mounted ? isMobile : false, mounted }
}

// Mobile Quantity Modal
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
            className="h-12 w-12 rounded-full bg-transparent"
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
            className="h-12 w-12 rounded-full bg-transparent"
            onClick={onIncrement}
            disabled={disabled}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {" "}
          {/* Cambiar de 3 a 4 columnas para acomodar más opciones */}
          {QUANTITY_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              className="text-sm font-medium bg-transparent"
              onClick={() => onQuantityChange(preset)}
              disabled={disabled}
            >
              {preset % 1 === 0 ? preset.toString() : preset.toString().replace(".", ",")}
            </Button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
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

// Componente para mostrar información detallada del carrito
const CartInfoDisplay = ({
  cartInfo,
  formatQuantity,
}: { cartInfo: DetailedCartInfo; formatQuantity: (qty: number) => string }) => {
  if (!cartInfo.isInCart) return null

  return (
    <div className="space-y-2">
      {/* Indicador principal */}
      <div className="flex items-center justify-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-center w-5 h-5 bg-green-600 rounded-full flex-shrink-0">
          <ShoppingCart className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-green-800 block truncate">✓ En tu carrito</span>
          <span className="text-xs text-green-700 block truncate">
            Total: {formatQuantity(cartInfo.totalQuantity)}
            {cartInfo.hasMultipleItems && ` (${cartInfo.cartItems.length} elementos)`}
          </span>
        </div>
      </div>

      {/* Detalles de elementos en el carrito */}
      {(cartInfo.hasMultipleUnits || cartInfo.hasMultipleItems) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-2">
            <Layers className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">
              {cartInfo.hasMultipleUnits ? "Diferentes unidades" : "Elementos separados"}
            </span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {cartInfo.cartItems.map((item, index) => (
              <div key={item.cartItemId} className="flex items-center justify-between text-xs">
                <span className="text-blue-700 truncate">
                  #{index + 1} • {item.unitName}
                </span>
                <Badge variant="outline" className="text-xs h-5 bg-white border-blue-300 text-blue-700">
                  {formatQuantity(item.quantity)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main ProductCard Component
export function ProductCard({
  product,
  isNew = false,
  isFeatured = false,
  disabled = false,
  loading = false,
  className,
  cartInfo,
  onAddToCart,
  onAddToCartAsDuplicate,
  onUpdateCartItemQuantity,
}: ProductCardProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(
    product.productUnits.length > 0 ? product.productUnits[0].unitMeasurement.id : 0,
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const { isMobile, mounted } = useIsMobile()

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

  // Memoized values
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

  // Helper functions
  const isNewProduct = useCallback((createdAt: string) => {
    const productDate = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - productDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }, [])

  const isFeaturedProduct = useCallback((id: number) => {
    return id % 5 === 0
  }, [])

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

  // Event handlers
  const handleAddToCart = useCallback(
    (product: BaseProduct, selectedUnitId: number, quantity: number, allowDuplicate = false) => {
      if (!onAddToCart || !onAddToCartAsDuplicate) return

      const cartProduct = createCartProduct(product, selectedUnitId, quantity)

      if (allowDuplicate) {
        onAddToCartAsDuplicate(cartProduct, selectedUnitId)
      } else {
        onAddToCart(cartProduct, selectedUnitId)
        if (quantity !== 1 && onUpdateCartItemQuantity) {
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

  // Determine if product should show badges
  const showAsNew = isNew || isNewProduct(product.createdAt)
  const showAsFeatured = isFeatured || isFeaturedProduct(product.id)

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Card className="overflow-hidden border border-border/40 flex flex-col bg-white min-h-[420px] animate-pulse">
        <div className="w-full aspect-square bg-gray-200" />
        <CardContent className="p-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <div className="h-10 bg-gray-200 rounded w-full" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden border border-border/40 transition-all duration-200 flex flex-col bg-white",
          // Altura mínima ajustada para acomodar mejor el contenido
          "min-h-[380px] sm:min-h-[420px] md:min-h-[450px]",
          !isMobile && isHovered && !disabled ? "shadow-lg border-border/80" : "shadow-sm",
          disabled && "opacity-60 cursor-not-allowed",
          loading && "animate-pulse",
          className,
        )}
        onMouseEnter={() => !disabled && !isMobile && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
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
          {/* Top badges */}
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

        {/* Card Content */}
        <CardContent className="p-2 sm:p-3 flex-1 flex flex-col">
          {/* Product title */}
          <div className="mb-2">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-2">
            <StarRating rating={productRating} />
            <span className="text-xs text-green-600 font-medium">{productRating.toFixed(1)} • Excelente</span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
            {product.description}
          </p>

          {/* Featured badge */}
          {showAsFeatured && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200">
                👑 Selección especial
              </span>
            </div>
          )}

          {/* Información del carrito - NUEVA SECCIÓN */}
          {cartInfo.isInCart && (
            <div className="mb-3">
              <CartInfoDisplay cartInfo={cartInfo} formatQuantity={formatQuantity} />
            </div>
          )}

          {/* Quantity and unit selection */}
          <div className="mt-auto">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border">
              <div className="text-xs text-muted-foreground mb-2 flex items-center font-medium">
                <Tag className="h-3 w-3 mr-1" />
                <span>Cantidad y Presentación</span>
              </div>
              <div className="space-y-2">
                {/* Quantity */}
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
                {/* Unit selection */}
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
              {/* Selection summary */}
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {formatQuantity(quantity)} {selectedUnitName}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer con botones mejorados y responsivos */}
        <CardFooter className="p-2 sm:p-3 pt-0 mt-auto">
          {cartInfo.isInCart ? (
            /* Producto YA está en el carrito - Mostrar estado y opciones */
            <div className="w-full space-y-2 sm:space-y-3">
              {/* Botones de acción cuando está en carrito - MEJORADOS PARA MÓVIL */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 sm:h-11 border-green-600 text-green-700 hover:bg-green-50 bg-transparent text-sm sm:text-xs font-medium flex items-center justify-center"
                  onClick={() => handleAddToCart(product, selectedUnitId, quantity, false)}
                  disabled={isAddToCartDisabled}
                >
                  <Plus className="mr-2 sm:mr-1.5 h-4 sm:h-3.5 w-4 sm:w-3.5 flex-shrink-0" />
                  <span className="truncate">Agregar más</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-12 sm:h-11 border-blue-600 text-blue-700 hover:bg-blue-50 bg-transparent text-sm sm:text-xs font-medium flex items-center justify-center"
                  onClick={() => handleAddToCart(product, selectedUnitId, quantity, true)}
                  disabled={isAddToCartDisabled}
                  title="Agregar como elemento separado en el carrito"
                >
                  <Package className="mr-2 sm:mr-1.5 h-4 sm:h-3.5 w-4 sm:w-3.5 flex-shrink-0" />
                  <span className="truncate">Elemento separado</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Producto NO está en el carrito - Botón principal */
            <div className="w-full">
              <Button
                size="sm"
                className={cn(
                  "w-full font-semibold transition-all duration-200 shadow-sm hover:shadow-md h-12 sm:h-11",
                  "text-sm sm:text-xs",
                  isOutOfStock
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
                )}
                onClick={() => handleAddToCart(product, selectedUnitId, quantity, false)}
                disabled={isAddToCartDisabled}
              >
                <ShoppingCart className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {isOutOfStock ? (
                    "Sin stock"
                  ) : (
                    <span className="flex flex-col items-center leading-tight">
                      <span>Agregar al carrito</span>
                      <span className="text-xs opacity-90">
                        {formatQuantity(quantity)} {selectedUnitName}
                      </span>
                    </span>
                  )}
                </span>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Mobile quantity modal */}
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
