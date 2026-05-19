export async function sendWebhook(evento, datos) {
  const url = process.env.WEBHOOK_URL
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: evento, ...datos, timestamp: new Date().toISOString() }),
    })
  } catch {
    // Silently fail - webhook no debe romper el flujo principal
  }
}
