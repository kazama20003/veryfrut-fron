import Image from "next/image"
import Link from "next/link"
import { Leaf, Apple, ShoppingBag, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Truck, CheckCircle, Users, Calendar } from "lucide-react"

// CategorySection Component - Optimizado
function CategorySection() {
  const categories = [
    {
      title: "Verduras",
      description: "Amplia variedad de verduras frescas: Acelga, Cebolla, Cilantro, Apio, Brócoli y muchas más.",
      image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744909701/2_bhlooi.jpg",
      bgColor: "from-green-500 to-green-600",
      icon: <Leaf className="h-6 w-6" />,
      link: "/login",
      sampleItems: ["Acelga", "Cebolla china", "Cilantro", "Apio", "Brócoli", "Espinaca"],
    },
    {
      title: "Frutas",
      description: "Frutas frescas y de temporada: Aguaymanto, Arándano, Chirimoya, Mango, Naranja y más.",
      image:
        "https://res.cloudinary.com/demzflxgq/image/upload/v1744910191/julia-zolotova-M_xIaxQE3Ms-unsplash_oarrco.jpg",
      bgColor: "from-red-500 to-red-600",
      icon: <Apple className="h-6 w-6" />,
      link: "/login",
      sampleItems: ["Aguaymanto", "Arándano", "Chirimoya", "Mango", "Naranja", "Palta"],
    },
    {
      title: "IGV",
      description: "Productos complementarios: Huevo de Codorniz, Quesos variados, Fideos y más.",
      image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744910081/flat-lay-raw-vegetables-mix_foc8d3.jpg",
      bgColor: "from-yellow-500 to-yellow-600",
      icon: <ShoppingBag className="h-6 w-6" />,
      link: "/login",
      sampleItems: ["Huevo Codornis", "Queso Paria", "Queso LLuta", "Fideo Chino", "Wantan", "Siu Cau"],
    },
    {
      title: "Otros",
      description: "Productos adicionales: Cáscara de Cacao, Mondongo, Garbanzo, Chuño y más.",
      image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744909683/vegeta_lbet82.jpg",
      bgColor: "from-purple-500 to-purple-600",
      icon: <Coffee className="h-6 w-6" />,
      link: "/login",
      sampleItems: ["Cascara de Cacao", "Mondonguito", "Garbanzo", "Chuño", "Higado", "Emoliente"],
    },
  ]

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">Nuestras Categorías</h2>
          <div className="w-16 sm:w-24 h-1 bg-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Descubre nuestra amplia selección de productos frescos y orgánicos, cuidadosamente seleccionados para
            ofrecerte lo mejor de la naturaleza.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col bg-white"
            >
              <div className="relative h-40 sm:h-44 w-full overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${category.bgColor} opacity-70 hover:opacity-80 transition-opacity duration-300`}
                ></div>

                <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">{category.icon}</div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{category.title}</h3>
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{category.description}</p>

                <div className="mb-3 flex-grow">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Productos destacados:</h4>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {category.sampleItems.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center">
                        <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5 flex-shrink-0"></span>
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={category.link} className="mt-auto">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2">
                    Ver productos
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4 text-sm">
            ¿Buscas un producto específico? Tenemos más de 200 productos disponibles.
          </p>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700 px-6 py-2 text-sm">Ver catálogo completo</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// InstitutionalLineSection Component - Optimizado
function InstitutionalLineSection() {
  const institutionalProduct = {
    id: 4,
    name: "Líneas de Productos",
    description:
      "Ofrecemos una amplia gama de productos frescos de alta calidad para satisfacer las necesidades específicas de su negocio. Todas nuestras líneas de productos cumplen con los más altos estándares de calidad y seguridad alimentaria.",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    features: ["Volumen garantizado", "Precios estables", "Entregas programadas"],
    certification: "Premiun",
    minOrder: "Consultar según volumen",
  }

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header compacto */}
        <div className="text-center mb-8">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mb-3 px-3 py-1 text-xs font-medium">
            Solución Especializada
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{institutionalProduct.name}</h2>
          <div className="w-16 h-1 bg-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{institutionalProduct.description}</p>
        </div>

        {/* Contenido principal más compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Imagen */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="relative h-48 sm:h-64 lg:h-72 rounded-xl overflow-hidden shadow-xl">
              <Image
                src={institutionalProduct.image || "/placeholder.svg"}
                alt={institutionalProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white text-xs">
                Mayorista
              </Badge>
            </div>
          </div>

          {/* Contenido */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Features en grid compacto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {institutionalProduct.features.map((feature, index) => {
                const icons = [Users, CheckCircle, Calendar]
                const IconComponent = icons[index] || CheckCircle
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center border border-gray-100">
                    <div className="bg-green-100 rounded-full p-2 w-fit mx-auto mb-2">
                      <IconComponent className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">{feature}</p>
                  </div>
                )
              })}
            </div>

            {/* Detalles en grid horizontal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Calidad</p>
                  <p className="text-xs text-gray-600">{institutionalProduct.certification}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Truck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Pedido mínimo</p>
                  <p className="text-xs text-gray-600">{institutionalProduct.minOrder}</p>
                </div>
              </div>
            </div>

            {/* Botones compactos */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50 py-2 text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ficha Técnica
              </Button>
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 py-2 text-sm">Solicitar Info</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA final más compacto */}
        <div className="mt-8 sm:mt-10">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold mb-2">¿Necesita una solución personalizada?</h3>
                <p className="text-green-100 text-sm max-w-xl">
                  Contáctenos para discutir volúmenes, frecuencia de entrega y requisitos especiales.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 text-sm font-semibold w-full sm:w-auto"
                  >
                    Contactar Ventas
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-green-600 hover:bg-white/10 px-4 py-2 text-sm w-full sm:w-auto"
                >
                  Ver Catálogo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Combined Component optimizado
export default function OptimizedSections() {
  return (
    <div className="space-y-0">
      <CategorySection />
      <InstitutionalLineSection />
    </div>
  )
}
