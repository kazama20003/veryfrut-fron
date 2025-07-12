"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Printer,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Trash2,
  Save,
  Search,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { api } from "@/lib/axiosInstance"
import {
  type Order,
  OrderStatus,
  type OrderItem as BackendOrderItem,
  type Product as BackendProduct,
} from "@/types/order"
import { useParams } from "next/navigation"
import type { AxiosError } from "axios"
import jsPDF from "jspdf"
// Import autotable correctly
// import "jspdf-autotable"

// Interfaces para las respuestas de la API
interface UnitMeasurement {
  id: number
  name: string
  description?: string
}

interface ProductUnit {
  id: number
  productId: number
  unitMeasurementId: number
  unitMeasurement: UnitMeasurement
}

// Extendemos la interfaz Product del backend para incluir productUnits
interface Product extends BackendProduct {
  productUnits: ProductUnit[]
  selectedUnitId?: number // Propiedad para almacenar la unidad seleccionada temporalmente
}

// Interfaz para nuestro OrderItem local que incluye las propiedades necesarias
interface OrderItem extends Omit<BackendOrderItem, "product"> {
  unitMeasurement?: UnitMeasurement
  product?: Product
}

// Tipo intermedio para los items del pedido tal como los recibimos del backend
interface OrderItemWithExtras extends BackendOrderItem {
  unitMeasurement?: UnitMeasurement
  product?: BackendProduct & { productUnits?: ProductUnit[] }
}

// DTO para actualizar el pedido
interface UpdateOrderDto {
  userId?: number
  areaId?: number
  totalAmount?: number
  status?: OrderStatus
  observation?: string
  orderItems?: {
    id?: number
    productId: number
    quantity: number
    price: number
    unitMeasurementId: number
  }[]
}

// Extended Order interface to include observation property
interface OrderWithObservation extends Order {
  observation?: string
}

// Type for Axios error response
interface AxiosErrorResponse {
  message?: string
}

// Componente para mostrar el estado del pedido
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case OrderStatus.CREATED:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Pendiente</span>
        </Badge>
      )
    case OrderStatus.PROCESS:
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
          <Truck className="h-3 w-3" />
          <span>En proceso</span>
        </Badge>
      )
    case OrderStatus.DELIVERED:
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          <span>Entregado</span>
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id

  const [order, setOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.CREATED)
  const [updating, setUpdating] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [observation, setObservation] = useState("")
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({})

  // Función para formatear la cantidad eliminando ceros innecesarios
  const formatQuantity = (quantity: number): string => {
    // Convertir a string con 2 decimales
    const formatted = quantity.toFixed(2)
    // Eliminar ceros innecesarios al final
    return formatted.replace(/\.?0+$/, "") || "0"
  }

  // Cargar datos del pedido, cliente y productos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [orderResponse, productsResponse, unitMeasurementsResponse] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get("/products"),
          api.get("/unit-measurements"),
        ])

        const orderData = orderResponse.data
        const productsData = productsResponse.data
        const unitMeasurementsData = unitMeasurementsResponse.data

        // Si la respuesta ya incluye User, asignarlo como customer
        if (orderData.User) {
          orderData.customer = orderData.User
        }
        // Si no hay User pero hay userId, intentar obtenerlo
        else if (orderData.userId && !orderData.customer) {
          try {
            const customerResponse = await api.get(`/users/${orderData.userId}`)
            orderData.customer = customerResponse.data
          } catch (err) {
            console.error("Error al cargar datos del cliente:", err)
          }
        }

        // Procesar los items del pedido para incluir información completa
        if (orderData.orderItems) {
          const processedItems = orderData.orderItems.map((item: BackendOrderItem) => {
            // Buscar el producto correspondiente
            const product = productsData.find((p: Product) => p.id === item.productId)

            // Buscar la unidad de medida correspondiente
            const unitMeasurement = unitMeasurementsData.find(
              (unit: UnitMeasurement) => unit.id === item.unitMeasurementId,
            )

            return {
              ...item,
              product,
              unitMeasurement,
              unitMeasurementId:
                item.unitMeasurementId ||
                (product?.productUnits && product.productUnits.length > 0
                  ? product.productUnits[0].unitMeasurementId
                  : 1),
            }
          })

          orderData.orderItems = processedItems
        }

        setOrder(orderData)
        setOrderItems(orderData.orderItems || [])
        setStatus(orderData.status)
        setProducts(productsData)
        setObservation(orderData.observation || "")
      } catch (err) {
        console.error("Error al cargar el pedido:", err)
        setError("No se pudo cargar la información del pedido. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) => {
    if (!productSearch.trim()) return false // No mostrar productos si no hay búsqueda
    const name = product.name.toLowerCase()
    const searchTerm = productSearch.toLowerCase()
    const productId = product.id.toString()
    return name.includes(searchTerm) || productId.includes(searchTerm)
  })

  // Actualizar cantidad de un producto con validación de decimales
  const handleQuantityChange = (index: number, value: string) => {
    // Permitir string vacío
    if (value === "") {
      const newItems = [...orderItems]
      newItems[index].quantity = 0
      setOrderItems(newItems)

      // Actualizar el valor del input
      const newInputValues = { ...inputValues }
      newInputValues[index] = ""
      setInputValues(newInputValues)
      return
    }

    // Regex que permite números con hasta 2 decimales
    const regex = /^\d*\.?\d{0,2}$/

    // Si no cumple el patrón, no permitir el cambio
    if (!regex.test(value)) {
      return
    }

    // Actualizar el valor del input (mantener como string)
    const newInputValues = { ...inputValues }
    newInputValues[index] = value
    setInputValues(newInputValues)

    // Actualizar el estado numérico
    const newItems = [...orderItems]
    const numericValue = Number.parseFloat(value) || 0
    newItems[index].quantity = numericValue
    setOrderItems(newItems)
  }

  // Actualizar unidad de medida seleccionada
  const handleUnitChange = (index: number, unitMeasurementId: number) => {
    const product = products.find((p) => p.id === orderItems[index].productId)
    if (!product) return

    const unit = product.productUnits.find((u) => u.unitMeasurementId === unitMeasurementId)
    if (!unit) return

    const newItems = [...orderItems]
    newItems[index].unitMeasurementId = unitMeasurementId
    newItems[index].unitMeasurement = unit.unitMeasurement
    setOrderItems(newItems)
  }

  // Calcular total del pedido
  const calculateTotal = () => {
    return Math.round(orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0) * 100) / 100
  }

  // Validar datos antes de enviar
  const validateOrderData = (): string | null => {
    if (orderItems.length === 0) {
      return "El pedido debe tener al menos un producto."
    }

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i]
      if (!item.productId || item.productId <= 0) {
        return `El producto en la posición ${i + 1} no es válido.`
      }
      if (!item.quantity || item.quantity < 0.01) {
        return `La cantidad del producto en la posición ${i + 1} debe ser al menos 0.01.`
      }
      if (!item.price || item.price < 0) {
        return `El precio del producto en la posición ${i + 1} no es válido.`
      }
      if (!item.unitMeasurementId || item.unitMeasurementId <= 0) {
        return `La unidad de medida del producto en la posición ${i + 1} no es válida.`
      }
    }

    return null
  }

  // Actualizar estado del pedido
  const handleUpdateStatus = async () => {
    if (!order) return

    setUpdating(true)
    try {
      // Crear objeto de actualización según el DTO del backend
      const updateData: UpdateOrderDto = {
        status,
        observation,
      }

      console.log("Enviando actualización de estado:", updateData)

      await api.patch(`/orders/${orderId}`, updateData)

      setOrder({
        ...order,
        status,
        observation,
      } as Order)

      toast.success("Pedido actualizado", {
        description: "El estado del pedido ha sido actualizado correctamente.",
      })

      setEditMode(false)
    } catch (err) {
      console.error("Error al actualizar el pedido:", err)
      const axiosError = err as AxiosError
      const errorMessage =
        (axiosError.response?.data as AxiosErrorResponse)?.message || "No se pudo actualizar el estado del pedido."
      toast.error("Error al actualizar", {
        description: errorMessage,
      })
    } finally {
      setUpdating(false)
    }
  }

  // Restaurar los items originales del pedido
  const restoreOriginalItems = () => {
    if (!order || !order.orderItems) return

    // Crear una nueva lista de items con el tipo correcto
    const originalItems: OrderItem[] = []

    // Procesar cada item del pedido original
    order.orderItems.forEach((item: OrderItemWithExtras) => {
      // Extraer las propiedades básicas que sabemos que existen
      const { id, productId, quantity, price, unitMeasurementId } = item

      // Crear un nuevo item con el tipo correcto
      const newItem: OrderItem = {
        id,
        productId,
        quantity,
        price,
        unitMeasurementId: unitMeasurementId || 1,
      }

      // Añadir unitMeasurement si existe en el item original
      if ("unitMeasurement" in item && item.unitMeasurement) {
        newItem.unitMeasurement = item.unitMeasurement
      }

      // Manejar el producto de manera especial
      if (item.product) {
        // Buscar el producto en nuestra lista de productos cargados
        const matchedProduct = products.find((p) => p.id === item.product?.id)

        if (matchedProduct) {
          // Si encontramos el producto en nuestra lista, usarlo directamente
          newItem.product = matchedProduct
        } else {
          // Si no lo encontramos, crear un producto con productUnits vacío
          newItem.product = {
            ...item.product,
            productUnits: [],
          } as Product
        }
      }

      // Añadir el item a la lista
      originalItems.push(newItem)
    })

    // Actualizar el estado
    setOrderItems(originalItems)
    setEditMode(false)
    setProductSearch("")
    setInputValues({})
  }

  // Actualizar productos del pedido
  const handleUpdateProducts = async () => {
    if (!order) return

    // Validar datos antes de enviar
    const validationError = validateOrderData()
    if (validationError) {
      toast.error("Error de validación", {
        description: validationError,
      })
      return
    }

    setUpdating(true)
    try {
      // Crear objeto de actualización con los items del pedido según el formato que espera el backend
      const updateOrderItems = orderItems.map((item) => {
        // NO incluir el id, solo los campos que acepta el DTO
        const orderItem = {
          productId: item.productId,
          quantity: Math.round(item.quantity * 100) / 100, // Asegurar 2 decimales
          price: Math.round(item.price * 100) / 100, // Asegurar 2 decimales
          unitMeasurementId: item.unitMeasurementId || 1,
        }

        return orderItem
      })

      // Crear el objeto de actualización con el formato correcto
      const updateData: UpdateOrderDto = {
        orderItems: updateOrderItems,
        totalAmount: calculateTotal(),
      }

      console.log("Enviando datos de actualización de productos:", updateData)

      // Usar el mismo endpoint que para actualizar el estado
      await api.patch(`/orders/${orderId}`, updateData)

      // Actualizar el pedido local con los nuevos items
      if (order) {
        // Crear una copia tipada correctamente
        const updatedOrderItems = orderItems.map((item) => ({ ...item })) as OrderItem[]

        setOrder({
          ...order,
          orderItems: updatedOrderItems,
          totalAmount: calculateTotal(),
        })
      }

      toast.success("Productos actualizados", {
        description: "Los productos del pedido han sido actualizados correctamente.",
      })

      setEditMode(false)
      setInputValues({})
      setProductSearch("")
    } catch (err) {
      console.error("Error al actualizar los productos:", err)
      const axiosError = err as AxiosError
      const errorMessage =
        (axiosError.response?.data as AxiosErrorResponse)?.message ||
        "No se pudieron actualizar los productos del pedido."
      toast.error("Error al actualizar", {
        description: errorMessage,
      })
    } finally {
      setUpdating(false)
    }
  }

  // Función para imprimir el pedido con estilos específicos
  const handlePrint = () => {
    if (!order) {
      toast.error("Error", {
        description: "No se puede imprimir. Pedido no encontrado.",
      })
      return
    }

    // Create print-specific styles
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
          .print-total { 
            text-align: right; 
            font-size: 18px; 
            font-weight: bold; 
            margin-top: 20px; 
          }
        }
      </style>
    `

    // Fix OrderStatus comparisons by using enum values
    const getStatusText = (status: OrderStatus) => {
      switch (status) {
        case OrderStatus.CREATED:
          return "Pendiente"
        case OrderStatus.PROCESS:
          return "En proceso"
        case OrderStatus.DELIVERED:
          return "Entregado"
        default:
          return status
      }
    }

    // Create HTML content for printing with null safety
    const printContent = `
      ${printStyles}
      <div class="print-section">
        <div class="print-header">
          <h1>PEDIDO #${order.id}</h1>
          <p>Estado: ${getStatusText(order.status)}</p>
          <p>Fecha: ${order.createdAt ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha no disponible"}</p>
        </div>
        
        <div class="print-info">
          <div>
            <h3>INFORMACIÓN DEL CLIENTE</h3>
            <p><strong>Cliente:</strong> ${order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : `Cliente #${order.userId}`}</p>
          ${order.customer?.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ""}
          ${order.customer?.phone ? `<p><strong>Teléfono:</strong> ${order.customer.phone}</p>` : ""}
          ${order.area ? `<p><strong>Área:</strong> ${order.area.name}</p>` : ""}
        </div>
        
        <div>
          <h3>DETALLES DE ENTREGA</h3>
          ${order.shippingAddress ? `<p><strong>Dirección:</strong> ${order.shippingAddress}</p>` : ""}
          ${order.deliveryDate ? `<p><strong>Fecha de entrega:</strong> ${format(new Date(order.deliveryDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>` : ""}
          ${(order as OrderWithObservation).observation ? `<p><strong>Observaciones:</strong> ${(order as OrderWithObservation).observation}</p>` : ""}
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
          ${orderItems
            .map(
              (item) => `
            <tr>
              <td>${item.product?.name || `Producto #${item.productId}`}</td>
              <td>${formatQuantity(item.quantity)}</td>
              <td>${item.unitMeasurement?.name || ""}</td>
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

      // Configure font
      doc.setFont("helvetica")

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(`PEDIDO #${order.id}`, 105, 20, { align: "center" })

      // Basic information
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      // Fix OrderStatus comparison
      const getStatusText = (status: OrderStatus) => {
        switch (status) {
          case OrderStatus.CREATED:
            return "Pendiente"
          case OrderStatus.PROCESS:
            return "En proceso"
          case OrderStatus.DELIVERED:
            return "Entregado"
          default:
            return status
        }
      }

      const statusText = getStatusText(order.status)
      doc.text(`Estado: ${statusText}`, 20, 35)

      const dateText = order.createdAt
        ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })
        : "Fecha no disponible"
      doc.text(`Fecha: ${dateText}`, 20, 45)

      // Customer information
      doc.setFont("helvetica", "bold")
      doc.text("INFORMACIÓN DEL CLIENTE", 20, 65)
      doc.setFont("helvetica", "normal")

      let yPos = 75
      const customerName = order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : `Cliente #${order.userId}`
      doc.text(`Cliente: ${customerName}`, 20, yPos)
      yPos += 10

      if (order.customer?.email) {
        doc.text(`Email: ${order.customer.email}`, 20, yPos)
        yPos += 10
      }

      if (order.customer?.phone) {
        doc.text(`Teléfono: ${order.customer.phone}`, 20, yPos)
        yPos += 10
      }

      if (order.area) {
        doc.text(`Área: ${order.area.name}`, 20, yPos)
        yPos += 10
      }

      if (order.shippingAddress) {
        doc.text(`Dirección: ${order.shippingAddress}`, 20, yPos)
        yPos += 10
      }

      if (order.deliveryDate) {
        const deliveryText = format(new Date(order.deliveryDate), "dd 'de' MMMM 'de' yyyy", { locale: es })
        doc.text(`Fecha de entrega: ${deliveryText}`, 20, yPos)
        yPos += 10
      }

      // Products section
      yPos += 15
      doc.setFont("helvetica", "bold")
      doc.text("PRODUCTOS", 20, yPos)
      yPos += 10

      // Create table manually
      const tableStartY = yPos
      const rowHeight = 10

      // Table header
      doc.setFont("helvetica", "bold")
      doc.setFillColor(240, 240, 240)
      doc.rect(20, tableStartY, 160, rowHeight, "F")

      // Header borders
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.rect(20, tableStartY, 160, rowHeight)

      // Vertical lines for header
      doc.line(120, tableStartY, 120, tableStartY + rowHeight)
      doc.line(150, tableStartY, 150, tableStartY + rowHeight)

      // Header text
      doc.text("Producto", 22, tableStartY + 7)
      doc.text("Cantidad", 122, tableStartY + 7)
      doc.text("Unidad", 152, tableStartY + 7)

      // Table rows
      doc.setFont("helvetica", "normal")
      let currentY = tableStartY + rowHeight

      orderItems.forEach((item, index) => {
        // Row background (alternating)
        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, currentY, 160, rowHeight, "F")
        }

        // Row borders
        doc.setDrawColor(0, 0, 0)
        doc.rect(20, currentY, 160, rowHeight)

        // Vertical lines
        doc.line(120, currentY, 120, currentY + rowHeight)
        doc.line(150, currentY, 150, currentY + rowHeight)

        // Row data
        const productName = item.product?.name || `Producto #${item.productId}`
        const quantity = formatQuantity(item.quantity)
        const unit = item.unitMeasurement?.name || ""

        // Truncate long product names
        const maxProductNameLength = 35
        const truncatedProductName =
          productName.length > maxProductNameLength
            ? productName.substring(0, maxProductNameLength) + "..."
            : productName

        doc.text(truncatedProductName, 22, currentY + 7)
        doc.text(quantity, 122, currentY + 7)
        doc.text(unit, 152, currentY + 7)

        currentY += rowHeight
      })

      // Final border for table
      doc.rect(20, tableStartY, 160, currentY - tableStartY)

      // Observations if they exist
      const orderWithObservation = order as OrderWithObservation
      const finalY = currentY + 20

      if (orderWithObservation.observation) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("OBSERVACIONES:", 20, finalY)
        doc.setFont("helvetica", "normal")

        // Split long text into multiple lines
        const splitText = doc.splitTextToSize(orderWithObservation.observation, 170)
        doc.text(splitText, 20, finalY + 10)
      }

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

  const handleRemoveProduct = (index: number) => {
    const newItems = [...orderItems]
    newItems.splice(index, 1)
    setOrderItems(newItems)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error || "No se encontró el pedido solicitado."}</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/orders">Volver a pedidos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex flex-wrap items-center gap-3">
            Pedido #{order.id}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-muted-foreground mt-1">
            {order.createdAt
              ? `Realizado el ${format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}`
              : "Fecha no disponible"}
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información del cliente */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Información del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Cliente</h3>
                <p className="text-sm">
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : `Cliente #${order.userId}`}
                </p>
                {order.customer?.email && <p className="text-sm text-muted-foreground">{order.customer.email}</p>}
                {order.customer?.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
              </div>

              {order.area && (
                <div>
                  <h3 className="font-medium">Área</h3>
                  <p className="text-sm">{order.area.name}</p>
                </div>
              )}

              {order.shippingAddress && (
                <div>
                  <h3 className="font-medium">Dirección de envío</h3>
                  <p className="text-sm">{order.shippingAddress}</p>
                </div>
              )}

              {order.deliveryDate && (
                <div>
                  <h3 className="font-medium">Fecha de entrega</h3>
                  <p className="text-sm">
                    {format(new Date(order.deliveryDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalles del pedido */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Detalles del pedido</CardTitle>
            {editMode ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar producto por nombre o ID..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {productSearch.trim() !== "" && filteredProducts.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium">Producto</th>
                            <th className="px-4 py-2 text-center text-xs font-medium">Unidad</th>
                            <th className="px-4 py-2 text-center text-xs font-medium w-16">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.slice(0, 5).map((product) => (
                            <tr key={product.id} className="border-t hover:bg-muted/30">
                              <td className="px-4 py-2 text-sm">{product.id}</td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                  {product.imageUrl && (
                                    <div className="relative w-6 h-6">
                                      <Image
                                        src={product.imageUrl || "/placeholder.svg"}
                                        alt={product.name}
                                        fill
                                        className="rounded-md object-cover"
                                        sizes="24px"
                                      />
                                    </div>
                                  )}
                                  <span>{product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Select
                                  defaultValue={
                                    product.productUnits && product.productUnits.length > 0
                                      ? product.productUnits[0].unitMeasurementId.toString()
                                      : ""
                                  }
                                  onValueChange={(value) => {
                                    // Almacenar temporalmente la unidad seleccionada
                                    product.selectedUnitId = Number(value)
                                  }}
                                >
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue placeholder="Unidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {product.productUnits?.map((unit) => (
                                      <SelectItem
                                        key={unit.unitMeasurementId}
                                        value={unit.unitMeasurementId.toString()}
                                      >
                                        {unit.unitMeasurement.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    const unitId =
                                      product.selectedUnitId ||
                                      (product.productUnits && product.productUnits.length > 0
                                        ? product.productUnits[0].unitMeasurementId
                                        : 1)

                                    const unit = product.productUnits?.find(
                                      (u) => u.unitMeasurementId === unitId,
                                    )?.unitMeasurement

                                    const newItem: OrderItem = {
                                      productId: product.id,
                                      quantity: 1,
                                      price: product.price,
                                      unitMeasurementId: unitId,
                                      product: product,
                                      unitMeasurement: unit,
                                    }

                                    setOrderItems([...orderItems, newItem])
                                    setProductSearch("")
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1">
                Editar productos
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Producto</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Cantidad</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Unidad</th>
                      {editMode && <th className="px-4 py-3 text-center text-sm font-medium w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={item.id || index} className="border-t">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {item.product?.imageUrl && (
                              <div className="relative w-8 h-8">
                                <Image
                                  src={item.product.imageUrl || "/placeholder.svg"}
                                  alt={item.product?.name || `Producto ${item.productId}`}
                                  fill
                                  className="rounded-md object-cover"
                                  sizes="32px"
                                />
                              </div>
                            )}
                            <div>
                              <span className="block">{item.product?.name || `Producto #${item.productId}`}</span>
                              <span className="text-xs text-muted-foreground">#{item.productId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {editMode ? (
                            <Input
                              type="text"
                              value={
                                // Usar el valor del input si existe, sino usar el valor numérico
                                inputValues[index] !== undefined
                                  ? inputValues[index]
                                  : item.quantity === 0
                                    ? ""
                                    : item.quantity.toString()
                              }
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              className="w-20 mx-auto text-center"
                              placeholder="0.00"
                              inputMode="decimal"
                            />
                          ) : (
                            formatQuantity(item.quantity)
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {editMode ? (
                            <Select
                              value={item.unitMeasurementId?.toString() || ""}
                              onValueChange={(value) => handleUnitChange(index, Number(value))}
                            >
                              <SelectTrigger className="w-24 mx-auto">
                                <SelectValue placeholder="Unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {item.product?.productUnits?.map((unit) => (
                                  <SelectItem key={unit.unitMeasurementId} value={unit.unitMeasurementId.toString()}>
                                    {unit.unitMeasurement.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            item.unitMeasurement?.name || ""
                          )}
                        </td>
                        {editMode && (
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(index)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editMode && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={restoreOriginalItems}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateProducts}
                    disabled={updating || orderItems.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Estado del pedido</h3>
                  <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.CREATED}>Pendiente</SelectItem>
                      <SelectItem value={OrderStatus.PROCESS}>En proceso</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Observaciones</h3>
                  <Textarea
                    placeholder="Añadir observaciones sobre el pedido..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateStatus} disabled={updating} className="bg-green-600 hover:bg-green-700">
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar estado"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
