"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "María García",
    role: "Propietaria de Restaurante",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911418/patricia-fernandez-propietaria-arroceria-marina-ventura-1024x683_nh4fsh.jpg",
    content:
      "Veryfrut ha transformado nuestra cocina. La calidad de sus productos orgánicos es excepcional y siempre llegan frescos. Su servicio de distribución es puntual y confiable, lo que nos permite ofrecer a nuestros clientes platos con ingredientes de primera calidad.",
    rating: 5,
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Gerente de Supermercado",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911447/store-manager-supermarket-meeting-team-260nw-2546519735_mhsmi8.jpg",
    content:
      "Desde que comenzamos a trabajar con Veryfrut, las ventas de nuestra sección de productos orgánicos han aumentado significativamente. Nuestros clientes aprecian la frescura y calidad de sus productos, y nosotros valoramos su profesionalismo y compromiso.",
    rating: 5,
  },
  {
    id: 3,
    name: "Laura Martínez",
    role: "Chef Profesional",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911461/Chef_Jean-Pierre_Br_C3_A9hier_golnxz.jpg",
    content:
      "Como chef, la calidad de los ingredientes es fundamental para mi trabajo. Veryfrut me proporciona las mejores frutas y verduras orgánicas del mercado. Su variedad de productos exóticos me permite innovar y crear platos únicos que sorprenden a mis comensales.",
    rating: 4,
  },
]

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }, [])

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }, [])

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Lo que dicen nuestros clientes</h2>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-100">
                  <Image
                    src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                    alt={testimonials[currentTestimonial].name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[currentTestimonial].rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">{testimonials[currentTestimonial].content}</p>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{testimonials[currentTestimonial].name}</h3>
                  <p className="text-green-600">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-5 md:-translate-x-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
            aria-label="Testimonio anterior"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-5 md:translate-x-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
            aria-label="Testimonio siguiente"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full ${index === currentTestimonial ? "bg-green-600" : "bg-gray-300"}`}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
