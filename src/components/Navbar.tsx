"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-rose-light/60 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-cream">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 7.3C9 7.3 6.5 9.8 6.5 13a5.5 5.5 0 0 0 11 0c0-3.2-2.5-5.7-5.5-5.7Z" />
              <path
                d="M12 2c1.5 2 1.5 4-.2 5.3C11.3 5.8 11 4 12 2Z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </span>
          <span className="font-serif text-xl tracking-wide text-ink">
            Piel y Método
          </span>
        </Link>
        <ul className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition hover:text-rose-deep"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link
            href="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-rose-deep hover:text-rose-deep"
            aria-label="Ver carrito"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 4h2l1.6 10.6a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L20 8H6" />
              <circle cx="9.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-deep px-1 text-[11px] font-semibold text-cream">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/catalogo"
            className="hidden rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream transition hover:bg-rose-deep sm:inline-block"
          >
            Ver productos
          </Link>
        </div>
      </nav>
    </header>
  );
}
