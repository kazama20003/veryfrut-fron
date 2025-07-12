"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, AlertCircle, Scale } from "lucide-react"
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

// Modificar la interfaz UnitMeasurement para que solo tenga name y description
interface UnitMeasurement {
  id: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// Modificar el componente UnitMeasurementForm para que solo pida name y description
function UnitMeasurementForm({
  unitMeasurement,
  onSubmit,
  isOpen,
  onOpenChange,
}: {
  unitMeasurement: UnitMeasurement | null
  onSubmit: (data: Partial<UnitMeasurement>) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos de la unidad de medida si estamos editando
  useEffect(() => {
    if (unitMeasurement) {
      setFormData({
        name: unitMeasurement.name || "",
        description: unitMeasurement.description || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [unitMeasurement, isOpen])

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
      console.error("Error al guardar unidad de medida:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{unitMeasurement ? "Editar unidad de medida" : "Nueva unidad de medida"}</DialogTitle>
          <DialogDescription>
            {unitMeasurement
              ? "Actualiza los detalles de la unidad de medida existente."
              : "Completa el formulario para crear una nueva unidad de medida."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Kilogramo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Breve descripción de la unidad de medida"
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
                  {unitMeasurement ? "Actualizando..." : "Creando..."}
                </>
              ) : unitMeasurement ? (
                "Actualizar unidad"
              ) : (
                "Crear unidad"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Modificar el componente UnitMeasurementCard para que no muestre la abreviatura
function UnitMeasurementCard({
  unitMeasurement,
  onEdit,
  onDelete,
}: {
  unitMeasurement: UnitMeasurement
  onEdit: (unitMeasurement: UnitMeasurement) => void
  onDelete: (id: number) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(unitMeasurement.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{unitMeasurement.name}</h3>
                {unitMeasurement.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{unitMeasurement.description}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(unitMeasurement)}>
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
          <div className="text-xs text-muted-foreground">ID: {unitMeasurement.id}</div>
          <div className="text-xs text-muted-foreground">
            {unitMeasurement.createdAt && new Date(unitMeasurement.createdAt).toLocaleDateString()}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la unidad de medida {unitMeasurement.name} y no se puede deshacer.
              <p className="mt-2 text-red-500 font-medium">
                Nota: Eliminar esta unidad de medida podría afectar a los productos asociados a ella.
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

// Componente principal de la página de unidades de medida
export default function UnitMeasurementsPage() {
  const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentUnitMeasurement, setCurrentUnitMeasurement] = useState<UnitMeasurement | null>(null)

  const itemsPerPage = 9

  // Cargar unidades de medida desde la API
  useEffect(() => {
    const fetchUnitMeasurements = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get("/unit-measurements")
        setUnitMeasurements(response.data)
      } catch (err) {
        console.error("Error al cargar unidades de medida:", err)
        setError("No se pudieron cargar las unidades de medida. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchUnitMeasurements()
  }, [])

  // Crear nueva unidad de medida
  const handleCreateUnitMeasurement = async (data: Partial<UnitMeasurement>) => {
    try {
      const response = await api.post("/unit-measurements", data)
      setUnitMeasurements([...unitMeasurements, response.data])
      toast.success("Unidad de medida creada correctamente")
    } catch (err) {
      console.error("Error al crear la unidad de medida:", err)
      toast.error("No se pudo crear la unidad de medida. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar unidad de medida existente
  const handleUpdateUnitMeasurement = async (data: Partial<UnitMeasurement>) => {
    if (!currentUnitMeasurement) return

    try {
      const response = await api.patch(`/unit-measurements/${currentUnitMeasurement.id}`, data)
      setUnitMeasurements(
        unitMeasurements.map((unit) => (unit.id === currentUnitMeasurement.id ? { ...unit, ...response.data } : unit)),
      )
      toast.success("Unidad de medida actualizada correctamente")
    } catch (err) {
      console.error("Error al actualizar la unidad de medida:", err)
      toast.error("No se pudo actualizar la unidad de medida. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Eliminar unidad de medida
  const handleDeleteUnitMeasurement = async (id: number) => {
    try {
      await api.delete(`/unit-measurements/${id}`)
      setUnitMeasurements(unitMeasurements.filter((unit) => unit.id !== id))
      toast.success("Unidad de medida eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar la unidad de medida:", err)
      toast.error("No se pudo eliminar la unidad de medida. Por favor, intenta de nuevo.")
    }
  }

  // Abrir formulario para editar
  const handleEdit = (unitMeasurement: UnitMeasurement) => {
    setCurrentUnitMeasurement(unitMeasurement)
    setIsFormOpen(true)
  }

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentUnitMeasurement(null)
    setIsFormOpen(true)
  }

  // Manejar envío del formulario
  const handleFormSubmit = async (data: Partial<UnitMeasurement>) => {
    if (currentUnitMeasurement) {
      await handleUpdateUnitMeasurement(data)
    } else {
      await handleCreateUnitMeasurement(data)
    }
  }

  // Modificar la función de filtrado para que solo busque por nombre y descripción
  const filteredUnitMeasurements = unitMeasurements.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Calcular unidades para la página actual
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUnitMeasurements.slice(indexOfFirstItem, indexOfLastItem)

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredUnitMeasurements.length / itemsPerPage)

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
        <h2 className="text-xl font-semibold mb-2">Error al cargar unidades de medida</h2>
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Unidades de Medida</h1>
        <Button size="sm" className="text-xs sm:text-sm" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Unidad
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar unidades de medida..."
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
            {filteredUnitMeasurements.length} resultados para {searchTerm}
          </div>
        )}

        {/* Grid de unidades de medida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentItems.length > 0 ? (
            currentItems.map((unit) => (
              <UnitMeasurementCard
                key={unit.id}
                unitMeasurement={unit}
                onEdit={handleEdit}
                onDelete={handleDeleteUnitMeasurement}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-muted-foreground">No se encontraron unidades de medida</p>
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

      {/* Formulario para crear/editar unidad de medida */}
      <UnitMeasurementForm
        unitMeasurement={currentUnitMeasurement}
        onSubmit={handleFormSubmit}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  )
}
