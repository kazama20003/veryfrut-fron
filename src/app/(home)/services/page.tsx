import { Suspense } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/global/LoadingSpinner"
import Header from "@/components/home/header/header"
import Footer from "@/components/home/footer/footer"
import { Metadata } from "next"
export const metadata: Metadata = {
  title: "Servicios de Distribución | Veryfrut",
  description: "Descubre nuestros servicios de distribución de frutas y verduras frescas al por mayor. Calidad garantizada para tu negocio, restaurante o mercado.",
};


export default function Services() {
  return (
    <>
    <Header></Header>
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Nuestros Servicios</h1>
        <div className="w-20 md:w-24 h-1 bg-green-600 mx-auto mb-4 md:mb-6"></div>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-2">
          En Veryfrut ofrecemos servicios completos de distribución de frutas y verduras orgánicas para satisfacer las
          necesidades de nuestros diversos clientes.
        </p>
      </div>

      {/* Sección Distribución Mayorista */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center mb-12 md:mb-16">
        <div className="order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Distribución Mayorista</h2>
          <p className="text-gray-600 mb-3 md:mb-4">
            Ofrecemos servicios de distribución mayorista para supermercados, hoteles, restaurantes y otros negocios que
            requieren productos frescos de alta calidad en grandes cantidades.
          </p>
          <p className="text-gray-600 mb-4 md:mb-6">
            Nuestro sistema logístico eficiente garantiza que los productos lleguen a su destino en perfectas
            condiciones y en el momento acordado, manteniendo la cadena de frío cuando es necesario.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1 md:space-y-2">
            <li>Entregas programadas y puntuales</li>
            <li>Productos frescos seleccionados</li>
            <li>Precios competitivos para mayoristas</li>
            <li>Amplia variedad de productos orgánicos</li>
          </ul>
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Solicitar información</Button>
        </div>
        <div className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg order-1 md:order-2 mb-6 md:mb-0">
          <Suspense fallback={<LoadingSpinner />}>
            <Image
              src="https://res.cloudinary.com/demzflxgq/image/upload/v1744912451/produce-azerbaijan-stockers-scaled_rxodoe.jpg"
              alt="Distribución Mayorista"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </Suspense>
        </div>
      </div>

      {/* Sección Distribución Minorista */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center mb-12 md:mb-16">
        <div className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-lg mb-6 md:mb-0">
          <Suspense fallback={<LoadingSpinner />}>
            <Image
              src="https://res.cloudinary.com/demzflxgq/image/upload/v1744912452/frutartean-19_wolp4t.jpg"
              alt="Distribución Minorista"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </Suspense>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Distribución Minorista</h2>
          <p className="text-gray-600 mb-3 md:mb-4">
            Suministramos a tiendas especializadas, mercados locales y pequeños comercios que buscan ofrecer a sus
            clientes productos orgánicos de la mejor calidad.
          </p>
          <p className="text-gray-600 mb-4 md:mb-6">
            Entendemos las necesidades específicas de los minoristas y ofrecemos soluciones flexibles que se adaptan a
            diferentes volúmenes y frecuencias de pedido.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1 md:space-y-2">
            <li>Pedidos personalizados</li>
            <li>Entregas frecuentes de productos frescos</li>
            <li>Asesoramiento sobre almacenamiento y exhibición</li>
            <li>Material promocional para punto de venta</li>
          </ul>
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Contactar ahora</Button>
        </div>
      </div>

      {/* Sección Nuestro Proceso */}
      <div className="bg-green-50 p-6 md:p-8 rounded-lg mb-12 md:mb-16 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6 md:mb-8">Nuestro Proceso</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              step: 1,
              title: "Selección",
              description: "Seleccionamos cuidadosamente los mejores productos orgánicos de agricultores certificados.",
            },
            {
              step: 2,
              title: "Control de Calidad",
              description: "Verificamos la calidad y frescura de cada producto antes de su distribución.",
            },
            {
              step: 3,
              title: "Empaque",
              description: "Empacamos los productos con materiales sostenibles que mantienen su frescura.",
            },
            {
              step: 4,
              title: "Distribución",
              description: "Entregamos los productos a tiempo y en perfectas condiciones a nuestros clientes.",
            },
          ].map((process, index) => (
            <div
              key={index}
              className="bg-white p-5 md:p-6 rounded-lg shadow-md text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-green-600">{process.step}</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{process.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{process.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Productos que Distribuimos */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Productos que Distribuimos</h2>
        <div className="w-20 md:w-24 h-1 bg-green-600 mx-auto mb-6 md:mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: "Frutas Frescas",
              image:
                "https://res.cloudinary.com/demzflxgq/image/upload/v1744910191/julia-zolotova-M_xIaxQE3Ms-unsplash_oarrco.jpg",
            },
            {
              title: "Verduras Orgánicas",
              image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744909701/2_bhlooi.jpg",
            },
            {
              title: "Frutas Exóticas",
              image:
                "https://res.cloudinary.com/demzflxgq/image/upload/v1744910081/flat-lay-raw-vegetables-mix_foc8d3.jpg",
            },
            {
              title: "Productos de Temporada",
              image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
            },
          ].map((product, index) => (
            <div
              key={index}
              className="p-3 md:p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-32 sm:h-40 mb-3 md:mb-4 bg-gray-100 rounded-md overflow-hidden">
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </Suspense>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800">{product.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Sección CTA */}
      <div className="bg-green-600 text-white p-6 md:p-8 rounded-lg text-center shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">¿Listo para comenzar?</h2>
        <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto">
          Contáctanos hoy mismo para discutir cómo podemos satisfacer tus necesidades de distribución de frutas y
          verduras orgánicas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-green-600 w-full sm:w-auto"
          >
            Solicitar Cotización
          </Button>
          <Button className="bg-white text-green-600 hover:bg-green-100 w-full sm:w-auto">Contactar Ahora</Button>
        </div>
      </div>
    </div>
    <Footer></Footer>
    </>
  )
}
