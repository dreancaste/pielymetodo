"use client";

import PaymentResult from "@/components/PaymentResult";

export default function PagoFallidoPage() {
  return (
    <PaymentResult
      icon="failure"
      title="El pago no se pudo completar"
      description="Tu carrito sigue guardado. Podés volver a intentarlo o probar con otro medio de pago."
    />
  );
}
