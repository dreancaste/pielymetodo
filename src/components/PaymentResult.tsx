"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE;

type Props = {
  icon: "success" | "pending" | "failure";
  title: string;
  description: string;
  clearCart?: boolean;
};

export default function PaymentResult({ icon, title, description, clearCart }: Props) {
  const { clear } = useCart();

  useEffect(() => {
    if (clearCart) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearCart]);

  const color =
    icon === "success" ? "sage" : icon === "pending" ? "amber" : "rose";

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          color === "sage"
            ? "bg-sage/15 text-sage-deep"
            : color === "amber"
              ? "bg-amber-100 text-amber-700"
              : "bg-rose-light text-rose-deep"
        }`}
      >
        {icon === "success" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M5 12.5 10 17 19 7" />
          </svg>
        )}
        {icon === "pending" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
          </svg>
        )}
        {icon === "failure" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        )}
      </div>
      <h1 className="mt-6 font-serif text-2xl text-ink sm:text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-ink-soft">{description}</p>

      {CONTACT_PHONE && (
        <p className="mt-3 text-sm text-ink-soft">
          ¿Dudas sobre tu pedido? Escribinos a{" "}
          <a
            href={`https://wa.me/${CONTACT_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-rose-deep hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/catalogo"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep"
        >
          Seguir viendo productos
        </Link>
        <Link
          href="/"
          className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-rose-deep hover:text-rose-deep"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
