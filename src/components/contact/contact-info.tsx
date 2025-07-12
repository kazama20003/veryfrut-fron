import { Phone, Mail, MapPin, Clock, Users, Truck } from "lucide-react"

export default function ContactInfo() {
  const contactItems = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Teléfono",
      content: "987 801 148",
      description: "Lunes a Viernes: 8:00 AM - 6:00 PM",
      action: "tel:+51987801148",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Correo electrónico",
      content: "veryfrut.fernanda@gmail.com",
      description: "Respuesta en 24 horas",
      action: "mailto:veryfrut.fernanda@gmail.com",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Ubicación",
      content: "Arequipa, Perú",
      description: "Distribución a nivel nacional",
      action: null,
    },
  ]

  const features = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Entregas Puntuales",
      description: "Garantizamos entregas en el tiempo acordado para mantener la frescura de nuestros productos.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Atención Personalizada",
      description: "Cada cliente recibe un servicio adaptado a sus necesidades específicas de negocio.",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Logística Especializada",
      description: "Contamos con veh��culos especializados para mantener la cadena de frío y calidad.",
    },
  ]

  return (
    <div className="space-y-12">
      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
            {item.action ? (
              <a href={item.action} className="text-green-600 hover:text-green-700 font-medium text-lg block mb-2">
                {item.content}
              </a>
            ) : (
              <p className="text-green-600 font-medium text-lg mb-2">{item.content}</p>
            )}
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">¿Por qué elegir Veryfrut?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
