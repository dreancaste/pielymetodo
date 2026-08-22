import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

const onSale = products.filter((p) => p.compareAtPrice);
const featured = onSale.slice(0, 8);
const heroPreview = featured.slice(0, 4);

const benefits = [
  {
    title: "Ingredientes de calidad",
    description:
      "Fórmulas desarrolladas con activos profesionales y materias primas seleccionadas.",
  },
  {
    title: "Asesoramiento personalizado",
    description:
      "Te ayudamos a elegir el producto ideal según tu tipo de piel.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-light via-cream to-cream-soft" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-rose-deep">
              Cosmetología profesional
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              Belleza natural,
              <br /> resultados reales
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Descubrí nuestra línea de productos cosmetológicos para el
              cuidado facial profesional, con marcas como Idraet, Lidherma,
              Icono y Dermassy.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep"
              >
                Ver catálogo
              </Link>
              <Link
                href="/contacto"
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-rose-deep hover:text-rose-deep"
              >
                Contactanos
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {heroPreview.map((product) => (
              <div
                key={product.id}
                className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="object-contain p-4"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 rounded-3xl border border-rose-light/60 bg-white p-8 sm:grid-cols-2 sm:p-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
              Envíos y entregas
            </span>
            <h2 className="mt-3 font-serif text-2xl text-ink sm:text-3xl">
              ¿Cómo recibís tu pedido?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Coordinamos la entrega de dos formas: en un{" "}
              <strong className="text-ink">punto de encuentro</strong> en
              estaciones de la Línea Roca (Constitución o Palermo), o por{" "}
              <strong className="text-ink">envío a coordinar</strong> a tu
              domicilio. El día y horario se acuerdan por WhatsApp después de
              tu compra.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-cream-soft/70 p-5">
              <h3 className="font-serif text-lg text-ink">
                Punto de encuentro
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Estaciones de la Línea Roca: Constitución o Palermo.
                Coordinamos día y horario por WhatsApp.
              </p>
            </div>
            <div className="rounded-2xl bg-cream-soft/70 p-5">
              <h3 className="font-serif text-lg text-ink">
                Envío a domicilio
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                A coordinar según tu zona. Te contactamos para confirmar
                costo y tiempo de entrega.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">
            Marcas
          </h2>
          <Link
            href="/catalogo"
            className="text-sm font-medium text-rose-deep hover:underline"
          >
            Ver todo →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogo?marca=${category.slug}`}
              className="group rounded-2xl border border-rose-light/60 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-serif text-lg text-ink group-hover:text-rose-deep">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-cream-soft/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">
              En oferta
            </h2>
            <Link
              href="/catalogo"
              className="text-sm font-medium text-rose-deep hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center sm:text-left">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 text-sage-deep sm:mx-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M5 12.5 10 17 19 7" />
                </svg>
              </div>
              <h3 className="mt-4 font-serif text-lg text-ink">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-ink px-8 py-12 text-center text-cream sm:px-16">
          <h2 className="font-serif text-2xl sm:text-3xl">
            ¿Lista para renovar tu rutina de belleza?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80">
            Explorá todo nuestro catálogo o escribinos para recibir
            recomendaciones personalizadas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogo"
              className="rounded-full bg-rose px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-full border border-cream/30 px-6 py-3 text-sm font-medium text-cream transition hover:border-cream"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
