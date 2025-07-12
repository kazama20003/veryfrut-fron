/**
 * Interfaz para el payload del token JWT
 */
interface JwtPayload {
  sub: number // ID del usuario
  email: string
  role: string
  areaId?: number // ID del área (puede no estar presente)
  areas?: number[] // IDs de áreas a las que tiene acceso el usuario
  iat: number
  exp: number
  [key: string]: unknown
}

/**
 * Función para decodificar un token JWT sin verificación de firma
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decodificando JWT:", error)
    return null
  }
}

/**
 * Obtiene el token JWT de las cookies o localStorage
 */
export function getToken(): string | null {
  // Primero intentar obtener de localStorage
  const localToken = localStorage.getItem("token")
  if (localToken) return localToken

  // Si no está en localStorage, intentar obtener de cookies
  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith("token=")) {
      return cookie.substring("token=".length, cookie.length)
    }
  }

  return null
}

/**
 * Obtiene el ID del usuario del token JWT
 */
export function getUserIdFromToken(): number | null {
  try {
    const token = getToken()
    if (!token) {
      console.error("No se encontró token de autenticación")
      return null
    }

    const decoded = decodeJwt(token)
    if (!decoded) {
      console.error("No se pudo decodificar el token")
      return null
    }

    // El ID del usuario generalmente está en el campo 'sub' del JWT
    return decoded.sub || null
  } catch (error) {
    console.error("Error al obtener el ID del usuario:", error)
    return null
  }
}

/**
 * Obtiene el ID del área actual del usuario del token JWT
 */
export function getUserAreaFromToken(): number | null {
  try {
    const token = getToken()
    if (!token) return null

    const decoded = decodeJwt(token)
    if (!decoded) return null

    // El área puede estar en un campo específico como 'areaId'
    return decoded.areaId || null
  } catch (error) {
    console.error("Error al obtener el ID del área:", error)
    return null
  }
}

/**
 * Obtiene todas las áreas a las que tiene acceso el usuario
 */
export function getUserAreas(): number[] {
  try {
    const token = getToken()
    if (!token) return []

    const decoded = decodeJwt(token)
    if (!decoded || !decoded.areas) return []

    return decoded.areas
  } catch (error) {
    console.error("Error al obtener las áreas del usuario:", error)
    return []
  }
}

/**
 * Verifica si un pedido puede ser editado basado en su fecha de creación
 * Solo se puede editar el mismo día hasta las 23:59:59
 */
export function canEditOrder(orderCreatedAt: string): boolean {
  const orderDate = new Date(orderCreatedAt)
  const now = new Date()

  // Verificar si es el mismo día
  return (
    orderDate.getDate() === now.getDate() &&
    orderDate.getMonth() === now.getMonth() &&
    orderDate.getFullYear() === now.getFullYear()
  )
}
