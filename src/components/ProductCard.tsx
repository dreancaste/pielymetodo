"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  // Descripción detallada del producto o fallback cosmético
  const displayDescription =
    product.description ||
    `Tratamiento cosmético profesional de ${product.brand} especialmente formulado para el cuidado facial diario, aportando nutrición, equilibrio y protección a la piel.`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-rose-light/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Contenedor de Imagen */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-cream-soft">
        {product.compareAtPrice && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-deep px-3 py-1 text-xs font-semibold tracking-wide text-cream shadow-sm">
            Oferta
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-108"
        />
      </div>

      {/* Contenido Principal de la Tarjeta */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-sage-deep">
          {product.brand}
        </span>
        <h3 className="font-serif text-base font-medium leading-snug text-ink line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-xs text-ink-soft/70 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-lg font-semibold text-rose-deep">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              added
                ? "bg-sage-deep text-cream"
                : "bg-ink text-cream hover:bg-rose-deep shadow-sm"
            }`}
          >
            {added ? "Agregado ✓" : "Agregar"}
          </button>
        </div>
      </div>

      {/* Panel flotante con detalles que se muestra al posar el mouse (div.col-md-6) */}
      <div
        className="col-md-6 pointer-events-none absolute inset-0 z-20 flex flex-col justify-between rounded-2xl border border-rose-light/80 bg-cream/95 p-5 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out translate-y-3 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-light/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-deep">
              {product.brand}
            </span>
            {product.compareAtPrice && (
              <span className="rounded-full bg-rose-deep px-2 py-0.5 text-[10px] font-semibold text-cream">
                Oferta
              </span>
            )}
          </div>
          <h4 className="font-serif text-sm font-semibold leading-snug text-ink">
            {product.name}
          </h4>
          <div className="h-px w-full bg-rose-light/60" />
          <p className="text-xs leading-relaxed text-ink-soft line-clamp-5">
            {displayDescription}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-rose-light/50 pt-3">
          <div>
            {product.compareAtPrice && (
              <span className="block text-[11px] text-ink-soft/70 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-base font-bold text-rose-deep">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm ${
              added
                ? "bg-sage-deep text-cream"
                : "bg-ink text-cream hover:bg-rose-deep"
            }`}
          >
            {added ? "Agregado ✓" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
