import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-rose-light/60 bg-cream-soft/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <span className="font-serif text-lg text-ink">Bloom Cosmética</span>
          <p className="mt-3 text-sm text-ink-soft">
            Productos cosmetológicos formulados para realzar tu belleza
            natural, con ingredientes de calidad profesional.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Navegación
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/" className="transition hover:text-rose-deep">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo"
                className="transition hover:text-rose-deep"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="transition hover:text-rose-deep"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Contacto
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>hola@bloomcosmetica.com</li>
            <li>Lunes a Viernes, 9 a 18 hs</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-rose-light/60 px-6 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Bloom Cosmética. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
