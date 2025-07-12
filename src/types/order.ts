export enum OrderStatus {
  CREATED = "created",
  PROCESS = "process",
  DELIVERED = "delivered",
}

export interface OrderItem {
  id?: number
  productId: number
  productName?: string
  quantity: number
  price: number
  total?: number
  unit?: string
  unitMeasurementId?: number
  unitMeasurementName?: string
  product?: Product // Añadimos la propiedad product
}


export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
}
export interface Order {
  id?: string | number
  userId: number // Changed from customerId to match backend
  areaId: number // Added to match backend
  customer?: Customer
  totalAmount: number
  status: OrderStatus
  orderItems: OrderItem[]
  createdAt?: string
  updatedAt?: string
  deliveryDate?: string
  notes?: string
  shippingAddress?: string
  User?: Customer // Añadimos User que viene del backend
  area?: {
    // Añadimos area que viene del backend
    id: number
    name: string
    companyId?: number
  }
}

export interface CreateOrderItemDto {
  productId: number
  quantity: number
  price: number
}

export interface CreateOrderDto {
  userId: number        // Changed from customerId to match backend
  areaId: number        // Added to match backend
  totalAmount: number
  status: OrderStatus
  orderItems: CreateOrderItemDto[]
}
export interface UpdateOrderDto {
  status?: OrderStatus
  notes?: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock?: number
  imageUrl?: string
  categoryId?: number
  unitMeasurementId?: number
  createdAt?: string
  updatedAt?: string
}