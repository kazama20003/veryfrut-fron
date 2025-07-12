"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Apple, MoreVertical, Plus, Search, Leaf, Tag, Edit, Trash2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/axiosInstance"
import { toast } from "sonner"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AxiosError } from "axios"

// Interfaz para errores de API
interface ApiErrorResponse {
  message: string
  error?: string
  statusCode?: number
}

// Definir una interfaz para el tipo de producto según la estructura proporcionada
interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  categoryId: number
  createdAt: string
  updatedAt: string

  // Nueva estructura para unidades de medida múltiples
  productUnits: {
    id: number
    productId: number
    unitMeasurementId: number
    unitMeasurement: {
      id: number
      name: string
      description: string
    }
  }[]

  // Campos adicionales que pueden venir del backend
  category?: {
    id: number
    name: string
  }
  isOrganic?: boolean
  onSale?: boolean
  originalPrice?: number
  origin?: string
}

// Interfaz para categorías
interface Category {
  id: number
  name: string
}

// Función para verificar si un error es un AxiosError con respuesta
function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  )
}

// Modificar el componente ProductCard para resolver el problema de accesibilidad ARIA
// Reemplazar la implementación actual del DropdownMenu con esta versión mejorada:

function ProductCard({
  product,
  onDelete,
  index,
}: {
  product: Product
  onDelete: (id: number) => Promise<void>
  index: number
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleDelete = () => {
    // Cerrar el menú antes de abrir el diálogo para evitar problemas de accesibilidad
    setIsMenuOpen(false)
    // Usar setTimeout para asegurar que el menú se cierre completamente antes de abrir el diálogo
    setTimeout(() => {
      setIsDeleteDialogOpen(true)
    }, 100)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(product.id)
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      toast.error("No se pudo eliminar el producto. Por favor, intenta de nuevo.")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Determinar si esta es una de las primeras imágenes (para prioridad)
  const isPriority = index < 4 // Priorizar las primeras 4 imágenes (visible en la primera pantalla)

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md border-muted group">
        <div className="relative h-44 sm:h-52 bg-muted overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority={isPriority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Apple className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={5} collisionPadding={10}>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {product.isOrganic && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-green-600 hover:bg-green-700 text-[10px]">
                <Leaf className="mr-1 h-2.5 w-2.5" />
                Orgánico
              </Badge>
            </div>
          )}
          {product.onSale && (
            <div className="absolute bottom-2 left-2 z-10">
              <Badge variant="destructive" className="text-[10px]">
                <Tag className="mr-1 h-2.5 w-2.5" />
                Oferta
              </Badge>
            </div>
          )}
          {/* Overlay gradiente para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="font-semibold text-sm sm:text-base leading-tight group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
            )}
          </div>

          {/* Unidades de medida disponibles */}
          {product.productUnits && product.productUnits.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.productUnits.map((unit) => (
                <Badge key={unit.id} variant="secondary" className="text-[10px] px-2 py-0.5 bg-secondary/30">
                  {unit.unitMeasurement.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/50">
            <div className="text-xs font-medium">
              <span
                className={
                  product.stock > 10
                    ? "text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm"
                    : product.stock > 0
                      ? "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm"
                      : "text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm"
                }
              >
                {product.stock > 10 ? "En stock" : product.stock > 0 ? `Solo ${product.stock}` : "Agotado"}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">{product.origin && `Origen: ${product.origin}`}</div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto {product.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Componente principal de la página de productos
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  // Estado para categorías y búsqueda
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  const productsPerPage = 8

  // Cargar productos desde la API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Cargar categorías
        try {
          const categoriesRes = await api.get("/categories")
          setCategories(categoriesRes.data)

          // Cargar productos por separado para manejar el error 404
          try {
            const productsRes = await api.get("/products")
            console.log("Productos cargados:", productsRes.data)
            setProducts(productsRes.data)
          } catch (err: unknown) {
            if (isAxiosError(err) && err.response?.status === 404) {
              console.log("No se encontraron productos:", err.response.data)
              setProducts([])
              // No establecemos error aquí, solo productos vacíos
            } else {
              throw err // Re-lanzar otros errores para que los maneje el catch externo
            }
          }
        } catch (err: unknown) {
          console.error("Error al cargar datos:", err)
          if (isAxiosError(err) && err.response?.data?.message) {
            setError(err.response.data.message)
          } else {
            setError("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.")
          }
        } finally {
          setLoading(false)
        }
      } catch (err: unknown) {
        console.error("Error al cargar datos:", err)
        if (isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message)
        } else {
          setError("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Eliminar un producto - Mejorado para manejar errores y evitar bloqueos
  const handleDeleteProduct = useCallback(async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`)
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id))
    } catch (err) {
      console.error("Error al eliminar el producto:", err)
      throw err // Re-lanzar el error para que lo maneje el componente ProductCard
    }
  }, [])

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.origin?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.categoryId === Number.parseInt(selectedCategory)

    return matchesSearch && matchesCategory
  })

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "stock":
        return b.stock - a.stock
      case "name":
        return a.name.localeCompare(b.name)
      default: // newest
        return b.id - a.id
    }
  })

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Calcular total de páginas
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error al cargar productos</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Productos</h1>
        <Button size="sm" className="text-xs sm:text-sm" asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              className="mr-2 whitespace-nowrap"
              onClick={() => setSelectedCategory("all")}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                size="sm"
                className="mr-2 whitespace-nowrap"
                onClick={() => setSelectedCategory(category.id.toString())}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-8 h-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="stock">Disponibilidad</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {sortedProducts.length} resultados para {searchTerm}
          </div>
        )}

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {currentProducts.length > 0 ? (
            currentProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} index={index} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-1">No se encontraron productos</h3>
              <p className="text-muted-foreground mb-4">
                No hay productos disponibles que coincidan con los criterios de búsqueda.
              </p>
              {searchTerm || selectedCategory !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/dashboard/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar producto
                  </Link>
                </Button>
              )}
            </div>
          )}
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
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNumber

                // Lógica para mostrar las páginas correctas cuando hay muchas
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                  if (i === 4)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                  if (i === 0)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                } else {
                  if (i === 0)
                    return (
                      <PaginationItem key={i}>
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
                    )
                  if (i === 1)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  if (i === 3)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  if (i === 4)
                    return (
                      <PaginationItem key={i}>
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
                    )
                  pageNumber = currentPage + i - 2
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNumber)
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
