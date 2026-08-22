"use client";

import PaymentResult from "@/components/PaymentResult";

export default function PagoExitosoPage() {
  return (
    <PaymentResult
      icon="success"
      title="¡Pago confirmado!"
      description="Recibimos tu pago. Ya estamos preparando tu pedido y te vamos a contactar para coordinar la entrega."
      clearCart
    />
  );
}
