import Image from "next/image"
import { Button } from "@/components/ui/button"
import Header from "@/components/home/header/header"
import Footer from "@/components/home/footer/footer"
import { Metadata } from "next"
export const metadata: Metadata = {
  title: "Acerca de | Veryfrut",
  description: "Descubre nuestros servicios de distribución de frutas y verduras frescas al por mayor. Calidad garantizada para tu negocio, restaurante o mercado.",
};

export default function AboutUs() {
  return (
   <>
   <Header />
   <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sobre Nosotros</h1>
        <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          En Veryfrut nos dedicamos a distribuir las mejores frutas y verduras orgánicas, garantizando frescura y
          calidad en cada producto.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
          <p className="text-gray-600 mb-4">
            Fundada en 2021, Veryfrut nació con la misión de proporcionar productos orgánicos de la más alta calidad a
            nuestros clientes. Comenzamos como una pequeña empresa familiar y hemos crecido hasta convertirnos en uno de
            los distribuidores líderes de frutas y verduras orgánicas en la región.
          </p>
          <p className="text-gray-600 mb-6">
            Trabajamos directamente con agricultores locales que comparten nuestra pasión por la agricultura sostenible
            y los productos naturales, garantizando que cada fruta y verdura que distribuimos cumpla con los más altos
            estándares de calidad.
          </p>
          <Button className="bg-green-600 hover:bg-green-700">Conoce a nuestro equipo</Button>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image src="https://res.cloudinary.com/demzflxgq/image/upload/v1744909699/vision_dds3m1.jpg" alt="Equipo de Veryfrut" fill className="object-cover" />
        </div>
      </div>

      <div className="bg-green-50 p-8 rounded-lg mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Nuestros Valores</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Calidad</h3>
            <p className="text-gray-600 text-center">
              Nos comprometemos a ofrecer solo productos de la más alta calidad, seleccionados cuidadosamente.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Sostenibilidad</h3>
            <p className="text-gray-600 text-center">
              Promovemos prácticas agrícolas sostenibles y respetuosas con el medio ambiente.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Comunidad</h3>
            <p className="text-gray-600 text-center">
              Apoyamos a los agricultores locales y contribuimos al desarrollo de nuestras comunidades.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">¿Por qué elegirnos?</h2>
        <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Calidad</h3>
            <p className="text-gray-600">Productos De la mejor calidad</p>
          </div>
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Entrega Rápida</h3>
            <p className="text-gray-600">Distribución eficiente y puntual</p>
          </div>
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Precios Justos</h3>
            <p className="text-gray-600">Valor justo para clientes y productores</p>
          </div>
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Compromiso</h3>
            <p className="text-gray-600">Responsabilidad y dedicación en cada entrega.</p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
   </>
  )
}
