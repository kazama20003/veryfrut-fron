"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { api } from "@/lib/axiosInstance"
import { Building, Plus, Search, Edit, Trash2, MoreVertical, Layers, AlertCircle, Check } from "lucide-react"

// Interfaces para los modelos
interface Area {
  id: number
  name: string
  companyId: number
  color?: string
}

interface Company {
  id: number
  name: string
  color?: string
  areas?: Area[]
}

// Colores predefinidos organizados por categorías - ACTUALIZADOS CON LOS NUEVOS COLORES
const colorOptions = {
  Rojos: [
    "#FF0000", // Nuevo - Rojo puro
    "#FF5252", // Nuevo - Ya existía
    "#FF6B6B",
    "#F44336",
    "#E53E3E",
    "#DC2626",
    "#B91C1C",
    "#991B1B",
    "#7F1D1D",
    "#FF1744",
    "#D50000",
  ],
  Azules: [
    "#1976D2", // Nuevo - Ya existía
    "#0070C0", // Nuevo
    "#4FC3F7",
    "#42A5F5",
    "#2196F3",
    "#1565C0",
    "#0D47A1",
    "#01579B",
    "#0277BD",
    "#0288D1",
    "#039BE5",
    "#BBDEFB", // Nuevo - Ya existía
  ],
  Verdes: [
    "#00CC00", // Nuevo
    "#00B050", // Nuevo
    "#66BB6A",
    "#4CAF50",
    "#43A047",
    "#388E3C",
    "#2E7D32",
    "#1B5E20",
    "#00C853",
    "#00BFA5",
    "#4DB6AC",
    "#26A69A",
  ],
  Naranjas: [
    "#E26B0A", // Nuevo
    "#FFB300", // Nuevo - Ya existía
    "#FFA726",
    "#FF9800",
    "#F57C00",
    "#EF6C00",
    "#E65100",
    "#FF6F00",
    "#FF8F00",
    "#FFA000",
    "#FFC107",
  ],
  Morados: [
    "#8E24AA", // Nuevo - Ya existía
    "#AB47BC",
    "#9C27B0",
    "#7B1FA2",
    "#6A1B9A",
    "#4A148C",
    "#AA00FF",
    "#BA68C8",
    "#CE93D8",
    "#E1BEE7",
  ],
  Rosas: [
    "#C2185B", // Nuevo - Ya existía
    "#EC407A",
    "#E91E63",
    "#D81B60",
    "#AD1457",
    "#880E4F",
    "#F50057",
    "#F8BBD9",
    "#FCE4EC",
  ],
  Amarillos: [
    "#FFEE58",
    "#FFEB3B",
    "#FDD835",
    "#F9A825",
    "#F57F17",
    "#FFCA28",
    "#FFD54F",
    "#FFF176",
    "#FFF59D",
    "#FFF9C4",
  ],
  Grises: [
    "#000000", // Nuevo - Negro
    "#78909C",
    "#607D8B",
    "#546E7A",
    "#455A64",
    "#37474F",
    "#263238",
    "#90A4AE",
    "#B0BEC5",
    "#CFD8DC",
    "#ECEFF1",
  ],
  Pasteles: [
    "#FFCDD2",
    "#F8BBD9",
    "#E1BEE7",
    "#D1C4E9",
    "#C5CAE9",
    "#BBDEFB",
    "#B3E5FC",
    "#B2EBF2",
    "#B2DFDB",
    "#C8E6C9",
  ],
  Vibrantes: [
    "#FF3D00",
    "#FF6D00",
    "#FF9100",
    "#FFB300",
    "#FFCC02",
    "#AEEA00",
    "#64DD17",
    "#00E676",
    "#1DE9B6",
    "#00E5FF",
  ],
  Oscuros: [
    "#212121",
    "#424242",
    "#616161",
    "#757575",
    "#9E9E9E",
    "#3E2723",
    "#4E342E",
    "#5D4037",
    "#6D4C41",
    "#795548",
  ],
  Neones: [
    "#00FFFF", // Nuevo - Ya existía
    "#FF073A",
    "#FF9500",
    "#FFFF00",
    "#39FF14",
    "#0080FF",
    "#8000FF",
    "#FF00FF",
    "#FF1493",
    "#FF69B4",
  ],
  Especiales: [
    "#948A54", // Nuevo - Verde oliva/Marrón
    "#8B4513", // Marrón silla de montar
    "#A0522D", // Marrón siena
    "#CD853F", // Marrón arena
    "#DEB887", // Marrón claro
    "#F4A460", // Marrón arena claro
    "#D2691E", // Chocolate
    "#B8860B", // Vara de oro oscura
    "#DAA520", // Vara de oro
    "#FFD700", // Oro
  ],
}

// Componente para el selector de color visual
function ColorSelector({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (color: string) => void
  label: string
}) {
  const [selectedCategory, setSelectedCategory] = useState("Azules")

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {/* Color seleccionado actual */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: value || "#4FC3F7" }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Color seleccionado</span>
          <span className="text-xs text-gray-500 font-mono">{value || "#4FC3F7"}</span>
        </div>
      </div>

      {/* Categorías de colores */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {Object.keys(colorOptions).map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Paleta de colores de la categoría seleccionada */}
        <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-white max-h-48 overflow-y-auto">
          {colorOptions[selectedCategory as keyof typeof colorOptions].map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              className="relative w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
              title={`Seleccionar ${color}`}
            >
              {value === color && (
                <Check
                  className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg"
                  style={{
                    color: color === "#FFFFFF" || color === "#FFFF00" || color === "#FFD700" ? "#000000" : "#FFFFFF",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border">
          <strong>Tip:</strong> Los colores se organizan por categorías para facilitar la selección. Puedes cambiar
          entre categorías usando los botones superiores.
        </div>
      </div>
    </div>
  )
}

// Componente para el formulario de empresa (AHORA CON color)
function CompanyForm({
  company,
  onSubmit,
  isOpen,
  onOpenChange,
}: {
  company: Company | null
  onSubmit: (data: { name: string; color: string }) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#4FC3F7")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (company) {
      setName(company.name)
      setColor(company.color || "#4FC3F7")
    } else {
      setName("")
      setColor("#4FC3F7")
    }
  }, [company, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ name, color })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar empresa:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
          <DialogDescription>
            {company
              ? "Actualiza los datos de la empresa existente."
              : "Completa el formulario para crear una nueva empresa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la empresa *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la empresa"
              required
            />
          </div>
          <ColorSelector value={color} onChange={setColor} label="Color identificativo de la empresa" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {company ? "Actualizando..." : "Creando..."}
                </>
              ) : company ? (
                "Actualizar empresa"
              ) : (
                "Crear empresa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para el formulario de área (CON color)
function AreaForm({
  area,
  companyId,
  onSubmit,
  isOpen,
  onOpenChange,
}: {
  area: Area | null
  companyId: number
  onSubmit: (data: { name: string; companyId: number; color?: string }) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#4FC3F7")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (area) {
      setName(area.name)
      setColor(area.color || "#4FC3F7")
    } else {
      setName("")
      setColor("#4FC3F7")
    }
  }, [area, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ name, companyId, color })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar área:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{area ? "Editar área" : "Nueva área"}</DialogTitle>
          <DialogDescription>
            {area ? "Actualiza los datos del área existente." : "Completa el formulario para crear una nueva área."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del área *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del área"
              required
            />
          </div>
          <ColorSelector value={color} onChange={setColor} label="Color identificativo del área" />
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

  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-md bg-card">
        <div className="flex items-center gap-3">
          {/* Indicador de color del área más prominente */}
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
            <div
              className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: area.color || "#4FC3F7" }}
            />
            <span className="text-xs text-blue-700 font-medium">Área</span>
          </div>
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{area.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(area)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el área {area.name} y no se puede deshacer.
              <br />
              <br />
              <span className="font-medium text-destructive">
                Nota: Si hay usuarios asignados a esta área, no podrá ser eliminada.
              </span>
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

// Componente para la tarjeta de empresa (AHORA CON indicador de color)
function CompanyCard({
  company,
  onEdit,
  onDelete,
  onAddArea,
  onEditArea,
  onDeleteArea,
}: {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (id: number) => void
  onAddArea: (companyId: number) => void
  onEditArea: (area: Area) => void
  onDeleteArea: (id: number) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const areas = company.areas || []

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(company.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-3">
                {/* Indicador de color de la empresa más prominente */}
                <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: company.color || "#4FC3F7" }}
                  />
                  <span className="text-xs text-gray-600 font-medium">Empresa</span>
                </div>
                <Building className="h-5 w-5 text-muted-foreground" />
                {company.name}
              </CardTitle>
              <CardDescription>
                {areas.length} {areas.length === 1 ? "área" : "áreas"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar empresa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddArea(company.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir área
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar empresa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="areas">
              <AccordionTrigger className="py-2">
                <span className="text-sm font-medium">Áreas</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1">
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <AreaCard key={area.id} area={area} onEdit={onEditArea} onDelete={onDeleteArea} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No hay áreas definidas</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-transparent"
                    onClick={() => onAddArea(company.id)}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Añadir área
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la empresa {company.name} y todas sus áreas. Esta acción no se puede
              deshacer.
              <br />
              <br />
              <span className="font-medium text-destructive">
                Nota: Si hay usuarios asignados a alguna de las áreas de esta empresa, no podrá ser eliminada.
              </span>
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

// Componente principal de la página de empresas
export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("companies")

  // Estados para los formularios
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isAreaFormOpen, setIsAreaFormOpen] = useState(false)
  const [currentArea, setCurrentArea] = useState<Area | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)

  // Cargar empresas desde la API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get("/company")
        // Asegurarse de que siempre sea un array
        const companiesData = Array.isArray(response.data) ? response.data : [response.data]
        setCompanies(companiesData)
      } catch (err) {
        console.error("Error al cargar empresas:", err)
        setError("No se pudieron cargar las empresas. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Crear nueva empresa (AHORA CON color)
  const handleCreateCompany = async (data: { name: string; color: string }) => {
    try {
      const response = await api.post("/company", data)
      // Si la API devuelve la empresa con sus áreas
      const newCompany = response.data
      setCompanies([...companies, { ...newCompany, areas: newCompany.areas || [] }])
      toast.success("Empresa creada correctamente")
    } catch (err) {
      console.error("Error al crear la empresa:", err)
      toast.error("No se pudo crear la empresa. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar empresa existente (AHORA CON color)
  const handleUpdateCompany = async (data: { name: string; color: string }) => {
    if (!currentCompany) return

    try {
      const response = await api.patch(`/company/${currentCompany.id}`, data)
      setCompanies(
        companies.map((company) =>
          company.id === currentCompany.id
            ? { ...company, ...response.data, areas: response.data.areas || company.areas }
            : company,
        ),
      )
      toast.success("Empresa actualizada correctamente")
    } catch (err) {
      console.error("Error al actualizar la empresa:", err)
      toast.error("No se pudo actualizar la empresa. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Eliminar empresa
  const handleDeleteCompany = async (id: number) => {
    try {
      await api.delete(`/company/${id}`)
      setCompanies(companies.filter((company) => company.id !== id))
      toast.success("Empresa eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar la empresa:", err)
      toast.error("No se pudo eliminar la empresa. Por favor, intenta de nuevo.")
    }
  }

  // Crear nueva área (CON color)
  const handleCreateArea = async (data: { name: string; companyId: number; color?: string }) => {
    try {
      const response = await api.post("/areas", data)
      const newArea = response.data
      setCompanies(
        companies.map((company) => {
          if (company.id === data.companyId) {
            return {
              ...company,
              areas: [...(company.areas || []), newArea],
            }
          }
          return company
        }),
      )
      toast.success("Área creada correctamente")
    } catch (err) {
      console.error("Error al crear el área:", err)
      toast.error("No se pudo crear el área. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar área existente (CON color)
  const handleUpdateArea = async (data: { name: string; companyId: number; color?: string }) => {
    if (!currentArea) return

    try {
      const response = await api.patch(`/areas/${currentArea.id}`, data)
      const updatedArea = response.data
      setCompanies(
        companies.map((company) => {
          if (company.id === data.companyId) {
            return {
              ...company,
              areas: (company.areas || []).map((area) =>
                area.id === currentArea.id ? { ...area, ...updatedArea } : area,
              ),
            }
          }
          return company
        }),
      )
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
      setCompanies(
        companies.map((company) => ({
          ...company,
          areas: (company.areas || []).filter((area) => area.id !== id),
        })),
      )
      toast.success("Área eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar el área:", err)
      toast.error("No se pudo eliminar el área. Por favor, intenta de nuevo.")
    }
  }

  // Abrir formulario para editar empresa
  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company)
    setIsCompanyFormOpen(true)
  }

  // Abrir formulario para crear empresa
  const handleCreateCompanyClick = () => {
    setCurrentCompany(null)
    setIsCompanyFormOpen(true)
  }

  // Abrir formulario para añadir área
  const handleAddArea = (companyId: number) => {
    setCurrentArea(null)
    setSelectedCompanyId(companyId)
    setIsAreaFormOpen(true)
  }

  // Abrir formulario para editar área
  const handleEditArea = (area: Area) => {
    setCurrentArea(area)
    setSelectedCompanyId(area.companyId)
    setIsAreaFormOpen(true)
  }

  // Manejar envío del formulario de empresa
  const handleCompanyFormSubmit = async (data: { name: string; color: string }) => {
    if (currentCompany) {
      await handleUpdateCompany(data)
    } else {
      await handleCreateCompany(data)
    }
  }

  // Manejar envío del formulario de área
  const handleAreaFormSubmit = async (data: { name: string; companyId: number; color?: string }) => {
    if (currentArea) {
      await handleUpdateArea(data)
    } else {
      await handleCreateArea(data)
    }
  }

  // Filtrar empresas por búsqueda
  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
        <h2 className="text-xl font-semibold mb-2">Error al cargar empresas</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Empresas y Áreas</h1>
        {/* Leyenda de colores */}
        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full border"></div>
            <span className="text-sm font-medium text-gray-700">Color de Empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full border"></div>
            <span className="text-sm font-medium text-gray-700">Color de Área</span>
          </div>
          <div className="text-xs text-gray-500">
            Cada empresa y sus áreas pueden tener colores diferentes para mejor organización
          </div>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleCreateCompanyClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empresas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Vista móvil: Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={handleEditCompany}
                  onDelete={handleDeleteCompany}
                  onAddArea={handleAddArea}
                  onEditArea={handleEditArea}
                  onDeleteArea={handleDeleteArea}
                />
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No se encontraron empresas que coincidan con la búsqueda"
                    : "No hay empresas registradas"}
                </p>
                <Button className="mt-4" onClick={handleCreateCompanyClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera empresa
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar áreas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => {
                const areas = company.areas || []
                const filteredAreas = areas.filter((area) => area.name.toLowerCase().includes(searchTerm.toLowerCase()))

                if (searchTerm && filteredAreas.length === 0) return null

                return (
                  <div key={company.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-3">
                        {/* Color de empresa más prominente en vista de áreas */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-400 shadow-sm"
                            style={{ backgroundColor: company.color || "#4FC3F7" }}
                          />
                          <span className="text-xs text-gray-700 font-semibold uppercase tracking-wide">Empresa</span>
                        </div>
                        <Building className="h-5 w-5 text-muted-foreground" />
                        {company.name}
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => handleAddArea(company.id)}>
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Añadir área
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {filteredAreas.length > 0 ? (
                        filteredAreas.map((area) => (
                          <AreaCard key={area.id} area={area} onEdit={handleEditArea} onDelete={handleDeleteArea} />
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {searchTerm
                            ? "No se encontraron áreas que coincidan con la búsqueda"
                            : "No hay áreas definidas"}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No hay empresas registradas</p>
                <Button className="mt-4" onClick={handleCreateCompanyClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera empresa
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Formularios */}
      <CompanyForm
        company={currentCompany}
        onSubmit={handleCompanyFormSubmit}
        isOpen={isCompanyFormOpen}
        onOpenChange={setIsCompanyFormOpen}
      />

      {selectedCompanyId && (
        <AreaForm
          area={currentArea}
          companyId={selectedCompanyId}
          onSubmit={handleAreaFormSubmit}
          isOpen={isAreaFormOpen}
          onOpenChange={setIsAreaFormOpen}
        />
      )}
    </div>
  )
}
