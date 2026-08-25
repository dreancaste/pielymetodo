"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/data/products";

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE;

type OrderResult = {
  total: number;
  alias: string;
  holder: string | null;
};

export default function CarritoPage() {
  const { items, removeItem, setQuantity, totalPrice, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"punto" | "envio" | "">("");
  const [station, setStation] = useState<"Constitución" | "Palermo" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);

  async function handleSubmitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (deliveryMethod === "punto" && !station) {
      setError("Elegí en qué estación te queda mejor encontrarnos.");
      return;
    }

    const delivery =
      deliveryMethod === "punto"
        ? `Punto de encuentro: estación ${station} (Línea Roca)`
        : "Envío a domicilio a coordinar";

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          customer: { name, phone, note, delivery },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No pudimos enviar tu pedido. Probá de nuevo.");
      }
      setOrder(data as OrderResult);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    const whatsappText = encodeURIComponent(
      `Hola! Te paso el comprobante de mi transferencia de ${formatPrice(order.total)} para mi pedido en Piel y Método.`
    );
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path d="M5 12.5 10 17 19 7" />
          </svg>
        </div>
        <h1 className="mt-6 font-serif text-2xl text-ink sm:text-3xl">
          ¡Pedido enviado!
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Ya recibimos el detalle de tu pedido. Para confirmarlo, transferí el
          total y envianos el comprobante.
        </p>

        <div className="mt-6 rounded-2xl border border-rose-light/60 bg-white p-6 text-left">
          <div className="flex items-center justify-between border-b border-rose-light/60 pb-3">
            <span className="text-sm font-medium text-ink-soft">
              Total a transferir
            </span>
            <span className="font-serif text-xl text-rose-deep">
              {formatPrice(order.total)}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-sm font-medium text-ink-soft">
              Alias para transferir
            </span>
            <p className="mt-1 font-serif text-lg text-ink">{order.alias}</p>
            {order.holder && (
              <p className="text-sm text-ink-soft">Titular: {order.holder}</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Una vez que transferís, mandanos el comprobante de pago por
          WhatsApp para coordinar la entrega.
        </p>

        {CONTACT_PHONE && (
          <a
            href={`https://wa.me/${CONTACT_PHONE}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep"
          >
            Enviar comprobante por WhatsApp
          </a>
        )}

        <div className="mt-4">
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft transition hover:text-rose-deep"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-ink">Tu carrito está vacío</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Agregá productos desde el catálogo para armar tu pedido.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">Tu carrito</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-rose-light/60 bg-white p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-soft">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-sm leading-snug text-ink">
                    {item.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-ink-soft transition hover:text-rose-deep"
                  >
                    Quitar
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-rose-deep hover:text-rose-deep"
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink transition hover:border-rose-deep hover:text-rose-deep"
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-rose-deep">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmitOrder}
            className="space-y-4 rounded-2xl border border-rose-light/60 bg-white p-6"
          >
            <div className="flex items-center justify-between border-b border-rose-light/60 pb-4">
              <span className="text-sm font-medium text-ink-soft">Total</span>
              <span className="font-serif text-2xl text-rose-deep">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Nombre y apellido
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rose-light/60 px-3 py-2 text-sm text-ink focus:border-rose-deep focus:outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-ink">
                Teléfono / WhatsApp
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rose-light/60 px-3 py-2 text-sm text-ink focus:border-rose-deep focus:outline-none"
                placeholder="11 1234 5678"
              />
            </div>
            <div>
              <label htmlFor="note" className="text-sm font-medium text-ink">
                Nota para tu pedido (opcional)
              </label>
              <textarea
                id="note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rose-light/60 px-3 py-2 text-sm text-ink focus:border-rose-deep focus:outline-none"
                placeholder="Dirección de entrega, horario, etc."
              />
            </div>

            <div className="rounded-xl border border-rose-light/60 bg-cream-soft/60 p-4">
              <p className="text-sm font-medium text-ink">Método de entrega</p>
              <p className="mt-1 text-xs text-ink-soft">
                Retirás en un punto de encuentro en estaciones de la Línea
                Roca (Constitución o Palermo) o coordinamos el envío a tu
                domicilio. Elegí una opción antes de enviar tu pedido.
              </p>

              <div className="mt-3 space-y-2">
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="delivery-method"
                    required
                    checked={deliveryMethod === "punto"}
                    onChange={() => setDeliveryMethod("punto")}
                    className="mt-0.5"
                  />
                  Punto de encuentro (Constitución o Palermo)
                </label>
                {deliveryMethod === "punto" && (
                  <select
                    value={station}
                    onChange={(e) =>
                      setStation(e.target.value as "Constitución" | "Palermo" | "")
                    }
                    required
                    className="ml-6 rounded-lg border border-rose-light/60 px-3 py-1.5 text-sm text-ink focus:border-rose-deep focus:outline-none"
                  >
                    <option value="">Elegí la estación</option>
                    <option value="Constitución">Estación Constitución</option>
                    <option value="Palermo">Estación Palermo</option>
                  </select>
                )}
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="delivery-method"
                    required
                    checked={deliveryMethod === "envio"}
                    onChange={() => setDeliveryMethod("envio")}
                    className="mt-0.5"
                  />
                  Envío a domicilio (a coordinar)
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-rose-deep">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando pedido…" : "Enviar pedido"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
