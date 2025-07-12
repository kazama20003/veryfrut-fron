"use client"

import type * as React from "react"
import { Apple, Banana, BarChart3, LifeBuoy, ShoppingCart, User } from "lucide-react"

import { NavMain } from "@/components/users/sidebar/nav-main"
import { NavProjects } from "@/components/users/sidebar/nav-projects"
import { NavSecondary } from "@/components/users/sidebar/nav-secondary"
import { NavUser } from "@/components/users/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Productos",
      url: "/users",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Pedidos - Rápido",
      url: "/users/fast",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Pedidos - Historial",
      url: "/users/history",
      icon: ShoppingCart,
    },
    {
      title: "Perfil",
      url: "/users/profile",
      icon: User,
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "/users/support",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "Veryfrut",
      url: "/",
      icon: Apple,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/users">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <Banana className="size-4" />
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
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
