"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-light/60 bg-white p-8 text-center shadow-sm lg:col-span-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M5 12.5 10 17 19 7" />
          </svg>
        </div>
        <h2 className="mt-4 font-serif text-xl text-ink">¡Gracias por escribirnos!</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Recibimos tu mensaje y te vamos a responder a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-rose-light/60 bg-white p-8 shadow-sm lg:col-span-3"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-ink">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="mt-2 w-full rounded-lg border border-rose-light/60 px-4 py-2.5 text-sm text-ink focus:border-rose-deep focus:outline-none"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-rose-light/60 px-4 py-2.5 text-sm text-ink focus:border-rose-deep focus:outline-none"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="asunto" className="text-sm font-medium text-ink">
          Asunto
        </label>
        <input
          id="asunto"
          name="asunto"
          type="text"
          className="mt-2 w-full rounded-lg border border-rose-light/60 px-4 py-2.5 text-sm text-ink focus:border-rose-deep focus:outline-none"
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>
      <div>
        <label htmlFor="mensaje" className="text-sm font-medium text-ink">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          required
          className="mt-2 w-full rounded-lg border border-rose-light/60 px-4 py-2.5 text-sm text-ink focus:border-rose-deep focus:outline-none"
          placeholder="Contanos qué estás buscando"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-rose-deep sm:w-auto"
      >
        Enviar mensaje
      </button>
    </form>
  );
}
