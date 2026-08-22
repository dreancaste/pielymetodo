"use client";

import PaymentResult from "@/components/PaymentResult";

export default function PagoPendientePage() {
  return (
    <PaymentResult
      icon="pending"
      title="Tu pago está pendiente"
      description="Mercado Pago todavía está procesando el pago (por ejemplo, si elegiste pago en efectivo). Te avisamos apenas se confirme."
      clearCart
    />
  );
}
