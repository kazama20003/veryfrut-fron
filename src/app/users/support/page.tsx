import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Facebook, Phone, Mail, Globe, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Soporte Técnico - Veryfrut",
  description: "Soporte técnico para Veryfrut. Desarrollado por Phoenix Solutions IT.",
  keywords: ["soporte", "veryfrut", "Phoenix Solutions IT", "desarrollo web", "soporte técnico"],
}

export default function SupportPage() {
  return (
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Soporte Técnico</h1>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
                Esta plataforma ha sido desarrollada por Phoenix Solutions IT, expertos en soluciones digitales para
                empresas.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Info Section */}
        <div className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Logo and Image Section */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 md:p-12 flex flex-col justify-center items-center text-white">
                    <div className="mb-8 w-40 h-40 relative mx-auto">
                      <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center p-4">
                        <div className="relative w-full h-full">
                          <Image
                            src="https://res.cloudinary.com/demzflxgq/image/upload/v1748008641/30057f59-7137-4f50-b6ee-66832c9df6e6_p8y0yh.jpg"
                            alt="Phoenix Solutions IT"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Phoenix Solutions IT</h2>
                    <p className="text-center text-purple-100 mb-6">
                      Transformamos ideas en soluciones digitales innovadoras para impulsar el crecimiento de tu
                      negocio.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Link
                        href="https://www.facebook.com/profile.php?id=61568108366850"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                      >
                        <Facebook className="h-6 w-6" />
                        <span className="sr-only">Facebook</span>
                      </Link>
                      <Link
                        href="https://www.tiktok.com/@phoenix_it_solutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                          <path d="M15 8v8a4 4 0 0 1-4 4" />
                          <line x1="15" y1="4" x2="15" y2="12" />
                        </svg>
                        <span className="sr-only">TikTok</span>
                      </Link>
                      <Link
                        href="https://phoenix-it.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                      >
                        <Globe className="h-6 w-6" />
                        <span className="sr-only">Sitio web</span>
                      </Link>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-8 md:p-12">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Información de Contacto</h3>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                          <Phone className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                          <p className="text-lg font-medium text-gray-800">901 206 784</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                          <Mail className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Correo electrónico</p>
                          <p className="text-lg font-medium text-gray-800">kazamatower@gmail.com</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                          <Globe className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Sitio web</p>
                          <Link
                            href="https://phoenix-it.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-medium text-purple-600 hover:text-purple-700 flex items-center"
                          >
                            phoenix-it.vercel.app
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Link
                          href="https://phoenix-it.vercel.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            Visitar sitio web
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Servicios que ofrecemos</h2>
              <div className="w-24 h-1 bg-purple-600 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">
                En Phoenix Solutions IT nos especializamos en crear soluciones digitales a medida para impulsar el
                crecimiento de tu negocio.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Desarrollo Web",
                  description:
                    "Creamos sitios web modernos, responsivos y optimizados para SEO que destacan tu marca en línea.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  ),
                },
                {
                  title: "E-commerce",
                  description:
                    "Implementamos tiendas online completas con gestión de inventario, pagos y experiencia de usuario optimizada.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  ),
                },
                {
                  title: "Aplicaciones Móviles",
                  description:
                    "Desarrollamos aplicaciones nativas y multiplataforma para iOS y Android con experiencias de usuario excepcionales.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  ),
                },
                {
                  title: "Marketing Digital",
                  description:
                    "Estrategias de marketing digital personalizadas para aumentar la visibilidad y conversiones de tu negocio.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      <path d="M5 3v4" />
                      <path d="M19 17v4" />
                      <path d="M3 5h4" />
                      <path d="M17 19h4" />
                    </svg>
                  ),
                },
                {
                  title: "Consultoría IT",
                  description:
                    "Asesoramiento experto para optimizar tus procesos tecnológicos y maximizar el rendimiento de tu negocio.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  ),
                },
                {
                  title: "Soporte Técnico",
                  description:
                    "Servicio de soporte técnico continuo para mantener tus plataformas digitales funcionando sin problemas.",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-purple-600"
                    >
                      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                      <path d="m12 12 4 10 1.7-4.3L22 16Z" />
                    </svg>
                  ),
                },
              ].map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Necesitas ayuda con tu proyecto digital?</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Contáctanos hoy mismo y descubre cómo podemos ayudarte a llevar tu negocio al siguiente nivel con
              soluciones tecnológicas a medida.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="tel:+51901206784">
                <Button className="bg-white text-purple-700 hover:bg-purple-50">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar ahora
                </Button>
              </Link>
              <Link href="mailto:kazamatower@gmail.com">
                <Button className="bg-purple-800 hover:bg-purple-900 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar email
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}
