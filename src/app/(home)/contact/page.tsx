import { Suspense } from "react"
import dynamic from "next/dynamic"
import LoadingSpinner from "@/components/global/LoadingSpinner"
import Footer from "@/components/home/footer/footer"
import Header from "@/components/home/header/header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto - Veryfrut",
  description:
    "Contáctanos para solicitar información sobre nuestros productos orgánicos. Teléfono: 987 801 148. Ubicados en Arequipa, Perú.",
  keywords: ["contacto", "veryfrut", "arequipa", "frutas orgánicas", "verduras orgánicas", "distribución"],
}

// Importar componentes con lazy loading
const ContactForm = dynamic(() => import("@/components/contact/contact-form"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

const ContactInfo = dynamic(() => import("@/components/contact/contact-info"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

const ContactFAQ = dynamic(() => import("@/components/contact/contact-faq"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-green-600 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Contáctanos</h1>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
                Estamos aquí para responder cualquier pregunta que puedas tener sobre nuestros productos orgánicos y
                servicios de distribución. Contáctanos y te responderemos lo antes posible.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ContactInfo />
            </Suspense>
          </div>
        </div>

        {/* Contact Form and Map Section */}
        <div className="pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
              <Suspense fallback={<LoadingSpinner />}>
                <ContactForm />
              </Suspense>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-[300px] md:h-[400px] bg-gray-200 relative">
                  {/* Mapa placeholder - aquí se puede integrar Google Maps */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600 mx-auto mb-4"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <p className="text-green-700 font-semibold text-lg">Arequipa, Perú</p>
                      <p className="text-green-600">Distribución de productos orgánicos</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Información de contacto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      <span className="text-gray-700">987 801 148</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className="text-gray-700">veryfrut.fernanda@gmail.com</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span className="text-gray-700">Arequipa, Perú</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <Suspense fallback={<LoadingSpinner />}>
              <ContactFAQ />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
