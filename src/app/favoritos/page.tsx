"use client";

import { Heart, Search, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPagination } from "@/components/account/AccountPagination";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { useFavorites } from "@/components/account/use-favorites";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import { formatCurrencyMx } from "@/lib/formatters";
import { getProductSlug } from "@/lib/product-share";

const FAVORITES_PAGE_SIZE = 6;

export default function FavoritosPage() {
  const { products, loaded, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");
    if (!query) return products;
    return products.filter((product) =>
      [
        product.nombre,
        product.marca,
        product.modelo,
        product.clasificacion,
      ].some((value) =>
        String(value).toLocaleLowerCase("es-MX").includes(query),
      ),
    );
  }, [products, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / FAVORITES_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * FAVORITES_PAGE_SIZE;
    return filteredProducts.slice(start, start + FAVORITES_PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Mis favoritos"
          description="Productos que guardaste para consultarlos más adelante."
          actions={
            products.length > 0 ? (
              <span className="text-sm text-[#607173]">
                {products.length} producto{products.length === 1 ? "" : "s"}
              </span>
            ) : null
          }
        />

        {products.length > 4 ? (
          <label className="relative mt-6 block max-w-md">
            <span className="sr-only">Buscar en mis favoritos</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar en favoritos"
              className={`${accountInputClassName} pl-11`}
            />
          </label>
        ) : null}

        {!loaded ? (
          <p className="flex min-h-[320px] items-center justify-center text-sm text-[#607173]">
            Cargando favoritos...
          </p>
        ) : products.length === 0 ? (
          <AccountEmptyState
            icon={Heart}
            title="No tienes productos guardados"
            description="Usa el botón de corazón en el catálogo para crear una lista de productos que quieras revisar después."
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
        ) : filteredProducts.length === 0 ? (
          <AccountEmptyState
            icon={Search}
            title="No encontramos coincidencias"
            description="Prueba con otro nombre, marca o modelo."
            compact
          />
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#e2ecec] bg-white">
            <div className="divide-y divide-[#e2ecec]">
              {paginatedProducts.map((product) => {
                const productHref = `/producto/${encodeURIComponent(
                  getProductSlug(product),
                )}`;
                return (
                  <article
                    key={product.id}
                    className="group grid gap-4 p-5 transition-colors hover:bg-[#f9fbfb] sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <Link
                      href={productHref}
                      className="relative grid size-[80px] place-items-center overflow-hidden rounded-xl border border-[#e2ecec] bg-white p-2 text-sm font-bold text-[#1f6a67] shadow-sm transition-transform group-hover:scale-105"
                    >
                      {isOptimizableImageUrl(product.imageUrl) ? (
                        <Image
                          src={product.imageUrl!}
                          alt={product.nombre}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      ) : (
                        product.nombre.slice(0, 2).toUpperCase()
                      )}
                    </Link>

                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#8b9c9b]">
                        {product.marca}
                      </p>
                      <Link
                        href={productHref}
                        className="mt-1 block truncate text-base font-bold text-[#0f3d3b] no-underline transition-colors hover:text-[#1f6a67]"
                      >
                        {product.nombre}
                      </Link>
                      <p className="mt-1 font-medium text-[#5e7472]">
                        {product.modelo} <span className="mx-2 text-[#cfdedd]">|</span>{" "}
                        <strong className="text-[#0f3d3b]">{formatCurrencyMx(product.precio)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={productHref}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#f4f8f8] px-5 text-sm font-bold text-[#1f6a67] no-underline transition-colors hover:bg-[#eef5f5]"
                      >
                        Ver producto
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product)}
                        className="grid size-11 place-items-center rounded-xl text-[#718184] transition-colors hover:bg-[#fff1f1] hover:text-[#b42318]"
                        aria-label={`Quitar ${product.nombre} de favoritos`}
                      >
                        <Trash2 className="size-5" strokeWidth={1.8} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <AccountPagination
              page={currentPage}
              pageSize={FAVORITES_PAGE_SIZE}
              total={filteredProducts.length}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </CustomerAccountShell>
  );
}
