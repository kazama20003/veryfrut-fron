"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, DollarSign, Package, ShoppingCart, Users, TrendingUp, Calendar, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/axiosInstance"
import { toast } from "sonner"

interface DashboardData {
  totals: {
    products: number
    orders: number
    sales: number
  }
  analytics: {
    recentOrders: Array<{
      date: string
      count: number
      total: number
    }>
  }
  topProducts: Array<{
    id: number
    name: string
    quantityOrdered: number
  }>
  topUsers: Array<{
    id: number
    firstName: string
    lastName: string
    email: string
    orderCount: number
  }>
  latestUsers: Array<{
    id: number
    firstName: string
    lastName: string
    email: string
    createdAt: string
  }>
  latestProducts: Array<{
    id: number
    name: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/dashboard")
        setDashboardData(response.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Error al cargar los datos del dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se pudieron cargar los datos del dashboard</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de tu negocio en tiempo real</p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <TrendingUp className="mr-2 h-4 w-4" />
          Descargar Reporte
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {dashboardData.totals.sales}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="ml-1">vs mes anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totals.orders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+8.2%</span>
              <span className="ml-1">este mes</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totals.products}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+2</span>
              <span className="ml-1">productos nuevos</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.latestUsers.length}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+{dashboardData.latestUsers.length}</span>
              <span className="ml-1">nuevos clientes</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de análisis */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Productos más vendidos */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Top productos por cantidad vendida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topProducts.length > 0 ? (
                dashboardData.topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {product.quantityOrdered} vendidos
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay datos de productos vendidos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mejores clientes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Mejores Clientes
            </CardTitle>
            <CardDescription>Clientes con más pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topUsers.length > 0 ? (
                dashboardData.topUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {user.orderCount} pedidos
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay datos de clientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos productos agregados */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-purple-500" />
              Productos Recientes
            </CardTitle>
            <CardDescription>Últimos productos agregados al catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.latestProducts.length > 0 ? (
                dashboardData.latestProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</p>
                      <Badge variant="outline" className="text-xs">
                        Nuevo
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay productos recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos usuarios registrados */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-orange-500" />
              Usuarios Recientes
            </CardTitle>
            <CardDescription>Últimos usuarios registrados en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.latestUsers.length > 0 ? (
                dashboardData.latestUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDateTime(user.createdAt)}</p>
                      <Badge variant="outline" className="text-xs">
                        Nuevo
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay usuarios recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de pedidos recientes */}
      {dashboardData.analytics.recentOrders.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Análisis de Pedidos Recientes
            </CardTitle>
            <CardDescription>Resumen de pedidos por fecha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.analytics.recentOrders.map((order) => (
                <div
                  key={order.date}
                  className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-800">{formatDate(order.date)}</p>
                    <Badge className="bg-green-600">{order.count} pedidos</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-700">S/. {order.total}</p>
                  <p className="text-sm text-green-600">Total en ventas</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
