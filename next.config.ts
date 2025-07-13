import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
    unoptimized: true,
  },

  // Versión simplificada sin tipos de webpack
  webpack: (config, { isServer }) => {
    // Configuración específica para ExcelJS y XLSX en producción
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    // Asegurar que las librerías de Excel se incluyan correctamente
    if (!isServer) {
      config.externals = config.externals || []
      config.resolve.alias = {
        ...config.resolve.alias,
        exceljs: require.resolve("exceljs"),
        xlsx: require.resolve("xlsx"),
      }
    }

    return config
  },

  // Transpile packages para mejor compatibilidad
  transpilePackages: ["exceljs"],

  // Configuración para ignorar errores durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuración para ignorar errores de TypeScript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
