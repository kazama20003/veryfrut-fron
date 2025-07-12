"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronDown, Building2, Truck, Award, Clock, Play, Pause } from "lucide-react"
import Link from "next/link"

interface SlideInfo {
  id: number
  title: string
  heading: string
  description: string
  feature: string
  image: string
  bgImage: string
  color: "green" | "orange" | "purple"
  icon: React.ReactNode
}

const slides: SlideInfo[] = [
  {
    id: 1,
    title: "DISTRIBUCIÓN MAYORISTA",
    heading: "Calidad Premium",
    description:
      "Somos especialistas en distribución de frutas y verduras de la mejor calidad para empresas, restaurantes, hoteles y supermercados. Productos cultivados sin pesticidas ni químicos.",
    feature: "Entregas programadas y puntuales para su negocio",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    bgImage: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    color: "green",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    id: 2,
    title: "SERVICIO EMPRESARIAL",
    heading: "Productos Frescos de la mejor Calidad",
    description:
      "Ofrecemos un servicio integral de abastecimiento de productos de la mejor calidad para empresas del sector HORECA y retail. Garantizamos frescura y sostenibilidad en cada entrega.",
    feature: "Logística especializada y control de calidad garantizado",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744843955/portada_toy2aq.jpg",
    bgImage: "https://res.cloudinary.com/demzflxgq/image/upload/v1744843955/portada_toy2aq.jpg",
    color: "orange",
    icon: <Truck className="h-6 w-6" />,
  },
  {
    id: 3,
    title: "COMPROMISO SOSTENIBLE",
    heading: "Soluciones Sostenibles",
    description:
      "Adaptamos nuestros servicios de distribución de productos de la mejor calidad a las necesidades específicas de cada cliente empresarial. Comprometidos con el medio ambiente y su salud.",
    feature: "Asesoramiento personalizado y atención exclusiva",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/september-featurebananas-featured_zvqv3h.jpg",
    bgImage:
      "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/september-featurebananas-featured_zvqv3h.jpg",
    color: "purple",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: 4,
    title: "LÍNEA INSTITUCIONAL",
    heading: "Soluciones Institucionales",
    description:
      "Productos adaptados a las necesidades de comedores escolares, hospitales y servicios de catering. Ofrecemos soluciones integrales para el sector institucional con productos orgánicos de alta calidad.",
    feature: "Volumen garantizado, precios estables y entregas programadas",
    image: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    bgImage: "https://res.cloudinary.com/demzflxgq/image/upload/v1744911096/shutterstock_1756689209_xlpwey.jpg",
    color: "green" as const,
    icon: <Building2 className="h-6 w-6" />,
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = useCallback(() => {
    setSlideDirection(1)
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [])

  const prevSlide = useCallback(() => {
    setSlideDirection(-1)
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isAutoPlaying && !isDragging) {
      intervalRef.current = setInterval(() => {
        nextSlide()
      }, 6000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [nextSlide, isAutoPlaying, isDragging])

  // Hide swipe hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // Touch/Swipe handlers with proper typing
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    setShowSwipeHint(false)
    const threshold = 50

    if (info.offset.x > threshold) {
      prevSlide()
    } else if (info.offset.x < -threshold) {
      nextSlide()
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
    setShowSwipeHint(false)
  }

  const getColorClass = useCallback((color: SlideInfo["color"]) => {
    switch (color) {
      case "orange":
        return "text-orange-600"
      case "purple":
        return "text-purple-600"
      default:
        return "text-green-600"
    }
  }, [])

  const getBgColorClass = useCallback((color: SlideInfo["color"]) => {
    switch (color) {
      case "orange":
        return "bg-orange-600"
      case "purple":
        return "bg-purple-600"
      default:
        return "bg-green-600"
    }
  }, [])

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById("categories-section")
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] min-h-[500px] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 bg-gray-900">
        {slides.map((slide, index) => (
          <motion.div
            key={`bg-${index}`}
            initial={false}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className="absolute inset-0"
            style={{ zIndex: currentSlide === index ? 1 : 0 }}
          >
            <Image
              src={slide.bgImage || "/placeholder.svg"}
              alt={`Fondo de ${slide.heading}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
          </motion.div>
        ))}
      </div>

      {/* Main Content - Swipeable */}
      <motion.div
        className="relative z-30 h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        dragElastic={0.1}
        ref={constraintsRef}
      >
        <div className="h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Content Column */}
              <div className="relative h-auto min-h-[350px] sm:min-h-[400px] md:min-h-[450px]">
                {slides.map((slide, index) => (
                  <motion.div
                    key={`content-${index}`}
                    initial={false}
                    animate={{
                      opacity: currentSlide === index ? 1 : 0,
                      x: currentSlide === index ? 0 : slideDirection > 0 ? -20 : 20,
                    }}
                    transition={{
                      opacity: { duration: 0.5, ease: "easeInOut" },
                      x: { duration: 0.5, ease: "easeOut" },
                    }}
                    className={`absolute inset-0 ${currentSlide === index ? "block" : "hidden"}`}
                  >
                    {/* Badge */}
                    <div className="mb-3 sm:mb-4 lg:mb-6">
                      <span
                        className={`${getColorClass(slide.color)} text-xs sm:text-sm lg:text-base font-bold inline-flex items-center gap-2 rounded-full px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 bg-white/90 shadow-lg`}
                      >
                        {slide.icon}
                        <span className="hidden sm:inline">{slide.title}</span>
                        <span className="sm:hidden">{slide.title.split(" ")[0]}</span>
                      </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 drop-shadow-lg leading-tight">
                      {slide.heading}
                    </h1>

                    {/* Description */}
                    <div className="bg-black/40 backdrop-blur-sm p-3 sm:p-4 lg:p-5 rounded-lg mb-3 sm:mb-4 lg:mb-6 max-w-xl">
                      <p className="text-xs sm:text-sm lg:text-base text-white leading-relaxed">{slide.description}</p>
                    </div>

                    {/* Feature */}
                    <div
                      className={`${getBgColorClass(slide.color)} text-white inline-flex items-center gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-md mb-4 sm:mb-5 lg:mb-6 shadow-lg`}
                    >
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm lg:text-base">{slide.feature}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-lg">
                      <Link href="/contact" className="flex-1">
                        <Button
                          className={`${getBgColorClass(slide.color)} hover:bg-opacity-90 text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base shadow-xl rounded-md transition-transform hover:scale-105 w-full touch-manipulation`}
                        >
                          Solicitar Información
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        className="flex-1 bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base shadow-xl rounded-md touch-manipulation"
                        onClick={scrollToCategories}
                      >
                        Nuestros Productos
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Image Column - Hidden on mobile */}
              <div className="hidden md:block relative h-[300px] lg:h-[400px]">
                {slides.map((slide, index) => (
                  <motion.div
                    key={`image-${index}`}
                    initial={false}
                    animate={{
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 30,
                      scale: currentSlide === index ? 1 : 0.95,
                    }}
                    transition={{
                      opacity: { duration: 0.7, ease: "easeInOut" },
                      y: { duration: 0.7, ease: "easeOut" },
                      scale: { duration: 0.7, ease: "easeOut" },
                    }}
                    className={`absolute inset-0 flex items-center justify-center ${
                      currentSlide === index ? "block" : "hidden"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full h-full max-w-[450px]">
                      <Image
                        src={slide.image || "/placeholder.svg"}
                        alt={`${slide.heading} - Veryfrut`}
                        fill
                        sizes="(max-width: 768px) 100vw, 450px"
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 ${getBgColorClass(slide.color)}/5 mix-blend-multiply`}></div>
                      <div className="absolute inset-0 border-4 border-white/20 rounded-2xl pointer-events-none"></div>
                      <div
                        className={`absolute top-4 right-4 ${getBgColorClass(slide.color)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
                      >
                        100% Calidad
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Swipe Hint - Repositioned */}
      {showSwipeHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 right-4 text-white text-xs bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full md:hidden z-40 pointer-events-none shadow-lg"
        >
          👆 Desliza para navegar
        </motion.div>
      )}

      {/* Controls - Repositioned for mobile */}
      <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 z-40">
        <div className="container mx-auto px-4">
          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mb-3 sm:mb-4">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => {
                  setSlideDirection(index > currentSlide ? 1 : -1)
                  setCurrentSlide(index)
                  setShowSwipeHint(false)
                }}
                className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                  index === currentSlide
                    ? `${getBgColorClass(slides[currentSlide].color)} w-6 sm:w-8`
                    : "bg-white/50 w-2"
                }`}
                aria-label={`Ir a la diapositiva ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation and Play/Pause */}
          <div className="flex justify-center items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => {
                prevSlide()
                setShowSwipeHint(false)
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 sm:p-3 transition-all duration-300 shadow-lg touch-manipulation"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>

            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying)
                setShowSwipeHint(false)
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 sm:p-3 transition-all duration-300 shadow-lg touch-manipulation"
              aria-label={isAutoPlaying ? "Pausar" : "Reproducir"}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </button>

            <button
              onClick={() => {
                nextSlide()
                setShowSwipeHint(false)
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 sm:p-3 transition-all duration-300 shadow-lg touch-manipulation"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 cursor-pointer z-40 touch-manipulation"
        onClick={scrollToCategories}
        initial={{ y: 0 }}
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-white text-xs mb-1 font-medium hidden sm:block">Descubre más</span>
          <div className="bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
