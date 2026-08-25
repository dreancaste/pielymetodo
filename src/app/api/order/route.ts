import { NextResponse } from "next/server";
import { formatPrice, products } from "@/data/products";

type OrderItem = { id: string; quantity: number };
type OrderCustomer = {
  name: string;
  phone: string;
  note?: string;
  delivery: string;
};
type OrderBody = {
  items?: OrderItem[];
  customer?: OrderCustomer;
};

const MAX_QUANTITY = 50;

function buildOwnerMessage(
  customer: OrderCustomer,
  lines: string[],
  total: number
) {
  const message = [
    "Nuevo pedido - Piel y Método",
    "",
    `Cliente: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    `Entrega: ${customer.delivery}`,
    customer.note?.trim() ? `Nota: ${customer.note.trim()}` : null,
    "",
    "Pedido:",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "El cliente todavía no pagó: va a transferir y enviar el comprobante.",
  ].filter(Boolean);
  return message.join("\n");
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

export async function POST(request: Request) {
  const alias = process.env.BANK_ALIAS;
  if (!alias) {
    return NextResponse.json(
      { error: "Los pedidos todavía no están configurados." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as OrderBody | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const customer = body.customer;
  if (!customer?.name?.trim() || !customer?.phone?.trim()) {
    return NextResponse.json(
      { error: "Faltan tus datos de contacto." },
      { status: 400 }
    );
  }
  if (!customer.delivery?.trim()) {
    return NextResponse.json(
      { error: "Elegí un método de entrega." },
      { status: 400 }
    );
  }

  let total = 0;
  const lines: string[] = [];
  for (const requested of body.items) {
    const product = products.find((p) => p.id === requested.id);
    if (!product) continue;
    const quantity = Math.max(
      1,
      Math.min(MAX_QUANTITY, Math.trunc(Number(requested.quantity) || 1))
    );
    total += product.price * quantity;
    lines.push(`${quantity}x ${product.name} - ${formatPrice(product.price * quantity)}`);
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  await sendWhatsAppNotification(
    buildOwnerMessage(
      { name: customer.name.trim(), phone: customer.phone.trim(), note: customer.note, delivery: customer.delivery },
      lines,
      total
    )
  );

  return NextResponse.json({
    total,
    alias,
    holder: process.env.BANK_HOLDER || null,
  });
}
