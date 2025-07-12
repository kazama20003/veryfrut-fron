"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, LogOut, User } from "lucide-react"

import { api } from "@/lib/axiosInstance"
import { getUserIdFromToken } from "@/lib/jwt"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { toast } from "sonner"

interface UserData {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  avatar?: string
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        // Obtener el ID del usuario del token JWT
        const userId = getUserIdFromToken()

        if (!userId) {
          console.error("No se pudo obtener el ID del usuario")
          return
        }

        // Obtener los datos del usuario desde la API
        const response = await api.get(`/users/${userId}`)
        setUserData(response.data)
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Función para cerrar sesión
const handleLogout = () => {
  try {
    // Eliminar cookies visibles desde el cliente
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    toast.success("Sesión cerrada", {
      description: "Has cerrado sesión correctamente.",
    });

    // Forzar recarga para aplicar el cambio de cookies inmediatamente
    window.location.href = "/login";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    toast.error("Error al cerrar sesión", {
      description: "No se pudo cerrar la sesión. Por favor, intenta nuevamente.",
    });
  }
}



  // Obtener el nombre completo y las iniciales
  const fullName = userData ? `${userData.firstName} ${userData.lastName}` : "Usuario"
  const initials = userData ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}` : "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} alt={fullName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs">{isLoading ? "Cargando..." : userData?.email || "Sin correo"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userData?.avatar || "/placeholder-user.jpg"} alt={fullName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullName}</span>
                  <span className="truncate text-xs">
                    {isLoading ? "Cargando..." : userData?.email || "Sin correo"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/users/profile")}>
            <User className="mr-2 h-4 w-4" />
            Cambiar contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
