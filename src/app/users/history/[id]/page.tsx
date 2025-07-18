"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import Image from "next/image"
import {
  Building,
  ChevronLeft,
  InfoIcon,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  PlusCircle,
  Download,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import jsPDF from "jspdf"
import { api } from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

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

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  categoryId: number
  createdAt?: string
  updatedAt?: string
  productUnits?: ProductUnit[]
}

interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  unitMeasurementId: number
  unitMeasurement?: UnitMeasurement
  product?: Product
}

interface Area {
  id: number
  name: string
  companyId: number
}

interface Order {
  id: number
  userId: number
  areaId: number
  area?: Area
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
  observation?: string
  orderItems: OrderItem[]
}

interface CartItem {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  quantity: number
  selectedUnitId: number
  productUnits: ProductUnit[]
  cartItemId: string // ID único para cada item del carrito
}

// Interfaz para errores de API
interface ApiErrorResponse {
  message: string
  statusCode?: number
  error?: string
}

// Constantes para manejo de cantidades decimales - ACTUALIZADO A 2 DECIMALES
const QUANTITY_LIMITS = {
  MIN: 0.01, // Mínimo 0.01 en lugar de 0.001
  MAX: 999.99, // Máximo con 2 decimales
  STEP: 0.01, // Incrementos de 0.01
  DECIMALS: 2, // Solo 2 decimales permitidos
} as const

// Función para generar un ID único para cada item del carrito
const generateCartItemId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Usar React.use para acceder a los parámetros
  const { id } = React.use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [, setUnitMeasurements] = useState<UnitMeasurement[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [observation, setObservation] = useState<string>("")
  const [showSearchHelp, setShowSearchHelp] = useState(true) // Estado para mostrar ayuda de búsqueda

  // Estado para manejar la edición de cantidades
  const [editingQuantity, setEditingQuantity] = useState<{
    cartItemId: string
    value: string
  } | null>(null)

  // Función para formatear cantidades con hasta 2 decimales
  const formatQuantity = useCallback((quantity: number): string => {
    if (quantity % 1 === 0) {
      return quantity.toFixed(0)
    }
    return Number.parseFloat(quantity.toFixed(QUANTITY_LIMITS.DECIMALS)).toString().replace(".", ",")
  }, [])

  // Función para actualizar cantidad con soporte para decimales hasta 0.01
  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menos, eliminar el producto
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
    } else {
      // Redondear a 2 decimales y actualizar la cantidad
      const roundedQuantity = Math.round(quantity * 100) / 100
      const clampedQuantity = Math.max(QUANTITY_LIMITS.MIN, Math.min(QUANTITY_LIMITS.MAX, roundedQuantity))
      setCart((prev) =>
        prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: clampedQuantity } : item)),
      )
    }
  }, [])

  // Función para manejar cambio directo en el input con validación de decimales
  const handleQuantityInputChange = useCallback(
    (cartItemId: string, value: string) => {
      const normalizedValue = value.replace(",", ".")
      // Regex actualizado para permitir solo 2 decimales
      const regex = /^\d*\.?\d{0,2}$/
      if (regex.test(normalizedValue) || value === "") {
        setEditingQuantity({
          cartItemId,
          value: value,
        })
        if (normalizedValue !== "") {
          const numValue = Number.parseFloat(normalizedValue)
          if (!isNaN(numValue) && numValue > 0) {
            const roundedValue = Math.round(numValue * 100) / 100
            updateQuantity(cartItemId, roundedValue)
          }
        }
      }
    },
    [updateQuantity],
  )

  // Función para manejar cuando el input pierde el foco
  const handleQuantityInputBlur = useCallback(
    (cartItemId: string) => {
      if (editingQuantity && editingQuantity.cartItemId === cartItemId) {
        const normalizedValue = editingQuantity.value.replace(",", ".")
        const numValue = Number.parseFloat(normalizedValue)
        if (!isNaN(numValue) && numValue > 0) {
          updateQuantity(cartItemId, numValue)
        } else {
          // Si el valor no es válido, establecer a 0.01 como mínimo
          updateQuantity(cartItemId, QUANTITY_LIMITS.MIN)
        }
        setEditingQuantity(null)
      }
    },
    [editingQuantity, updateQuantity],
  )

  // Función para manejar Enter en el input
  const handleQuantityKeyPress = useCallback(
    (e: React.KeyboardEvent, cartItemId: string) => {
      if (e.key === "Enter") {
        handleQuantityInputBlur(cartItemId)
      }
    },
    [handleQuantityInputBlur],
  )

  // Actualizar la función fetchOrderData para manejar correctamente las unidades de medida
  const fetchOrderData = useCallback(async () => {
    try {
      setIsLoading(true)
      // Obtener unidades de medida
      const unitResponse = await api.get("/unit-measurements")
      setUnitMeasurements(unitResponse.data || [])

      // Obtener todos los productos para la búsqueda
      const productsResponse = await api.get("/products")
      setAllProducts(productsResponse.data || [])

      // Obtener detalles del pedido
      const response = await api.get(`/orders/${id}`)
      const orderData = response.data
      setOrder(orderData)

      // Initialize observation from order data
      setObservation(orderData.observation || "")

      // Convertir items del pedido al formato del carrito
      const cartItems: CartItem[] = []
      for (const item of orderData.orderItems) {
        // Obtener detalles completos del producto si no están disponibles
        let productDetails = item.product
        if (!productDetails) {
          const productResponse = await api.get(`/products/${item.productId}`)
          productDetails = productResponse.data
        }

        if (!productDetails) {
          console.error(`No se pudo obtener el producto con ID ${item.productId}`)
          continue
        }

        // Asegurarse de que el producto tenga unidades de medida
        if (
          !productDetails.productUnits ||
          !Array.isArray(productDetails.productUnits) ||
          productDetails.productUnits.length === 0
        ) {
          // Crear una unidad por defecto
          const defaultUnit = unitResponse.data.find((um: UnitMeasurement) => um.id === 1) || {
            id: 1,
            name: "Unidad",
            description: "Unidad estándar",
          }
          productDetails.productUnits = [
            {
              id: 1,
              productId: productDetails.id,
              unitMeasurementId: defaultUnit.id,
              unitMeasurement: defaultUnit,
            },
          ]
        }

        // Usar unitMeasurementId del item si está disponible, de lo contrario usar el primero disponible
        const selectedUnitId = item.unitMeasurementId || productDetails.productUnits[0].unitMeasurement.id

        // Añadir al carrito con un ID único
        cartItems.push({
          id: productDetails.id,
          name: productDetails.name,
          description: productDetails.description,
          price: item.price,
          imageUrl: productDetails.imageUrl || "",
          quantity: item.quantity,
          selectedUnitId: selectedUnitId,
          productUnits: productDetails.productUnits,
          cartItemId: generateCartItemId(), // Generar ID único para cada item
        })
      }

      setCart(cartItems)
    } catch (error) {
      console.error("Error al cargar el pedido:", error)
      toast.error("Error al cargar el pedido", {
        description: "No se pudo cargar la información del pedido. Por favor, intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [id])

  // Cargar datos del pedido
  useEffect(() => {
    fetchOrderData()
  }, [fetchOrderData])

  // Buscar productos
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      setIsSearching(true)
      // Filtrar productos localmente en lugar de hacer una llamada API
      const query = searchQuery.toLowerCase()
      const filtered = allProducts.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
      setSearchResults(filtered.slice(0, 5)) // Limitar a 5 resultados
    } catch (error) {
      console.error("Error al buscar productos:", error)
      toast.error("Error al buscar productos", {
        description: "No se pudieron cargar los resultados de búsqueda.",
      })
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, allProducts])

  // Actualizar búsqueda cuando cambia la consulta
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
        // Ocultar el mensaje de ayuda cuando se está buscando
        setShowSearchHelp(false)
      } else {
        setSearchResults([])
        // Mostrar el mensaje de ayuda cuando no hay búsqueda
        setShowSearchHelp(true)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Añadir producto al carrito - MODIFICADO para permitir duplicados
  const addToCart = (product: Product, unitId: number) => {
    // Siempre añadir como nuevo item con ID único
    setCart((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl || "",
        quantity: 1, // Iniciar con cantidad 1
        selectedUnitId: unitId,
        productUnits: product.productUnits || [],
        cartItemId: generateCartItemId(), // Generar ID único para cada item
      },
    ])

    // Mostrar mensaje de éxito
    const selectedUnit = product.productUnits?.find((pu) => pu.unitMeasurement.id === unitId)
    const unitName = selectedUnit?.unitMeasurement.name || "Unidad"
    toast.success("Producto añadido", {
      description: `${product.name} (${unitName}) ha sido añadido al pedido.`,
    })

    // Limpiar la búsqueda después de añadir
    setSearchQuery("")
    setSearchResults([])
  }

  // Eliminar un producto del carrito
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  // Obtener el nombre de la unidad de medida
  const getUnitName = (item: CartItem) => {
    if (!item.productUnits || !Array.isArray(item.productUnits)) {
      return "Unidad"
    }
    const selectedUnit = item.productUnits.find((pu) => pu.unitMeasurement.id === item.selectedUnitId)
    return selectedUnit?.unitMeasurement.name || "Unidad"
  }

  // Función para eliminar el pedido
  const handleDeleteOrder = async () => {
    if (!order) return

    // Mostrar confirmación
    const confirmed = window.confirm(
      `¿Estás seguro que quieres eliminar el pedido #${order.id}?\n\nEsta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    try {
      setIsDeleting(true)
      await api.delete(`/orders/${order.id}`)

      toast.success("Pedido eliminado", {
        description: "El pedido ha sido eliminado correctamente.",
      })

      // Redirigir al historial después de eliminar
      setTimeout(() => {
        router.push("/users/history")
      }, 1500)
    } catch (error: unknown) {
      console.error("Error al eliminar el pedido:", error)

      let errorMessage = "No se pudo eliminar el pedido. Por favor, intenta nuevamente."
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse
        errorMessage = apiError.message || errorMessage
      }

      toast.error("Error al eliminar el pedido", {
        description: errorMessage,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Guardar cambios en el pedido
  const handleSaveChanges = async () => {
    if (!order) return

    try {
      setIsSubmitting(true)
      // Preparar los datos para la actualización
      const updateData = {
        userId: Number(order.userId),
        areaId: Number(order.areaId),
        status: order.status,
        totalAmount: Number(cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)),
        ...(observation.trim() && { observation: observation.trim() }),
        orderItems: cart.map((item) => ({
          productId: Number(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
          unitMeasurementId: Number(item.selectedUnitId),
        })),
      }

      console.log("Actualizando pedido con PATCH:", order.id, updateData)

      // Enviar la actualización al backend usando PATCH
      await api.patch(`/orders/${order.id}`, updateData)

      toast.success("Pedido actualizado con éxito", {
        description:
          cart.length === 0
            ? "Tu pedido ha sido vaciado. Ya no recibirás productos mañana."
            : "Tu pedido ha sido actualizado y será procesado pronto. La entrega será mañana.",
      })

      // Redirigir a la página de historial de pedidos
      setTimeout(() => {
        router.push("/users/history")
      }, 1500)
    } catch (error: unknown) {
      console.error("Error al actualizar el pedido:", error)
      // Manejar el error con tipado adecuado
      let errorMessage = "No se pudo actualizar el pedido. Por favor, intenta nuevamente."
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse
        errorMessage = apiError.message || errorMessage
      }

      toast.error("Error al actualizar el pedido", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancelar la edición
  const handleCancel = () => {
    router.push("/users/history")
  }

  // Función para imprimir el pedido con estilos específicos
  const handlePrint = () => {
    if (!order) {
      toast.error("Error", {
        description: "No se puede imprimir. Pedido no encontrado.",
      })
      return
    }

    // Create print-specific styles with proper page break handling
    const printStyles = `
    <style>
      @media print {
        body * { visibility: hidden; }
        .print-section, .print-section * { visibility: visible; }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          padding: 20px;
        }
        .no-print { display: none !important; }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .print-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .print-table th, .print-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        .print-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .print-table tbody tr {
          page-break-inside: avoid;
        }
        .print-table thead {
          display: table-header-group;
        }
        .print-total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }
        /* Ensure proper page breaks */
        @page {
          margin: 1in;
          size: A4;
        }
        .page-break {
          page-break-before: always;
        }
        .avoid-break {
          page-break-inside: avoid;
        }
      }
    </style>
  `

    // Create HTML content for printing with null safety and proper page handling
    const printContent = `
    ${printStyles}
    <div class="print-section">
      <div class="print-header avoid-break">
        <h1>PEDIDO #${order.id}</h1>
        <p>Estado: ${order.status}</p>
        <p>Fecha: ${order.createdAt ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha no disponible"}</p>
      </div>
      
      <div class="print-info avoid-break">
        <div>
          <h3>INFORMACIÓN DEL ÁREA</h3>
          <p><strong>Área:</strong> ${order.area ? order.area.name : `Área #${order.areaId}`}</p>
        </div>
        
        <div>
          <h3>DETALLES DEL PEDIDO</h3>
          ${observation ? `<p><strong>Observaciones:</strong> ${observation}</p>` : ""}
        </div>
      </div>
      
      <h3>PRODUCTOS</h3>
      <table class="print-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
          </tr>
        </thead>
        <tbody>
          ${cart
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${formatQuantity(item.quantity)}</td>
              <td>${getUnitName(item)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `

    // Create print window
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${order.id}</title>
          <meta charset="utf-8">
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
      printWindow.document.close()
      // Wait for load and then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }

    toast.success("Preparando impresión", {
      description: "El documento se está preparando para imprimir.",
    })
  }

  // Función para descargar el pedido como PDF
  const handleDownload = () => {
    if (!order) {
      toast.error("Error", {
        description: "No se puede descargar. Pedido no encontrado.",
      })
      return
    }

    try {
      // Create new PDF document
      const doc = new jsPDF()
      const pageHeight = doc.internal.pageSize.height
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      const usableWidth = pageWidth - 2 * margin

      // Configure font
      doc.setFont("helvetica")
      let yPos = margin

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(`PEDIDO #${order.id}`, pageWidth / 2, yPos, { align: "center" })
      yPos += 20

      // Basic information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Estado: ${order.status}`, margin, yPos)
      yPos += 10
      const dateText = order.createdAt
        ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })
        : "Fecha no disponible"
      doc.text(`Fecha: ${dateText}`, margin, yPos)
      yPos += 20

      // Area information
      doc.setFont("helvetica", "bold")
      doc.text("INFORMACIÓN DEL ÁREA", margin, yPos)
      doc.setFont("helvetica", "normal")
      yPos += 10
      const areaName = order.area ? order.area.name : `Área #${order.areaId}`
      doc.text(`Área: ${areaName}`, margin, yPos)
      yPos += 15

      // Observations if they exist
      if (observation) {
        // Check if we need a new page
        if (yPos + 30 > pageHeight - margin) {
          doc.addPage()
          yPos = margin
        }
        doc.setFont("helvetica", "bold")
        doc.text("OBSERVACIONES:", margin, yPos)
        doc.setFont("helvetica", "normal")
        yPos += 10
        // Split long text into multiple lines
        const splitText = doc.splitTextToSize(observation, usableWidth)
        const textHeight = splitText.length * 7
        // Check if observation fits on current page
        if (yPos + textHeight > pageHeight - margin) {
          doc.addPage()
          yPos = margin
        }
        doc.text(splitText, margin, yPos)
        yPos += textHeight + 10
      }

      // Products section
      // Check if we need a new page for the products section
      if (yPos + 40 > pageHeight - margin) {
        doc.addPage()
        yPos = margin
      }
      doc.setFont("helvetica", "bold")
      doc.text("PRODUCTOS", margin, yPos)
      yPos += 15

      // Table setup
      const rowHeight = 12
      const headerHeight = 15
      const colWidths = [100, 30, 30] // Product, Quantity, Unit
      const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1]]

      // Function to draw table header
      const drawTableHeader = (startY: number) => {
        // Header background
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, startY, usableWidth, headerHeight, "F")
        // Header borders
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.5)
        doc.rect(margin, startY, usableWidth, headerHeight)
        // Vertical lines for header
        doc.line(colPositions[1], startY, colPositions[1], startY + headerHeight)
        doc.line(colPositions[2], startY, colPositions[2], startY + headerHeight)
        // Header text
        doc.setFont("helvetica", "bold")
        doc.text("Producto", colPositions[0] + 2, startY + 10)
        doc.text("Cantidad", colPositions[1] + 2, startY + 10)
        doc.text("Unidad", colPositions[2] + 2, startY + 10)
        return startY + headerHeight
      }

      // Draw initial table header
      yPos = drawTableHeader(yPos)

      // Table rows
      doc.setFont("helvetica", "normal")
      cart.forEach((item, index) => {
        // Check if we need a new page
        if (yPos + rowHeight > pageHeight - margin) {
          doc.addPage()
          yPos = margin
          // Redraw header on new page
          yPos = drawTableHeader(yPos)
        }

        // Row background (alternating)
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, yPos, usableWidth, rowHeight, "F")
        }

        // Row borders
        doc.setDrawColor(0, 0, 0)
        doc.rect(margin, yPos, usableWidth, rowHeight)
        // Vertical lines
        doc.line(colPositions[1], yPos, colPositions[1], yPos + rowHeight)
        doc.line(colPositions[2], yPos, colPositions[2], yPos + rowHeight)

        // Row data
        const productName = item.name
        const quantity = formatQuantity(item.quantity)
        const unit = getUnitName(item)

        // Truncate long product names to fit in column
        const maxProductNameLength = 40
        const truncatedProductName =
          productName.length > maxProductNameLength
            ? productName.substring(0, maxProductNameLength) + "..."
            : productName

        doc.text(truncatedProductName, colPositions[0] + 2, yPos + 8)
        doc.text(quantity, colPositions[1] + 2, yPos + 8)
        doc.text(unit, colPositions[2] + 2, yPos + 8)

        yPos += rowHeight
      })

      // Final border for table
      doc.rect(
        margin,
        yPos - cart.length * rowHeight - headerHeight,
        usableWidth,
        cart.length * rowHeight + headerHeight,
      )

      // Download the PDF
      doc.save(`pedido-${order.id}.pdf`)

      toast.success("Descarga iniciada", {
        description: "El archivo PDF se ha descargado correctamente.",
      })
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al descargar", {
        description: "No se pudo generar el archivo PDF. Intenta de nuevo.",
      })
    }
  }

  // Agrupar productos por tipo y unidad para mostrar contadores
  const getProductCounts = useCallback(() => {
    const counts: Record<string, number> = {}
    cart.forEach((item) => {
      const key = `${item.id}-${item.selectedUnitId}`
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [cart])

  const productCounts = getProductCounts()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleCancel}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold md:text-xl">Cargando pedido...</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando información del pedido...</span>
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleCancel}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold md:text-xl">Pedido no encontrado</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudo encontrar el pedido solicitado. Por favor, regresa al historial de pedidos e intenta
              nuevamente.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={handleCancel}>
            Volver al historial
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={handleCancel}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-lg font-semibold md:text-xl">Detalle del Pedido #{order.id}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1 bg-transparent">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1 bg-transparent">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {/* Información del área */}
        <div className="mb-4 flex items-center">
          <Building className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className="text-lg font-medium text-blue-700">Área: {order.area?.name || `Área #${order.areaId}`}</h2>
        </div>

        {/* Información importante */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Información importante</AlertTitle>
          <AlertDescription className="text-blue-600">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Puedes añadir o quitar productos de este pedido.</li>
              <li>La edición solo está disponible hasta el final del día de hoy.</li>
              <li>La entrega de los productos será mañana.</li>
              <li>Puedes usar cantidades decimales hasta 2 decimales (ej: 2.5, 0.75, 0.01).</li>
              <li>Puedes añadir el mismo producto varias veces como elementos separados.</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Buscador de productos - MEJORADO */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">Añadir productos al pedido</h3>
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar productos para añadir..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSubmitting}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Mensaje de ayuda para la búsqueda */}
            {showSearchHelp && (
              <div className="mt-2 p-3 bg-muted/30 rounded-md border border-dashed">
                <div className="flex items-center text-muted-foreground">
                  <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <p className="text-sm">Escribe el nombre de un producto para buscarlo y añadirlo al pedido.</p>
                </div>
                <div className="mt-2 flex items-center text-muted-foreground">
                  <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                  <p className="text-sm">Puedes añadir el mismo producto varias veces como elementos separados.</p>
                </div>
              </div>
            )}

            {/* Resultados de búsqueda - MEJORADOS */}
            {searchResults.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-80">
                    <ul className="divide-y">
                      {searchResults.map((product) => (
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
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{product.name}</h4>
                                {/* Mostrar contador si el producto ya está en el carrito */}
                                {product.productUnits &&
                                  product.productUnits.some((pu) => {
                                    const key = `${product.id}-${pu.unitMeasurement.id}`
                                    return productCounts[key] && productCounts[key] > 0
                                  }) && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Ya en pedido
                                    </Badge>
                                  )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {product.productUnits && product.productUnits.length > 0 ? (
                                  product.productUnits.map((pu) => {
                                    const key = `${product.id}-${pu.unitMeasurement.id}`
                                    const count = productCounts[key] || 0
                                    return (
                                      <Button
                                        key={pu.id}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs flex items-center gap-1 bg-white"
                                        onClick={() => addToCart(product, pu.unitMeasurement.id)}
                                        disabled={isSubmitting}
                                      >
                                        <PlusCircle className="h-3 w-3 mr-1" />
                                        <span>{pu.unitMeasurement.name}</span>
                                        {count > 0 && (
                                          <Badge className="ml-1 h-5 bg-green-100 text-green-800 text-[10px]">
                                            {count}
                                          </Badge>
                                        )}
                                      </Button>
                                    )
                                  })
                                ) : (
                                  <p className="text-xs text-muted-foreground">No hay unidades disponibles</p>
                                )}
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
          </div>
        </div>

        {/* Lista de productos en el pedido */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">Productos en el pedido</h3>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/20">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No hay productos en el pedido</p>
              <p className="text-sm text-muted-foreground">Busca y añade productos usando el buscador de arriba</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item.cartItemId} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-medium">{getUnitName(item)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeFromCart(item.cartItemId)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Control de cantidad con soporte para decimales hasta 0.01 */}
                  <div className="mt-3 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full flex-shrink-0 bg-transparent"
                        onClick={() =>
                          updateQuantity(
                            item.cartItemId,
                            Math.max(QUANTITY_LIMITS.MIN, item.quantity - QUANTITY_LIMITS.STEP),
                          )
                        }
                        disabled={item.quantity <= QUANTITY_LIMITS.MIN || isSubmitting}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Disminuir</span>
                      </Button>
                      <div className="flex flex-col items-center">
                        {editingQuantity && editingQuantity.cartItemId === item.cartItemId ? (
                          <Input
                            type="text"
                            value={editingQuantity.value}
                            onChange={(e) => handleQuantityInputChange(item.cartItemId, e.target.value)}
                            onBlur={() => handleQuantityInputBlur(item.cartItemId)}
                            onKeyPress={(e) => handleQuantityKeyPress(e, item.cartItemId)}
                            className="w-20 h-8 text-center text-sm"
                            autoFocus
                            disabled={isSubmitting}
                            inputMode="decimal"
                          />
                        ) : (
                          <button
                            onClick={() =>
                              setEditingQuantity({
                                cartItemId: item.cartItemId,
                                value: formatQuantity(item.quantity),
                              })
                            }
                            className="w-20 h-8 text-center text-sm border rounded px-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                          >
                            {formatQuantity(item.quantity)}
                          </button>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">{getUnitName(item)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full flex-shrink-0 bg-transparent"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + QUANTITY_LIMITS.STEP)}
                        disabled={isSubmitting}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Aumentar</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Observaciones */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">Observaciones (opcional)</h3>
          <Textarea
            placeholder="¿Algún producto específico o algo especial que quieras agregar?"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px] text-sm"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 500 caracteres. Especifica cualquier detalle especial sobre los productos.
          </p>
        </div>

        <Separator className="my-6" />

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || isDeleting}
            className="order-2 sm:order-1 bg-transparent"
          >
            Cancelar
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={isSubmitting || isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar pedido"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCart([])}
              disabled={cart.length === 0 || isSubmitting || isDeleting}
              className="w-full sm:w-auto"
            >
              Vaciar pedido
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={handleSaveChanges}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
