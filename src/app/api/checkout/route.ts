import { NextResponse } from "next/server";
import { products } from "@/data/products";

type CheckoutItem = { id: string; quantity: number };
type CheckoutCustomer = {
  name: string;
  phone: string;
  email?: string;
  note?: string;
};
type CheckoutBody = {
  items?: CheckoutItem[];
  customer?: CheckoutCustomer;
};

const MAX_QUANTITY = 50;

export async function POST(request: Request) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "Los pagos todavía no están configurados." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
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

  const mpItems = [];
  for (const requested of body.items) {
    const product = products.find((p) => p.id === requested.id);
    if (!product) continue;
    const quantity = Math.max(
      1,
      Math.min(MAX_QUANTITY, Math.trunc(Number(requested.quantity) || 1))
    );
    mpItems.push({
      id: product.id,
      title: product.name,
      quantity,
      unit_price: product.price,
      currency_id: "ARS",
      picture_url: product.image,
    });
  }

  if (mpItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const orderId = crypto.randomUUID();
  const itemsSummary = mpItems.map((i) => `${i.quantity}x ${i.title}`).join(" | ");

  const preferencePayload = {
    items: mpItems,
    payer: {
      name: customer.name,
      email: customer.email?.trim() || undefined,
    },
    external_reference: orderId,
    metadata: {
      order_id: orderId,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email?.trim() || "",
      customer_note: customer.note?.trim() || "",
      items_summary: itemsSummary,
    },
    back_urls: {
      success: `${siteUrl}/pago-exitoso`,
      failure: `${siteUrl}/pago-fallido`,
      pending: `${siteUrl}/pago-pendiente`,
    },
    auto_return: "approved",
    notification_url: `${siteUrl}/api/mercadopago/webhook`,
  };

  const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferencePayload),
  });

  if (!mpResponse.ok) {
    const errorBody = await mpResponse.text();
    console.error("MercadoPago preference creation failed:", errorBody);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago con Mercado Pago." },
      { status: 502 }
    );
  }

  const preference = (await mpResponse.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
  };
  const initPoint =
    process.env.MP_USE_SANDBOX === "true"
      ? preference.sandbox_init_point
      : preference.init_point;

  if (!initPoint) {
    return NextResponse.json(
      { error: "Mercado Pago no devolvió un link de pago." },
      { status: 502 }
    );
  }

  return NextResponse.json({ initPoint });
}
