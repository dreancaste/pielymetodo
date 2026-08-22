import { NextResponse } from "next/server";

type MercadoPagoPayment = {
  id: number | string;
  status: string;
  transaction_amount?: number;
  metadata?: Record<string, string | undefined>;
};

// Always re-fetch payment status from MercadoPago's API instead of trusting
// the notification payload — the payload is not signed/verified here.
async function fetchPayment(paymentId: string, accessToken: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as MercadoPagoPayment;
}

function buildWhatsAppMessage(payment: MercadoPagoPayment) {
  const meta = payment.metadata || {};
  const lines = [
    "Nuevo pedido pagado - Piel y Método",
    "",
    `Cliente: ${meta.customer_name || "-"}`,
    `Teléfono: ${meta.customer_phone || "-"}`,
    `Entrega: ${meta.delivery_method || "-"}`,
    meta.customer_email ? `Email: ${meta.customer_email}` : null,
    meta.customer_note ? `Nota: ${meta.customer_note}` : null,
    "",
    `Pedido: ${meta.items_summary || "-"}`,
    `Total: $${payment.transaction_amount ?? "-"}`,
    `Pago #${payment.id} (${payment.status})`,
  ].filter(Boolean);
  return lines.join("\n");
}

async function sendWhatsAppNotification(message: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone = process.env.CALLMEBOT_PHONE;
  if (!apiKey || !phone) {
    console.error("CallMeBot not configured; WhatsApp notification not sent:", message);
    return;
  }
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    phone
  )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("CallMeBot request failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Failed to send WhatsApp notification", err);
  }
}

async function handleNotification(request: Request) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  let type = url.searchParams.get("type") || url.searchParams.get("topic");

  if (!paymentId) {
    const body = (await request.json().catch(() => null)) as {
      type?: string;
      data?: { id?: string };
    } | null;
    if (body?.data?.id) paymentId = String(body.data.id);
    if (body?.type) type = body.type;
  }

  // Always acknowledge with 200 so MercadoPago doesn't keep retrying —
  // any real problem is only logged, not surfaced to the caller.
  if (!paymentId || (type && type !== "payment")) {
    return NextResponse.json({ received: true });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("MP_ACCESS_TOKEN not configured; cannot verify payment.");
    return NextResponse.json({ received: true });
  }

  const payment = await fetchPayment(paymentId, accessToken);
  if (!payment || payment.status !== "approved") {
    return NextResponse.json({ received: true });
  }

  await sendWhatsAppNotification(buildWhatsAppMessage(payment));

  return NextResponse.json({ received: true });
}

export async function POST(request: Request) {
  return handleNotification(request);
}

export async function GET(request: Request) {
  return handleNotification(request);
}
