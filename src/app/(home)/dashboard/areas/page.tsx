"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, AlertCircle, MapPin } from "lucide-react"
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

// Definir interfaz para el área
interface Area {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
}

// Componente para la tarjeta de área
function AreaCard({
  area,
  onEdit,
  onDelete,
}: {
  area: Area
  onEdit: (area: Area) => void
  onDelete: (id: number) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(area.id)
    setIsDeleteDialogOpen(false)
  }

  // Generar un color basado en el ID del área para tener variedad visual
  const getAreaColor = () => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-orange-100 text-orange-800",
      "bg-teal-100 text-teal-800",
      "bg-cyan-100 text-cyan-800",
    ]
    return colors[(area.id - 1) % colors.length]
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getAreaColor()}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{area.name}</h3>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(area)}>
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
          <div className="text-xs text-muted-foreground">ID: {area.id}</div>
          <div className="text-xs text-muted-foreground">
            {area.createdAt && new Date(area.createdAt).toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el área {area.name} y no se puede deshacer.
              <p className="mt-2 text-red-500 font-medium">
                Nota: Eliminar esta área podría afectar a los usuarios asociados a ella.
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

// Componente para el formulario de área
function AreaForm({
  area,
  onSubmit,
  isOpen,
  onOpenChange,
}: {
  area: Area | null
  onSubmit: (data: Partial<Area>) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos del área si estamos editando
  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || "",
      })
    } else {
      setFormData({
        name: "",
      })
    }
  }, [area, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que el nombre no esté vacío
    if (!formData.name.trim()) {
      toast.error("El nombre del área es obligatorio")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar área:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{area ? "Editar área" : "Nueva área"}</DialogTitle>
          <DialogDescription>
            {area ? "Actualiza el nombre del área existente." : "Ingresa el nombre para crear una nueva área."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del área *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Zona Norte"
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
                  {area ? "Actualizando..." : "Creando..."}
                </>
              ) : area ? (
                "Actualizar área"
              ) : (
                "Crear área"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal de la página de áreas
export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentArea, setCurrentArea] = useState<Area | null>(null)

  const areasPerPage = 9

  // Cargar áreas desde la API
  useEffect(() => {
    const fetchAreas = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get("/areas")
        setAreas(response.data)
      } catch (err) {
        console.error("Error al cargar áreas:", err)
        setError("No se pudieron cargar las áreas. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchAreas()
  }, [])

  // Crear nueva área
  const handleCreateArea = async (data: Partial<Area>) => {
    try {
      const response = await api.post("/areas", data)
      setAreas([...areas, response.data])
      toast.success("Área creada correctamente")
    } catch (err) {
      console.error("Error al crear el área:", err)
      toast.error("No se pudo crear el área. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar área existente
  const handleUpdateArea = async (data: Partial<Area>) => {
    if (!currentArea) return

    try {
      const response = await api.patch(`/areas/${currentArea.id}`, data)
      setAreas(areas.map((area) => (area.id === currentArea.id ? { ...area, ...response.data } : area)))
      toast.success("Área actualizada correctamente")
    } catch (err) {
      console.error("Error al actualizar el área:", err)
      toast.error("No se pudo actualizar el área. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Eliminar área
  const handleDeleteArea = async (id: number) => {
    try {
      await api.delete(`/areas/${id}`)
      setAreas(areas.filter((area) => area.id !== id))
      toast.success("Área eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar el área:", err)
      toast.error("No se pudo eliminar el área. Por favor, intenta de nuevo.")
    }
  }

  // Abrir formulario para editar
  const handleEdit = (area: Area) => {
    setCurrentArea(area)
    setIsFormOpen(true)
  }

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentArea(null)
    setIsFormOpen(true)
  }

  // Manejar envío del formulario
  const handleFormSubmit = async (data: Partial<Area>) => {
    if (currentArea) {
      await handleUpdateArea(data)
    } else {
      await handleCreateArea(data)
    }
  }

  // Filtrar áreas por búsqueda
  const filteredAreas = areas.filter((area) => area.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Calcular áreas para la página actual
  const indexOfLastArea = currentPage * areasPerPage
  const indexOfFirstArea = indexOfLastArea - areasPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstArea, indexOfLastArea)

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredAreas.length / areasPerPage)

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
        <h2 className="text-xl font-semibold mb-2">Error al cargar áreas</h2>
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Áreas</h1>
        <Button size="sm" className="text-xs sm:text-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Área
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar áreas..."
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
            {filteredAreas.length} resultados para {searchTerm}
          </div>
        )}

        {/* Grid de áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentAreas.length > 0 ? (
            currentAreas.map((area) => (
              <AreaCard key={area.id} area={area} onEdit={handleEdit} onDelete={handleDeleteArea} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-muted-foreground">No se encontraron áreas</p>
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

      {/* Formulario para crear/editar área */}
      <AreaForm area={currentArea} onSubmit={handleFormSubmit} isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
