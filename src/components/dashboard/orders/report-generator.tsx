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

// Mantener todas tus interfaces exactamente igual
interface Area {
  id: number
  name: string
  companyId?: number
  color: string
}

interface Company {
  id: number
  name: string
  areas?: Area[]
  color?: string
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

export function ReportGenerator() {
  // Mantener todos tus estados exactamente igual
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
  const [, setGeneratedPdfBlob] = useState<Blob | null>(null)

  // Estados para datos reales
  const [companies, setCompanies] = useState<Company[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productQuantities, setProductQuantities] = useState<{ [areaId: number]: { [productId: number]: number } }>({})
  const [categories, setCategories] = useState<{ [id: number]: ProductCategory }>({})
  const [areasWithOrders, setAreasWithOrders] = useState<number[]>([])

  // Mantener tu función loadInitialData exactamente igual
  useEffect(() => {
    const loadInitialData = async () => {
      try {
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

        const categoriesMap: { [id: number]: ProductCategory } = {}
        categoriesData.forEach((category: ProductCategory) => {
          categoriesMap[category.id] = category
        })
        setCategories(categoriesMap)

        const processedCompanies = Array.isArray(companiesData) ? companiesData : [companiesData]
        setCompanies(processedCompanies)

        const allAreas: Area[] = []
        processedCompanies.forEach((company: Company) => {
          if (company.areas && Array.isArray(company.areas)) {
            allAreas.push(...company.areas)
          }
        })
        setAreas(allAreas)

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

  // Mantener todas tus funciones helper exactamente igual
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace("#", "")
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split("")
            .map((char) => char + char)
            .join("")
        : cleanHex
    return fullHex.toUpperCase()
  }

  const getTextColor = (): string => {
    return "000000"
  }

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
          if (!observationsByArea[areaId].includes(order.observation.trim())) {
            observationsByArea[areaId].push(order.observation.trim())
          }
        }
      }
    })
    console.log("Observaciones por área:", observationsByArea)
    return observationsByArea
  }

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

  const getProductQuantityForExcel = (productId: number, companyId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) {
      return { text: "", color: "000000", hasData: false }
    }

    const quantities: string[] = []
    let dominantColor = "000000"

    companyAreas.forEach((area, index) => {
      if (productQuantities[area.id] && productQuantities[area.id][productId]) {
        let foundInOrders = false
        for (const order of orders) {
          if (order.areaId === area.id) {
            for (const item of order.orderItems) {
              if (item.productId === productId) {
                const unit = item.unitMeasurement?.name || ""
                quantities.push(`${item.quantity}${unit}`)
                if (index === 0) {
                  dominantColor = hexToRgb(area.color)
                }
                foundInOrders = true
              }
            }
          }
        }

        if (!foundInOrders && productQuantities[area.id][productId]) {
          const product = products.find((p) => p.id === productId)
          const unit = product?.unitMeasurement?.name || ""
          quantities.push(`${productQuantities[area.id][productId]}${unit}`)
          if (index === 0) {
            dominantColor = hexToRgb(area.color)
          }
        }
      }
    })

    if (quantities.length === 0) {
      return { text: "", color: "000000", hasData: false }
    }

    return {
      text: quantities.join(" + "),
      color: dominantColor,
      hasData: true,
    }
  }

  // Mantener tu función generatePDF exactamente igual
  const generatePDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF("landscape", "mm", "a4")
      doc.setFont("helvetica")
      let yPosition = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Reporte de Productos por Empresa", margin, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha: ${reportDate}`, margin, yPosition)
      yPosition += 15

      const productsByCategory = getProductsForReport()
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area: Area) => areasWithOrders.includes(area.id))
      })

      const categoryOrder = [1, 2, 5, 3, 4]
      const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
        .filter((categoryId) => productsByCategory[categoryId])
        .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

      Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        if (!categoryOrder.includes(categoryId)) {
          orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
        }
      })

      const totalCompanies = companiesWithOrders.length
      const firstColumnWidth = 60
      const companyColumnWidth = totalCompanies > 0 ? (pageWidth - margin * 2 - firstColumnWidth) / totalCompanies : 50

      for (const [categoryIdStr, categoryProducts] of orderedCategoryEntries) {
        const categoryId = Number.parseInt(categoryIdStr)
        const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

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

        if (productsWithOrders.length === 0) continue

        const estimatedHeight = (productsWithOrders.length + 3) * 8
        if (yPosition + estimatedHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")

        doc.setFillColor(255, 255, 255)
        doc.rect(margin, yPosition, pageWidth - margin * 2, 6, "F")
        doc.text(`fecha: ${reportDate}`, margin + 2, yPosition + 4)
        yPosition += 6

        let xPosition = margin

        doc.setFillColor(242, 242, 242)
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "S")
        doc.text(categoryName.toUpperCase(), xPosition + 2, yPosition + 5)
        xPosition += firstColumnWidth

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
          doc.setTextColor(0, 0, 0)

          const textWidth = doc.getTextWidth(company.name.toUpperCase())
          const textX = xPosition + (companyColumnWidth - textWidth) / 2
          doc.text(company.name.toUpperCase(), textX, yPosition + 5)
          xPosition += companyColumnWidth
        })
        yPosition += 8

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        productsWithOrders.forEach((product: Product) => {
          xPosition = margin

          doc.setFillColor(255, 255, 255)
          doc.rect(xPosition, yPosition, firstColumnWidth, 6, "F")
          doc.rect(xPosition, yPosition, firstColumnWidth, 6, "S")
          doc.setTextColor(0, 0, 0)
          doc.text(product.name, xPosition + 2, yPosition + 4)
          xPosition += firstColumnWidth

          companiesWithOrders.forEach((company) => {
            const companyAreas =
              getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
            if (companyAreas.length === 0) return

            doc.setFillColor(255, 255, 255)
            doc.rect(xPosition, yPosition, companyColumnWidth, 6, "F")
            doc.rect(xPosition, yPosition, companyColumnWidth, 6, "S")

            const quantities: Array<{ quantity: string; color: string }> = []
            companyAreas.forEach((area) => {
              if (productQuantities[area.id] && productQuantities[area.id][product.id]) {
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

            if (quantities.length > 0) {
              let currentX = xPosition + 2
              const cellWidth = companyColumnWidth - 4
              const maxTextWidth = cellWidth

              quantities.forEach((item, index) => {
                const rgb = hexToRgb(item.color)
                const r = Number.parseInt(rgb.substring(0, 2), 16)
                const g = Number.parseInt(rgb.substring(2, 4), 16)
                const b = Number.parseInt(rgb.substring(4, 6), 16)

                doc.setTextColor(r, g, b)

                const textWidth = doc.getTextWidth(item.quantity)
                const separatorWidth = index < quantities.length - 1 ? doc.getTextWidth(" + ") : 0

                if (currentX + textWidth - (xPosition + 2) <= maxTextWidth) {
                  doc.text(item.quantity, currentX, yPosition + 4)
                  currentX += textWidth

                  if (index < quantities.length - 1) {
                    doc.setTextColor(0, 0, 0)
                    doc.text(" + ", currentX, yPosition + 4)
                    currentX += separatorWidth
                  }
                } else {
                  doc.setTextColor(0, 0, 0)
                  doc.text("...", currentX, yPosition + 4)
                  return
                }
              })
            }

            doc.setTextColor(0, 0, 0)
            xPosition += companyColumnWidth
          })

          yPosition += 6
        })

        xPosition = margin
        doc.setFont("helvetica", "bold")

        doc.setFillColor(255, 255, 255)
        doc.rect(xPosition, yPosition, firstColumnWidth, 6, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 6, "S")
        doc.text("TOTAL", xPosition + 2, yPosition + 4)
        xPosition += firstColumnWidth

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

      const observationsByArea = getObservationsByArea()
      const hasObservations = Object.keys(observationsByArea).length > 0
      console.log("¿Hay observaciones para PDF?", hasObservations, observationsByArea)

      if (hasObservations) {
        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = margin
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        let xPosition = margin

        doc.setFillColor(255, 255, 0)
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "F")
        doc.rect(xPosition, yPosition, firstColumnWidth, 8, "S")
        doc.setTextColor(0, 0, 0)
        doc.text("OBSERVACION", xPosition + 2, yPosition + 5)
        xPosition += firstColumnWidth

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

          const allObservations: string[] = []
          companyAreas.forEach((area) => {
            const areaObservations = observationsByArea[area.id] || []
            allObservations.push(...areaObservations)
          })

          const uniqueObservations = [...new Set(allObservations)]
          const observationText = uniqueObservations.join("; ")
          console.log(`Observaciones para empresa ${company.name}:`, observationText)

          const maxWidth = companyColumnWidth - 4
          const lines = doc.splitTextToSize(observationText, maxWidth)
          let lineY = yPosition + 4
          lines.slice(0, 2).forEach((line: string) => {
            doc.text(line, xPosition + 2, lineY)
            lineY += 3
          })

          xPosition += companyColumnWidth
        })
      }

      const pdfBlob = doc.output("blob")
      setGeneratedPdfBlob(pdfBlob)
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

  const downloadPDF = async () => {
    if (!hasData) {
      toast.error("No hay datos para generar el PDF", {
        description: "No se encontraron órdenes para el período seleccionado.",
      })
      return
    }
    await generatePDF()
  }

  // NUEVA FUNCIÓN: Excel con ExcelJS para máxima compatibilidad en producción
  const downloadExcelWithExcelJS = async () => {
    try {
      console.log("🔄 Iniciando generación de Excel con ExcelJS (producción)...")

      if (!hasData) {
        toast.error("No hay datos para generar el Excel", {
          description: "No se encontraron órdenes para el período seleccionado.",
        })
        return
      }

      // Importar ExcelJS dinámicamente
      const ExcelJS = await import("exceljs")
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Reporte de Productos")

      let currentRow = 1

      // Obtener datos necesarios
      const productsByCategory = getProductsForReport()
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area: Area) => areasWithOrders.includes(area.id))
      })

      console.log(
        `📊 Procesando ${Object.keys(productsByCategory).length} categorías y ${companiesWithOrders.length} empresas`,
      )

      // Orden específico de categorías
      const categoryOrder = [1, 2, 5, 3, 4]
      const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
        .filter((categoryId) => productsByCategory[categoryId])
        .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

      // Agregar categorías adicionales
      Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        if (!categoryOrder.includes(categoryId)) {
          orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
        }
      })

      // Procesar cada categoría
      for (const [categoryIdStr, categoryProducts] of orderedCategoryEntries) {
        const categoryId = Number.parseInt(categoryIdStr)
        const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

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

        if (productsWithOrders.length === 0) continue

        // Fila de fecha
        const dateRow = worksheet.getRow(currentRow)
        dateRow.getCell(1).value = `fecha: ${reportDate}`
        dateRow.getCell(1).font = { bold: true }
        dateRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        }
        currentRow++

        // Fila de encabezados
        const headerRow = worksheet.getRow(currentRow)
        headerRow.getCell(1).value = categoryName.toUpperCase()
        headerRow.getCell(1).font = { bold: true }
        headerRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        }

        let colIndex = 2
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const cell = headerRow.getCell(colIndex)
          cell.value = company.name.toUpperCase()
          cell.font = { bold: true, color: { argb: "FF000000" } }

          // Aplicar color de empresa/área
          const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
          const hexColor = companyColor.replace("#", "")
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${hexColor}` },
          }
          cell.alignment = { horizontal: "center" }

          colIndex++
        })
        currentRow++

        // Filas de productos
        for (const product of productsWithOrders) {
          const productRow = worksheet.getRow(currentRow)
          productRow.getCell(1).value = product.name
          productRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFFF" },
          }

          colIndex = 2
          companiesWithOrders.forEach((company) => {
            const companyAreas =
              getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
            if (companyAreas.length === 0) return

            const cell = productRow.getCell(colIndex)

            // Obtener cantidades con colores
            const quantities: Array<{ text: string; color: string }> = []
            companyAreas.forEach((area) => {
              if (productQuantities[area.id] && productQuantities[area.id][product.id]) {
                let foundInOrders = false
                for (const order of orders) {
                  if (order.areaId === area.id) {
                    for (const item of order.orderItems) {
                      if (item.productId === product.id) {
                        const unit = item.unitMeasurement?.name || ""
                        quantities.push({
                          text: `${item.quantity}${unit}`,
                          color: area.color,
                        })
                        foundInOrders = true
                      }
                    }
                  }
                }

                if (!foundInOrders && productQuantities[area.id][product.id]) {
                  const productData = products.find((p) => p.id === product.id)
                  const unit = productData?.unitMeasurement?.name || ""
                  quantities.push({
                    text: `${productQuantities[area.id][product.id]}${unit}`,
                    color: area.color,
                  })
                }
              }
            })

            if (quantities.length > 0) {
              // Usar el color de la primera área como dominante
              const dominantColor = quantities[0]?.color?.replace("#", "") || "000000"
              cell.value = quantities.map((q) => q.text).join(" + ")
              cell.font = {
                bold: true,
                color: { argb: `FF${dominantColor}` },
                size: 12,
              }
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFFFF" },
              }
            } else {
              cell.value = ""
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFFFF" },
              }
            }

            colIndex++
          })
          currentRow++
        }

        // Fila de totales
        const totalRow = worksheet.getRow(currentRow)
        totalRow.getCell(1).value = "TOTAL"
        totalRow.getCell(1).font = { bold: true }
        totalRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        }

        colIndex = 2
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const total = calculateCompanyTotalByCategory(company.id, categoryId)
          const cell = totalRow.getCell(colIndex)
          cell.value = total
          cell.font = { bold: true }
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFFF" },
          }

          colIndex++
        })
        currentRow += 2 // Espacio entre categorías
      }

      // Agregar observaciones
      const observationsByArea = getObservationsByArea()
      if (Object.keys(observationsByArea).length > 0) {
        console.log("¿Hay observaciones para Excel?", true, observationsByArea)

        const obsHeaderRow = worksheet.getRow(currentRow)
        obsHeaderRow.getCell(1).value = "OBSERVACION"
        obsHeaderRow.getCell(1).font = { bold: true }
        obsHeaderRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        }

        let colIndex = 2
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const cell = obsHeaderRow.getCell(colIndex)
          cell.value = company.name.toUpperCase()
          cell.font = { bold: true }

          const companyColor = company.color || companyAreas[0]?.color || "#CCCCCC"
          const hexColor = companyColor.replace("#", "")
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${hexColor}` },
          }

          colIndex++
        })
        currentRow++

        const obsDetailRow = worksheet.getRow(currentRow)
        obsDetailRow.getCell(1).value = "Detalle"
        obsDetailRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF99" },
        }

        colIndex = 2
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const allObservations: string[] = []
          companyAreas.forEach((area) => {
            const areaObservations = observationsByArea[area.id] || []
            allObservations.push(...areaObservations)
          })

          const cell = obsDetailRow.getCell(colIndex)
          cell.value = [...new Set(allObservations)].join("; ")
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF99" },
          }
          cell.alignment = { wrapText: true }

          colIndex++
        })
      } else {
        console.log("¿Hay observaciones para Excel?", false, {})
      }

      // Configurar anchos de columna
      worksheet.getColumn(1).width = 40
      for (let i = 2; i <= companiesWithOrders.length + 1; i++) {
        worksheet.getColumn(i).width = 25
      }

      // Generar y descargar
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Reporte_Productos_${reportDate.replace(/\//g, "-").replace(/\s/g, "_")}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      console.log("✅ Excel con ExcelJS generado exitosamente")
      toast.success("Reporte Excel generado", {
        description: "El archivo Excel se ha descargado correctamente con colores.",
      })
    } catch (error) {
      console.error("❌ Error al generar Excel con ExcelJS:", error)
      toast.error("Error al generar Excel", {
        description: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    }
  }

  // Función de fallback con XLSX simple (sin estilos pero funcional)
  const downloadExcelSimple = async () => {
    try {
      console.log("🔄 Generando Excel simple (fallback)...")

      if (!hasData) {
        toast.error("No hay datos para generar el Excel", {
          description: "No se encontraron órdenes para el período seleccionado.",
        })
        return
      }

      // Importar XLSX básico
      const XLSX = await import("xlsx")

      // Crear datos simples para Excel - CORREGIR EL TIPO ANY
      const excelData: (string | number)[][] = []

      const productsByCategory = getProductsForReport()
      const companiesWithOrders = companies.filter((company) => {
        const companyAreas = getAreasByCompany()[company.id] || []
        return companyAreas.some((area: Area) => areasWithOrders.includes(area.id))
      })

      const categoryOrder = [1, 2, 5, 3, 4]
      const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
        .filter((categoryId) => productsByCategory[categoryId])
        .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

      Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        if (!categoryOrder.includes(categoryId)) {
          orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
        }
      })

      orderedCategoryEntries.forEach(([categoryIdStr, categoryProducts]) => {
        const categoryId = Number.parseInt(categoryIdStr)
        const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

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

        if (productsWithOrders.length === 0) return

        // Fila de fecha
        const dateRow: (string | number)[] = [`fecha: ${reportDate}`]
        companiesWithOrders.forEach(() => dateRow.push(""))
        excelData.push(dateRow)

        // Fila de encabezados
        const headerRow: (string | number)[] = [categoryName.toUpperCase()]
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length > 0) {
            headerRow.push(company.name.toUpperCase())
          }
        })
        excelData.push(headerRow)

        // Filas de productos
        productsWithOrders.forEach((product: Product) => {
          const productRow: (string | number)[] = [product.name]

          companiesWithOrders.forEach((company) => {
            const companyAreas =
              getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
            if (companyAreas.length === 0) return

            const quantityInfo = getProductQuantityForExcel(product.id, company.id)
            productRow.push(quantityInfo.text || "")
          })

          excelData.push(productRow)
        })

        // Fila de totales
        const totalRow: (string | number)[] = ["TOTAL"]
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const total = calculateCompanyTotalByCategory(company.id, categoryId)
          totalRow.push(total.toString())
        })
        excelData.push(totalRow)

        excelData.push([])
      })

      // Agregar observaciones
      const observationsByArea = getObservationsByArea()
      if (Object.keys(observationsByArea).length > 0) {
        const observationHeaderRow: (string | number)[] = ["OBSERVACION"]
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length > 0) {
            observationHeaderRow.push(company.name.toUpperCase())
          }
        })
        excelData.push(observationHeaderRow)

        const observationDetailRow: (string | number)[] = ["Detalle"]
        companiesWithOrders.forEach((company) => {
          const companyAreas =
            getAreasByCompany()[company.id]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
          if (companyAreas.length === 0) return

          const allObservations: string[] = []
          companyAreas.forEach((area) => {
            const areaObservations = observationsByArea[area.id] || []
            allObservations.push(...areaObservations)
          })

          const uniqueObservations = [...new Set(allObservations)]
          observationDetailRow.push(uniqueObservations.join("; "))
        })
        excelData.push(observationDetailRow)
      }

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Configurar anchos de columna
      const wscols = [{ wch: 40 }]
      companiesWithOrders.forEach(() => {
        wscols.push({ wch: 25 })
      })
      ws["!cols"] = wscols

      XLSX.utils.book_append_sheet(wb, ws, "Reporte de Productos")

      const fileName = `Reporte_Productos_${reportDate.replace(/\//g, "-").replace(/\s/g, "_")}.xlsx`
      XLSX.writeFile(wb, fileName)

      console.log("✅ Excel simple generado exitosamente")
      toast.success("Reporte Excel generado", {
        description: "El archivo Excel se ha descargado correctamente (versión simple).",
      })
    } catch (error) {
      console.error("❌ Error al generar Excel simple:", error)
      toast.error("Error al generar Excel", {
        description: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    }
  }

  // Función principal de descarga de Excel con fallbacks
  const downloadExcel = async () => {
    try {
      // Intentar primero con ExcelJS (más confiable en producción)
      await downloadExcelWithExcelJS()
    } catch (error) {
      console.error("ExcelJS falló, intentando con XLSX simple:", error)
      try {
        // Fallback a XLSX simple
        await downloadExcelSimple()
      } catch (fallbackError) {
        console.error("Todos los métodos de Excel fallaron:", fallbackError)
        toast.error("Error al generar Excel", {
          description: "No se pudo generar el archivo Excel. Intenta recargar la página.",
        })
      }
    }
  }

  // Mantener todas tus otras funciones exactamente igual
  const getProductsForReport = () => {
    if (products.length > 0) {
      const productsByCategory: { [categoryId: number]: Product[] } = {}
      products.forEach((product) => {
        const categoryId = product.categoryId || 0
        if (!productsByCategory[categoryId]) {
          productsByCategory[categoryId] = []
        }
        productsByCategory[categoryId].push(product)
      })

      Object.keys(productsByCategory).forEach((categoryId) => {
        productsByCategory[Number(categoryId)].sort((a: Product, b: Product) => a.name.localeCompare(b.name))
      })

      const categoryOrder = [1, 2, 5, 3, 4]
      const orderedCategories: { [categoryId: number]: Product[] } = {}

      categoryOrder.forEach((categoryId) => {
        if (productsByCategory[categoryId] && productsByCategory[categoryId].length > 0) {
          orderedCategories[categoryId] = productsByCategory[categoryId]
        }
      })

      Object.keys(productsByCategory).forEach((categoryIdStr) => {
        const categoryId = Number(categoryIdStr)
        if (!categoryOrder.includes(categoryId) && productsByCategory[categoryId].length > 0) {
          orderedCategories[categoryId] = productsByCategory[categoryId]
        }
      })

      return orderedCategories
    }

    const demoData: { [categoryId: number]: Product[] } = {}
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

  const getProductQuantityByCompany = (productId: number, companyId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) {
      return ""
    }

    const quantities: Array<{ quantity: string; color: string; areaName: string }> = []

    companyAreas.forEach((area) => {
      if (productQuantities[area.id] && productQuantities[area.id][productId]) {
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

    return quantities
      .map((item) => {
        return `<span style="color: ${item.color}; font-weight: bold;">${item.quantity}</span>`
      })
      .join(" + ")
  }

  const calculateCompanyTotalByCategory = (companyId: number, categoryId: number) => {
    const companyAreas = getAreasByCompany()[companyId]?.filter((area: Area) => areasWithOrders.includes(area.id)) || []
    if (companyAreas.length === 0) return 0

    let productCount = 0
    const categoryProducts = products.filter((p) => p.categoryId === categoryId)

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

  const renderObservationsTable = () => {
    const observationsByArea = getObservationsByArea()
    const hasObservations = Object.keys(observationsByArea).length > 0
    console.log("Renderizando observaciones en preview:", hasObservations, observationsByArea)

    if (!hasObservations) {
      return null
    }

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

                    const allObservations: string[] = []
                    companyAreas.forEach((area) => {
                      const areaObservations = observationsByArea[area.id] || []
                      allObservations.push(...areaObservations)
                    })

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

  // Mantener tu función generatePreview exactamente igual
  const generatePreview = async () => {
    setIsLoading(true)
    setHasData(false)
    setShowReport(false)
    setGeneratedPdfBlob(null)

    try {
      let orders: Order[] = []
      let apiUrl = ""

      if (reportType === "day" && selectedDate) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        const startDateISO = startOfDay.toISOString()
        const endDateISO = endOfDay.toISOString()
        setReportDate(format(selectedDate, "dd/MM/yyyy"))

        console.log(`Cargando órdenes para la fecha: ${format(selectedDate, "yyyy-MM-dd")}`)
        apiUrl = `/orders/filter?startDate=${encodeURIComponent(startDateISO)}&endDate=${encodeURIComponent(endDateISO)}`
      } else if (reportType === "range" && dateRange.from && dateRange.to) {
        const startOfRange = new Date(dateRange.from)
        startOfRange.setHours(0, 0, 0, 0)
        const endOfRange = new Date(dateRange.to)
        endOfRange.setHours(23, 59, 59, 999)

        const startDateISO = startOfRange.toISOString()
        const endDateISO = endOfRange.toISOString()
        setReportDate(`${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`)

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

      if (!orders || orders.length === 0) {
        toast.warning("No hay órdenes", {
          description: "No se encontraron órdenes para el período seleccionado.",
        })
        setIsLoading(false)
        return
      }

      const ordersWithDetails = await Promise.all(
        orders.map(async (order: Order) => {
          try {
            let user = order.user
            if (!user && order.userId) {
              try {
                const userResponse = await api.get(`/users/${order.userId}`)
                user = userResponse.data
              } catch (error) {
                console.error(`Error al cargar usuario ${order.userId}:`, error)
              }
            }

            const orderItemsWithProducts = await Promise.all(
              order.orderItems.map(async (item: OrderItem) => {
                try {
                  let product = item.product
                  if (!product && item.productId) {
                    const productResponse = await api.get(`/products/${item.productId}`)
                    product = productResponse.data

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

            let area = order.area
            if (!area && order.areaId) {
              const foundArea = areas.find((a) => a.id === order.areaId)
              if (foundArea) {
                area = foundArea
              }
            } else if (!area && user?.areas && user.areas.length > 0) {
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

      const quantities: { [areaId: number]: { [productId: number]: number } } = {}
      const areasWithOrdersIds: number[] = []

      areas.forEach((area) => {
        quantities[area.id] = {}
      })

      ordersWithDetails.forEach((order) => {
        const areaId =
          order.areaId ||
          order.area?.id ||
          (order.user?.areas && order.user.areas.length > 0 ? order.user.areas[0].id : null)

        if (areaId) {
          if (!quantities[areaId]) {
            quantities[areaId] = {}
          }

          if (!areasWithOrdersIds.includes(areaId)) {
            areasWithOrdersIds.push(areaId)
          }

          order.orderItems.forEach((item) => {
            if (item.productId) {
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

      setHasData(true)
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

  // Mantener tu función renderCategoryTables exactamente igual
  const renderCategoryTables = () => {
    const productsByCategory = getProductsForReport()
    const categoryOrder = [1, 2, 5, 3, 4]

    const orderedCategoryEntries: Array<[string, Product[]]> = categoryOrder
      .filter((categoryId) => productsByCategory[categoryId])
      .map((categoryId) => [categoryId.toString(), productsByCategory[categoryId] as Product[]])

    Object.entries(productsByCategory).forEach(([categoryIdStr, categoryProducts]) => {
      const categoryId = Number.parseInt(categoryIdStr)
      if (!categoryOrder.includes(categoryId)) {
        orderedCategoryEntries.push([categoryIdStr, categoryProducts as Product[]])
      }
    })

    const categoryTables = orderedCategoryEntries.map(([categoryIdStr, categoryProducts]) => {
      const categoryId = Number.parseInt(categoryIdStr)
      const categoryName = categories[categoryId]?.name || `Categoría ${categoryId}`

      const productsWithOrders = (categoryProducts as Product[])
        .filter((product: Product) => {
          for (const areaId in productQuantities) {
            if (productQuantities[areaId][product.id]) {
              return true
            }
          }
          return false
        })
        .sort((a: Product, b: Product) => a.name.localeCompare(b.name))

      if (productsWithOrders.length === 0) return null

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

  // Mantener tus funciones de manejo de fechas exactamente igual
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
