import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
    unoptimized: true,
  },

  // Configuración simplificada para producción
  webpack: (config, { isServer }) => {
    // Configuración específica para librerías de Excel en producción
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    }

    // Solo para el cliente
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        xlsx: require.resolve("xlsx"),
      }
    }

    return config
  },

  // Configuración para ignorar errores durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
