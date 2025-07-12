import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  sub: number
  email: string
  role: "admin" | "customer"
  iat: number
  exp: number
}

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isUserRoute = pathname.startsWith("/users")
  const isAuthRoute = ["/login", "/register"].includes(pathname)

  // Obtener la cookie "token"
  const token = request.cookies.get("token")?.value

  if (token) {
    try {
      // Decodificar el token JWT
      const decodedToken: DecodedToken = jwtDecode(token)

      const user = {
        id: decodedToken.sub,
        email: decodedToken.email,
        role: decodedToken.role,
      }

      if (isDashboardRoute) {
        if (user.role === "admin") {
          return NextResponse.next()
        } else {
          return NextResponse.redirect(`${origin}/users`)
        }
      }

      if (isUserRoute) {
        if (user.role === "customer") {
          return NextResponse.next()
        } else {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }

      if (isAuthRoute) {
        return user.role === "admin"
          ? NextResponse.redirect(`${origin}/dashboard`)
          : NextResponse.redirect(`${origin}/users`)
      }
    } catch (error) {
      console.error("Error decoding token:", error)
      return NextResponse.redirect(`${origin}/login`)
    }
  } else {
    // Si no hay token y quiere entrar a dashboard o users, redirigir
    if (isDashboardRoute || isUserRoute) {
      return NextResponse.redirect(`${origin}/login`)
    }
  }

  return NextResponse.next()
}

// Configuración para aplicar el middleware
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
