"use client"

import * as React from "react"
import {
  Package,
  Users,
  BarChart3,
  Tag,
  MonitorCog,
  DatabaseIcon,
  BookImage,
  Factory,
  LayersPlus,
  Home,
  MessageSquareText,
  Megaphone,
  Percent,
  FileText,
  ClipboardCheck,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { SidebarBrand } from "./sidebar-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar"

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Catalogo",
      url: "#",
      icon: BookImage,
      items: [
        {
          icon: Package,
          title: "Productos",
          url: "/admin/products",
        },
        {
          icon: LayersPlus,
          title: "Categorias",
          url: "/admin/categories",
        },
        {
          icon: Tag,
          title: "Marcas",
          url: "/admin/brands",
        },
        {
          icon: Factory,
          title: "Proveedores",
          url: "/admin/suppliers",
        },
      ],
    },
    {
      title: "Usuarios",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Rentas",
      url: "/admin/rentals",
      icon: ClipboardCheck,
    },
    {
      title: "Marketing",
      url: "#",
      icon: Megaphone,
      items: [
        {
          icon: Percent,
          title: "Promociones",
          url: "/admin/promotions",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },{
      title: "Reseñas",
      url: "/admin/reviews",
      icon: MessageSquareText,
    },
    {
      title: "Sistema",
      url: "#",
      icon: MonitorCog,
      items: [
        {
          icon: DatabaseIcon,
          title: "Monitoreo de BD",
          url: "/admin/database",
        },
         {
          icon: FileText,
          title: "Quiénes somos",
          url: "/admin/about",
        }
      ],
    },
  ],
  support: [] as Array<{ name: string; url: string; icon: typeof Package }>,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="min-w-0">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.support.length > 0 ? <NavProjects projects={data.support} /> : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
