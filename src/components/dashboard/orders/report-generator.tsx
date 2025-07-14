"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { format, addDays } from "date-fns"
import { FileSpreadsheet, FileIcon as FilePdf, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/lib/axiosInstance"
import type { DateRange } from "react-day-picker"
import { Input } from "@/components/ui/input"

// Update the interfaces to match the backend structure
interface Area {
  id: number
  name: string
  companyId?: number
  color: string // Now required hexadecimal color
}

interface Company {
  id: number
  name: string
  areas?: Area[]
  color?: string // Color de la empresa
}

interface User {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  role?: string
  areas?: Area[]
}

interface Product {
  id: number
  name: string
  price: number
  unitMeasurementId: number
  unitMeasurement?: UnitMeasurement
  categoryId?: number
  category?: ProductCategory
}

interface ProductCategory {
  id: number
  name: string
}

interface UnitMeasurement {
  id: number
  name: string
  abbreviation?: string
  description?: string
}

interface OrderItem {
  id?: number
  orderId?: number
  productId: number
  quantity: number
  price: number
  unitMeasurementId?: number
  unitMeasurement?: UnitMeasurement
  product?: Product
}

interface Order {
  id: number
  userId: number
  user?: User
  areaId?: number
  area?: Area
  totalAmount: number
  status: string
  observation?: string
  orderItems: OrderItem[]
  createdAt?: string
}

// Interfaz para el tipo de celda de Excel con estilos y rich text
interface StyledCell {
  v?: string | number // valor
  r?: Array<{
    t: string
    s: {
      font: {
        name: string
        sz: number
        bold: boolean
        color: { rgb: string }
      }
    }
  }> // rich text array
  t: string // tipo
  s: {
    font?: {
      bold?: boolean
      color?: { rgb: string }
      sz?: number
      name?: string
    }
    fill?: {
      fgColor: { rgb: string }
    }
    alignment?: {
      horizontal: string
      vertical?: string
      wrapText?: boolean
    }
    border?: {
      top?: { style: string; color?: { rgb: string } }
      left?: { style: string; color?: { rgb: string } }
      bottom?: { style: string; color?: { rgb: string } }
      right?: { style: string; color?: { rgb: string } }
    }
  }
}

// Replace the existing ReportGenerator component with this updated version
export function ReportGenerator() {
  const [reportType, setReportType] = useState<"day" | "range">("day")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportDate, setReportDate] = useState<string>(format(new Date(), "dd/MM/yyyy"))
  const [hasData, setHasData] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null)

  // Estados para datos reales
  const [companies, setCompanies] = useState<Company[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productQuantities, setProductQuantities] = useState<{ [areaId: number]: { [productId: number]: number } }>({})
  const [categories, setCategories] = useState<{ [id: number]: ProductCategory }>({})
  const [areasWithOrders, setAreasWithOrders] = useState<number[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar usuarios, compañías, productos y unidades de medida
        const [companiesResponse, productsResponse, unitMeasurementsResponse, categoriesResponse] = await Promise.all([
          api.get("/company"),
          api.get("/products"),
          api.get("/unit-measurements"),
          api.get("/categories"),
        ])

        const companiesData = companiesResponse.data
        const productsData = productsResponse.data
        const unitMeasurementsData = unitMeasurementsResponse.data
        const categoriesData = categoriesResponse.data || []

        // Procesar categorías
        const categoriesMap: { [id: number]: ProductCategory } = {}
        categoriesData.forEach((category: ProductCategory) => {
          categoriesMap[category.id] = category
        })
        setCategories(categoriesMap)

        // Procesar compañías - ya no necesitamos asignar colores aquí
        const processedCompanies = Array.isArray(companiesData) ? companiesData : [companiesData]
        setCompanies(processedCompanies)

        // Extraer todas las áreas de las compañías - ahora usan el color hexadecimal del área
        const allAreas: Area[] = []
        processedCompanies.forEach((company: Company) => {
          if (company.areas && Array.isArray(company.areas)) {
            // Las áreas ya vienen con su color hexadecimal
            allAreas.push(...company.areas)
          }
        })
        setAreas(allAreas)

        // Asignar unidades de medida a los productos
        const productsWithUnits = productsData.map((product: Product) => {
          const unitMeasurement = unitMeasurementsData.find(
            (unit: UnitMeasurement) => unit.id === product.unitMeasurementId,
          )
          return {
            ...product,
            unitMeasurement,
            category: categoriesMap[product.categoryId || 0],
          }
        })
        setProducts(productsWithUnits)
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error)
        toast.error("Error al cargar datos", {
          description: "No se pudieron cargar los datos necesarios para el reporte.",
        })
      }
    }

    loadInitialData()
  }, [])

  // Función para convertir color hexadecimal a RGB para Excel
  const hexToRgb = (hex: string): string => {
    // Remover el # si está presente
    const cleanHex = hex.replace("#", "")
    // Si es un color de 3 caracteres, expandirlo a 6
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split("")
            .map((char) => char + char)
            .join("")
        : cleanHex
    return fullHex.toUpperCase()
  }

  // Función para determinar si el texto debe ser blanco o negro basado en el color de fondo
  const getTextColor = (): string => {
    // Siempre usar texto negro
    return "000000"
  }

  // Función CORREGIDA para obtener observaciones por área
  const getObservationsByArea = () => {
    const observationsByArea: { [areaId: number]: string[] } = {}

    console.log("Procesando observaciones de órdenes:", orders.length)

    orders.forEach((order) => {
      if (order.observation && order.observation.trim()) {
        const areaId = order.areaId || order.area?.id
        console.log(`Orden ${order.id}: observación="${order.observation}", areaId=${areaId}`)

        if (areaId) {
          if (!observationsByArea[areaId]) {
            observationsByArea[areaId] = []
          }
          // Evitar duplicados en la misma área
          if (!observationsByArea[areaId].includes(order.observation.trim())) {
            observationsByArea[areaId].push(order.observation.trim())
          }
        }
      }
    })

    console.log("Observaciones por área:", observationsByArea)
    return observationsByArea
  }

  // Agrupar áreas por compañía
  const getAreasByCompany = () => {
    const areasByCompany: { [companyId: number]: Area[] } = {}
    companies.forEach((company) => {
      areasByCompany[company.id] = []
    })
    areas.forEach((area) => {
      if (area.companyId && areasByCompany[area.companyId]) {
        areasByCompany[area.companyId].push(area)
      }
    })
    return areasByCompany
  }

  // FUNCIÓN CORREGIDA: Obtener cantidad de producto por empresa para Excel con COLORES POR ÁREA
  const getProductQuantityForExcel = (productId: number, companyId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) {
      return { text: "", color: "000000", hasData: false }
    }

    const quantities: string[] = []
    let dominantColor = "000000"

    // Buscar cantidades en cada área de la empresa
    companyAreas.forEach((area, index) => {
      if (productQuantities[area.id] && productQuantities[area.id][productId]) {
        // Buscar en las órdenes los items con este productId y areaId
        let foundInOrders = false
        for (const order of orders) {
          if (order.areaId === area.id) {
            for (const item of order.orderItems) {
              if (item.productId === productId) {
                const unit = item.unitMeasurement?.name || ""
                quantities.push(`${item.quantity}${unit}`)
                // Usar el color de la primera área como dominante
                if (index === 0) {
                  dominantColor = hexToRgb(area.color)
                }
                foundInOrders = true
              }
            }
          }
        }
        // Si no encontramos nada en las órdenes, usar la cantidad del estado
        if (!foundInOrders && productQuantities[area.id][productId]) {
          const product = products.find((p) => p.id === productId)
          const unit = product?.unitMeasurement?.name || ""
          quantities.push(`${productQuantities[area.id][productId]}${unit}`)
          // Usar el color de la primera área como dominante
          if (index === 0) {
            dominantColor = hexToRgb(area.color)
          }
        }
      }
    })

    if (quantities.length === 0) {
      return { text: "", color: "000000", hasData: false }
    }

    // Retornar texto simple concatenado con color dominante
    return {
      text: quantities.join(" + "),
      color: dominantColor,
      hasData: true,
    }
  }

  // Función para generar PDF igual que el preview - VERSIÓN SIMPLE SIN AUTOTABLE
  const generatePDF = async () => {
    try {
      // Importar solo jsPDF
      const { default: jsPDF } = await import("jspdf")

      // Crear nuevo documento PDF
      const doc = new jsPDF("landscape", "mm", "a4")

      // Configurar fuente
      doc.setFont("helvetica")
      let yPosition = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20

      // Título del documento
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Reporte de Productos por Empresa", margin, yPosition)
      yPosition += 10

      // Fecha del reporte
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha: ${reportDate}`, margin, yPosition)
      yPosition += 15

      // Obtener productos agrupados por categoría
      const productsByCategory = getProductsForReport()

      // Filtrar compañías que tienen áreas con pedidos
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area: Area) => areasWithOrders.includes(area.id))
      })

      // MANTENER EL ORDEN ESPECÍFICO
      const categoryOrder = [1, 2, 5, 3, 4]

      // Crear array ordenado de categorías que existen
      const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
        .filter((categoryId) => productsByCategory[categoryId])
        .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

      // Agregar cualquier categoría adicional que no esté en el orden específico
      Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        if (!categoryOrder.includes(categoryId)) {
          orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
        }
      })

      // Calcular anchos de columna
      const totalCompanies = companiesWithOrders.length
      const firstColumnWidth = 60
      const companyColumnWidth = totalCompanies > 0 ? (pageWidth - margin * 2 - firstColumnWidth) / totalCompanies : 50

      // Procesar cada categoría
      for (const [categoryIdStr, categoryProducts] of orderedCategoryEntries) {
        const categoryId = Number.parseInt(categoryIdStr)
        const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

        // Filtrar solo productos con pedidos
        const productsWithOrders = categoryProducts
          .filter((product: Product) => {
            for (const areaId in productQuantities) {
              if (productQuantities[areaId][product.id]) {
                return true
              }
            }
            return false
          })
          .sort((a: Product, b: Product) => a.name.localeCompare(b.name))

        // Si no hay productos con pedidos en esta categoría, omitir
        if (productsWithOrders.length === 0) continue

        // Verificar si necesitamos una nueva página
        const estimatedHeight = (productsWithOrders.length + 3) * 8 // 3 filas extra para headers y total
        if (yPosition + estimatedHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        // Dibujar encabezado de categoría
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")

        // Fila de fecha
        doc.setFillColor(255, 255, 255)
        doc.rect(margin, yPosition, pageWidth - margin * 2, 6, "F")
        doc.text(`fecha: ${reportDate}`, margin + 2, yPosition + 4)
        yPosition += 6

        // Fila de encabezados
        let xPosition = margin

        // Encabezado de categoría
        doc.setFillColor(242, 242, 242)
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "S")
        doc.text(categoryName.toUpperCase(), xPosition + 2, yPosition + 5)
        xPosition += firstColumnWidth

        // Encabezados de compañías
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          // Usar color de la empresa o de la primera área
          const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
          const rgb = hexToRgb(companyColor)
          const r = Number.parseInt(rgb.substring(0, 2), 16)
          const g = Number.parseInt(rgb.substring(2, 4), 16)
          const b = Number.parseInt(rgb.substring(4, 6), 16)

          doc.setFillColor(r, g, b)
          doc.rect(xPosition, yPosition, companyColumnWidth, 8, "F")
          doc.rect(xPosition, yPosition, companyColumnWidth, 8, "S")
          doc.setTextColor(0, 0, 0)

          // Centrar texto
          const textWidth = doc.getTextWidth(company.name.toUpperCase())
          const textX = xPosition + (companyColumnWidth - textWidth) / 2
          doc.text(company.name.toUpperCase(), textX, yPosition + 5)
          xPosition += companyColumnWidth
        })

        yPosition += 8

        // Filas de productos
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)

        productsWithOrders.forEach((product: Product) => {
          xPosition = margin

          // Nombre del producto
          doc.setFillColor(255, 255, 255)
          doc.rect(xPosition, yPosition, firstColumnWidth, 6, "F")
          doc.rect(xPosition, yPosition, firstColumnWidth, 6, "S")
          doc.setTextColor(0, 0, 0)
          doc.text(product.name, xPosition + 2, yPosition + 4)
          xPosition += firstColumnWidth

          // Cantidades por empresa
          companiesWithOrders.forEach((company) => {
            const companyAreas =
              getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
            if (companyAreas.length === 0) return

            doc.setFillColor(255, 255, 255)
            doc.rect(xPosition, yPosition, companyColumnWidth, 6, "F")
            doc.rect(xPosition, yPosition, companyColumnWidth, 6, "S")

            // Obtener cantidades por empresa con colores (igual que el preview)
            const quantities: Array<{ quantity: string; color: string }> = []

            companyAreas.forEach((area) => {
              if (productQuantities[area.id] && productQuantities[area.id][product.id]) {
                // Buscar en las órdenes los items con este productId y areaId
                let foundInOrders = false
                for (const order of orders) {
                  if (order.areaId === area.id) {
                    for (const item of order.orderItems) {
                      if (item.productId === product.id) {
                        const unit = item.unitMeasurement?.name || ""
                        quantities.push({
                          quantity: `${item.quantity}${unit}`,
                          color: area.color,
                        })
                        foundInOrders = true
                      }
                    }
                  }
                }

                // Si no encontramos nada en las órdenes, usar la cantidad del estado
                if (!foundInOrders && productQuantities[area.id][product.id]) {
                  const productData = products.find((p) => p.id === product.id)
                  const unit = productData?.unitMeasurement?.name || ""
                  quantities.push({
                    quantity: `${productQuantities[area.id][product.id]}${unit}`,
                    color: area.color,
                  })
                }
              }
            })

            // Renderizar cada cantidad con su color correspondiente
            if (quantities.length > 0) {
              let currentX = xPosition + 2
              const cellWidth = companyColumnWidth - 4
              const maxTextWidth = cellWidth

              quantities.forEach((item, index) => {
                // Convertir color hex a RGB
                const rgb = hexToRgb(item.color)
                const r = Number.parseInt(rgb.substring(0, 2), 16)
                const g = Number.parseInt(rgb.substring(2, 4), 16)
                const b = Number.parseInt(rgb.substring(4, 6), 16)

                // Establecer color del texto
                doc.setTextColor(r, g, b)

                // Calcular ancho del texto actual
                const textWidth = doc.getTextWidth(item.quantity)
                const separatorWidth = index < quantities.length - 1 ? doc.getTextWidth(" + ") : 0

                // Verificar si el texto cabe en la celda
                if (currentX + textWidth - (xPosition + 2) <= maxTextWidth) {
                  doc.text(item.quantity, currentX, yPosition + 4)
                  currentX += textWidth

                  // Agregar separador si no es el último elemento
                  if (index < quantities.length - 1) {
                    doc.setTextColor(0, 0, 0) // Color negro para el separador
                    doc.text(" + ", currentX, yPosition + 4)
                    currentX += separatorWidth
                  }
                } else {
                  // Si no cabe, truncar y mostrar "..."
                  doc.setTextColor(0, 0, 0)
                  doc.text("...", currentX, yPosition + 4)
                  return // break
                }
              })
            }

            // Resetear color del texto a negro
            doc.setTextColor(0, 0, 0)
            xPosition += companyColumnWidth
          })

          yPosition += 6
        })

        // Fila de totales
        xPosition = margin
        doc.setFont("helvetica", "bold")

        // Total label
        doc.setFillColor(255, 255, 255)
        doc.rect(xPosition, yPosition, firstColumnWidth, 6, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 6, "S")
        doc.text("TOTAL", xPosition + 2, yPosition + 4)
        xPosition += firstColumnWidth

        // Totales por empresa
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          doc.setFillColor(255, 255, 255)
          doc.rect(xPosition, yPosition, companyColumnWidth, 6, "F")
          doc.rect(xPosition, yPosition, companyColumnWidth, 6, "S")

          const total = calculateCompanyTotalByCategory(company.id, categoryId)
          doc.text(total.toString(), xPosition + 2, yPosition + 4)
          xPosition += companyColumnWidth
        })

        yPosition += 10
      }

      // SECCIÓN DE OBSERVACIONES CORREGIDA
      const observationsByArea = getObservationsByArea()
      const hasObservations = Object.keys(observationsByArea).length > 0

      console.log("¿Hay observaciones para PDF?", hasObservations, observationsByArea)

      if (hasObservations) {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = margin
        }

        // Título de observaciones
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        let xPosition = margin

        // Encabezado de observaciones
        doc.setFillColor(255, 255, 0)
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "S")
        doc.setTextColor(0, 0, 0)
        doc.text("OBSERVACION", xPosition + 2, yPosition + 5)
        xPosition += firstColumnWidth

        // Encabezados de compañías para observaciones
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
          const rgb = hexToRgb(companyColor)
          const r = Number.parseInt(rgb.substring(0, 2), 16)
          const g = Number.parseInt(rgb.substring(2, 4), 16)
          const b = Number.parseInt(rgb.substring(4, 6), 16)

          doc.setFillColor(r, g, b)
          doc.rect(xPosition, yPosition, companyColumnWidth, 8, "F")
          doc.rect(xPosition, yPosition, companyColumnWidth, 8, "S")

          const textWidth = doc.getTextWidth(company.name.toUpperCase())
          const textX = xPosition + (companyColumnWidth - textWidth) / 2
          doc.text(company.name.toUpperCase(), textX, yPosition + 5)
          xPosition += companyColumnWidth
        })

        yPosition += 8

        // Fila de detalles de observaciones
        xPosition = margin
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)

        doc.setFillColor(255, 255, 200)
        doc.rect(xPosition, yPosition, firstColumnWidth, 12, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 12, "S")
        doc.text("Detalle", xPosition + 2, yPosition + 7)
        xPosition += firstColumnWidth

        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          doc.setFillColor(255, 255, 200)
          doc.rect(xPosition, yPosition, companyColumnWidth, 12, "F")
          doc.rect(xPosition, yPosition, companyColumnWidth, 12, "S")

          // Combinar observaciones de todas las áreas de la empresa
          const allObservations: string[] = []
          companyAreas.forEach((area) => {
            const areaObservations = observationsByArea[area.id] || []
            allObservations.push(...areaObservations)
          })

          const uniqueObservations = [...new Set(allObservations)]
          const observationText = uniqueObservations.join("; ")

          console.log(`Observaciones para empresa ${company.name}:`, observationText)

          // Dividir texto largo en múltiples líneas
          const maxWidth = companyColumnWidth - 4
          const lines = doc.splitTextToSize(observationText, maxWidth)
          let lineY = yPosition + 4

          lines.slice(0, 2).forEach((line: string) => {
            // Máximo 2 líneas
            doc.text(line, xPosition + 2, lineY)
            lineY += 3
          })

          xPosition += companyColumnWidth
        })
      }

      // Generar blob del PDF
      const pdfBlob = doc.output("blob")
      setGeneratedPdfBlob(pdfBlob)

      // Descargar PDF
      doc.save(`Reporte_Productos_${reportDate.replace(/\//g, "-").replace(/\s/g, "_")}.pdf`)

      toast.success("Reporte PDF generado", {
        description: "El archivo PDF se ha descargado correctamente.",
      })

      return pdfBlob
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF", {
        description: `No se pudo generar el archivo PDF: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
      return null
    }
  }

  // Función para descargar PDF
  const downloadPDF = async () => {
    if (!hasData) {
      toast.error("No hay datos para generar el PDF", {
        description: "No se encontraron órdenes para el período seleccionado.",
      })
      return
    }

    await generatePDF()
  }

  // Generar y descargar Excel - VERSIÓN CORREGIDA que primero genera PDF
  const downloadExcel = async () => {
    try {
      // Verificar si hay datos para generar el Excel
      if (!hasData) {
        toast.error("No hay datos para generar el Excel", {
          description: "No se encontraron órdenes para el período seleccionado.",
        })
        return
      }

      // Primero generar el PDF si no existe
      let pdfBlob = generatedPdfBlob
      if (!pdfBlob) {
        pdfBlob = await generatePDF()
        if (!pdfBlob) {
          toast.error("Error al generar PDF base", {
            description: "No se pudo generar el PDF necesario para crear el Excel.",
          })
          return
        }
      }

      // Importar xlsx-js-style dinámicamente
      const XLSX_STYLE = await import("xlsx-js-style")

      // Crear un nuevo libro de Excel
      const wb = XLSX_STYLE.utils.book_new()

      // Crear datos para el Excel con estilos
      const excelData: StyledCell[][] = []

      // Estilo base para todas las celdas
      const baseStyle = {
        font: { name: "Calibri", sz: 11, bold: false },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      }

      // Obtener productos agrupados por categoría (igual que el preview)
      const productsByCategory = getProductsForReport()

      // Filtrar compañías que tienen áreas con pedidos (igual que el preview)
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area: Area) => areasWithOrders.includes(area.id))
      })

      // MANTENER EL ORDEN ESPECÍFICO (igual que el preview)
      const categoryOrder = [1, 2, 5, 3, 4]

      // Crear array ordenado de categorías que existen
      const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
        .filter((categoryId) => productsByCategory[categoryId])
        .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

      // Agregar cualquier categoría adicional que no esté en el orden específico
      Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        if (!categoryOrder.includes(categoryId)) {
          orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
        }
      })

      // Procesar cada categoría (replicando exactamente el preview)
      orderedCategoryEntries.forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

        // Filtrar solo productos con pedidos (igual que el preview)
        const productsWithOrders = categoryProducts
          .filter((product: Product) => {
            // Verificar si hay algún pedido para este producto en cualquier área
            for (const areaId in productQuantities) {
              if (productQuantities[areaId][product.id]) {
                return true
              }
            }
            return false
          })
          .sort((a: Product, b: Product) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente

        // Si no hay productos con pedidos en esta categoría, omitir
        if (productsWithOrders.length === 0) return

        // Agregar fila de fecha (igual que el preview)
        const dateRow: StyledCell[] = [
          {
            v: `fecha: ${reportDate}`,
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true },
              fill: { fgColor: { rgb: "FFFFFF" } },
            },
          },
        ]

        // Rellenar el resto de columnas para la fecha
        companiesWithOrders.forEach(() => {
          dateRow.push({
            v: "",
            t: "s",
            s: {
              ...baseStyle,
              fill: { fgColor: { rgb: "FFFFFF" } },
            },
          })
        })
        excelData.push(dateRow)

        // Preparar la fila de encabezados de compañías (igual que el preview)
        const companyRow: StyledCell[] = [
          {
            v: categoryName.toUpperCase(),
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true },
              fill: { fgColor: { rgb: "F2F2F2" } },
            },
          },
        ]

        // Agregar compañías a la fila de encabezado (igual que el preview)
        companiesWithOrders.forEach((company) => {
          // Filtrar solo áreas con pedidos para verificar si la empresa tiene pedidos
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) {
            return // Saltar esta compañía si no tiene áreas con pedidos
          }

          // Usar el color de la empresa si está disponible, sino el color de la primera área
          const companyColor = company.color ? hexToRgb(company.color) : hexToRgb(companyAreas[0]?.color || "#CCCCCC")

          // Agregar la compañía
          companyRow.push({
            v: company.name.toUpperCase(),
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true, color: { rgb: "000000" } },
              fill: { fgColor: { rgb: companyColor } },
              alignment: { horizontal: "center" },
            },
          })
        })
        excelData.push(companyRow)

        // Agregar productos de esta categoría (igual que el preview)
        productsWithOrders.forEach((product: Product) => {
          const productRow: StyledCell[] = [
            {
              v: product.name,
              t: "s",
              s: {
                ...baseStyle,
                fill: { fgColor: { rgb: "FFFFFF" } },
                alignment: { horizontal: "left" },
              },
            },
          ]

          // Agregar cantidades por empresa (MÉTODO SIMPLE QUE SÍ FUNCIONA)
          companiesWithOrders.forEach((company) => {
            const companyAreas =
              getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
            if (companyAreas.length === 0) {
              return // Saltar esta compañía si no tiene áreas con pedidos
            }

            // Obtener la cantidad como texto simple con color
            const quantityInfo = getProductQuantityForExcel(product.id, company.id)
            if (quantityInfo.hasData && quantityInfo.text) {
              productRow.push({
                v: quantityInfo.text, // TEXTO SIMPLE QUE SÍ SE VE
                t: "s",
                s: {
                  ...baseStyle,
                  font: {
                    ...baseStyle.font,
                    bold: true,
                    color: { rgb: quantityInfo.color }, // Color dominante del área
                    sz: 12,
                  },
                  fill: { fgColor: { rgb: "FFFFFF" } },
                  alignment: { horizontal: "left" },
                  border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                  },
                },
              })
            } else {
              // Celda vacía si no hay cantidades
              productRow.push({
                v: "",
                t: "s",
                s: {
                  ...baseStyle,
                  fill: { fgColor: { rgb: "FFFFFF" } },
                  alignment: { horizontal: "left" },
                },
              })
            }
          })
          excelData.push(productRow)
        })

        // Agregar fila de totales para esta categoría (igual que el preview)
        const totalRow: StyledCell[] = [
          {
            v: "TOTAL",
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true },
              fill: { fgColor: { rgb: "FFFFFF" } },
              alignment: { horizontal: "left" },
            },
          },
        ]

        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) {
            return // Saltar esta compañía si no tiene áreas con pedidos
          }

          // Calcular total contando productos únicos para esta categoría en toda la empresa
          const total = calculateCompanyTotalByCategory(company.id, categoryId)
          totalRow.push({
            v: total ? `${total}` : "0",
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true },
              alignment: { horizontal: "left" },
              fill: { fgColor: { rgb: "FFFFFF" } },
            },
          })
        })
        excelData.push(totalRow)

        // Agregar fila vacía para separación entre categorías
        excelData.push([])
      })

      // SECCIÓN DE OBSERVACIONES CORREGIDA PARA EXCEL
      const observationsByArea = getObservationsByArea()
      const hasObservations = Object.keys(observationsByArea).length > 0

      console.log("¿Hay observaciones para Excel?", hasObservations, observationsByArea)

      if (hasObservations) {
        // Fila de observaciones
        const observationRow: StyledCell[] = [
          {
            v: "OBSERVACION",
            t: "s",
            s: {
              ...baseStyle,
              font: { ...baseStyle.font, bold: true },
              fill: { fgColor: { rgb: "FFFF00" } }, // Amarillo
              alignment: { horizontal: "left" },
            },
          },
        ]

        // Agregar observaciones por empresa (igual que el preview)
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) {
            return
          }

          // Combinar observaciones de todas las áreas de la empresa
          const allObservations: string[] = []
          companyAreas.forEach((area) => {
            const areaObservations = observationsByArea[area.id] || []
            allObservations.push(...areaObservations)
          })

          // Eliminar duplicados y unir
          const uniqueObservations = [...new Set(allObservations)]
          const observationText = uniqueObservations.join("; ")

          console.log(`Observaciones Excel para empresa ${company.name}:`, observationText)

          observationRow.push({
            v: observationText,
            t: "s",
            s: {
              ...baseStyle,
              fill: { fgColor: { rgb: "FFFF99" } }, // Amarillo claro
              alignment: { horizontal: "left", wrapText: true },
            },
          })
        })
        excelData.push(observationRow)
      }

      // Crear hoja de cálculo
      const ws = XLSX_STYLE.utils.aoa_to_sheet(excelData)

      // Definir anchos de columna
      const wscols = [
        { wch: 40 }, // Nombre del producto/categoría
      ]

      // Agregar anchos para las columnas de empresas
      companiesWithOrders.forEach(() => {
        wscols.push({ wch: 25 }) // Ancho para empresa
      })

      ws["!cols"] = wscols

      // Agregar hoja al libro con nombre único
      XLSX_STYLE.utils.book_append_sheet(wb, ws, "Reporte de Productos")

      // Generar archivo y descargar
      XLSX_STYLE.writeFile(wb, `Reporte_Productos_${reportDate.replace(/\//g, "-").replace(/\s/g, "_")}.xlsx`)

      toast.success("Reporte Excel generado", {
        description: "El archivo Excel se ha descargado correctamente basado en el PDF generado.",
      })
    } catch (error) {
      console.error("Error al generar Excel:", error)
      toast.error("Error al generar Excel", {
        description: "No se pudo generar el archivo Excel.",
      })
    }
  }

  // Modificar la función getProductsForReport para agrupar por categoría
  const getProductsForReport = () => {
    // Si tenemos productos reales, usarlos agrupados por categoría
    if (products.length > 0) {
      // Agrupar productos por categoría
      const productsByCategory: { [categoryId: number]: Product[] } = {}
      products.forEach((product) => {
        const categoryId = product.categoryId || 0
        if (!productsByCategory[categoryId]) {
          productsByCategory[categoryId] = []
        }
        productsByCategory[categoryId].push(product)
      })

      // Ordenar productos alfabéticamente dentro de cada categoría
      Object.keys(productsByCategory).forEach((categoryId) => {
        productsByCategory[Number(categoryId)].sort((a: Product, b: Product) => a.name.localeCompare(b.name))
      })

      // ORDEN ESPECÍFICO REQUERIDO: 1=Verduras, 2=Frutas, 5=Hierbas, 3=IGV, 4=Otros
      const categoryOrder = [1, 2, 5, 3, 4]
      const orderedCategories: { [categoryId: number]: Product[] } = {}

      // Aplicar el orden específico - FORZAR este orden exacto
      categoryOrder.forEach((categoryId) => {
        if (productsByCategory[categoryId] && productsByCategory[categoryId].length > 0) {
          orderedCategories[categoryId] = productsByCategory[categoryId]
        }
      })

      // Agregar cualquier categoría que no esté en el orden específico al final
      Object.keys(productsByCategory).forEach((categoryIdStr) => {
        const categoryId = Number(categoryIdStr)
        if (!categoryOrder.includes(categoryId) && productsByCategory[categoryId].length > 0) {
          orderedCategories[categoryId] = productsByCategory[categoryId]
        }
      })

      return orderedCategories
    }

    // Datos de demostración mínimos con el orden correcto y propiedades completas
    const demoData: { [categoryId: number]: Product[] } = {}

    // IMPORTANTE: Crear el objeto en el orden específico requerido
    // 1=Verduras, 2=Frutas, 5=Hierbas, 3=IGV, 4=Otros
    demoData[1] = [
      {
        id: 1,
        name: "Acelga",
        price: 0,
        unitMeasurementId: 1,
        unitMeasurement: { id: 1, name: "kg-mz", abbreviation: "kg-mz" },
        categoryId: 1,
      },
    ]

    demoData[2] = [
      {
        id: 4,
        name: "Manzana",
        price: 0,
        unitMeasurementId: 2,
        unitMeasurement: { id: 2, name: "kg", abbreviation: "kg" },
        categoryId: 2,
      },
    ]

    demoData[5] = [
      {
        id: 6,
        name: "Huatacay",
        price: 0,
        unitMeasurementId: 1,
        unitMeasurement: { id: 1, name: "kg-mz", abbreviation: "kg-mz" },
        categoryId: 5,
      },
    ]

    demoData[3] = [
      {
        id: 8,
        name: "IGV Product",
        price: 0,
        unitMeasurementId: 2,
        unitMeasurement: { id: 2, name: "kg", abbreviation: "kg" },
        categoryId: 3,
      },
    ]

    demoData[4] = [
      {
        id: 9,
        name: "Otros Product",
        price: 0,
        unitMeasurementId: 1,
        unitMeasurement: { id: 1, name: "kg-mz", abbreviation: "kg-mz" },
        categoryId: 4,
      },
    ]

    return demoData
  }

  // NUEVA FUNCIÓN: Obtener cantidad de producto por empresa (combinando todas las áreas) con colores
  const getProductQuantityByCompany = (productId: number, companyId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) {
      return ""
    }

    const quantities: Array<{ quantity: string; color: string; areaName: string }> = []

    // Buscar cantidades en cada área de la empresa
    companyAreas.forEach((area) => {
      if (productQuantities[area.id] && productQuantities[area.id][productId]) {
        // Buscar en las órdenes los items con este productId y areaId
        for (const order of orders) {
          if (order.areaId === area.id) {
            for (const item of order.orderItems) {
              if (item.productId === productId) {
                const unit = item.unitMeasurement?.name || ""
                quantities.push({
                  quantity: `${item.quantity}${unit}`,
                  color: area.color,
                  areaName: area.name,
                })
              }
            }
          }
        }

        // Si no encontramos nada en las órdenes, usar la cantidad del estado
        if (quantities.filter((q) => q.areaName === area.name).length === 0 && productQuantities[area.id][productId]) {
          const product = products.find((p) => p.id === productId)
          const unit = product?.unitMeasurement?.name || ""
          quantities.push({
            quantity: `${productQuantities[area.id][productId]}${unit}`,
            color: area.color,
            areaName: area.name,
          })
        }
      }
    })

    // Crear HTML con colores para cada cantidad
    return quantities
      .map((item) => {
        return `<span style="color: ${item.color}; font-weight: bold;">${item.quantity}</span>`
      })
      .join(" + ")
  }

  // NUEVA FUNCIÓN: Calcular totales por categoría para toda la empresa
  const calculateCompanyTotalByCategory = (companyId: number, categoryId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) return 0

    let productCount = 0
    const categoryProducts = products.filter((p) => p.categoryId === categoryId)

    // Contar productos únicos que tienen pedidos en cualquier área de la empresa
    categoryProducts.forEach((product) => {
      let hasOrderInCompany = false
      companyAreas.forEach((area) => {
        if (
          productQuantities[area.id] &&
          productQuantities[area.id][product.id] &&
          productQuantities[area.id][product.id] > 0
        ) {
          hasOrderInCompany = true
        }
      })
      if (hasOrderInCompany) {
        productCount += 1
      }
    })

    return productCount
  }

  // FUNCIÓN CORREGIDA: Renderizar tabla de observaciones por empresa
  const renderObservationsTable = () => {
    const observationsByArea = getObservationsByArea()
    const hasObservations = Object.keys(observationsByArea).length > 0

    console.log("Renderizando observaciones en preview:", hasObservations, observationsByArea)

    if (!hasObservations) {
      return null
    }

    // Filtrar compañías que tienen áreas con pedidos
    const companiesWithOrders = companies.filter((company) => {
      const companyAreas = getAreasByCompany()[company.id] || []
      return companyAreas.some((area) => areasWithOrders.includes(area.id))
    })

    return (
      <div className="mb-8">
        <h4 className="text-md font-medium mb-2">Observaciones</h4>
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[200px] overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-white">
                  <th className="px-4 py-2 text-left border bg-yellow-200 sticky left-0 z-20">OBSERVACION</th>
                  {companiesWithOrders.map((company) => {
                    const companyAreas =
                      getAreasByCompany()[company.id]?.filter((area) => areasWithOrders.includes(area.id)) || []
                    if (companyAreas.length === 0) {
                      return null
                    }

                    // Usar el color de la empresa si está disponible, sino el color de la primera área
                    const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
                    const textColor = getTextColor()

                    return (
                      <th
                        key={company.id}
                        className="px-4 py-2 text-center border uppercase"
                        style={{
                          backgroundColor: companyColor,
                          color: textColor,
                        }}
                      >
                        {company.name}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border font-medium bg-yellow-50 sticky left-0 z-10">Detalle</td>
                  {companiesWithOrders.map((company) => {
                    const companyAreas =
                      getAreasByCompany()[company.id]?.filter((area) => areasWithOrders.includes(area.id)) || []
                    if (companyAreas.length === 0) {
                      return null
                    }

                    // Combinar observaciones de todas las áreas de la empresa
                    const allObservations: string[] = []
                    companyAreas.forEach((area) => {
                      const areaObservations = observationsByArea[area.id] || []
                      allObservations.push(...areaObservations)
                    })

                    // Eliminar duplicados y unir
                    const uniqueObservations = [...new Set(allObservations)]
                    const observationText = uniqueObservations.join("; ")

                    console.log(`Observaciones preview para empresa ${company.name}:`, observationText)

                    return (
                      <td key={company.id} className="px-4 py-2 border bg-yellow-50 min-w-[120px] text-left">
                        {observationText}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Modificar la función generatePreview para asegurar que use las fechas seleccionadas
  const generatePreview = async () => {
    setIsLoading(true)
    setHasData(false)
    setShowReport(false)
    setGeneratedPdfBlob(null) // Limpiar PDF anterior

    try {
      // Establecer la fecha del reporte según el tipo
      let orders: Order[] = []
      let apiUrl = ""

      if (reportType === "day" && selectedDate) {
        // Para reportes de un solo día, necesitamos el inicio y fin del día
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Formatear fechas en ISO8601
        const startDateISO = startOfDay.toISOString()
        const endDateISO = endOfDay.toISOString()

        setReportDate(format(selectedDate, "dd/MM/yyyy"))

        // Usar la ruta correcta para filtrar por fecha
        console.log(`Cargando órdenes para la fecha: ${format(selectedDate, "yyyy-MM-dd")}`)
        apiUrl = `/orders/filter?startDate=${encodeURIComponent(startDateISO)}&endDate=${encodeURIComponent(endDateISO)}`
      } else if (reportType === "range" && dateRange.from && dateRange.to) {
        // Para reportes de rango, usamos desde el inicio del primer día hasta el final del último día
        const startOfRange = new Date(dateRange.from)
        startOfRange.setHours(0, 0, 0, 0)
        const endOfRange = new Date(dateRange.to)
        endOfRange.setHours(23, 59, 59, 999)

        // Formatear fechas en ISO8601
        const startDateISO = startOfRange.toISOString()
        const endDateISO = endOfRange.toISOString()

        setReportDate(`${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`)

        // Usar la ruta correcta para filtrar por rango de fechas
        console.log(
          `Cargando órdenes para el rango: ${format(dateRange.from, "yyyy-MM-dd")} a ${format(dateRange.to, "yyyy-MM-dd")}`,
        )
        apiUrl = `/orders/filter?startDate=${encodeURIComponent(startDateISO)}&endDate=${encodeURIComponent(endDateISO)}`
      }

      if (apiUrl) {
        const ordersResponse = await api.get(apiUrl)
        orders = ordersResponse.data
        console.log("Órdenes cargadas:", orders.length)
        console.log("Órdenes con observaciones:", orders.filter((o) => o.observation).length)
      } else {
        console.error("No se pudo determinar la URL de la API")
        toast.error("Error al generar vista previa", {
          description: "No se pudo determinar el período para el reporte.",
        })
        setIsLoading(false)
        return
      }

      // Verificar si hay órdenes
      if (!orders || orders.length === 0) {
        toast.warning("No hay órdenes", {
          description: "No se encontraron órdenes para el período seleccionado.",
        })
        setIsLoading(false)
        return
      }

      // Cargar datos completos para cada orden
      const ordersWithDetails = await Promise.all(
        orders.map(async (order: Order) => {
          try {
            // Obtener datos del usuario si no están incluidos
            let user = order.user
            if (!user && order.userId) {
              try {
                const userResponse = await api.get(`/users/${order.userId}`)
                user = userResponse.data
              } catch (error) {
                console.error(`Error al cargar usuario ${order.userId}:`, error)
              }
            }

            // Obtener datos de productos para cada item
            const orderItemsWithProducts = await Promise.all(
              order.orderItems.map(async (item: OrderItem) => {
                try {
                  // Si el producto no está incluido, cargarlo
                  let product = item.product
                  if (!product && item.productId) {
                    const productResponse = await api.get(`/products/${item.productId}`)
                    product = productResponse.data

                    // Obtener unidad de medida si no está incluida
                    if (product && product.unitMeasurementId && !product.unitMeasurement) {
                      try {
                        const unitResponse = await api.get(`/unit-measurements/${product.unitMeasurementId}`)
                        product.unitMeasurement = unitResponse.data
                      } catch (error) {
                        console.error(`Error al cargar unidad de medida ${product.unitMeasurementId}:`, error)
                      }
                    }
                  }

                  return { ...item, product }
                } catch (error) {
                  console.error(`Error al cargar producto ${item.productId}:`, error)
                  return item
                }
              }),
            )

            // Obtener área si no está incluida
            let area = order.area
            if (!area && order.areaId) {
              const foundArea = areas.find((a) => a.id === order.areaId)
              if (foundArea) {
                area = foundArea
              }
            } else if (!area && user?.areas && user.areas.length > 0) {
              // Si no hay areaId pero el usuario tiene áreas, usar la primera
              area = user.areas[0]
            }

            return {
              ...order,
              user,
              area,
              orderItems: orderItemsWithProducts,
            }
          } catch (error) {
            console.error(`Error al cargar detalles para orden ${order.id}:`, error)
            return order
          }
        }),
      )

      setOrders(ordersWithDetails)

      // Procesar datos para el reporte - cantidades de productos por área
      const quantities: { [areaId: number]: { [productId: number]: number } } = {}
      const areasWithOrdersIds: number[] = []

      // Inicializar estructura para todas las áreas
      areas.forEach((area) => {
        quantities[area.id] = {}
      })

      // Agrupar productos por área basado en las órdenes
      ordersWithDetails.forEach((order) => {
        const areaId =
          order.areaId ||
          order.area?.id ||
          (order.user?.areas && order.user.areas.length > 0 ? order.user.areas[0].id : null)

        if (areaId) {
          if (!quantities[areaId]) {
            quantities[areaId] = {}
          }

          // Registrar esta área como una con pedidos
          if (!areasWithOrdersIds.includes(areaId)) {
            areasWithOrdersIds.push(areaId)
          }

          order.orderItems.forEach((item) => {
            if (item.productId) {
              // Create a unique key that includes both product ID and unit measurement ID
              const productKey = item.productId
              if (!quantities[areaId][productKey]) {
                quantities[areaId][productKey] = 0
              }
              quantities[areaId][productKey] += item.quantity
            }
          })
        }
      })

      setProductQuantities(quantities)
      setAreasWithOrders(areasWithOrdersIds)

      // Verificar si hay datos para mostrar
      let hasAnyData = false
      for (const areaId in quantities) {
        if (Object.keys(quantities[areaId]).length > 0) {
          hasAnyData = true
          break
        }
      }

      if (!hasAnyData) {
        toast.warning("No hay datos para mostrar", {
          description: "No se encontraron productos en las órdenes para el período seleccionado.",
        })
        setIsLoading(false)
        return
      }

      // Indicar que hay datos disponibles
      setHasData(true)

      // Mostrar el reporte
      setShowReport(true)
    } catch (error) {
      console.error("Error al generar vista previa:", error)
      toast.error("Error al generar vista previa", {
        description: "No se pudieron cargar los datos para el reporte.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // NUEVA FUNCIÓN: Renderizar tablas por categoría con columnas de empresa
  const renderCategoryTables = () => {
    const productsByCategory = getProductsForReport()

    // ORDEN ESPECÍFICO: 1=Verduras, 2=Frutas, 5=Hierbas, 3=IGV, 4=Otros
    const categoryOrder = [1, 2, 5, 3, 4]

    // Crear array ordenado de categorías que existen
    const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
      .filter((categoryId) => productsByCategory[categoryId])
      .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

    // Agregar cualquier categoría adicional que no esté en el orden específico
    Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
      const categoryId = Number.parseInt(categoryIdStr)
      if (!categoryOrder.includes(categoryId)) {
        orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
      }
    })

    const categoryTables = orderedCategoryEntries.map(([categoryIdStr, categoryProducts]) => {
      const categoryId = Number.parseInt(categoryIdStr)
      const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

      // Filtrar solo productos con pedidos
      const productsWithOrders = (categoryProducts as Product[])
        .filter((product: Product) => {
          // Verificar si hay algún pedido para este producto en cualquier área
          for (const areaId in productQuantities) {
            if (productQuantities[areaId][product.id]) {
              return true
            }
          }
          return false
        })
        .sort((a: Product, b: Product) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente

      // Si no hay productos con pedidos en esta categoría, no mostrar la tabla
      if (productsWithOrders.length === 0) return null

      // Filtrar compañías que tienen áreas con pedidos
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area) => areasWithOrders.includes(area.id))
      })

      if (companiesWithOrders.length === 0) return null

      return (
        <div key={categoryId} className="mb-8">
          <h4 className="text-md font-medium mb-2">{categoryName}</h4>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[350px] overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th colSpan={companiesWithOrders.length + 1} className="px-4 py-2 text-left border bg-white">
                      fecha: {reportDate}
                    </th>
                  </tr>
                  {/* Fila de compañías */}
                  <tr className="bg-white">
                    <th className="px-4 py-2 text-left border bg-gray-100 sticky left-0 z-20">
                      {categoryName.toUpperCase()}
                    </th>
                    {companiesWithOrders.map((company) => {
                      const companyAreas =
                        getAreasByCompany()[company.id]?.filter((area) => areasWithOrders.includes(area.id)) || []
                      if (companyAreas.length === 0) {
                        return null
                      }

                      // Usar el color de la empresa si está disponible, sino el color de la primera área
                      const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
                      const textColor = getTextColor()

                      return (
                        <th
                          key={company.id}
                          className="px-4 py-2 text-center border uppercase"
                          style={{
                            backgroundColor: companyColor,
                            color: textColor,
                          }}
                        >
                          {company.name}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {productsWithOrders.map((product: Product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-2 text-left border bg-white sticky left-0">{product.name}</td>
                      {companiesWithOrders.map((company) => {
                        const companyAreas =
                          getAreasByCompany()[company.id]?.filter((area) => areasWithOrders.includes(area.id)) || []
                        if (companyAreas.length === 0) {
                          return null
                        }

                        return (
                          <td key={`${product.id}-${company.id}`} className="px-4 py-2 text-left border">
                            <span
                              dangerouslySetInnerHTML={{ __html: getProductQuantityByCompany(product.id, company.id) }}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-2 text-left border font-medium bg-white sticky left-0">TOTAL</td>
                    {companiesWithOrders.map((company) => {
                      const companyAreas =
                        getAreasByCompany()[company.id]?.filter((area) => areasWithOrders.includes(area.id)) || []
                      if (companyAreas.length === 0) {
                        return null
                      }

                      return (
                        <td key={`total-${company.id}`} className="px-4 py-2 text-left border font-medium">
                          {calculateCompanyTotalByCategory(company.id, categoryId)}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    })

    return (
      <>
        {categoryTables}
        {renderObservationsTable()}
      </>
    )
  }

  // Función para manejar la entrada manual de fecha
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      const [year, month, day] = dateValue.split("-").map(Number)
      const newDate = new Date(year, month - 1, day)
      setSelectedDate(newDate)
      setShowReport(false)
      setHasData(false)
      setGeneratedPdfBlob(null)
      console.log("Fecha seleccionada manualmente:", format(newDate, "yyyy-MM-dd"))
    }
  }

  // Función para manejar la entrada manual de rango de fechas
  const handleDateRangeInputChange = (type: "from" | "to", e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      const [year, month, day] = dateValue.split("-").map(Number)
      const newDate = new Date(year, month - 1, day)

      if (type === "from") {
        setDateRange((prev) => ({ ...prev, from: newDate }))
      } else {
        setDateRange((prev) => ({ ...prev, to: newDate }))
      }

      setShowReport(false)
      setHasData(false)
      setGeneratedPdfBlob(null)
      console.log(`Fecha ${type} seleccionada manualmente:`, format(newDate, "yyyy-MM-dd"))
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          id="report-generator-dialog"
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          onClick={() => setIsDialogOpen(true)}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden sm:inline">Generar Reporte</span>
          <span className="sm:hidden">Reporte</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generar Reporte de Productos</DialogTitle>
          <DialogDescription>
            Selecciona el período para generar el reporte de productos por empresas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tipo de reporte</label>
              <Select
                value={reportType}
                onValueChange={(value) => {
                  setReportType(value as "day" | "range")
                  // Resetear el reporte al cambiar el tipo
                  setShowReport(false)
                  setHasData(false)
                  setGeneratedPdfBlob(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Por día</SelectItem>
                  <SelectItem value="range">Por rango de fechas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "day" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Seleccionar día</label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="date"
                    value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                    onChange={handleDateInputChange}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Fecha seleccionada: {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Ninguna"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Seleccionar rango de fechas</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Desde</label>
                    <Input
                      type="date"
                      value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleDateRangeInputChange("from", e)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Hasta</label>
                    <Input
                      type="date"
                      value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => handleDateRangeInputChange("to", e)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Rango seleccionado: {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Ninguna"} -{" "}
                  {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Ninguna"}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                console.log(
                  "Generando reporte con fecha:",
                  reportType === "day"
                    ? format(selectedDate || new Date(), "yyyy-MM-dd")
                    : `${format(dateRange.from || new Date(), "yyyy-MM-dd")} a ${format(dateRange.to || new Date(), "yyyy-MM-dd")}`,
                )
                generatePreview()
              }}
              disabled={
                isLoading ||
                (reportType === "day" && !selectedDate) ||
                (reportType === "range" && (!dateRange.from || !dateRange.to))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar Reporte"
              )}
            </Button>
          </div>

          {/* Vista previa del reporte */}
          {showReport && (
            <div className="mt-4 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Reporte de Productos por Empresa</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadExcel} className="gap-1 bg-transparent">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadPDF} className="gap-1 bg-transparent">
                    <FilePdf className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">{renderCategoryTables()}</div>
              <div className="text-sm text-muted-foreground">
                <div className="mb-2">Reporte para: {reportDate}</div>
                <div className="text-xs">
                  <strong>Nota:</strong> Las cantidades están coloreadas por área dentro de cada empresa. El PDF se
                  genera con el mismo contenido que el preview, y el Excel se basa en el PDF generado con colores
                  representativos de las empresas.
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-2" />
                <p className="text-muted-foreground">Generando reporte...</p>
              </div>
            </div>
          ) : (
            !showReport && (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">
                  {reportType === "day"
                    ? "Selecciona un día y haz clic en 'Generar Reporte' para ver los resultados"
                    : "Selecciona un rango de fechas y haz clic en 'Generar Reporte' para ver los resultados"}
                </p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
