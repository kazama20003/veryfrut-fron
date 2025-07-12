import Link from "next/link"
import { Facebook, Instagram, MapPin, Phone, Mail, ExternalLink, Code, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Veryfrut</h3>
            <p className="text-gray-400 mb-4">
              Distribuidor líder de frutas y verduras orgánicas en Arequipa, comprometidos con la calidad y la
              sostenibilidad.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/veryfrut"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="https://www.instagram.com/veryfrut"
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Soporte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">Arequipa, Perú</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-green-500 mr-2 flex-shrink-0" />
                <a href="tel:+51987801148" className="text-gray-400 hover:text-white transition-colors">
                  987 801 148
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-green-500 mr-2 flex-shrink-0" />
                <a
                  href="mailto:veryfrut.fernanda@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  veryfrut.fernanda@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Horario</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Lunes - Viernes: 5:00 AM - 1:00 PM</li>
              <li>Sábado: 5:00 AM - 1:00 PM</li>
              <li>Domingo: Cerrado</li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">Verduras</span>
                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">Frutas</span>
                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">Orgánicos</span>
                <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">Mayorista</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Veryfrut. Todos los derechos reservados.
          </p>

          <div className="flex items-center text-gray-500 text-sm">
            <span className="flex items-center">
              <Code size={14} className="mr-1" /> Desarrollado con <Heart size={14} className="mx-1 text-red-500" /> por
            </span>
            <a
              href="https://phoenix-it.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-purple-400 hover:text-purple-300 transition-colors flex items-center"
            >
              Phoenix Solutions IT
              <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
