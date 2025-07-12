import type React from "react"
import type { Metadata } from "next"
import { AppSidebar } from "@/components/users/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Veryfrut - Clientes",
  description: "Distribuidor de frutas y verduras orgánicas de la mejor calidad",
}

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              {"<--"} Menu
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
          </div>
        </header>
        <div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
