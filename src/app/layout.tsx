import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import LoadingSpinner from "@/components/global/LoadingSpinner"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Veryfrut - Distribuidor de Frutas y Verduras Orgánicas",
    template: "%s | Veryfrut",
  },
  description:
    "Distribuidor mayorista de frutas y verduras 100% orgánicas para empresas, restaurantes, hoteles y supermercados. Productos frescos de la mejor calidad con entregas programadas.",
  keywords: [
    "frutas orgánicas",
    "Arequipa",
    "Perú",
    "distribuidor de frutas",
    "distribuidor de verduras",
    "distribuidor de frutas orgánicas",
    "distribuidor de verduras orgánicas",
    "frutas orgánicas Arequipa",
    "verduras orgánicas Arequipa",
    "verduras orgánicas",
    "distribuidor mayorista",
    "productos orgánicos",
    "frutas frescas",
    "verduras frescas",
    "distribución empresarial",
    "HORECA",
    "supermercados",
    "restaurantes",
    "hoteles",
    "productos naturales",
    "agricultura orgánica",
    "alimentación saludable",
  ],
  authors: [{ name: "Veryfrut" }],
  creator: "Veryfrut",
  publisher: "Veryfrut",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://veryfrut.com"),
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/es-pe",
      es: "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://veryfrut.com",
    title: "Veryfrut - Distribuidor de Frutas y Verduras Orgánicas",
    description:
      "Distribuidor mayorista de frutas y verduras 100% orgánicas para empresas, restaurantes, hoteles y supermercados. Productos frescos de la mejor calidad.",
    siteName: "Veryfrut",
    images: [
      {
        url: "https://res.cloudinary.com/demzflxgq/image/upload/v1744843955/portada_toy2aq.jpg",
        width: 1200,
        height: 630,
        alt: "Veryfrut - Frutas y Verduras Orgánicas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veryfrut - Distribuidor de Frutas y Verduras Orgánicas",
    description:
      "Distribuidor mayorista de frutas y verduras 100% orgánicas para empresas, restaurantes, hoteles y supermercados.",
    images: ["https://res.cloudinary.com/demzflxgq/image/upload/v1744843955/portada_toy2aq.jpg"],
    creator: "@veryfrut",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-site-verification-code",
  },
  category: "food",
  classification: "business",
  referrer: "origin-when-cross-origin",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-PE" className={inter.variable}>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* Additional meta tags for better SEO */}
        <meta name="application-name" content="Veryfrut" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Veryfrut" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#16a34a" />

        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Veryfrut",
              description: "Distribuidor mayorista de frutas y verduras 100% orgánicas",
              url: "https://veryfrut.com",
              logo: "https://res.cloudinary.com/demzflxgq/image/upload/v1746485219/Imagen_de_WhatsApp_2025-05-01_a_las_15.03.46_9cee1908_1_dgctjp.jpg",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+51-987-801-148",
                contactType: "customer service",
                availableLanguage: "Spanish",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "PE",
              },
              sameAs: ["https://www.facebook.com/veryfrut", "https://www.instagram.com/veryfrut"],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-md z-50"
        >
          Saltar al contenido principal
        </a>

        <div id="root" className="min-h-screen flex flex-col">
          <Suspense fallback={<LoadingSpinner />}>
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </Suspense>
        </div>

        {/* Toast notifications */}
        <Toaster position="top-right" expand={false} richColors closeButton />

        {/* Analytics and tracking scripts would go here */}
        {process.env.NODE_ENV === "production" && (
          <>
            {/* Google Analytics */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
