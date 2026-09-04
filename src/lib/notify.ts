export async function sendWhatsAppNotification(message: string) {
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
