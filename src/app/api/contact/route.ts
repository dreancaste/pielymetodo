import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/notify";

type ContactBody = {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactBody | null;
  const nombre = body?.nombre?.trim();
  const email = body?.email?.trim();
  const mensaje = body?.mensaje?.trim();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json(
      { error: "Faltan datos del formulario." },
      { status: 400 }
    );
  }

  const asunto = body?.asunto?.trim();

  const text = [
    "Nuevo mensaje de contacto - Piel y Método",
    "",
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    asunto ? `Asunto: ${asunto}` : null,
    "",
    "Mensaje:",
    mensaje,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsAppNotification(text);

  return NextResponse.json({ ok: true });
}
