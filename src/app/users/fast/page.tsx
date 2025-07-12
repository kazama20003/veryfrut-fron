"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Loader2, User, Search, Package, AlertTriangle, Edit, Zap, X } from "lucide-react"
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
  role?: string
}

interface Area {
  id: number
  name: string
  companyId?: number
  color?: string
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

interface CurrentUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  role: string
  areas?: Area[]
}

interface ProductOption {
  productId: number
  productName: string
  unitMeasurementId: number
  unitMeasurementName: string
  price: number
  stock: number
  displayText: string
  searchText: string
}

// Función para decodificar JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decodificando JWT:", error)
    return null
  }
}

export default function NewOrderPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
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
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [, setExistingOrderId] = useState<number | null>(null)
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1)

  // Para manejar inputs de cantidad como strings para mejor UX
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({})

  // Determinar si el usuario actual es admin o cliente
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "ADMIN"
  const isClient = !isAdmin

  // Función para obtener fecha actual en zona horaria de Lima, Perú (UTC-5)
  const getLimaPeruDate = (): string => {
    const now = new Date()
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const limaTime = new Date(utc + -5 * 3600000)

    const year = limaTime.getFullYear()
    const month = String(limaTime.getMonth() + 1).padStart(2, "0")
    const day = String(limaTime.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Función mejorada para obtener el usuario actual desde el token JWT
  const getCurrentUser = async (): Promise<CurrentUser | null> => {
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem("token") || localStorage.getItem("authToken")
      if (!token) {
        throw new Error("No hay token de autenticación")
      }

      // Decodificar el token JWT para obtener el ID del usuario
      const decodedToken = decodeJWT(token)
      if (!decodedToken || !decodedToken.sub) {
        throw new Error("Token inválido o sin ID de usuario")
      }

      const userId = decodedToken.sub
      console.log("ID de usuario desde token:", userId)

      // Obtener información completa del usuario desde la API
      const userResponse = await api.get(`/users/${userId}`)
      const userData = userResponse.data

      console.log("Datos del usuario obtenidos:", userData)

      if (!userData.id || !userData.email || !userData.role) {
        throw new Error("Datos de usuario incompletos")
      }

      return userData as CurrentUser
    } catch (error) {
      console.error("Error al obtener usuario actual:", error)
      return null
    }
  }

 

  // Cargar usuario actual y datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Obtener usuario actual desde el token
        const userData = await getCurrentUser()
        if (!userData) {
          setError("No se encontró información del usuario. Por favor, inicia sesión.")
          return
        }

        setCurrentUser(userData)
        console.log("Usuario actual establecido:", userData)

        // Cargar productos siempre
        const productsRes = await api.get("/products")
        setProducts(productsRes.data)

        // Si es admin, cargar también todos los clientes
        if (userData.role === "admin" || userData.role === "ADMIN") {
          const usersRes = await api.get("/users")
          setCustomers(usersRes.data)
        } else {
          // Si es cliente, usar automáticamente sus datos
          setSelectedCustomerId(userData.id.toString())
          setSelectedCustomer(userData as Customer)

          // Si tiene áreas, seleccionar la primera por defecto
          if (userData.areas && userData.areas.length > 0) {
            setSelectedAreaId(userData.areas[0].id.toString())
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Enfocar buscador al cargar
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [loading])

  // Actualizar cliente seleccionado (solo para admins)
  useEffect(() => {
    if (isAdmin && selectedCustomerId) {
      const customer = customers.find((c) => c.id === Number(selectedCustomerId))
      setSelectedCustomer(customer || null)

      if (customer?.areas && customer.areas.length > 0) {
        setSelectedAreaId(customer.areas[0].id.toString())
      } else {
        setSelectedAreaId("")
      }
    }
  }, [selectedCustomerId, customers, isAdmin])

  // Verificar si ya existe un pedido para el área seleccionada - VERIFICACIÓN INICIAL
  useEffect(() => {
    const checkAreaAvailability = async () => {
      if (!selectedAreaId) {
        setAreaBlocked(false)
        setAreaBlockMessage("")
        setExistingOrderId(null)
        return
      }

      setCheckingArea(true)
      setAreaBlocked(false)
      setAreaBlockMessage("")
      setExistingOrderId(null)

      try {
        const limaDate = getLimaPeruDate()
        console.log(`Verificando pedido para área ${selectedAreaId} en fecha ${limaDate}`)

        const response = await api.get(`/orders/check?areaId=${selectedAreaId}&date=${limaDate}`)
        console.log("Respuesta de verificación:", response.data)

        if (response.data && response.data.exists === true) {
          console.log("PEDIDO EXISTE - BLOQUEANDO DESDE EL INICIO")
          setAreaBlocked(true)
          setExistingOrderId(response.data.orderId || null)
          setAreaBlockMessage(
            "⚠️ PEDIDO EXISTENTE: Ya tienes un pedido creado para esta área el día de hoy. No puedes crear otro pedido hasta mañana.",
          )

          toast.error("Pedido ya existe para hoy", {
            description: "Ya existe un pedido para esta área hoy. Solo se permite un pedido por área por día.",
            action: {
              label: "Ver historial",
              onClick: () => router.push("/users/history"),
            },
          })
        } else {
          console.log("NO EXISTE PEDIDO - PERMITIENDO CREACIÓN")
          setAreaBlocked(false)
          setAreaBlockMessage("")
          setExistingOrderId(null)
        }
      } catch (err) {
        console.error("Error al verificar disponibilidad del área:", err)
        setAreaBlocked(false)
        setAreaBlockMessage(
          "⚠️ No se pudo verificar la disponibilidad del área. Verifica tu conexión e intenta nuevamente.",
        )
        setExistingOrderId(null)
      } finally {
        setCheckingArea(false)
      }
    }

    // Ejecutar verificación inmediatamente cuando se selecciona un área
    if (selectedAreaId) {
      checkAreaAvailability()
    }
  }, [selectedAreaId, router])

  // Filtrar clientes por búsqueda (solo para admins)
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
    const email = customer.email?.toLowerCase() || ""
    const searchTerm = customerSearch.toLowerCase()
    return fullName.includes(searchTerm) || email.includes(searchTerm)
  })

  // Obtener opciones de productos filtradas con mejor búsqueda
  const getFilteredProductOptions = (): ProductOption[] => {
    if (!productSearch.trim()) return []

    const searchTerm = productSearch.toLowerCase().trim()
    return products
      .flatMap((product) =>
        product.productUnits.map((unit) => ({
          productId: product.id,
          productName: product.name,
          unitMeasurementId: unit.unitMeasurementId,
          unitMeasurementName: unit.unitMeasurement.name,
          price: product.price,
          stock: product.stock,
          displayText: `${product.name} - ${unit.unitMeasurement.name}`,
          searchText: `${product.name} ${unit.unitMeasurement.name}`.toLowerCase(),
        })),
      )
      .filter(
        (option) =>
          option.searchText.includes(searchTerm) ||
          option.productName.toLowerCase().includes(searchTerm) ||
          option.unitMeasurementName.toLowerCase().includes(searchTerm),
      )
      .sort((a, b) => {
        const aStartsWith = a.productName.toLowerCase().startsWith(searchTerm)
        const bStartsWith = b.productName.toLowerCase().startsWith(searchTerm)
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        return a.productName.localeCompare(b.productName)
      })
      .slice(0, 10)
  }

  // Manejar navegación con teclado en búsqueda
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const searchResults = getFilteredProductOptions()

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedSearchIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedSearchIndex >= 0 && searchResults[selectedSearchIndex]) {
        handleAddSpecificProduct(searchResults[selectedSearchIndex])
        setSelectedSearchIndex(-1)
      }
    } else if (e.key === "Escape") {
      setShowProductSearch(false)
      setSelectedSearchIndex(-1)
    }
  }

  // Añadir producto específico desde la búsqueda
  const handleAddSpecificProduct = (productOption: ProductOption) => {
    const existingIndex = orderItems.findIndex(
      (item) =>
        item.productId === productOption.productId && item.unitMeasurementId === productOption.unitMeasurementId,
    )

    if (existingIndex >= 0) {
      const currentQuantity = orderItems[existingIndex].quantity
      const newQuantity = currentQuantity + 1
      const newItems = [...orderItems]
      newItems[existingIndex].quantity = newQuantity
      newItems[existingIndex].total = newQuantity * newItems[existingIndex].price
      setOrderItems(newItems)

      setQuantityInputs((prev) => ({
        ...prev,
        [existingIndex]: newQuantity.toString(),
      }))

      toast.success("Cantidad actualizada", {
        description: `${productOption.productName} - ${productOption.unitMeasurementName}: ${newQuantity}`,
      })
    } else {
      const newItem: OrderItem = {
        productId: productOption.productId,
        productName: productOption.productName,
        quantity: 1,
        price: productOption.price,
        total: productOption.price,
        unitMeasurementId: productOption.unitMeasurementId,
        unitMeasurementName: productOption.unitMeasurementName,
      }

      const newIndex = orderItems.length
      setOrderItems([...orderItems, newItem])
      setQuantityInputs((prev) => ({
        ...prev,
        [newIndex]: "1",
      }))

      toast.success("Producto agregado", {
        description: `${productOption.productName} - ${productOption.unitMeasurementName}`,
      })
    }

    setProductSearch("")
    setShowProductSearch(false)
    setSelectedSearchIndex(-1)

    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Eliminar producto del pedido
  const handleRemoveProduct = (index: number) => {
    const newItems = [...orderItems]
    newItems.splice(index, 1)
    setOrderItems(newItems)

    const newQuantityInputs = { ...quantityInputs }
    delete newQuantityInputs[index]
    setQuantityInputs(newQuantityInputs)
  }

  // Actualizar cantidad de un producto
  const handleQuantityInputChange = (index: number, value: string) => {
    if (value === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
      setQuantityInputs((prev) => ({
        ...prev,
        [index]: value,
      }))

      const numValue = value === "" ? 0 : Number.parseFloat(value) || 0
      const newItems = [...orderItems]
      newItems[index].quantity = numValue
      newItems[index].total = numValue * newItems[index].price
      setOrderItems(newItems)
    }
  }

  // Actualizar producto y unidad seleccionados
  const handleProductUnitChange = (index: number, optionKey: string) => {
    const [productId, unitMeasurementId] = optionKey.split("-").map(Number)
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const unit = product.productUnits.find((u) => u.unitMeasurementId === unitMeasurementId)
    if (!unit) return

    const currentQuantity = orderItems[index].quantity || 1
    const newItems = [...orderItems]
    newItems[index].productId = product.id
    newItems[index].productName = product.name
    newItems[index].price = product.price
    newItems[index].quantity = currentQuantity
    newItems[index].total = currentQuantity * product.price
    newItems[index].unitMeasurementId = unit.unitMeasurementId
    newItems[index].unitMeasurementName = unit.unitMeasurement.name
    setOrderItems(newItems)

    if (!quantityInputs[index]) {
      setQuantityInputs((prev) => ({
        ...prev,
        [index]: "1",
      }))
    }
  }

  // Calcular total de productos (cantidad)
  const calculateTotalQuantity = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0)
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

    if (areaBlocked) {
      toast.error("Pedido ya existe", {
        description: "Ya tienes un pedido para esta área hoy. Edita tu pedido existente desde el historial.",
        action: {
          label: "Ver historial",
          onClick: () => router.push("/users/history"),
        },
      })
      return false
    }

    if (orderItems.length === 0) {
      toast.error("Error de validación", {
        description: "Debes añadir al menos un producto al pedido.",
      })
      return false
    }

    const unselectedItems = orderItems.filter((item) => item.productId === 0)
    if (unselectedItems.length > 0) {
      toast.error("Error de validación", {
        description: "Debes seleccionar un producto para todas las filas.",
      })
      return false
    }

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

    if (areaBlocked) {
      toast.error("Operación bloqueada", {
        description: "Ya existe un pedido para esta área hoy. Solo se permite un pedido por área por día.",
        action: {
          label: "Ver historial",
          onClick: () => router.push("/users/history"),
        },
      })
      return
    }

    if (!validateForm()) return

    setSubmitting(true)
    try {
      const limaDate = getLimaPeruDate()
      const checkResponse = await api.get(`/orders/check?areaId=${selectedAreaId}&date=${limaDate}`)

      if (checkResponse.data && checkResponse.data.exists === true) {
        console.log("VERIFICACIÓN FINAL - PEDIDO EXISTE - BLOQUEANDO ENVÍO")
        toast.error("Pedido duplicado detectado", {
          description: "Se detectó un pedido existente para esta área. Solo se permite un pedido por día.",
        })
        setAreaBlocked(true)
        setExistingOrderId(checkResponse.data.orderId || null)
        return
      }

      const orderData: CreateOrderDto = {
        userId: Number(selectedCustomerId),
        areaId: Number(selectedAreaId),
        totalAmount: orderItems.reduce((sum, item) => sum + item.total, 0),
        status,
        ...(observation.trim() && { observation: observation.trim() }),
        orderItems: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          unitMeasurementId: item.unitMeasurementId,
        })),
      }

      await api.post("/orders", orderData)

      toast.success("¡Pedido creado exitosamente!", {
        description: `Se creó el pedido con ${orderItems.length} productos.`,
        action: {
          label: "Ver historial",
          onClick: () => router.push("/users/history"),
        },
      })

      // Refrescar la página completa después de crear la orden
      window.location.reload()
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
          <Link href="/users/fast">Volver</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header optimizado para móvil */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isClient ? "Pedido Rápido" : "Nuevo Pedido"}
            </h1>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Zap className="h-3 w-3 mr-1" />
              Rápido
            </Badge>
          </div>
          {isClient && currentUser && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="sm:hidden">{currentUser.firstName}</span>
            </div>
          )}
        </div>

        {/* Información del área seleccionada - Móvil optimizado */}
        {selectedCustomer && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Área de entrega</Label>
                  {checkingArea && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <Select value={selectedAreaId} onValueChange={setSelectedAreaId} disabled={checkingArea}>
                  <SelectTrigger>
                    <SelectValue placeholder={checkingArea ? "Verificando..." : "Seleccionar área"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer.areas && selectedCustomer.areas.length > 0 ? (
                      selectedCustomer.areas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: area.color || "#4FC3F7" }}
                            />
                            {area.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No hay áreas disponibles</div>
                    )}
                  </SelectContent>
                </Select>

                {areaBlockMessage && (
                  <div
                    className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                      areaBlocked
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span>{areaBlockMessage}</span>
                      {areaBlocked && (
                        <div className="mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => router.push("/users/history")}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar pedido existente
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sección de productos con diseño de tabla como en la imagen */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-semibold">Productos</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => {
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
                  setQuantityInputs((prev) => ({
                    ...prev,
                    [newIndex]: "0",
                  }))
                }}
                className="bg-black text-white hover:bg-gray-800"
                disabled={areaBlocked}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir vacío
              </Button>
            </div>

            {/* Búsqueda de productos */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar y agregar productos..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value)
                  setShowProductSearch(e.target.value.length > 0)
                  setSelectedSearchIndex(-1)
                }}
                onFocus={() => setShowProductSearch(productSearch.length > 0)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-10"
                disabled={areaBlocked}
              />
              {productSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProductSearch("")
                    setShowProductSearch(false)
                    setSelectedSearchIndex(-1)
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showProductSearch && (
              <div className="border rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto mb-4">
                {(() => {
                  const searchResults = getFilteredProductOptions()
                  if (searchResults.length === 0) {
                    return (
                      <div className="p-4 text-center text-muted-foreground">
                        No se encontraron productos con {productSearch}
                      </div>
                    )
                  }
                  return searchResults.map((result, index) => (
                    <button
                      key={`${result.productId}-${result.unitMeasurementId}`}
                      type="button"
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors ${
                        index === selectedSearchIndex ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => handleAddSpecificProduct(result)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {result.productName} - {result.unitMeasurementName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {result.stock}
                            {result.stock < 10 && (
                              <Badge variant="destructive" className="text-xs px-1 py-0 ml-2">
                                Bajo stock
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                    </button>
                  ))
                })()}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Tabla de productos como en la imagen */}
            <div className="border rounded-lg overflow-hidden">
              {/* Header de la tabla */}
              <div className="bg-gray-50 border-b">
                <div className="grid grid-cols-12 gap-4 p-3">
                  <div className="col-span-8 text-sm font-medium text-gray-700">Producto y Unidad</div>
                  <div className="col-span-3 text-sm font-medium text-gray-700 text-center">Cantidad</div>
                  <div className="col-span-1"></div>
                </div>
              </div>

              {/* Filas de productos */}
              <div className="divide-y">
                {orderItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">No hay productos en el pedido</p>
                    <p className="text-xs">Usa el buscador de arriba o el botón Añadir vacío</p>
                  </div>
                ) : (
                  orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-gray-50">
                      {/* Producto y Unidad */}
                      <div className="col-span-8">
                        {item.productId === 0 ? (
                          <Select
                            value=""
                            onValueChange={(value) => handleProductUnitChange(index, value)}
                            disabled={areaBlocked}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar producto y unidad..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {products.flatMap((product) =>
                                product.productUnits.map((unit) => (
                                  <SelectItem
                                    key={`${product.id}-${unit.unitMeasurementId}`}
                                    value={`${product.id}-${unit.unitMeasurementId}`}
                                  >
                                    <div className="flex flex-col">
                                      <span>
                                        {product.name} - {unit.unitMeasurement.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                    </div>
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
                                setQuantityInputs((prev) => ({
                                  ...prev,
                                  [index]: "0",
                                }))
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              disabled={areaBlocked}
                            >
                              Cambiar
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-3">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={quantityInputs[index] !== undefined ? quantityInputs[index] : item.quantity.toString()}
                          onChange={(e) => handleQuantityInputChange(index, e.target.value)}
                          className="text-center"
                          placeholder="0"
                          disabled={areaBlocked}
                        />
                      </div>

                      {/* Botón eliminar */}
                      <div className="col-span-1 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          disabled={areaBlocked}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resumen y observación */}
            {orderItems.length > 0 && (
              <div className="mt-6 space-y-4">
                {/* Total de productos */}
                <div className="text-right">
                  <span className="text-sm font-medium">Total productos: {calculateTotalQuantity()}</span>
                </div>

                {/* Observación */}
                <div className="space-y-2">
                  <Label htmlFor="observation">Observación (opcional)</Label>
                  <Textarea
                    id="observation"
                    placeholder="Añadir observación sobre el pedido..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                    disabled={areaBlocked}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <div className="flex w-full gap-3">
              <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/users/fast">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={submitting || areaBlocked || checkingArea || orderItems.length === 0}
                className={`flex-1 ${
                  areaBlocked ? "bg-red-600 hover:bg-red-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando pedido...
                  </>
                ) : areaBlocked ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Bloqueado - Pedido existe
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear pedido
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Información del cliente para admins - Colapsada en móvil */}
        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerSearch">Buscar cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerSearch"
                    placeholder="Buscar por nombre o email"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                          <div className="flex flex-col">
                            <span>
                              {customer.firstName} {customer.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">No se encontraron clientes</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div>
                    <p className="font-medium">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
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
              )}

              {isAdmin && (
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
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
