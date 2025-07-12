"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  ShoppingBag,
  Trash2,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Definir interfaces
interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  status: "active" | "inactive"
  totalOrders: number
  lastOrderDate?: string
  totalSpent: number
  notes?: string
  createdAt: string
}

interface Order {
  id: number
  date: string
  status: "pending" | "processing" | "completed" | "cancelled"
  total: number
  items: number
}

// Datos de ejemplo
const customer: Customer = {
  id: 1,
  name: "María García",
  email: "maria@example.com",
  phone: "555-123-4567",
  address: "Calle Principal 123",
  city: "Ciudad de México",
  postalCode: "01000",
  status: "active",
  totalOrders: 12,
  lastOrderDate: "2023-04-17T14:30:00",
  totalSpent: 1250.75,
  notes: "Cliente frecuente, prefiere entregas por la tarde",
  createdAt: "2022-06-15T10:30:00",
}

const orders: Order[] = [
  {
    id: 1001,
    date: "2023-04-17T14:30:00",
    status: "completed",
    total: 125.5,
    items: 3,
  },
  {
    id: 982,
    date: "2023-03-22T10:15:00",
    status: "completed",
    total: 89.99,
    items: 2,
  },
  {
    id: 965,
    date: "2023-02-15T16:45:00",
    status: "completed",
    total: 210.25,
    items: 4,
  },
  {
    id: 942,
    date: "2023-01-30T09:20:00",
    status: "cancelled",
    total: 45.0,
    items: 1,
  },
  {
    id: 921,
    date: "2023-01-10T13:40:00",
    status: "completed",
    total: 178.5,
    items: 3,
  },
]

// Componente para mostrar el estado del cliente
function CustomerStatusBadge({ status }: { status: Customer["status"] }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          <span>Activo</span>
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3" />
          <span>Inactivo</span>
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

// Componente para mostrar el estado del pedido
function OrderStatusBadge({ status }: { status: Order["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pendiente
        </Badge>
      )
    case "processing":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          En proceso
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Completado
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Cancelado
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-start" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="sm:hidden">Volver</span>
              <span className="hidden sm:inline">Volver a clientes</span>
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{customer.name}</h1>
          <CustomerStatusBadge status={customer.status} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button size="sm" variant="outline" className="flex-1 sm:flex-auto" asChild>
            <Link href={`/dashboard/customers/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Enviar correo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información del cliente */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Información del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nombre</span>
                </div>
                <p className="text-sm font-medium break-words">{customer.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Correo electrónico</span>
                </div>
                <p className="text-sm font-medium break-all">{customer.email}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono</span>
                </div>
                <p className="text-sm font-medium">{customer.phone}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Dirección</span>
                </div>
                <p className="text-sm font-medium break-words">
                  {customer.address}, {customer.city}, CP {customer.postalCode}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Cliente desde</span>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(customer.createdAt), "dd MMMM yyyy", { locale: es })}
                </p>
              </div>
              {customer.notes && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-sm break-words">{customer.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumen y pedidos */}
        <div className="md:col-span-2 space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Total de pedidos</p>
                <p className="text-2xl font-bold">{customer.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Package className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Último pedido</p>
                <p className="text-2xl font-bold">
                  {customer.lastOrderDate
                    ? format(new Date(customer.lastOrderDate), "dd/MM/yy", { locale: es })
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center h-8 w-8 text-primary mb-2">
                  <span className="text-xl font-bold">$</span>
                </div>
                <p className="text-sm text-muted-foreground">Total gastado</p>
                <p className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pedidos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pedidos recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                      <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                      <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">Estado</th>
                      <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">Productos</th>
                      <th className="py-3 px-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                      <th className="py-3 px-2 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 px-2 text-sm">#{order.id}</td>
                        <td className="py-3 px-2 text-sm">
                          {format(new Date(order.date), "dd/MM/yyyy", { locale: es })}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-2 text-sm">{order.items}</td>
                        <td className="py-3 px-2 text-sm text-right font-medium">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <ChevronDown className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    Ver todos los pedidos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
