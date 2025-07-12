"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for recent orders
const recentOrders = [
  {
    id: "ORD-7652",
    customer: "María García",
    date: "2023-04-17T14:30:00",
    status: "completed",
    total: "$125.50",
    items: 8,
  },
  {
    id: "ORD-7651",
    customer: "Juan Pérez",
    date: "2023-04-17T12:15:00",
    status: "processing",
    total: "$86.25",
    items: 5,
  },
  {
    id: "ORD-7650",
    customer: "Ana Rodríguez",
    date: "2023-04-17T10:45:00",
    status: "pending",
    total: "$210.75",
    items: 12,
  },
  {
    id: "ORD-7649",
    customer: "Carlos Martínez",
    date: "2023-04-16T18:20:00",
    status: "completed",
    total: "$45.30",
    items: 3,
  },
]

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Helper function to format date for mobile (shorter)
const formatDateMobile = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Helper function to get badge variant based on status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500 text-[10px] sm:text-xs">Completado</Badge>
    case "processing":
      return <Badge className="bg-blue-500 text-[10px] sm:text-xs">En Proceso</Badge>
    case "pending":
      return (
        <Badge variant="outline" className="text-[10px] sm:text-xs">
          Pendiente
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="destructive" className="text-[10px] sm:text-xs">
          Cancelado
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="text-[10px] sm:text-xs">
          {status}
        </Badge>
      )
  }
}

export function RecentOrdersTable() {
  const isMobile = useMobile()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // For mobile view, we'll use a card-based layout instead of a table
  if (isMobile) {
    return (
      <div className="space-y-2">
        {recentOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{order.total}</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>

              <div
                className="px-3 py-1.5 bg-muted/50 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <p className="text-xs">{formatDateMobile(order.date)}</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>

              {expandedOrder === order.id && (
                <div className="p-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-muted-foreground">Productos:</p>
                      <p>{order.items}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha:</p>
                      <p>{formatDate(order.date)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <Eye className="mr-1 h-3 w-3" />
                      Ver detalles
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                        <DropdownMenuItem className="text-xs">Actualizar estado</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Enviar factura</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Contactar cliente</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Desktop view uses a traditional table
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{formatDate(order.date)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Actualizar estado</DropdownMenuItem>
                    <DropdownMenuItem>Enviar factura</DropdownMenuItem>
                    <DropdownMenuItem>Contactar cliente</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
