"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, ArrowRight, HelpCircle, AlertCircle } from "lucide-react"
import { api } from "@/lib/axiosInstance"
import { setCookie } from "@/lib/cookies"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"

// Definir tipos para el formulario y errores
interface FormData {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email: string
  password: string
}

// Interfaces para la autenticación
interface LoginRequest {
  email: string
  password: string
}

// Actualizar la interfaz para manejar ambos formatos de respuesta
interface LoginResponse {
  token?: string
  access_token?: string
}

// Interfaz para el token decodificado
interface DecodedToken {
  sub: number
  email: string
  role: string
  iat: number
  exp: number
}

// Definir un tipo para los errores de API
interface ApiError {
  response?: {
    status: number
    data?: {
      message?: string
    }
  }
  request?: unknown
  message?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
  })
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Limpiar errores al escribir
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Limpiar error de autenticación cuando el usuario modifica los campos
    if (authError) {
      setAuthError("")
    }
  }

  const validateForm = (): boolean => {
    let valid = true
    const newErrors: FormErrors = { email: "", password: "" }

    // Validación básica de email
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
      valid = false
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
      valid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setAuthError("")

    // Mostrar toast de carga
    const loadingToast = toast.loading("Iniciando sesión...")

    try {
      // Preparar datos para la solicitud
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      }

      // Realizar la solicitud de autenticación
      const response = await api.post<LoginResponse>("/auth/login", loginData)

      // Extraer el token de la respuesta (puede venir como token o access_token)
      const token = response.data.token || response.data.access_token

      // Verificar que tenemos un token
      if (!token) {
        throw new Error("No se recibió un token válido del servidor")
      }

      console.log("Token recibido:", token)

      // Configurar el token en los headers de axios para futuras peticiones
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Guardar el token en localStorage con la clave "token"
      localStorage.setItem("token", token)

      try {
        // Decodificar el token para obtener la información del usuario
        const decodedToken = jwtDecode<DecodedToken>(token)

        // Extraer información del usuario del token
        const { sub, email, role, exp } = decodedToken

        // Calcular tiempo de expiración en segundos (desde la fecha actual hasta exp)
        const expirationTime = exp - Math.floor(Date.now() / 1000)

        // Configurar opciones de cookie basadas en "recordar sesión"
        const cookieOptions = {
          // Si "recordar" está activado, usar el tiempo de expiración del token
          // De lo contrario, la cookie expirará al cerrar el navegador (session cookie)
          maxAge: formData.remember ? expirationTime : undefined,
          secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
          path: "/", // Disponible en toda la aplicación
        }

        // 1. Guardar el token sin modificar en una cookie con la clave "token"
        setCookie("token", token, cookieOptions)

        // 2. Guardar información básica del usuario en una cookie no-httpOnly para el middleware
        const userData = {
          id: sub,
          email,
          role,
        }

        setCookie("user_info", JSON.stringify(userData), {
          ...cookieOptions,
          httpOnly: false, // Accesible desde JavaScript
        })

        // Cerrar el toast de carga y mostrar toast de éxito
        toast.dismiss(loadingToast)
        toast.success("Usuario autenticado", {
          duration: 3000,
          onAutoClose: () => {
            // Redireccionar al usuario según su rol
            router.push("/dashboard")
          },
        })
      } catch (decodeError) {
        console.error("Error al decodificar el token:", decodeError)
        console.log("Token recibido:", token)

        // Aún así, guardar el token sin decodificar para pruebas
        setCookie("token", token, {
          secure: process.env.NODE_ENV === "production",
          path: "/",
        })

        // Configurar el token en los headers de axios para futuras peticiones
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`

        toast.dismiss(loadingToast)
        toast.success("Usuario autenticado", {
          duration: 3000,
          onAutoClose: () => {
            // Redireccionar al dashboard
            router.push("/dashboard")
          },
        })
      }
    } catch (error: unknown) {
      console.error("Error de autenticación:", error)

      // Convertir el error a un tipo más específico
      const apiError = error as ApiError

      // Cerrar el toast de carga
      toast.dismiss(loadingToast)

      // Manejar diferentes tipos de errores
      if (apiError.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (apiError.response.status === 401) {
          setAuthError("Credenciales incorrectas. Por favor, verifica tu email y contraseña.")
          toast.error("Credenciales incorrectas", {
            description: "Por favor, verifica tu email y contraseña.",
          })
        } else if (apiError.response.status === 403) {
          setAuthError("No tienes permiso para acceder. Contacta con el administrador.")
          toast.error("Acceso denegado", {
            description: "No tienes permiso para acceder. Contacta con el administrador.",
          })
        } else {
          const errorMessage = apiError.response.data?.message || "Error al iniciar sesión. Inténtalo de nuevo."
          setAuthError(errorMessage)
          toast.error("Error de inicio de sesión", {
            description: errorMessage,
          })
        }
      } else if (apiError.request) {
        // La solicitud se realizó pero no se recibió respuesta
        const errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        setAuthError(errorMessage)
        toast.error("Error de conexión", {
          description: errorMessage,
        })
      } else {
        // Ocurrió un error al configurar la solicitud
        const errorMessage = apiError.message || "Error al procesar la solicitud. Inténtalo de nuevo más tarde."
        setAuthError(errorMessage)
        toast.error("Error inesperado", {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Encabezado con imagen */}
        <div className="relative h-40 bg-green-600">
          <Image
            src="https://res.cloudinary.com/demzflxgq/image/upload/v1744912451/produce-azerbaijan-stockers-scaled_rxodoe.jpg"
            alt="Frutas y verduras frescas"
            fill
            className="object-cover mix-blend-overlay opacity-60"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <Link href="/" className="inline-block mb-2">
              <div className="relative h-12 w-32">
                <span className="text-2xl font-bold text-white">
                  Very<span className="text-green-200">frut</span>
                </span>
                <span className="absolute top-8 right-0 text-xs text-green-200">shop</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold">Acceso a Clientes</h1>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start">
            <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Acceso exclusivo para clientes registrados</p>
              <p>
                Para solicitar acceso, contacte con nuestro equipo comercial al{" "}
                <a href="tel:987801148" className="font-medium underline">
                  987801148
                </a>{" "}
                o envíe un correo a{" "}
                <a href="mailto:veryfrut.fernanda@gmail.com" className="font-medium underline">
                  veryfrut.fernanda@gmail.com
                </a>
              </p>
            </div>
          </div>

          {authError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="ejemplo@veryfrut.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link href="/contact" className="text-sm text-green-600 hover:text-green-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remember: checked === true }))}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Recordar sesión
                </label>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Iniciar Sesión <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <Link href="/contact" className="font-medium text-green-600 hover:text-green-500">
                Contacta con soporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
