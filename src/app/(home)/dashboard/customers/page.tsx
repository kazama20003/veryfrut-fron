"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  ChevronDown,
  Filter,
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  User,
  Shield,
  Users,
  Building,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/axiosInstance"
import { toast } from "sonner"
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

// Definir interfaces para el usuario, área y empresa
interface Area {
  id: number
  name: string
  companyId: number
  company?: Company
}

interface Company {
  id: number
  name: string
  areas?: Area[]
}

interface UserType {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  role: "admin" | "customer"
  createdAt?: string
  updatedAt?: string
  areas?: Area[] // El usuario puede tener múltiples áreas asignadas
}

// DTO para crear/actualizar usuario según la validación del backend
interface UserDTO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  role: string
  password?: string
  areaIds: number[] // Array de IDs de áreas según el DTO del backend
}

// Función para obtener la empresa de un usuario a través de sus áreas
function getUserCompany(user: UserType, companies: Company[]): Company | null {
  if (!user.areas || user.areas.length === 0) return null

  // Obtener el ID de la empresa del primer área
  const companyId = user.areas[0].companyId

  // Buscar la empresa por ID
  return companies.find((company) => company.id === companyId) || null
}

// Componente para mostrar el rol del usuario
function UserRoleBadge({ role }: { role: UserType["role"] }) {
  switch (role) {
    case "admin":
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-purple-100 text-purple-800">
          <Shield className="h-3 w-3" />
          <span>Admin</span>
        </Badge>
      )
    case "customer":
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
          <Users className="h-3 w-3" />
          <span>Cliente</span>
        </Badge>
      )
    default:
      return <Badge>{role}</Badge>
  }
}

// Componente para la tarjeta de usuario (vista móvil)
function UserCard({
  user,
  onEdit,
  onDelete,
  companies,
}: {
  user: UserType
  onEdit: (user: UserType) => void
  onDelete: (id: number) => void
  companies: Company[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Obtener las áreas asignadas al usuario
  const userAreas = user.areas || []

  // Obtener la empresa del usuario
  const userCompany = getUserCompany(user, companies)

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(user.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">
                  {user.firstName} {user.lastName}
                </span>
                <UserRoleBadge role={user.role} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium">{userCompany?.name || "Sin empresa"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {userAreas.length > 0 ? userAreas[0].name : "Área no asignada"}
                {userAreas.length > 1 && ` +${userAreas.length - 1}`}
              </p>
            </div>
          </div>

          <div
            className="px-3 sm:px-4 py-2 bg-muted/50 flex justify-between items-center cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-xs">
              {user.createdAt
                ? `Registrado: ${format(new Date(user.createdAt), "dd MMM yyyy", { locale: es })}`
                : "Fecha no disponible"}
            </p>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {expanded && (
            <div className="p-3 sm:p-4 border-t">
              <div className="space-y-3">
                {user.phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="break-all">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <span className="break-words">{user.address}</span>
                  </div>
                )}
                {userAreas.length > 0 && (
                  <div className="flex items-start gap-2 text-xs">
                    <Building className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">{userCompany?.name || "Sin empresa"}</span>
                      <ul className="mt-1 space-y-1">
                        {userAreas.map((area) => (
                          <li key={area.id}>{area.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onEdit(user)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" className="text-xs h-7" onClick={handleDelete}>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario {user.firstName} {user.lastName} y no se puede deshacer.
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

// Componente de formulario para crear/editar usuario
function UserForm({
  user,
  onSubmit,
  isOpen,
  onOpenChange,
  companies,
}: {
  user: UserType | null
  onSubmit: (data: UserDTO) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  companies: Company[]
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
    selectedCompany: "",
    selectedAreas: [] as string[],
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailDomain, setEmailDomain] = useState("@veryfrut.com")
  const [availableAreas, setAvailableAreas] = useState<Area[]>([])

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (user) {
      const userAreas = user.areas || []
      const userCompanyId = userAreas.length > 0 ? userAreas[0].companyId.toString() : ""

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email.split("@")[0] || "", // Solo guardamos la parte local del email
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "customer",
        selectedCompany: userCompanyId,
        selectedAreas: userAreas.map((area) => area.id.toString()),
        password: "", // No cargar la contraseña por seguridad
      })

      // Extraer el dominio del email
      const emailParts = user.email.split("@")
      if (emailParts.length > 1) {
        setEmailDomain(`@${emailParts[1]}`)
      }

      // Establecer las áreas disponibles según la empresa del usuario
      if (userCompanyId) {
        const company = companies.find((c) => c.id.toString() === userCompanyId)
        if (company && company.areas) {
          setAvailableAreas(company.areas)
        }
      }
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        role: "customer",
        selectedCompany: "",
        selectedAreas: [],
        password: "",
      })
      setEmailDomain("@veryfrut.com") // Valor por defecto para nuevos usuarios
      setAvailableAreas([])
    }
  }, [user, isOpen, companies])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "selectedCompany") {
      // Cuando cambia la empresa, actualizar las áreas disponibles y limpiar las seleccionadas
      const company = companies.find((c) => c.id.toString() === value)
      setAvailableAreas(company?.areas || [])
      setFormData((prev) => ({
        ...prev,
        selectedCompany: value,
        selectedAreas: [],
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAreaChange = (areaId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedAreas.includes(areaId)
      if (isSelected) {
        return {
          ...prev,
          selectedAreas: prev.selectedAreas.filter((id) => id !== areaId),
        }
      } else {
        return {
          ...prev,
          selectedAreas: [...prev.selectedAreas, areaId],
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar datos para enviar
      const userData: UserDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: `${formData.email}${emailDomain}`,
        role: formData.role,
        areaIds: formData.selectedAreas.map((id) => Number.parseInt(id)),
      }

      // Añadir campos opcionales solo si tienen valor
      if (formData.phone) userData.phone = formData.phone
      if (formData.address) userData.address = formData.address

      // Añadir contraseña solo si es un nuevo usuario o si se ha cambiado
      if (!user || formData.password) {
        userData.password = formData.password
      }

      await onSubmit(userData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar usuario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Actualiza los datos del usuario existente."
              : "Completa el formulario para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <div className="flex">
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario"
                required
                className="rounded-r-none"
              />
              <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">
                {emailDomain}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(Opcional)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="(Opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="selectedCompany">Empresa *</Label>
            <Select
              value={formData.selectedCompany}
              onValueChange={(value) => handleSelectChange("selectedCompany", value)}
              required
            >
              <SelectTrigger id="selectedCompany">
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Áreas *</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              {formData.selectedCompany ? (
                <div className="space-y-2">
                  {availableAreas.length > 0 ? (
                    availableAreas.map((area) => (
                      <div key={area.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`area-${area.id}`}
                          checked={formData.selectedAreas.includes(area.id.toString())}
                          onChange={() => handleAreaChange(area.id.toString())}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`area-${area.id}`} className="text-sm">
                          {area.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay áreas disponibles para esta empresa</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Selecciona una empresa para ver sus áreas</p>
              )}
            </div>
            {formData.selectedAreas.length === 0 && (
              <p className="text-xs text-red-500">Debes seleccionar al menos un área</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "Contraseña (dejar en blanco para mantener la actual)" : "Contraseña *"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? "••••••••" : "Contraseña"}
              required={!user}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.selectedAreas.length === 0 || !formData.selectedCompany}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {user ? "Actualizando..." : "Creando..."}
                </>
              ) : user ? (
                "Actualizar usuario"
              ) : (
                "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal de la página de usuarios
export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState("all")
  const [sortOrder, setSortOrder] = useState("name-asc")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)

  const usersPerPage = 10

  // Cargar usuarios y compañías desde la API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Cargar usuarios y compañía en paralelo
        const [usersRes, companiesRes] = await Promise.all([api.get("/users"), api.get("/company")])

        setUsers(usersRes.data)

        // Procesar las compañías recibidas
        if (companiesRes.data && Array.isArray(companiesRes.data)) {
          setCompanies(companiesRes.data)
        } else if (companiesRes.data) {
          // Si solo devuelve una compañía (no en array)
          setCompanies([companiesRes.data])
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Crear nuevo usuario
  const handleCreateUser = async (data: UserDTO) => {
    try {
      const response = await api.post("/users", data)
      setUsers([...users, response.data])
      toast.success("Usuario creado correctamente")
    } catch (err) {
      console.error("Error al crear el usuario:", err)
      toast.error("No se pudo crear el usuario. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Actualizar usuario existente
  const handleUpdateUser = async (data: UserDTO) => {
    if (!currentUser) return

    try {
      const response = await api.patch(`/users/${currentUser.id}`, data)
      setUsers(users.map((user) => (user.id === currentUser.id ? { ...user, ...response.data } : user)))
      toast.success("Usuario actualizado correctamente")
    } catch (err) {
      console.error("Error al actualizar el usuario:", err)
      toast.error("No se pudo actualizar el usuario. Por favor, intenta de nuevo.")
      throw err
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`)
      setUsers(users.filter((user) => user.id !== id))
      toast.success("Usuario eliminado correctamente")
    } catch (err) {
      console.error("Error al eliminar el usuario:", err)
      toast.error("No se pudo eliminar el usuario. Por favor, intenta de nuevo.")
    }
  }

  // Abrir formulario para editar
  const handleEdit = (user: UserType) => {
    setCurrentUser(user)
    setIsFormOpen(true)
  }

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentUser(null)
    setIsFormOpen(true)
  }

  // Manejar envío del formulario
  const handleFormSubmit = async (data: UserDTO) => {
    if (currentUser) {
      await handleUpdateUser(data)
    } else {
      await handleCreateUser(data)
    }
  }

  // Filtrar usuarios por búsqueda, rol y empresa
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole =
      selectedRole === "all" ||
      (selectedRole === "admin" && user.role === "admin") ||
      (selectedRole === "customer" && user.role === "customer")

    const matchesCompany =
      selectedCompany === "all" ||
      (user.areas && user.areas.some((area) => area.companyId.toString() === selectedCompany))

    return matchesSearch && matchesRole && matchesCompany
  })

  // Ordenar usuarios
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`
    const nameB = `${b.firstName} ${b.lastName}`

    switch (sortOrder) {
      case "name-desc":
        return nameB.localeCompare(nameA)
      case "email-asc":
        return a.email.localeCompare(b.email)
      case "email-desc":
        return b.email.localeCompare(a.email)
      case "role-asc":
        return a.role.localeCompare(b.role)
      case "role-desc":
        return b.role.localeCompare(a.role)
      default: // name-asc
        return nameA.localeCompare(nameB)
    }
  })

  // Calcular usuarios para la página actual
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)

  // Calcular total de páginas
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)

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
        <div className="text-red-500 mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Error al cargar usuarios</h2>
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Usuarios</h1>
        <Button size="sm" className="text-xs sm:text-sm w-full sm:w-auto" onClick={handleCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto pb-2 sm:pb-0 w-full">
            <Tabs defaultValue="all" value={selectedRole} onValueChange={setSelectedRole} className="w-full">
              <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-xs sm:text-sm">
                  Administradores
                </TabsTrigger>
                <TabsTrigger value="customer" className="text-xs sm:text-sm">
                  Clientes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="w-full pl-8 h-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filtrar por empresa</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCompany("all")}>
                    <span className={selectedCompany === "all" ? "font-medium" : ""}>Todas las empresas</span>
                  </DropdownMenuItem>
                  {companies.map((company) => (
                    <DropdownMenuItem key={company.id} onClick={() => setSelectedCompany(company.id.toString())}>
                      <Building className="mr-2 h-4 w-4" />
                      <span className={selectedCompany === company.id.toString() ? "font-medium" : ""}>
                        {company.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  <SelectItem value="email-asc">Email: A-Z</SelectItem>
                  <SelectItem value="email-desc">Email: Z-A</SelectItem>
                  <SelectItem value="role-asc">Rol: A-Z</SelectItem>
                  <SelectItem value="role-desc">Rol: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {sortedUsers.length} resultados para {searchTerm}
          </div>
        )}

        {/* Vista móvil: Tarjetas */}
        <div className="md:hidden space-y-3">
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDeleteUser}
                companies={companies}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          )}
        </div>

        {/* Vista desktop: Tabla */}
        <div className="hidden md:block">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Lista de usuarios</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contacto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Dirección</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Empresa / Áreas</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => {
                      const userAreas = user.areas || []
                      const userCompany = getUserCompany(user, companies)

                      return (
                        <tr key={user.id} className="border-b">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.createdAt &&
                                    `Desde ${format(new Date(user.createdAt), "MMM yyyy", { locale: es })}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {user.address ? (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{user.address}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No disponible</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <UserRoleBadge role={user.role} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">{userCompany?.name || "Sin empresa"}</span>
                              {userAreas.length > 0 ? (
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className="text-xs">{userAreas[0].name}</span>
                                  {userAreas.length > 1 && (
                                    <span className="text-xs text-muted-foreground">+{userAreas.length - 1} más</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin áreas asignadas</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleEdit(user)}>
                                <Edit className="mr-1 h-3 w-3" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={`text-xs sm:text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                />
              </PaginationItem>

              {/* Mostrar menos páginas en móviles */}
              {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                let pageNumberIndex

                // Lógica simplificada para móviles
                if (totalPages <= 3) {
                  pageNumberIndex = i + 1
                } else if (currentPage <= 2) {
                  pageNumberIndex = i + 1
                  if (i === 2)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                } else if (currentPage >= totalPages - 1) {
                  pageNumberIndex = totalPages - 2 + i
                  if (i === 0)
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                } else {
                  if (i === 0)
                    return (
                      <PaginationItem key={i} className="hidden sm:inline-flex">
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
                        <PaginationLink
                          href="#"
                          isActive={true}
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  if (i === 2)
                    return (
                      <PaginationItem key={i} className="hidden sm:inline-flex">
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  pageNumberIndex = currentPage
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumberIndex === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNumberIndex)
                      }}
                      className="text-xs sm:text-sm"
                    >
                      {pageNumberIndex}
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
                  className={`text-xs sm:text-sm ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Formulario para crear/editar usuario */}
      <UserForm
        user={currentUser}
        onSubmit={handleFormSubmit}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        companies={companies}
      />
    </div>
  )
}
