import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
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
            Bloom Cosmética
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
        <Link
          href="/catalogo"
          className="hidden rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream transition hover:bg-rose-deep sm:inline-block"
        >
          Ver productos
        </Link>
      </nav>
    </header>
  );
}
