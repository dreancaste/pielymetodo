"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

const DIACRITICS = /[̀-ͯ]/g;
const PAGE_SIZE = 10;

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(DIACRITICS, "");
}

export default function CatalogGrid() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("marca") ?? "todos";
  const [activeBrand, setActiveBrand] = useState(initialBrand);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({ activeBrand, query });

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);
    return products.filter((product) => {
      const matchesBrand = activeBrand === "todos" || product.brand === activeBrand;
      const matchesQuery = normalize(product.name).includes(normalizedQuery);
      return matchesBrand && matchesQuery;
    });
  }, [activeBrand, query]);

  if (appliedFilters.activeBrand !== activeBrand || appliedFilters.query !== query) {
    setAppliedFilters({ activeBrand, query });
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveBrand("todos")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeBrand === "todos"
                ? "bg-ink text-cream"
                : "bg-white text-ink-soft hover:text-rose-deep"
            }`}
          >
            Todas las marcas
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveBrand(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeBrand === category.slug
                  ? "bg-ink text-cream"
                  : "bg-white text-ink-soft hover:text-rose-deep"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-full border border-rose-light/60 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose-deep focus:outline-none sm:w-64"
        />
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        {filtered.length} producto{filtered.length === 1 ? "" : "s"} encontrado
        {filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-soft">
          No encontramos productos que coincidan con tu búsqueda.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-rose-deep hover:text-rose-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/20 disabled:hover:text-ink"
              >
                Anteriores
              </button>
              <span className="text-sm text-ink-soft">
                Página {page + 1} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-rose-deep hover:text-rose-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/20 disabled:hover:text-ink"
              >
                Mostrar más
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
