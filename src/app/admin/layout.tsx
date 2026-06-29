import type { ReactNode } from "react"
import NextTopLoader from "nextjs-toploader"

import { AdminProviders } from "@/features/admin/providers"
import { AdminSessionHydrator } from "@/features/admin/components/admin-session-hydrator"
import { AdminRouteShell } from "@/features/admin/components/admin-route-shell"
import { AdminThemeProvider } from "@/features/admin/components/admin-theme-provider"
import { AppSidebar } from "@/features/admin/components/app-sidebar"
import { DashboardHeader } from "@/features/admin/components/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/features/admin/components/ui/sidebar"
import { requireAdminSessionUser } from "@/lib/server-session"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminUser = await requireAdminSessionUser()

  return (
    <>
      <AdminSessionHydrator user={adminUser} />
      <NextTopLoader
        color="var(--brand-600)"
        height={3}
        showSpinner={false}
        shadow="0 0 12px rgba(43, 162, 161, 0.35)"
        zIndex={99999}
      />
      <AdminProviders>
      <AdminThemeProvider>
        <AdminRouteShell>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="admin-route min-h-0 flex-1 bg-[var(--card)] text-[var(--text-main)] antialiased">
              <DashboardHeader />
              {/* px debe coincidir con dashboard-header para alinear breadcrumb con la barra superior */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-5">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AdminRouteShell>
      </AdminThemeProvider>
      </AdminProviders>
    </>
  )
}
