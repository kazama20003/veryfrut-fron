"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Edit, Mail, MapPin, Phone, User, Building, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

import { api } from "@/lib/axiosInstance"
import { getUserIdFromToken } from "@/lib/jwt"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Interfaces para los tipos de datos
interface Area {
  id: number
  name: string
  companyId: number
}

interface Company {
  id: number
  name: string
  areas?: Area[]
}

interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  role: string
  createdAt: string
  updatedAt: string
  areas?: Area[] // El usuario puede tener múltiples áreas asignadas
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  })

  // Estados para el cambio de contraseña
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordFormData>>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        // Obtener el ID del usuario del token JWT
        const userId = getUserIdFromToken()

        if (!userId) {
          setErrorMessage("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.")
          toast.error("Error de autenticación", {
            description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
          })
          return
        }

        // Obtener el perfil del usuario y las empresas en paralelo
        const [profileResponse, companiesResponse] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get("/company"),
        ])

        // Procesar la respuesta de las empresas
        const companiesData = Array.isArray(companiesResponse.data) ? companiesResponse.data : [companiesResponse.data]

        setCompanies(companiesData)
        setProfile(profileResponse.data)

        // Inicializar el formulario con los datos del perfil
        setFormData({
          firstName: profileResponse.data.firstName || "",
          lastName: profileResponse.data.lastName || "",
          phone: profileResponse.data.phone || "",
          address: profileResponse.data.address || "",
        })
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error)
        setErrorMessage("Error al cargar el perfil. Por favor, intenta nuevamente.")
        toast.error("Error al cargar perfil", {
          description: "No se pudo cargar tu información de perfil. Por favor, intenta nuevamente.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar errores cuando el usuario comienza a escribir
    if (passwordErrors[name as keyof PasswordFormData]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const userId = getUserIdFromToken()

      if (!userId) {
        toast.error("Error de autenticación", {
          description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
        })
        return
      }

      await api.patch(`/users/${userId}`, formData)

      // Actualizar el perfil local con los nuevos datos
      setProfile((prev) => (prev ? { ...prev, ...formData } : null))

      toast.success("Perfil actualizado", {
        description: "Tu información de perfil ha sido actualizada correctamente.",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar tu información. Por favor, intenta nuevamente.",
      })
    }
  }

  const validatePasswordForm = (): boolean => {
    const errors: Partial<PasswordFormData> = {}

    if (!passwordFormData.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida"
    }

    if (!passwordFormData.newPassword) {
      errors.newPassword = "La nueva contraseña es requerida"
    } else if (passwordFormData.newPassword.length < 8) {
      errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    } else if (!/[A-Z]/.test(passwordFormData.newPassword)) {
      errors.newPassword = "La contraseña debe incluir al menos una letra mayúscula"
    } else if (!/[a-z]/.test(passwordFormData.newPassword)) {
      errors.newPassword = "La contraseña debe incluir al menos una letra minúscula"
    } else if (!/[0-9]/.test(passwordFormData.newPassword)) {
      errors.newPassword = "La contraseña debe incluir al menos un número"
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordFormData.newPassword)) {
      errors.newPassword = "La contraseña debe incluir al menos un carácter especial"
    }

    if (!passwordFormData.confirmPassword) {
      errors.confirmPassword = "Por favor confirma tu nueva contraseña"
    } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el formulario
    if (!validatePasswordForm()) {
      return
    }

    setIsChangingPassword(true)
    setPasswordChangeSuccess(false)

    try {
      const userId = getUserIdFromToken()

      if (!userId) {
        toast.error("Error de autenticación", {
          description: "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
        })
        return
      }

      // Enviar solicitud para cambiar la contraseña
      await api.patch(`/users/${userId}/password`, {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      })

      // Mostrar mensaje de éxito
      toast.success("Contraseña actualizada", {
        description: "Tu contraseña ha sido actualizada correctamente.",
      })

      // Resetear el formulario
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setPasswordChangeSuccess(true)
    } catch (error: unknown) {
      console.error("Error al cambiar la contraseña:", error)

      // Manejar errores específicos
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 401
      ) {
        setPasswordErrors({
          currentPassword: "La contraseña actual es incorrecta",
        })
        toast.error("Contraseña incorrecta", {
          description: "La contraseña actual que ingresaste es incorrecta.",
        })
      } else {
        toast.error("Error al cambiar la contraseña", {
          description: "No se pudo actualizar tu contraseña. Por favor, intenta nuevamente.",
        })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Función para obtener la empresa de un usuario a través de sus áreas
  const getUserCompany = (userAreas: Area[]): Company | null => {
    if (!userAreas || userAreas.length === 0) return null

    // Obtener el ID de la empresa del primer área
    const companyId = userAreas[0].companyId

    // Buscar la empresa por ID
    return companies.find((company) => company.id === companyId) || null
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return "Fecha desconocida"
    }
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  // Obtener las áreas y la empresa del usuario
  const userAreas = profile?.areas || []
  const userCompany = getUserCompany(userAreas)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <h1 className="text-xl font-semibold md:text-2xl">Mi Perfil</h1>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {isLoading ? (
          // Estado de carga
          <div className="grid gap-6">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 text-center md:text-left">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        ) : errorMessage ? (
          // Estado de error
          <div className="flex h-[50vh] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
              <User className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No se pudo cargar tu perfil</h2>
            <p className="mb-4 max-w-md text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>Intentar nuevamente</Button>
          </div>
        ) : profile ? (
          // Perfil del usuario
          <div className="grid gap-6">
            {/* Cabecera del perfil */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src="/placeholder-user.jpg" alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-lg">{getInitials(profile.firstName, profile.lastName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
                <p className="text-muted-foreground">Cliente desde {formatDate(profile.createdAt)}</p>
                {userCompany && (
                  <Badge variant="outline" className="mt-1">
                    {userCompany.name}
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Información Personal</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>Gestiona tu información personal y de contacto</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{isEditing ? "Cancelar edición" : "Editar perfil"}</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      // Formulario de edición
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        {/* Campo de correo electrónico (solo lectura) */}
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input id="email" value={profile.email} disabled className="bg-muted opacity-80" />
                          <p className="text-xs text-muted-foreground">El correo electrónico no se puede modificar</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Guardar cambios
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Vista de información
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Nombre completo</p>
                            <p className="flex items-center gap-2 font-medium">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {`${profile.firstName} ${profile.lastName}`}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Correo electrónico</p>
                            <p className="flex items-center gap-2 font-medium">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {profile.email}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="flex items-center gap-2 font-medium">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {profile.phone || "No especificado"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="flex items-center gap-2 font-medium">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {profile.address || "No especificada"}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Rol</p>
                          <p className="flex items-center gap-2 font-medium">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {profile.role === "customer" ? "Cliente" : profile.role}
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{userCompany?.name || "Sin empresa asignada"}</p>
                          </div>

                          {userAreas.length > 0 && (
                            <div className="pl-6">
                              <p className="text-sm text-muted-foreground mb-2">Áreas asignadas:</p>
                              <div className="flex flex-wrap gap-2">
                                {userAreas.map((area) => (
                                  <Badge key={area.id} variant="secondary" className="text-xs">
                                    {area.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Gestiona tu contraseña y configuración de seguridad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordChangeSuccess ? (
                      <div className="mb-6 rounded-lg border border-green-100 bg-green-50 p-4 text-green-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <p className="font-medium">Contraseña actualizada correctamente</p>
                        </div>
                        <p className="mt-1 text-sm">Tu contraseña ha sido cambiada con éxito.</p>
                      </div>
                    ) : null}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña actual</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className={passwordErrors.currentPassword ? "border-red-500" : ""}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={handlePasswordInputChange}
                          className={passwordErrors.newPassword ? "border-red-500" : ""}
                        />
                        {passwordErrors.newPassword ? (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.newPassword}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y
                            caracteres especiales.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordFormData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cambiando...
                          </>
                        ) : (
                          "Cambiar contraseña"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </main>
    </div>
  )
}
