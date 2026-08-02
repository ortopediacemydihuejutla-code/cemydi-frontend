"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import { CustomerAccountSidebar } from "@/components/account/CustomerAccountSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/features/admin/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/features/admin/components/ui/sidebar";
import { useAuth } from "@/providers/AuthContext";

export function CustomerAccountShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading) {
    return (
      <AuthRouteLoading
        title="Preparando tu cuenta"
        description="Estamos organizando tu información..."
      />
    );
  }

  if (!user) return null;

  return (
    <div
      data-customer-account
      data-admin-theme="light"
      className="w-full bg-white text-[#17333f]"
    >
      <SidebarProvider className="relative min-h-svh! bg-[#f9fbfb]">
        <CustomerAccountSidebar className="absolute! h-full! min-h-full! border-r border-[#e2ecec] bg-[#f9fbfb]" />

        <section className="relative flex min-w-0 flex-1 flex-col bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 xl:px-12">
            <div className="mb-5 flex min-h-9 items-center gap-3">
              <SidebarTrigger
                className="size-9 rounded-lg border border-[#d7e4e4] bg-white text-[#1f6a67] shadow-sm hover:bg-[#edf7f6] hover:text-[#154f4d] md:hidden"
                aria-label="Abrir el menú de Mi cuenta"
              />
              <Breadcrumb>
                <BreadcrumbList className="gap-y-2 text-[0.92rem]">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="font-medium text-[#5e707a] hover:text-[#1f6a67]"
                    >
                      <Link href="/">Inicio</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[#93a4ac]" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-[#142734]">
                      Mi cuenta
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <main
              data-account-main-container
              className="min-h-[680px] min-w-0 pb-20"
            >
              {children}
            </main>
          </div>
        </section>
      </SidebarProvider>
    </div>
  );
}
