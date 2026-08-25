"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-rose-light/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-48 items-center justify-center bg-cream-soft">
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
          className="object-contain p-4 transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-sage-deep">
          {product.brand}
        </span>
        <h3 className="font-serif text-base leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-xs text-ink-soft line-through">
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
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
