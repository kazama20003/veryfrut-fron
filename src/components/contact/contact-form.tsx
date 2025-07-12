"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ChangeEvent, FormEvent } from "react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envío de email
      // Estructura de datos que se enviaría a la API
      // const emailData = {
      //   to: "veryfrut.fernanda@gmail.com",
      //   subject: `Nuevo mensaje de contacto: ${formData.subject}`,
      //   html: `
      //     <h2>Nuevo mensaje de contacto desde Veryfrut</h2>
      //     <p><strong>Nombre:</strong> ${formData.name}</p>
      //     <p><strong>Email:</strong> ${formData.email}</p>
      //     <p><strong>Teléfono:</strong> ${formData.phone || "No proporcionado"}</p>
      //     <p><strong>Empresa:</strong> ${formData.company || "No proporcionado"}</p>
      //     <p><strong>Asunto:</strong> ${formData.subject}</p>
      //     <p><strong>Mensaje:</strong></p>
      //     <p>${formData.message}</p>
      //   `,
      // }

      // Aquí iría la llamada real a tu API de envío de emails
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData),
      // })

      // Simulación de éxito
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("¡Mensaje enviado correctamente!", {
        description: "Te responderemos a la brevedad posible.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error al enviar el mensaje:", error)
      toast.error("Error al enviar el mensaje", {
        description: "Por favor, inténtalo de nuevo o contáctanos directamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h2>
      <p className="text-gray-600 mb-8">
        Completa el formulario y nos pondremos en contacto contigo para discutir tus necesidades de productos orgánicos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full"
              placeholder="987 801 148"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full"
              placeholder="Nombre de tu empresa"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Asunto *
          </label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full"
            placeholder="¿En qué podemos ayudarte?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje *
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full min-h-[150px] resize-none"
            placeholder="Cuéntanos sobre tus necesidades de productos orgánicos..."
          />
        </div>

        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 w-full md:w-auto px-8 py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar mensaje
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
