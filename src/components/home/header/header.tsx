"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Phone, Search, User, Menu, X, LogOut, Settings, UserCircle, ShoppingBag, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axiosInstance"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserInfo {
  id: number
  email: string
  role: string
  name?: string
  avatar?: string | null
  company?: string | null
}

export default function Header() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // Función para obtener detalles del usuario
  const fetchUserDetails = useCallback(async (userId: number) => {
    try {
      // Intentar obtener información adicional del usuario desde la API
      const response = await api.get(`/users/${userId}`)

      if (response.data) {
        // Actualizar el estado con la información completa del usuario
        setUserInfo((prevInfo) => {
          if (!prevInfo) return prevInfo

          return {
            ...prevInfo,
            name: response.data.name || response.data.firstName || prevInfo.email.split("@")[0],
            avatar: response.data.avatar || null,
            company: response.data.company || null,
          }
        })
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      // Si hay un error, no hacemos nada y mantenemos la información básica
    }
  }, [])

  // Función para verificar la autenticación
  const checkAuth = useCallback(() => {
    try {
      // Obtener cookies directamente
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1]

      const userInfoCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_info="))
        ?.split("=")[1]

      console.log("Token cookie:", token)
      console.log("User info cookie:", userInfoCookie)

      // Si tenemos al menos user_info, consideramos al usuario autenticado
      if (userInfoCookie) {
        try {
          // Decodificar la cookie user_info
          const parsedUserInfo = JSON.parse(decodeURIComponent(userInfoCookie)) as UserInfo
          console.log("Parsed user info:", parsedUserInfo)

          setIsAuthenticated(true)
          setUserInfo(parsedUserInfo)

          // Obtener información adicional del usuario
          if (parsedUserInfo && parsedUserInfo.id) {
            fetchUserDetails(parsedUserInfo.id)
          }
          return true
        } catch (error) {
          console.error("Error parsing user info:", error)
          return false
        }
      } else {
        setIsAuthenticated(false)
        setUserInfo(null)
        return false
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      return false
    }
  }, [fetchUserDetails]) // Añadir fetchUserDetails como dependencia

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    checkAuth()

    // Manejar el evento de scroll
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    // Agregar event listener para scroll
    window.addEventListener("scroll", handleScroll)

    // Verificar autenticación periódicamente (cada 10 segundos)
    const authCheckInterval = setInterval(checkAuth, 10000)

    // Limpiar event listeners y intervalos
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(authCheckInterval)
    }
  }, [checkAuth]) // Añadido checkAuth como dependencia

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleLogout = async () => {
    // Función para eliminar todas las cookies
    const deleteAllCookies = () => {
      // Obtener todas las cookies
      const cookies = document.cookie.split(";")

      // Para cada cookie, establecer una fecha de expiración en el pasado
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

        // Eliminar con diferentes combinaciones de path y domain para asegurar que se eliminen todas
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`

        // También intentar con subdominios
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
      }
    }

    // Eliminar todas las cookies
    deleteAllCookies()

    // Actualizar estado inmediatamente para una experiencia más fluida
    setIsAuthenticated(false)
    setUserInfo(null)

    // Mostrar toast de confirmación
    toast.success("Sesión cerrada correctamente", {
      duration: 2000,
    })

    // Redireccionar a la página principal
    router.push("/")
    router.refresh() // Forzar recarga para actualizar el estado
  }

  // Función para obtener el nombre de usuario para mostrar
  const getUserDisplayName = () => {
    if (!userInfo) return ""

    if (userInfo.name) return userInfo.name

    // Si no hay nombre, usar la parte antes del @ del email
    const emailParts = userInfo.email.split("@")
    return emailParts[0]
  }

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-50">
        <div className={`bg-white border-b transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}>
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm hidden sm:inline font-medium">
                Llámanos: <span className="text-green-600 hover:underline">987 801 148</span>
              </span>
              <span className="text-sm sm:hidden font-medium text-green-600">987 801 148</span>
            </div>
            <Link
              href="/"
              className="flex items-center absolute left-1/2 transform -translate-x-1/2 sm:static sm:left-auto sm:transform-none"
            >
              <div className="relative h-10 w-28 sm:h-12 sm:w-40">
                <Image
                  src="https://res.cloudinary.com/demzflxgq/image/upload/v1746485219/Imagen_de_WhatsApp_2025-05-01_a_las_15.03.46_9cee1908_1_dgctjp.jpg"
                  alt="Veryfrut - Distribuidora de frutas y verduras"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 112px, 160px"
                  style={{ objectFit: "contain", padding: "0" }}
                />
              </div>
            </Link>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                aria-label="Buscar"
                className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 focus:outline-none">
                      <Avatar className="h-8 w-8 border border-green-200">
                        {userInfo?.avatar ? (
                          <AvatarImage src={userInfo.avatar || "/placeholder.svg"} alt={getUserDisplayName()} />
                        ) : (
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {getUserDisplayName().charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm font-medium hidden md:block">{getUserDisplayName()}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span className="truncate">{userInfo?.email}</span>
                    </DropdownMenuItem>
                    {userInfo?.company && (
                      <DropdownMenuItem className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>{userInfo.company}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="flex items-center">
                      <span className="mr-2 h-4 w-4 flex items-center justify-center text-xs font-bold bg-green-100 text-green-800 rounded-full">
                        {userInfo?.role?.charAt(0).toUpperCase()}
                      </span>
                      <span className="capitalize">{userInfo?.role}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {userInfo?.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:inline">Iniciar sesión</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <motion.nav
          className={`bg-green-600 transition-all duration-300 ${scrolled ? "py-1" : "py-2"}`}
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            height: scrolled ? "auto" : "auto",
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-white p-2 hover:bg-green-700 rounded-md transition-colors duration-200 active:bg-green-800"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <span className="text-white font-medium">Menú</span>
              <Link href={isAuthenticated ? "/users" : "/login"}>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 text-sm px-4 py-1 h-auto shadow-sm"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Pedir Ahora
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden overflow-hidden"
                >
                  <nav className="flex flex-col gap-2 mt-3 pb-3">
                    <Link
                      href="/"
                      className="text-white font-medium py-2 px-3 border-b border-green-500/30 hover:bg-green-700 hover:border-white/30 rounded-md transition-all duration-200 active:bg-green-800 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                      Inicio
                    </Link>
                    <Link
                      href="/about-us"
                      className="text-white font-medium py-2 px-3 border-b border-green-500/30 hover:bg-green-700 hover:border-white/30 rounded-md transition-all duration-200 active:bg-green-800 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                      Sobre Nosotros
                    </Link>
                    <Link
                      href="/services"
                      className="text-white font-medium py-2 px-3 border-b border-green-500/30 hover:bg-green-700 hover:border-white/30 rounded-md transition-all duration-200 active:bg-green-800 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                      Servicios
                    </Link>
                    <Link
                      href="/contact"
                      className="text-white font-medium py-2 px-3 border-b border-green-500/30 hover:bg-green-700 hover:border-white/30 rounded-md transition-all duration-200 active:bg-green-800 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                      Contacto
                    </Link>
                    <Link href={isAuthenticated ? "/users" : "/login"}>
                      <Button
                        className="bg-white text-green-600 hover:bg-green-50 mt-2 w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Pedir Ahora
                      </Button>
                    </Link>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-white font-medium hover:text-white/80 transition-colors duration-200 relative group"
                >
                  Inicio
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/about-us"
                  className="text-white font-medium hover:text-white/80 transition-colors duration-200 relative group"
                >
                  Sobre Nosotros
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/services"
                  className="text-white font-medium hover:text-white/80 transition-colors duration-200 relative group"
                >
                  Servicios
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/contact"
                  className="text-white font-medium hover:text-white/80 transition-colors duration-200 relative group"
                >
                  Contacto
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
              <Link href={isAuthenticated ? "/users" : "/login"}>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50 transition-all duration-300 flex items-center"
                  size={scrolled ? "sm" : "default"}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Pedir Ahora
                </Button>
              </Link>
            </div>
          </div>
        </motion.nav>
      </header>
      {/* Espaciador ajustado para diferentes dispositivos */}
      <div className="h-[80px] sm:h-[100px]"></div>
    </>
  )
}
