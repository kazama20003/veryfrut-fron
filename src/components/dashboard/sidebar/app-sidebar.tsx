"use client"

import type * as React from "react"
import {
  Apple,
  BarChart3,
  LifeBuoy,
  Send,
  MapPinned ,
  ShoppingCart,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/sidebar/nav-main"
import { NavProjects } from "@/components/dashboard/sidebar/nav-projects"
import { NavSecondary } from "@/components/dashboard/sidebar/nav-secondary"
import { NavUser } from "@/components/dashboard/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Pedidos",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Productos",
      url: "/dashboard/products",
      icon: Apple,
      items: [
        {
          title: "Categorías",
          url: "/dashboard/products/categories",
        },
        {
          title: "Unidades de medida",
          url: "/dashboard/products/unit-measurement",
        },
      ],
    },
    {
      title: "Clientes",
      url: "/dashboard/customers",
      icon: Users,
    },
    {
      title: "Empresas",
      url: "/dashboard/company",
      icon: MapPinned ,
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Veryfrut",
      url: "/",
      icon: Apple,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <Apple className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Veryfrut</span>
                  <span className="truncate text-xs">Orgánico & Fresco</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
