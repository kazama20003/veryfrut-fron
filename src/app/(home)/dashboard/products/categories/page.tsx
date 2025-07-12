"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, AlertCircle, Tag } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Modificar la interfaz Category para que solo tenga name como campo obligatorio
interface Category {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

// Modificar el componente CategoryCard para que solo muestre el nombre
function CategoryCard({
  category,
  onEdit,
  onDelete,
}: { category: Category; onEdit: (category: Category) => void; onDelete: (id: number) => void }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(category.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{category.name}</h3>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-2 bg-muted/30 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">ID: {category.id}</div>
          <div className="text-xs text-muted-foreground">
            {category.createdAt && new Date(category.createdAt).toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la categoría {category.name} y no se puede deshacer.
              <p className="mt-2 text-red-500 font-medium">
                Nota: Eliminar esta categoría podría afectar a los productos asociados a ella.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Modificar el componente CategoryForm para que solo pida el campo name
function CategoryForm({
  category,
  onSubmit,
  isOpen,
  onOpenChange,
}: {
  category: Category | null
  onSubmit: (data: Partial<Category>) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos de la categoría si estamos editando
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
      })
    } else {
      setFormData({
        name: "",
      })
    }
  }, [category, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar categoría:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Actualiza el nombre de la categoría existente."
              : "Ingresa el nombre para crear una nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la categoría *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Frutas"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {category ? "Actualizando..." : "Creando..."}
                </>
              ) : category ? (
                "Actualizar categoría"
              ) : (
                "Crear categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal de la página de categorías
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  const categoriesPerPage = 8

  // Cargar categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get("/categories")
        setCategories(response.data)
      } catch (err) {
        console.error("Error al cargar categorías:", err)
        setError("No se pudieron cargar las categorías. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Crear nueva categoría
  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      const response = await api.post("/categories", data)
      setCategories([...categories, response.data])
      toast.success("Categoría creada correctamente")
    } catch (err) {
      console.error("Error al crear la categoría:", err)
      toast.error("No se pudo crear la categoría. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar categoría existente
  const handleUpdateCategory = async (data: Partial<Category>) => {
    if (!currentCategory) return

    try {
      const response = await api.patch(`/categories/${currentCategory.id}`, data)
      setCategories(
        categories.map((category) =>
          category.id === currentCategory.id ? { ...category, ...response.data } : category,
        ),
      )
      toast.success("Categoría actualizada correctamente")
    } catch (err) {
      console.error("Error al actualizar la categoría:", err)
      toast.error("No se pudo actualizar la categoría. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Eliminar categoría
  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`)
      setCategories(categories.filter((category) => category.id !== id))
      toast.success("Categoría eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar la categoría:", err)
      toast.error("No se pudo eliminar la categoría. Por favor, intenta de nuevo.")
    }
  }

  // Abrir formulario para editar
  const handleEdit = (category: Category) => {
    setCurrentCategory(category)
    setIsFormOpen(true)
  }

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentCategory(null)
    setIsFormOpen(true)
  }

  // Manejar envío del formulario
  const handleFormSubmit = async (data: Partial<Category>) => {
    if (currentCategory) {
      await handleUpdateCategory(data)
    } else {
      await handleCreateCategory(data)
    }
  }

  // Modificar la función de filtrado para que solo busque por nombre
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular categorías para la página actual
  const indexOfLastCategory = currentPage * categoriesPerPage
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory)

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)

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
        <h2 className="text-xl font-semibold mb-2">Error al cargar categorías</h2>
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categorías</h1>
        <Button size="sm" className="text-xs sm:text-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categorías..."
              className="w-full pl-8 h-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {filteredCategories.length} resultados para {searchTerm}
          </div>
        )}

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentCategories.length > 0 ? (
            currentCategories.map((category) => (
              <CategoryCard key={category.id} category={category} onEdit={handleEdit} onDelete={handleDeleteCategory} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-muted-foreground">No se encontraron categorías</p>
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

      {/* Formulario para crear/editar categoría */}
      <CategoryForm
        category={currentCategory}
        onSubmit={handleFormSubmit}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  )
}
