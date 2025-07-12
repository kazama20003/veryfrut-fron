"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para procesar la suscripción
    alert(`Gracias por suscribirte con: ${email}`)
    setEmail("")
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">Únete a Nuestro Boletín</h2>
          <p className="text-gray-600 mb-8">
            Suscríbete para recibir noticias sobre productos de temporada, ofertas especiales y consejos sobre
            alimentación saludable.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow"
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Suscribir
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
