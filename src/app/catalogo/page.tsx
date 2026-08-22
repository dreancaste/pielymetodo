import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogGrid from "@/components/CatalogGrid";

export const metadata: Metadata = {
  title: "Catálogo | Piel y Método",
  description:
    "Explorá el catálogo de cuidado facial profesional de Idraet, Lidherma, Icono y Dermassy.",
};

export default function CatalogoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
          Catálogo
        </span>
        <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
          Productos disponibles
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Filtrá por marca o buscá el producto que estás buscando.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={null}>
          <CatalogGrid />
        </Suspense>
      </div>
    </div>
  );
}
