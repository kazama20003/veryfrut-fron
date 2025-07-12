import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  Facebook,
  Instagram,
  Globe,
  Phone,
  MessageSquare,
  CheckCircle2,
  Users,
  ThumbsUp,
  Award,
  Clock,
  Calendar,
} from "lucide-react"

export default function FeedbackPage() {
  // Datos estáticos de feedback
  const feedbackData = [
    {
      id: 1,
      name: "Carlos Rodríguez",
      company: "Restaurante El Sabor",
      rating: 5,
      date: "15 de mayo, 2025",
      comment:
        "Excelente plataforma para gestionar nuestros pedidos de productos orgánicos. La interfaz es intuitiva y el proceso de pedido es muy sencillo. Recomendado para todos los restaurantes.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "María Fernández",
      company: "Hotel Las Palmeras",
      rating: 4,
      date: "10 de mayo, 2025",
      comment:
        "Muy buena aplicación para gestionar nuestros suministros. La calidad de los productos es excelente y siempre llegan a tiempo. Solo mejoraría algunas opciones de filtrado.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Juan Pérez",
      company: "Supermercado Orgánico",
      rating: 5,
      date: "5 de mayo, 2025",
      comment:
        "Desde que empezamos a usar Veryfrut, nuestro proceso de abastecimiento ha mejorado significativamente. Los productos son frescos y la plataforma es muy fácil de usar.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Estadísticas de satisfacción
  const satisfactionStats = {
    overall: 4.8,
    totalReviews: 127,
    fiveStars: 85,
    fourStars: 32,
    threeStars: 8,
    twoStars: 2,
    oneStar: 0,
  }

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Feedback y Recomendaciones</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Actualizado
            </Badge>
          </div>

          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">Opiniones de Clientes</TabsTrigger>
              <TabsTrigger value="developer">Desarrollador</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                    Opiniones de nuestros clientes
                  </CardTitle>
                  <CardDescription>
                    Descubre lo que nuestros clientes opinan sobre nuestra plataforma y servicios.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-8 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">{satisfactionStats.overall}</div>
                        <div className="flex justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(satisfactionStats.overall)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Basado en {satisfactionStats.totalReviews} opiniones
                        </p>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm w-16 text-right">5 estrellas</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{
                                width: `${(satisfactionStats.fiveStars / satisfactionStats.totalReviews) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-sm w-8">{satisfactionStats.fiveStars}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm w-16 text-right">4 estrellas</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${(satisfactionStats.fourStars / satisfactionStats.totalReviews) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-sm w-8">{satisfactionStats.fourStars}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm w-16 text-right">3 estrellas</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{
                                width: `${(satisfactionStats.threeStars / satisfactionStats.totalReviews) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-sm w-8">{satisfactionStats.threeStars}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm w-16 text-right">2 estrellas</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{
                                width: `${(satisfactionStats.twoStars / satisfactionStats.totalReviews) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-sm w-8">{satisfactionStats.twoStars}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm w-16 text-right">1 estrella</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{
                                width: `${(satisfactionStats.oneStar / satisfactionStats.totalReviews) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-sm w-8">{satisfactionStats.oneStar}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {feedbackData.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="relative h-10 w-10 rounded-full overflow-hidden">
                            <Image
                              src={feedback.avatar || "/placeholder.svg"}
                              alt={feedback.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <h3 className="font-medium">{feedback.name}</h3>
                                <p className="text-sm text-muted-foreground">{feedback.company}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{feedback.date}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-gray-700">{feedback.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
                      <Users className="h-4 w-4" />
                      <span>Mostrando 3 de {satisfactionStats.totalReviews} opiniones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="developer" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Desarrollado por Phoenix Solutions IT
                  </CardTitle>
                  <CardDescription>Soluciones tecnológicas innovadoras para tu negocio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                      <span className="text-white text-4xl font-bold">PS</span>
                    </div>
                    <h3 className="text-xl font-semibold">Phoenix Solutions IT</h3>
                    <p className="text-muted-foreground mt-1">Transformando ideas en soluciones digitales</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <a
                      href="https://phoenix-it.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3 text-purple-600" />
                      <div>
                        <p className="font-medium">Sitio Web</p>
                        <p className="text-sm text-muted-foreground">phoenix-it.vercel.app</p>
                      </div>
                    </a>

                    <a
                      href="https://www.instagram.com/phoenix_solutions_it"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Instagram className="h-5 w-5 mr-3 text-pink-600" />
                      <div>
                        <p className="font-medium">Instagram</p>
                        <p className="text-sm text-muted-foreground">@phoenix_solutions_it</p>
                      </div>
                    </a>

                    <a
                      href="https://www.tiktok.com/@phoenix_it_solutions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3 text-black" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      <div>
                        <p className="font-medium">TikTok</p>
                        <p className="text-sm text-muted-foreground">@phoenix_it_solutions</p>
                      </div>
                    </a>

                    <a
                      href="https://www.facebook.com/profile.php?id=61568108366850"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Facebook</p>
                        <p className="text-sm text-muted-foreground">Phoenix Solutions I.T</p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center text-purple-700">
                          <Phone className="h-4 w-4 mr-2" />
                          Contacto directo
                        </h4>
                        <p className="text-sm">901 206 784</p>
                        <p className="text-sm">kazamatower@gmail.com</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center text-purple-700">
                          <Clock className="h-4 w-4 mr-2" />
                          Horario de atención
                        </h4>
                        <p className="text-sm">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                        <p className="text-sm">Sábados: 9:00 AM - 1:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-800">Proyectos completados</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded p-2">
                        <div className="text-2xl font-bold text-purple-600">45+</div>
                        <div className="text-xs text-gray-500">Sitios web</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-2xl font-bold text-purple-600">20+</div>
                        <div className="text-xs text-gray-500">Aplicaciones</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-2xl font-bold text-purple-600">30+</div>
                        <div className="text-xs text-gray-500">Clientes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    © {new Date().getFullYear()} Phoenix Solutions IT. Todos los derechos reservados.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 sticky top-4">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                ¿Por qué elegirnos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-green-700 mb-2 flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  Soluciones a medida
                </h3>
                <p className="text-sm">
                  Desarrollamos aplicaciones personalizadas que se adaptan perfectamente a las necesidades de tu
                  negocio.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-green-700 mb-2 flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  Tecnología de vanguardia
                </h3>
                <p className="text-sm">
                  Utilizamos las últimas tecnologías para garantizar que tu aplicación sea rápida, segura y escalable.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-green-700 mb-2 flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  Soporte continuo
                </h3>
                <p className="text-sm">
                  Ofrecemos soporte técnico y mantenimiento para asegurar que tu aplicación funcione sin problemas.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-green-700 mb-2 flex items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  Diseño intuitivo
                </h3>
                <p className="text-sm">
                  Creamos interfaces de usuario intuitivas y atractivas que mejoran la experiencia de tus clientes.
                </p>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full bg-white hover:bg-green-50" asChild>
                  <Link href="/support">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar soporte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
