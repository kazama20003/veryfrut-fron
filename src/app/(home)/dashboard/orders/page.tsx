"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Calendar,
  Filter,
  Search,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { api } from "@/lib/axiosInstance"
import type { OrderStatus } from "@/types/order"
import { toast } from "sonner"

// Importar el componente ReportGenerator
import { ReportGenerator } from "@/components/dashboard/orders/report-generator"

// Definir interfaces para los tipos
interface User {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  areaId?: number
}

// Update the Order interface to match the backend structure
interface Order {
  id: number
  userId: number
  customerId?: number // Keep for backward compatibility
  customer?: User
  areaId?: number
  totalAmount: number
  status: OrderStatus
  orderItems: OrderItem[] // Replace any with proper type
  createdAt?: string
  observation?: string
}

// Add OrderItem interface
interface OrderItem {
  id?: number
  productId: number
  productName?: string
  quantity: number
  price: number
  total?: number
}

// Interfaz para las áreas
interface Area {
  id: number
  name: string
  companyId: number
  company?: {
    id: number
    name: string
  }
}

// Variable global para almacenar las áreas
let areasCache: Area[] = []

// Función para obtener el nombre del área
function getAreaName(areaId?: number) {
  if (!areaId) return "N/A"
  const area = areasCache.find((a) => a.id === areaId)
  return area ? area.name : `Área #${areaId}`
}

// Función para generar el número de orden diario
function generateDailyOrderNumber(order: Order, allOrders: Order[]): string {
  if (!order.createdAt) return `#${order.id}`

  try {
    const orderDate = parseISO(order.createdAt)

    // Filtrar órdenes del mismo día y ordenarlas por fecha de creación
    const ordersFromSameDay = allOrders
      .filter((o) => o.createdAt && isSameDay(parseISO(o.createdAt), orderDate))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

    // Encontrar la posición de la orden actual en el día
    const orderIndex = ordersFromSameDay.findIndex((o) => o.id === order.id)
    const dailyNumber = orderIndex + 1

    // Formatear el número con el día
    const dayName = format(orderDate, "EEEE", { locale: es })
    const dayNumber = format(orderDate, "dd/MM")

    return `#${dailyNumber} (${dayName} ${dayNumber})`
  } catch (error) {
    console.error("Error generating daily order number:", error)
    return `#${order.id}`
  }
}

// Fix the customer reference in the OrderCard component
function OrderCard({
  order,
  onDelete,
  dailyOrderNumber,
}: {
  order: Order
  onDelete: (id: number) => void
  dailyOrderNumber: string
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pedido {dailyOrderNumber}</span>
          <span className="text-xs text-muted-foreground font-normal">ID: {order.id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between">
          <p className="text-sm font-medium">Cliente:</p>
          <p className="text-sm">
            {order.customer
              ? `${order.customer.firstName} ${order.customer.lastName}`
              : `Cliente #${order.userId || order.customerId || "N/A"}`}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">Fecha:</p>
          <p className="text-sm">
            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: es }) : "N/A"}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">Área:</p>
          <p className="text-sm">{order.areaId ? getAreaName(order.areaId) : "N/A"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">Productos:</p>
          <p className="text-sm">
            {order.orderItems.length} {order.orderItems.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        {order.observation && (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Observaciones:
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded line-clamp-2">{order.observation}</p>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/dashboard/orders/${order.id}`}>
              <Edit className="mr-1 h-3 w-3" />
              Editar
            </Link>
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-1 h-3 w-3" />
            Eliminar
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido {dailyOrderNumber} (ID: {order.id}) y no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(order.id)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([]) // Para calcular números diarios
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const ordersPerPage = 10
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [, setAreas] = useState<Area[]>([])

  const fetchAreas = async () => {
    try {
      const areasResponse = await api.get("/areas")
      const areasData = areasResponse.data
      setAreas(areasData)
      areasCache = areasData // Actualizar la caché global
    } catch (err) {
      console.error("Error al cargar áreas:", err)
    }
  }

  // Función para obtener todas las órdenes (para calcular números diarios)
  const fetchAllOrders = async () => {
    try {
      // Obtener todas las órdenes sin paginación para calcular números diarios
      const allOrdersResponse = await api.get("/orders?limit=1000") // Ajustar según necesidades
      const allOrdersData = allOrdersResponse.data
      const ordersData = allOrdersData.data || allOrdersData || []

      const ordersWithUsers = ordersData.map(
        (order: {
          id: number
          userId: number
          areaId?: number
          totalAmount: number
          status: OrderStatus
          observation?: string
          createdAt?: string
          updatedAt?: string
          orderItems: OrderItem[]
          User?: User
          customer?: User
        }) => ({
          ...order,
          customer: order.User || order.customer || null,
        }),
      )

      setAllOrders(ordersWithUsers)
    } catch (err) {
      console.error("Error al cargar todas las órdenes:", err)
    }
  }

  // Fix the fetchData function to handle both userId and customerId
  const fetchOrders = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    try {
      const ordersResponse = await api.get(`/orders?page=${page}&limit=${limit}`)

      // Extract data and pagination info from the API response
      const responseData = ordersResponse.data
      const ordersData = responseData.data || responseData || []

      // Set pagination metadata
      setTotalItems(responseData.total || 0)
      setTotalPages(responseData.totalPages || 0)

      // Map the orders to match our interface, handling the "User" field from the API
      const ordersWithUsers = ordersData.map(
        (order: {
          id: number
          userId: number
          areaId?: number
          totalAmount: number
          status: OrderStatus
          observation?: string
          createdAt?: string
          updatedAt?: string
          orderItems: OrderItem[]
          User?: User
          customer?: User
        }) => ({
          ...order,
          customer: order.User || order.customer || null, // Handle both "User" and "customer" fields
        }),
      )

      setOrders(ordersWithUsers)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("No se pudieron cargar las órdenes. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage)
    fetchAllOrders() // Obtener todas las órdenes para calcular números diarios
    fetchAreas()
  }, [currentPage])

  // Memoizar los números de orden diarios para evitar recálculos innecesarios
  const ordersWithDailyNumbers = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      dailyOrderNumber: generateDailyOrderNumber(order, allOrders),
    }))
  }, [orders, allOrders])

  // Función para eliminar un pedido
  const handleDeleteOrder = async (id: number) => {
    setIsDeleting(true)
    try {
      await api.delete(`/orders/${id}`)
      setOrders(orders.filter((order) => order.id !== id))
      setAllOrders(allOrders.filter((order) => order.id !== id)) // También actualizar allOrders

      const deletedOrder = orders.find((order) => order.id === id)
      const dailyNumber = deletedOrder ? generateDailyOrderNumber(deletedOrder, allOrders) : `#${id}`

      toast.success("Pedido eliminado", {
        description: `El pedido ${dailyNumber} ha sido eliminado correctamente.`,
      })
      setOrderToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error al eliminar el pedido:", err)
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el pedido. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Preparar la eliminación de un pedido
  const confirmDelete = (id: number) => {
    setOrderToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Filtrar pedidos por búsqueda y estado
  // Since we're using server-side pagination, we work directly with the orders from the API
  const displayOrders = ordersWithDailyNumbers

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue)
    setCurrentPage(1) // Reset to first page
    // You may want to add a debounce here and pass search params to the API
    fetchOrders(1, ordersPerPage)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error al cargar órdenes</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => fetchOrders(currentPage, ordersPerPage)}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h1>
        <div className="flex gap-2">
          <ReportGenerator />
          <Button size="sm" className="text-xs sm:text-sm" asChild>
            <Link href="/dashboard/orders/new">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto pb-2 sm:pb-0">
            <Tabs defaultValue="all" value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="created">Pendientes</TabsTrigger>
                <TabsTrigger value="process">En proceso</TabsTrigger>
                <TabsTrigger value="delivered">Entregados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pedidos..."
                className="w-full pl-8 h-9"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Truck className="mr-2 h-4 w-4" />
                    Método de envío
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="total-asc">Total: Menor a Mayor</SelectItem>
                  <SelectItem value="total-desc">Total: Mayor a Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {totalItems} resultados para &quot;{searchTerm}&quot;
          </div>
        )}

        {/* Vista móvil: Tarjetas */}
        <div className="md:hidden space-y-3">
          {displayOrders.length > 0 ? (
            displayOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={handleDeleteOrder}
                dailyOrderNumber={order.dailyOrderNumber}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No se encontraron pedidos</p>
            </div>
          )}
        </div>

        {/* Vista desktop: Tabla */}
        <div className="hidden md:block">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Lista de pedidos</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Número de Pedido</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Fecha y Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Área</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Productos</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Info. Adicional</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.length > 0 ? (
                    displayOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{order.dailyOrderNumber}</span>
                            <span className="text-xs text-muted-foreground">ID: {order.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">
                              {order.customer
                                ? `${order.customer.firstName} ${order.customer.lastName}`
                                : `Cliente #${order.userId || order.customerId}`}
                            </p>
                            {order.customer?.email && (
                              <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {order.createdAt
                            ? format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: es })
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">{order.areaId ? getAreaName(order.areaId) : "N/A"}</td>
                        <td className="px-4 py-3 text-sm">
                          {order.orderItems.length} {order.orderItems.length === 1 ? "producto" : "productos"}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-[200px]">
                          <div className="space-y-1">
                            {order.observation ? (
                              <div className="truncate text-xs bg-muted/50 px-2 py-1 rounded" title={order.observation}>
                                {order.observation}
                              </div>
                            ) : !order.observation ? (
                              <span className="text-muted-foreground text-xs">Sin información adicional</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8" asChild>
                              <Link href={`/dashboard/orders/${order.id}`}>
                                <Edit className="mr-1 h-3 w-3" />
                                Editar
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => confirmDelete(order.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No se encontraron pedidos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1)
                    }
                  }}
                  className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
                />
              </PaginationItem>
              {/* Mostrar la primera página */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(1)
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              {/* Mostrar los puntos suspensivos si hay más de dos páginas entre la primera y la actual */}
              {currentPage > 3 && <PaginationEllipsis />}

              {/* Mostrar la página anterior, la actual y la siguiente */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
                if (pageNumber >= 1 && pageNumber <= totalPages) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageNumber)
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}

              {/* Mostrar los puntos suspensivos si hay más de dos páginas entre la última y la actual */}
              {currentPage < totalPages - 2 && <PaginationEllipsis />}

              {/* Mostrar la última página */}
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(totalPages)
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido{" "}
              {orderToDelete && orders.find((o) => o.id === orderToDelete)
                ? generateDailyOrderNumber(orders.find((o) => o.id === orderToDelete)!, allOrders)
                : `#${orderToDelete}`}{" "}
              y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
