"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/axiosInstance"
import { type CreateOrderDto, OrderStatus } from "@/types/order"

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  areas?: Area[]
}

interface Area {
  id: number
  name: string
  companyId?: number
}

interface UnitMeasurement {
  id: number
  name: string
  description?: string
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
  price: number
  stock: number
  categoryId?: number
  productUnits: ProductUnit[]
}

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  total: number
  unitMeasurementId: number
  unitMeasurementName: string
}

// Interfaz para las opciones del dropdown que combina producto y unidad
// Eliminar esta interfaz
// interface ProductUnitOption {
//   productId: number
//   productName: string
//   unitMeasurementId: number
//   unitMeasurementName: string
//   price: number
//   displayText: string
// }

export default function NewOrderPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [observation, setObservation] = useState("")
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.CREATED)

  const [areaBlocked, setAreaBlocked] = useState(false)
  const [checkingArea, setCheckingArea] = useState(false)
  const [areaBlockMessage, setAreaBlockMessage] = useState("")

  // Para manejar inputs de cantidad como strings para mejor UX
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({})

  // Crear opciones combinadas de producto + unidad de medida
  // const productUnitOptions: ProductUnitOption[] = products.flatMap((product) =>
  //   product.productUnits.map((unit) => ({
  //     productId: product.id,
  //     productName: product.name,
  //     unitMeasurementId: unit.unitMeasurementId,
  //     unitMeasurementName: unit.unitMeasurement.name,
  //     price: product.price,
  //     displayText: `${product.name} - ${unit.unitMeasurement.name}`,
  //   })),
  // )

  // Filtrar opciones por búsqueda
  // const filteredProductUnitOptions = productUnitOptions.filter((option) =>
  //   option.displayText.toLowerCase().includes(productSearch.toLowerCase()),
  // )

  // Cargar clientes y productos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [usersRes, productsRes] = await Promise.all([api.get("/users"), api.get("/products")])

        setCustomers(usersRes.data)
        setProducts(productsRes.data)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Actualizar cliente seleccionado
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === Number(selectedCustomerId))
      setSelectedCustomer(customer || null)

      // Si el cliente tiene áreas, seleccionar la primera por defecto
      if (customer?.areas && customer.areas.length > 0) {
        setSelectedAreaId(customer.areas[0].id.toString())
      } else {
        setSelectedAreaId("")
      }
    } else {
      setSelectedCustomer(null)
      setSelectedAreaId("")
    }
  }, [selectedCustomerId, customers])

  // Verificar si ya existe un pedido para el área seleccionada
  useEffect(() => {
    const checkAreaAvailability = async () => {
      if (!selectedAreaId) {
        setAreaBlocked(false)
        setAreaBlockMessage("")
        return
      }

      setCheckingArea(true)
      setAreaBlocked(false)
      setAreaBlockMessage("")

      try {
        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0]

        const response = await api.get(`/orders/check?areaId=${selectedAreaId}&date=${today}`)

        if (response.data.exists) {
          setAreaBlocked(true)
          setAreaBlockMessage(
            "⚠️ BLOQUEADO: Ya existe un pedido para esta área en la fecha actual (hoy). No se puede crear otro pedido para el mismo día.",
          )
        } else {
          setAreaBlocked(false)
          setAreaBlockMessage("")
        }
      } catch (err) {
        console.error("Error al verificar disponibilidad del área:", err)
        // En caso de error, permitir continuar pero mostrar advertencia
        setAreaBlocked(false)
        setAreaBlockMessage("No se pudo verificar la disponibilidad del área. Procede con precaución.")
      } finally {
        setCheckingArea(false)
      }
    }

    checkAreaAvailability()
  }, [selectedAreaId])

  // Filtrar clientes por búsqueda
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
    const email = customer.email?.toLowerCase() || ""
    const searchTerm = customerSearch.toLowerCase()

    return fullName.includes(searchTerm) || email.includes(searchTerm)
  })

  // Añadir producto al pedido
  const handleAddProduct = () => {
    const newItem: OrderItem = {
      productId: 0,
      productName: "",
      quantity: 0,
      price: 0,
      total: 0,
      unitMeasurementId: 0,
      unitMeasurementName: "",
    }

    const newIndex = orderItems.length
    setOrderItems([...orderItems, newItem])

    // Inicializar el input de cantidad como "0"
    setQuantityInputs((prev) => ({
      ...prev,
      [newIndex]: "0",
    }))
  }

  // Eliminar producto del pedido
  const handleRemoveProduct = (index: number) => {
    const newItems = [...orderItems]
    newItems.splice(index, 1)
    setOrderItems(newItems)

    // Eliminar el input de cantidad correspondiente
    const newQuantityInputs = { ...quantityInputs }
    delete newQuantityInputs[index]
    setQuantityInputs(newQuantityInputs)
  }

  // Actualizar cantidad de un producto - maneja el input como string
  const handleQuantityInputChange = (index: number, value: string) => {
    // Permitir valores vacíos, "0", "0." y decimales
    // Validar que solo contenga números y un punto decimal
    if (value === "" || value === "0" || value === "0." || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setQuantityInputs((prev) => ({
        ...prev,
        [index]: value,
      }))

      // Actualizar el valor numérico en el orderItem
      const numValue = value === "" || value === "0." ? 0 : Number.parseFloat(value)
      if (!isNaN(numValue)) {
        const newItems = [...orderItems]
        newItems[index].quantity = numValue
        newItems[index].total = numValue * newItems[index].price
        setOrderItems(newItems)
      }
    }
  }

  // Actualizar producto y unidad seleccionados
  const handleProductUnitChange = (index: number, optionKey: string) => {
    const [productId, unitMeasurementId] = optionKey.split("-").map(Number)

    const product = products.find((p) => p.id === productId)
    if (!product) return

    const unit = product.productUnits.find((u) => u.unitMeasurementId === unitMeasurementId)
    if (!unit) return

    const currentQuantity = orderItems[index].quantity

    const newItems = [...orderItems]
    newItems[index].productId = product.id
    newItems[index].productName = product.name
    newItems[index].price = product.price
    newItems[index].total = currentQuantity * product.price
    newItems[index].unitMeasurementId = unit.unitMeasurementId
    newItems[index].unitMeasurementName = unit.unitMeasurement.name
    setOrderItems(newItems)
  }

  // Calcular total del pedido
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  // Validar formulario
  const validateForm = () => {
    if (!selectedCustomerId) {
      toast.error("Error de validación", {
        description: "Debes seleccionar un cliente.",
      })
      return false
    }

    if (!selectedAreaId) {
      toast.error("Error de validación", {
        description: "Debes seleccionar un área.",
      })
      return false
    }

    // VALIDACIÓN CRÍTICA: Bloquear si ya existe un pedido para esta área hoy
    if (areaBlocked) {
      toast.error("Pedido duplicado no permitido", {
        description:
          "Ya existe un pedido para esta área en la fecha actual. No se puede crear otro pedido para el mismo día.",
      })
      return false
    }

    if (orderItems.length === 0) {
      toast.error("Error de validación", {
        description: "Debes añadir al menos un producto al pedido.",
      })
      return false
    }

    // Validar que todos los productos estén seleccionados
    const unselectedItems = orderItems.filter((item) => item.productId === 0)
    if (unselectedItems.length > 0) {
      toast.error("Error de validación", {
        description: "Debes seleccionar un producto para todas las filas.",
      })
      return false
    }

    // Validar que todas las cantidades sean válidas
    const invalidItems = orderItems.filter((item) => item.quantity <= 0)
    if (invalidItems.length > 0) {
      toast.error("Error de validación", {
        description: "Todas las cantidades deben ser mayores a 0.",
      })
      return false
    }

    return true
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // VERIFICACIÓN ADICIONAL: Doble verificación antes de enviar
    if (areaBlocked) {
      toast.error("Operación bloqueada", {
        description: "No se puede crear el pedido. Ya existe un pedido para esta área en la fecha actual.",
      })
      return
    }

    if (!validateForm()) return

    setSubmitting(true)

    try {
      // VERIFICACIÓN FINAL: Verificar una vez más antes de enviar al servidor
      const today = new Date().toISOString().split("T")[0]
      const checkResponse = await api.get(`/orders/check?areaId=${selectedAreaId}&date=${today}`)

      if (checkResponse.data.exists) {
        toast.error("Pedido duplicado detectado", {
          description: "Se detectó un pedido existente para esta área. La operación ha sido cancelada.",
        })
        setAreaBlocked(true)
        setAreaBlockMessage("Se detectó un pedido existente para esta área en la fecha actual.")
        return
      }

      const orderData: CreateOrderDto = {
        userId: Number(selectedCustomerId),
        areaId: Number(selectedAreaId),
        totalAmount: calculateTotal(),
        status,
        ...(observation.trim() && { observation: observation.trim() }),
        orderItems: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          unitMeasurementId: item.unitMeasurementId,
        })),
      }

      const response = await api.post("/orders", orderData)

      toast.success("Pedido creado", {
        description: "El pedido ha sido creado correctamente.",
      })

      router.push(`/dashboard/orders/${response.data.id}`)
    } catch (err) {
      console.error("Error al crear el pedido:", err)
      toast.error("Error al crear el pedido", {
        description: "No se pudo crear el pedido. Por favor, intenta de nuevo.",
      })
    } finally {
      setSubmitting(false)
    }
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
        <div className="text-red-500 mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/orders">Volver a pedidos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nuevo Pedido</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información del cliente */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerSearch">Buscar cliente</Label>
                <Input
                  id="customerSearch"
                  placeholder="Buscar por nombre o email"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Seleccionar cliente</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No se encontraron clientes</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <>
                  <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                    </div>

                    {selectedCustomer.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Teléfono:</p>
                        <p className="text-sm">{selectedCustomer.phone}</p>
                      </div>
                    )}

                    {selectedCustomer.address && (
                      <div>
                        <p className="text-xs text-muted-foreground">Dirección:</p>
                        <p className="text-sm">{selectedCustomer.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaId">Área</Label>
                    <Select value={selectedAreaId} onValueChange={setSelectedAreaId} disabled={checkingArea}>
                      <SelectTrigger id="areaId">
                        <SelectValue placeholder={checkingArea ? "Verificando..." : "Seleccionar área"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCustomer.areas && selectedCustomer.areas.length > 0 ? (
                          selectedCustomer.areas.map((area) => (
                            <SelectItem key={area.id} value={area.id.toString()}>
                              {area.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">No hay áreas disponibles</div>
                        )}
                      </SelectContent>
                    </Select>

                    {checkingArea && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando disponibilidad del área...
                      </div>
                    )}

                    {areaBlockMessage && (
                      <div
                        className={`text-sm p-2 rounded-md ${
                          areaBlocked
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {areaBlockMessage}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Estado del pedido</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.CREATED}>Pendiente</SelectItem>
                    <SelectItem value={OrderStatus.PROCESS}>En proceso</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation">Observación (opcional)</Label>
                <Textarea
                  id="observation"
                  placeholder="Añadir observación sobre el pedido..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Productos del pedido */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Productos</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Input
                    placeholder="Buscar y agregar productos..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full"
                  />
                  {productSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductSearch("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  )}

                  {/* Dropdown de resultados de búsqueda */}
                  {productSearch.trim() !== "" && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {(() => {
                        const searchResults = products
                          .flatMap((product) =>
                            product.productUnits.map((unit) => ({
                              productId: product.id,
                              productName: product.name,
                              unitMeasurementId: unit.unitMeasurementId,
                              unitMeasurementName: unit.unitMeasurement.name,
                              price: product.price,
                              displayText: `${product.name} - ${unit.unitMeasurement.name}`,
                            })),
                          )
                          .filter((option) => option.displayText.toLowerCase().includes(productSearch.toLowerCase()))

                        if (searchResults.length === 0) {
                          return (
                            <div className="p-3 text-center text-muted-foreground">
                              No se encontraron productos con {productSearch}
                            </div>
                          )
                        }

                        // Cambiar esto:
                        // return searchResults.map((result, idx) => (
                        // Por esto:
                        return searchResults.map((result) => (
                          <button
                            key={`${result.productId}-${result.unitMeasurementId}`}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                            onClick={() => {
                              // Agregar el producto automáticamente
                              const newItem: OrderItem = {
                                productId: result.productId,
                                productName: result.productName,
                                quantity: 0,
                                price: result.price,
                                total: 0,
                                unitMeasurementId: result.unitMeasurementId,
                                unitMeasurementName: result.unitMeasurementName,
                              }

                              const newIndex = orderItems.length
                              setOrderItems([...orderItems, newItem])
                              setQuantityInputs((prev) => ({
                                ...prev,
                                [newIndex]: "0",
                              }))

                              // Limpiar búsqueda
                              setProductSearch("")
                            }}
                          >
                            <div className="font-medium">{result.displayText}</div>
                          </button>
                        ))
                      })()}
                    </div>
                  )}
                </div>
                <Button type="button" size="sm" onClick={handleAddProduct} className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Añadir vacío</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/30">
                    <p className="text-muted-foreground">No hay productos en el pedido</p>
                    <Button type="button" variant="link" onClick={handleAddProduct} className="mt-2">
                      Añadir producto
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Producto y Unidad</th>
                          <th className="px-4 py-3 text-center text-sm font-medium">Cantidad</th>
                          <th className="px-4 py-3 text-center text-sm font-medium w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => {
                          // Eliminar esta línea:
                          // const currentOptionKey =
                          //   item.productId && item.unitMeasurementId
                          //     ? `${item.productId}-${item.unitMeasurementId}`
                          //     : ""

                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-3">
                                {item.productId === 0 ? (
                                  <Select value="" onValueChange={(value) => handleProductUnitChange(index, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar producto y unidad..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                      {products.flatMap((product) =>
                                        product.productUnits.map((unit) => (
                                          <SelectItem
                                            key={`${product.id}-${unit.unitMeasurementId}`}
                                            value={`${product.id}-${unit.unitMeasurementId}`}
                                          >
                                            {product.name} - {unit.unitMeasurement.name}
                                          </SelectItem>
                                        )),
                                      )}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {item.productName} - {item.unitMeasurementName}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newItems = [...orderItems]
                                        newItems[index] = {
                                          productId: 0,
                                          productName: "",
                                          quantity: 0,
                                          price: 0,
                                          total: 0,
                                          unitMeasurementId: 0,
                                          unitMeasurementName: "",
                                        }
                                        setOrderItems(newItems)
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Cambiar
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={
                                    quantityInputs[index] !== undefined
                                      ? quantityInputs[index]
                                      : item.quantity.toString()
                                  }
                                  onChange={(e) => handleQuantityInputChange(index, e.target.value)}
                                  className="w-20 mx-auto text-center"
                                  placeholder="0"
                                  step="0.01"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveProduct(index)}
                                  className="h-8 w-8 text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-muted/30">
                        <tr className="border-t">
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">
                            Total productos: {orderItems.length}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/orders">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={submitting || areaBlocked || checkingArea}
                className={`w-full sm:w-auto ${
                  areaBlocked ? "bg-red-600 hover:bg-red-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : areaBlocked ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Bloqueado - Pedido ya existe
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear pedido
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
