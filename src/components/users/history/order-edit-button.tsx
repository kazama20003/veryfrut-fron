"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Loader2 } from "lucide-react"
import { isToday } from "date-fns"

import { Button } from "@/components/ui/button"

interface Area {
  id: number
  name: string
  companyId: number
}

interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  unitMeasurementId: number
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
  orderItems: OrderItem[]
}

interface OrderEditButtonProps {
  order: Order
}

export function OrderEditButton({ order }: OrderEditButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si la orden se puede editar (solo el mismo día)
  const canEdit = isToday(new Date(order.createdAt)) && order.status === "created"

  // Función para manejar el clic en el botón de editar
  const handleEditClick = () => {
    setIsLoading(true)
    router.push(`/users/history/${order.id}`)
  }

  // Si la orden no se puede editar, mostrar un botón deshabilitado
  if (!canEdit) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        <Edit className="mr-2 h-4 w-4" />
        No editable
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleEditClick}
      disabled={isLoading}
      title={`Editar pedido para ${order.area?.name || `Área #${order.areaId}`}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando...
        </>
      ) : (
        <>
          <Edit className="mr-2 h-4 w-4" />
          Editar pedido
        </>
      )}
    </Button>
  )
}
