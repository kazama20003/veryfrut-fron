import { Suspense } from "react"
import dynamic from "next/dynamic"
import LoadingSpinner from "@/components/global/LoadingSpinner"

// Importar el Hero normalmente ya que es crítico para la primera carga
import Hero from "@/components/home/hero"
import Header from "@/components/home/header/header"
import Footer from "@/components/home/footer/footer"

// Importar componentes no críticos con dynamic import para lazy loading
const CategorySection = dynamic(() => import("@/components/home/category-section"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})


const TestimonialsSection = dynamic(() => import("@/components/home/testimonials-section"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

const FeaturesSection = dynamic(() => import("@/components/home/features-section"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

const NewsletterSection = dynamic(() => import("@/components/home/newsletter-section"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
})

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />

      <Suspense fallback={<LoadingSpinner />}>
        <CategorySection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <NewsletterSection />
      </Suspense>
      <Footer />
    </div>
  )
}
