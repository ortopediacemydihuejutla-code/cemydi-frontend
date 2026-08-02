"use client";

import { PackageSearch, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPagination } from "@/components/account/AccountPagination";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { formatCurrencyMx, formatDateEsMx } from "@/lib/formatters";

type CustomerOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type CustomerOrder = {
  id: string;
  createdAt: string;
  status: CustomerOrderStatus;
  total: number;
};

const ORDERS_PAGE_SIZE = 8;

// La API aún no expone un modelo de ventas/pedidos. La vista queda preparada
// para sustituir esta colección por la respuesta paginada cuando exista.
const orders: CustomerOrder[] = [];

const statusPresentation: Record<
  CustomerOrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    className: "border-[#e2cfaa]/60 bg-[#fff9ed] text-[#b47a18]",
  },
  PROCESSING: {
    label: "En preparación",
    className: "border-[#badbe4]/60 bg-[#f1f9fb] text-[#216779]",
  },
  SHIPPED: {
    label: "Enviado",
    className: "border-[#c8d7ec]/60 bg-[#f4f7fd] text-[#3d5f91]",
  },
  DELIVERED: {
    label: "Entregado",
    className: "border-[#abd0ce]/60 bg-[#eef8f7] text-[#1f6a67]",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "border-[#efc4c4]/60 bg-[#fff4f4] text-[#a33d3d]",
  },
};

export default function MisPedidosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | CustomerOrderStatus>("ALL");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    return orders.filter((order) => {
      const matchesSearch =
        !query || order.id.toLocaleLowerCase("es-MX").includes(query);
      const matchesStatus = status === "ALL" || order.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const emptyState = (
    <AccountEmptyState
      icon={PackageSearch}
      title="Aún no tienes pedidos"
      description="Cuando completes una compra, podrás consultar aquí su fecha, estado y total."
      compact
      action={
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#154f4d]"
        >
          <ShoppingBag className="size-4" />
          Explorar catálogo
        </Link>
      }
    />
  );

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Mis pedidos"
          description="Consulta el historial y seguimiento de tus compras."
          actions={
            <span className="text-sm text-[#607173]">
              {orders.length} pedido{orders.length === 1 ? "" : "s"}
            </span>
          }
        />

        {orders.length > 0 ? (
          <section className="grid gap-4 py-8 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <span className="sr-only">Buscar pedidos</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#71858c]" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por ID de pedido"
                className={`${accountInputClassName} pl-11`}
              />
            </label>
            <label>
              <span className="sr-only">Filtrar pedidos por estado</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target.value as "ALL" | CustomerOrderStatus,
                  );
                  setPage(1);
                }}
                className={accountInputClassName}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="PROCESSING">En preparación</option>
                <option value="SHIPPED">Enviados</option>
                <option value="DELIVERED">Entregados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </label>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-[#e2ecec] bg-white">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-[#e2ecec] bg-[#f4f8f8]">
                <tr className="text-[0.8rem] font-bold uppercase tracking-wider text-[#5e7472]">
                  <th scope="col" className="px-6 py-4">
                    ID del pedido
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ecec]">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4}>{emptyState}</td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const presentation = statusPresentation[order.status];
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-[#f9fbfb]"
                      >
                        <th
                          scope="row"
                          className="px-6 py-5 text-sm font-bold text-[#0f3d3b]"
                        >
                          {order.id}
                        </th>
                        <td className="px-6 py-5 text-sm font-medium text-[#5e7472]">
                          {formatDateEsMx(order.createdAt, { style: "short" })}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${presentation.className}`}
                          >
                            {presentation.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-[#0f3d3b]">
                          {formatCurrencyMx(order.total)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden">
            {paginatedOrders.length === 0 ? (
              emptyState
            ) : (
              <div className="divide-y divide-[#e2ecec]">
                {paginatedOrders.map((order) => {
                  const presentation = statusPresentation[order.status];
                  return (
                    <article key={order.id} className="grid gap-4 px-5 py-5 transition-colors hover:bg-[#f9fbfb]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#8b9c9b]">
                            Pedido
                          </p>
                          <h2 className="mt-1 font-bold text-[#0f3d3b]">
                            {order.id}
                          </h2>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${presentation.className}`}
                        >
                          {presentation.label}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-4 text-sm">
                        <span className="font-medium text-[#5e7472]">
                          {formatDateEsMx(order.createdAt, { style: "short" })}
                        </span>
                        <strong className="text-lg font-bold text-[#0f3d3b]">
                          {formatCurrencyMx(order.total)}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <AccountPagination
            page={currentPage}
            pageSize={ORDERS_PAGE_SIZE}
            total={filteredOrders.length}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </div>
    </CustomerAccountShell>
  );
}
