export default function FeaturesSection() {
    const features = [
      {
        title: "Mejor Rendimiento",
        description: "Distribución eficiente y de alta calidad",
        icon: "🌱",
      },
      {
        title: "Venta Online",
        description: "Pedidos fáciles a través de nuestra plataforma",
        icon: "🛒",
      },
      {
        title: "Adaptado a Móviles",
        description: "Realiza pedidos desde cualquier dispositivo",
        icon: "📱",
      },
      {
        title: "Personalización Fácil",
        description: "Adapta tus pedidos a tus necesidades",
        icon: "⚙️",
      },
      {
        title: "Productos Orgánicos",
        description: "100% certificados y naturales",
        icon: "🍎",
      },
      {
        title: "Mejor Precio",
        description: "Precios justos para todos",
        icon: "💰",
      },
    ]
  
    return (
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <div className="relative w-64 h-64 mb-8 md:mb-0">
                <div className="absolute inset-0 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">
                    Very<span className="text-green-600">frut</span>
                  </span>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:ml-12">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  