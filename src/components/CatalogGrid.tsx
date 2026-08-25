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
  const initialCategory = searchParams.get("categoria") ?? "todas";
  const initialBrand = searchParams.get("marca") ?? "todas";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeBrand, setActiveBrand] = useState(initialBrand);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({
    activeCategory,
    activeBrand,
    query,
  });

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b)),
    []
  );

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);
    return products.filter((product) => {
      const matchesCategory = activeCategory === "todas" || product.category === activeCategory;
      const matchesBrand = activeBrand === "todas" || product.brand === activeBrand;
      const matchesQuery = normalize(product.name).includes(normalizedQuery);
      return matchesCategory && matchesBrand && matchesQuery;
    });
  }, [activeCategory, activeBrand, query]);

  if (
    appliedFilters.activeCategory !== activeCategory ||
    appliedFilters.activeBrand !== activeBrand ||
    appliedFilters.query !== query
  ) {
    setAppliedFilters({ activeCategory, activeBrand, query });
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("todas")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeCategory === "todas"
              ? "bg-ink text-cream"
              : "bg-white text-ink-soft hover:text-rose-deep"
          }`}
        >
          Todas las categorías
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActiveCategory(category.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === category.slug
                ? "bg-ink text-cream"
                : "bg-white text-ink-soft hover:text-rose-deep"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Marca
          <select
            value={activeBrand}
            onChange={(event) => setActiveBrand(event.target.value)}
            className="rounded-full border border-rose-light/60 bg-white px-4 py-2 text-sm text-ink focus:border-rose-deep focus:outline-none"
          >
            <option value="todas">Todas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
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
