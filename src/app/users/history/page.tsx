"use client"
import { useEffect, useCallback, useState, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { isToday } from "date-fns"
import { Calendar, Clock, Eye, Package, ShoppingBag, Truck, Building } from "lucide-react"
import { api } from "@/lib/axiosInstance"
import { getUserIdFromCookies } from "@/lib/cookies"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { OrderEditButton } from "@/components/users/history/order-edit-button"

// Enum para los estados de la orden
enum OrderStatus {
  CREATED = "created",
  PROCESS = "process",
  DELIVERED = "delivered",
}

// Interfaces para los tipos de datos
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
  productUnits: ProductUnit[]
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
  status: OrderStatus
  createdAt: string
  updatedAt: string
  observation?: string
  orderItems: OrderItem[]
}

export default function OrdersHistoryPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Usar useRef para las cachés para evitar re-renders innecesarios
  const productsCacheRef = useRef<Record<number, Product>>({})
  const areasCacheRef = useRef<Record<number, Area>>({})
  const lastFetchTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoizar el userId para evitar recalcularlo en cada render
  const userId = useMemo(() => getUserIdFromCookies(), [])

  // Función optimizada para obtener detalles de producto
  const fetchProductDetails = useCallback(async (productId: number): Promise<Product | null> => {
    try {
      // Verificar caché primero
      if (productsCacheRef.current[productId]) {
        return productsCacheRef.current[productId]
      }

      const response = await api.get(`/products/${productId}`)
      const product = response.data

      // Actualizar caché
      productsCacheRef.current[productId] = product
      return product
    } catch (error) {
      console.error(`Error al obtener producto ${productId}:`, error)
      return null
    }
  }, [])

  // Función optimizada para obtener detalles de área
  const fetchAreaDetails = useCallback(async (areaId: number): Promise<Area | null> => {
    try {
      // Verificar caché primero
      if (areasCacheRef.current[areaId]) {
        return areasCacheRef.current[areaId]
      }

      const response = await api.get(`/areas/${areaId}`)
      const area = response.data

      // Actualizar caché
      areasCacheRef.current[areaId] = area
      return area
    } catch (error) {
      console.error(`Error al obtener área ${areaId}:`, error)
      return null
    }
  }, [])

  // Función optimizada para enriquecer órdenes
  const enrichOrdersWithDetails = useCallback(
    async (ordersData: Order[]): Promise<Order[]> => {
      const enrichedOrders = [...ordersData]

      // Recopilar todos los IDs únicos que necesitamos
      const productIds = new Set<number>()
      const areaIds = new Set<number>()

      ordersData.forEach((order) => {
        if (!order.area) {
          areaIds.add(order.areaId)
        }
        order.orderItems.forEach((item) => {
          if (!item.product) {
            productIds.add(item.productId)
          }
        })
      })

      // Obtener datos en paralelo para mejor rendimiento
      await Promise.all([
        ...Array.from(productIds).map((id) => fetchProductDetails(id)),
        ...Array.from(areaIds).map((id) => fetchAreaDetails(id)),
      ])

      // Aplicar los datos obtenidos a las órdenes
      for (const order of enrichedOrders) {
        // Asignar área si no existe
        if (!order.area && areasCacheRef.current[order.areaId]) {
          order.area = areasCacheRef.current[order.areaId]
        }

        // Asignar productos a los items
        for (let i = 0; i < order.orderItems.length; i++) {
          const item = order.orderItems[i]
          if (!item.product && productsCacheRef.current[item.productId]) {
            order.orderItems[i] = {
              ...item,
              product: productsCacheRef.current[item.productId],
            }
          }
        }
      }

      return enrichedOrders
    },
    [fetchProductDetails, fetchAreaDetails],
  )

  // Función principal para cargar órdenes con throttling
  const fetchOrders = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now()
      // Throttling: evitar llamadas muy frecuentes (mínimo 5 segundos entre llamadas)
      if (!forceRefresh && now - lastFetchTimeRef.current < 5000) {
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)
        lastFetchTimeRef.current = now

        if (!userId) {
          setErrorMessage("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
          toast.error("Error de autenticación", {
            description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
          })
          return
        }

        // Obtener órdenes del usuario
        const response = await api.get(`/orders/customer/${userId}`)
        console.log("====================================")
        console.log(response)
        console.log("====================================")
        const ordersData = response.data

        // Solo enriquecer si tenemos datos nuevos o si es la primera carga
        if (ordersData && ordersData.length > 0) {
          const enrichedOrders = await enrichOrdersWithDetails(ordersData)
          setOrders(enrichedOrders)
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error("Error al obtener el historial de pedidos:", err)
        setErrorMessage("Error al cargar el historial de pedidos. Por favor, intenta nuevamente.")
        toast.error("Error al cargar pedidos", {
          description: "No se pudieron cargar tus pedidos. Por favor, intenta nuevamente.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId], // Solo incluir userId como dependencia y usar eslint-disable para evitar warnings
  )

  // Efecto principal optimizado
  useEffect(() => {
    // Cargar datos iniciales
    fetchOrders(true)

    // Configurar intervalo solo si es necesario (cada 60 segundos en lugar de 30)
    intervalRef.current = setInterval(() => {
      fetchOrders(false)
    }, 60000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchOrders]) // Incluir fetchOrders como dependencia

  // Efecto para abrir automáticamente el diálogo si se pasa orderId en la URL
  useEffect(() => {
    const orderId = searchParams.get("orderId")
    if (orderId && orders.length > 0) {
      const orderToShow = orders.find((order) => order.id === Number.parseInt(orderId))
      if (orderToShow) {
        setSelectedOrder(orderToShow)
        setIsDialogOpen(true)

        // Mostrar toast de confirmación
        toast.success("¡Pedido creado exitosamente!", {
          description: `Pedido #${orderToShow.id} creado con ${orderToShow.orderItems.length} productos.`,
        })
      }
    }
  }, [orders, searchParams])

  // Función manual para refrescar
  const handleRefresh = useCallback(() => {
    fetchOrders(true)
  }, [fetchOrders])

  // Funciones de utilidad memoizadas
  const getOrderStatusInfo = useMemo(
    () => (status: OrderStatus) => {
      switch (status) {
        case OrderStatus.CREATED:
          return {
            color: "bg-blue-500",
            text: "Creado",
            icon: <Package className="h-4 w-4" />,
          }
        case OrderStatus.PROCESS:
          return {
            color: "bg-amber-500",
            text: "En proceso",
            icon: <Truck className="h-4 w-4" />,
          }
        case OrderStatus.DELIVERED:
          return {
            color: "bg-green-600",
            text: "Entregado",
            icon: <ShoppingBag className="h-4 w-4" />,
          }
        default:
          return {
            color: "bg-gray-500",
            text: "Desconocido",
            icon: <Package className="h-4 w-4" />,
          }
      }
    },
    [],
  )

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return "Fecha desconocida"
    }
  }, [])

  const formatTime = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a", { locale: es })
    } catch {
      return ""
    }
  }, [])

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }, [])

  const getAreaName = useCallback((order: Order) => {
    if (order.area?.name) {
      return order.area.name
    }
    return `Área #${order.areaId}`
  }, [])

  const getUnitName = useCallback((item: OrderItem) => {
    if (item.unitMeasurement) {
      return item.unitMeasurement.name
    }
    if (item.product?.productUnits && item.product.productUnits.length > 0) {
      const selectedUnit = item.product.productUnits.find((pu) => pu.unitMeasurementId === item.unitMeasurementId)
      return selectedUnit?.unitMeasurement.name || "unidad(es)"
    }
    return "unidad(es)"
  }, [])

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <h1 className="text-xl font-semibold md:text-2xl">Historial de Pedidos</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            Actualizar
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {isLoading ? (
            // Estado de carga
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : errorMessage ? (
            // Estado de error
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No se pudieron cargar tus pedidos</h2>
              <p className="mb-4 max-w-md text-muted-foreground">{errorMessage}</p>
              <Button onClick={handleRefresh}>Intentar nuevamente</Button>
            </div>
          ) : orders.length === 0 ? (
            // Sin pedidos
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No tienes pedidos aún</h2>
              <p className="mb-4 max-w-md text-muted-foreground">
                Cuando realices un pedido, podrás ver su estado e historial aquí.
              </p>
              <Button onClick={() => (window.location.href = "/users/products")}>Ir a comprar</Button>
            </div>
          ) : (
            // Lista de pedidos
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status as OrderStatus)
                const canEdit = isToday(new Date(order.createdAt)) && order.status === OrderStatus.CREATED

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(order.createdAt)}
                        <span className="mx-1">•</span>
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(order.createdAt)}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-1 mt-1 text-blue-600">
                        <Building className="h-3.5 w-3.5" />
                        {getAreaName(order)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Productos:</p>
                        <ul className="space-y-2">
                          {order.orderItems.slice(0, 3).map((item) => (
                            <li key={`order-item-${item.id}`} className="flex items-center gap-2 text-sm">
                              <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-muted overflow-hidden">
                                {item.product?.imageUrl ? (
                                  <Image
                                    src={item.product.imageUrl || "/placeholder.svg"}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                  />
                                ) : (
                                  <Package className="h-4 w-4" />
                                )}
                              </div>
                              <span className="flex-1 line-clamp-1">
                                {item.product?.name || `Producto #${item.productId}`}
                              </span>
                              <span className="text-muted-foreground">
                                x{item.quantity} {getUnitName(item)}
                              </span>
                            </li>
                          ))}
                          {order.orderItems.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              + {order.orderItems.length - 3} productos más
                            </li>
                          )}
                        </ul>
                      </div>

                      {order.observation && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Observaciones:</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                            {order.observation}
                          </p>
                        </div>
                      )}

                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fecha:</span>
                        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </div>
                      {canEdit && (
                        <div className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                          Este pedido puede ser editado hasta el final del día de hoy.
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Button>
                      <OrderEditButton order={order} />
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Diálogo de detalles del pedido */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="text-xl">Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {selectedOrder && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedOrder.createdAt)}
                    <span className="mx-1">•</span>
                    <Clock className="h-4 w-4" />
                    {formatTime(selectedOrder.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 mt-1">
                    <Building className="h-4 w-4" />
                    {selectedOrder.area?.name || `Área #${selectedOrder.areaId}`}
                  </div>
                </>
              )}
            </div>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Estado del pedido */}
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Estado del pedido</h3>
                  <Badge
                    className={`${getOrderStatusInfo(selectedOrder.status as OrderStatus).color} flex items-center gap-1`}
                  >
                    {getOrderStatusInfo(selectedOrder.status as OrderStatus).icon}
                    {getOrderStatusInfo(selectedOrder.status as OrderStatus).text}
                  </Badge>
                </div>
                {isToday(new Date(selectedOrder.createdAt)) && selectedOrder.status === OrderStatus.CREATED && (
                  <div className="mt-3 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                    Este pedido puede ser editado hasta el final del día de hoy.
                  </div>
                )}
              </div>

              {/* Lista de productos */}
              <div>
                <h3 className="mb-3 font-medium">Productos</h3>
                <div className="space-y-3 rounded-lg border p-4">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={`detail-item-${item.id}`} className="flex items-center gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product?.name || `Producto #${item.productId}`}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.product?.description || "Sin descripción"}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} {getUnitName(item)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div>
                <h3 className="mb-3 font-medium">Información adicional</h3>
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fecha de pedido</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hora</span>
                      <span>{formatTime(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Área</span>
                      <span className="font-medium text-blue-600">
                        {selectedOrder.area?.name || `Área #${selectedOrder.areaId}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Número de productos</span>
                      <span>{selectedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-medium">
                      <span>Estado</span>
                      <Badge
                        className={`${getOrderStatusInfo(selectedOrder.status as OrderStatus).color} flex items-center gap-1`}
                      >
                        {getOrderStatusInfo(selectedOrder.status as OrderStatus).icon}
                        {getOrderStatusInfo(selectedOrder.status as OrderStatus).text}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedOrder.observation && (
                <div>
                  <h3 className="mb-3 font-medium">Observaciones</h3>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedOrder.observation}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cerrar
                </Button>
                {isToday(new Date(selectedOrder.createdAt)) && selectedOrder.status === OrderStatus.CREATED && (
                  <OrderEditButton order={selectedOrder} />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
