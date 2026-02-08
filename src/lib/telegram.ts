const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export async function sendPhotoToTelegram(photoUrl: string, caption?: string) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Telegram not configured');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      photo: photoUrl,
      caption: caption || '',
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data;
}

export async function sendMessageToTelegram(text: string) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Telegram not configured');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  return data;
}
