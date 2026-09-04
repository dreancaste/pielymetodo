import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto | Piel y Método",
  description:
    "Contactanos para consultas sobre productos cosmetológicos o para recibir asesoramiento personalizado.",
};

const info = [
  { label: "Email", value: "pielymetodo@gmail.com" },
  { label: "Teléfono", value: "+54 11 2852-8896" },
  { label: "Ubicación", value: "Florencio Varela, Buenos Aires" },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
          Contacto
        </span>
        <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
          Hablemos de tu piel
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          ¿Tenés dudas sobre qué producto elegir? Escribime y te respondo a la brevedad.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <ContactForm />

        <div className="space-y-4 lg:col-span-2">
          {info.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-rose-light/60 bg-cream-soft/60 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-deep">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
