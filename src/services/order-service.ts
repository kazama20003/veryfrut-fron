import { api } from "@/lib/axiosInstance"
import type { CreateOrderDto, Order, OrderStatus } from "@/types/order"

export const OrderService = {
  // Obtener todas las órdenes
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders")
    return response.data
  },

  // Obtener una orden por ID
  getOrderById: async (id: string | number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  // Crear una nueva orden
  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    const response = await api.post("/orders", orderData)
    return response.data
  },

  // Actualizar una orden existente
  updateOrder: async (id: string | number, data: Partial<Order>): Promise<Order> => {
    const response = await api.patch(`/orders/${id}`, data)
    return response.data
  },

  // Actualizar el estado de una orden
  updateOrderStatus: async (id: string | number, status: OrderStatus): Promise<Order> => {
    const response = await api.patch(`/orders/${id}`, { status })
    return response.data
  },

  // Obtener órdenes filtradas por fecha
  getOrdersByDate: async (date: string): Promise<Order[]> => {
    const response = await api.get(`/orders?date=${date}`)
    return response.data
  },

  // Obtener órdenes filtradas por rango de fechas
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<Order[]> => {
    const response = await api.get(`/orders?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },
}
