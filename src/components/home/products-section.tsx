import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Truck, Award, CheckCircle, Users, Calendar } from "lucide-react"

export default function InstitutionalLineSection() {
  const institutionalProduct = {
    id: 4,
    name: "Línea Institucional",
    description: "Productos adaptados a las necesidades de comedores escolares, hospitales y servicios de catering.",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    features: ["Volumen garantizado", "Precios estables", "Entregas programadas"],
    certification: "ISO 22000",
    minOrder: "Consultar según volumen",
  }

  return (
    <section id="categories-section" className="bg-gradient-to-br from-green-50 to-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mb-4 px-4 py-2 text-sm font-medium">
            Solución Especializada
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{institutionalProduct.name}</h2>
          <div className="w-16 sm:w-24 h-1 bg-green-600 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {institutionalProduct.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section */}
          <div className="relative order-2 lg:order-1">
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={institutionalProduct.image || "/placeholder.svg"}
                alt={institutionalProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white">
                Distribución Mayorista
              </Badge>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-200 rounded-full blur-xl opacity-60"></div>
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-300 rounded-full blur-lg opacity-40"></div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {institutionalProduct.features.map((feature, index) => {
                const icons = [Users, CheckCircle, Calendar]
                const IconComponent = icons[index] || CheckCircle
                return (
                  <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-green-100 rounded-full p-3 mb-3">
                        <IconComponent className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-gray-800">{feature}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-green-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Certificación</p>
                    <p className="text-sm text-gray-600">{institutionalProduct.certification}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Pedido mínimo</p>
                    <p className="text-sm text-gray-600">{institutionalProduct.minOrder}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50 py-3 sm:py-4 text-sm sm:text-base"
              >
                <FileText className="h-4 w-4 mr-2" />
                Descargar Ficha Técnica
              </Button>
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 py-3 sm:py-4 text-sm sm:text-base">
                  Solicitar Información
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">
                  ¿Necesita una solución personalizada?
                </h3>
                <p className="text-green-100 text-sm sm:text-base lg:text-lg max-w-2xl">
                  Ofrecemos soluciones adaptadas a comedores escolares, hospitales y servicios de catering. Contáctenos
                  para discutir volúmenes, frecuencia de entrega y requisitos especiales.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    className="bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold w-full sm:w-auto whitespace-nowrap"
                  >
                    Contactar Ventas
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
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
