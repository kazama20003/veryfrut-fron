// Función para establecer una cookie
interface CookieOptions {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: "strict" | "lax" | "none"
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`
  }

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`
  }

  if (options.path) {
    cookieString += `; path=${options.path}`
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`
  }

  if (options.secure) {
    cookieString += "; secure"
  }

  if (options.httpOnly) {
    cookieString += "; httpOnly"
  }

  if (options.sameSite) {
    cookieString += `; sameSite=${options.sameSite}`
  }

  document.cookie = cookieString
}

// Función para obtener una cookie
export function getCookie(name: string): string | null {
  const nameEQ = `${encodeURIComponent(name)}=`
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
    }
  }

  return null
}

// Función para eliminar una cookie
export function removeCookie(name: string, path = "/"): void {
  setCookie(name, "", {
    path,
    expires: new Date(0), // Fecha en el pasado para eliminar la cookie
  })
}


export function getUserIdFromCookies(): string | null {
  // Verificar si estamos en el navegador
  if (typeof document === "undefined") {
    return null
  }

  try {
    // Buscar la cookie user_info
    const cookies = document.cookie.split(";")
    let userInfoCookie = null

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith("user_info=")) {
        userInfoCookie = cookie.substring("user_info=".length)
        break
      }
    }

    if (!userInfoCookie) {
      return null
    }

    // Decodificar el valor de la cookie (URL encoded)
    const decodedCookie = decodeURIComponent(userInfoCookie)

    // Parsear el JSON
    const userInfo = JSON.parse(decodedCookie)

    return userInfo.id?.toString() || null
  } catch (error) {
    console.error("Error al obtener el ID del usuario desde las cookies:", error)
    return null
  }
}