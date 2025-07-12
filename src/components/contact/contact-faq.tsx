"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Phone } from "lucide-react"

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "¿Cuál es el tiempo de entrega?",
      answer:
        "Nuestro tiempo de entrega estándar es de 24 a 48 horas después de recibir el pedido, dependiendo de la ubicación en Arequipa y disponibilidad de productos. Para entregas fuera de Arequipa, coordinamos tiempos específicos.",
    },
    {
      question: "¿Cómo puedo realizar un pedido?",
      answer:
        "Puede realizar su pedido llamándonos al 987 801 148, enviando un correo a veryfrut.fernanda@gmail.com, o completando nuestro formulario de contacto. Nuestro equipo se pondrá en contacto para confirmar detalles y disponibilidad.",
    },
    {
      question: "¿Cuál es el pedido mínimo?",
      answer:
        "Para distribución mayorista, el pedido mínimo es de S/. 300. Para clientes minoristas y restaurantes, el pedido mínimo es de S/. 100. Ofrecemos flexibilidad según las necesidades de cada cliente.",
    },
    {
      question: "¿Ofrecen envío gratuito?",
      answer:
        "Sí, ofrecemos envío gratuito para pedidos superiores a S/. 200 dentro de Arequipa metropolitana y para pedidos mayoristas superiores a S/. 800 a nivel nacional.",
    },
    {
      question: "¿Todos sus productos son orgánicos?",
      answer:
        "Sí, todos nuestros productos son 100% orgánicos y cuentan con las certificaciones correspondientes que garantizan su calidad. Trabajamos directamente con productores certificados.",
    },
    {
      question: "¿Atienden a restaurantes y hoteles?",
      answer:
        "Absolutamente. Nos especializamos en el sector HORECA (Hoteles, Restaurantes y Catering). Ofrecemos productos de calibre seleccionado y entregas programadas según sus necesidades operativas.",
    },
    {
      question: "¿Cómo garantizan la frescura de los productos?",
      answer:
        "Mantenemos una cadena de frío especializada desde la cosecha hasta la entrega. Nuestros vehículos cuentan con refrigeración y realizamos entregas diarias para garantizar máxima frescura.",
    },
    {
      question: "¿Puedo visitar sus instalaciones?",
      answer:
        "Por supuesto. Estamos ubicados en Arequipa y puede coordinar una visita llamándonos al 987 801 148. Será un placer mostrarle nuestras instalaciones y procesos de calidad.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">Preguntas frecuentes</h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">¿No encontraste la respuesta que buscabas?</h3>
        <p className="text-gray-600 mb-4">
          Contáctanos directamente y te ayudaremos con cualquier consulta específica sobre nuestros productos orgánicos.
        </p>
        <a
          href="tel:+51987801148"
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Phone className="h-4 w-4 mr-2" />
          Llamar ahora: 987 801 148
        </a>
      </div>
    </div>
  )
}
