interface SendTelegramMessageParams {
  botToken: string;
  chatId: string;
  imageUrl: string;
  caption?: string | null;
}

export async function sendTelegramMessage({
  botToken,
  chatId,
  imageUrl,
  caption,
}: SendTelegramMessageParams): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  const payload = {
    chat_id: chatId,
    photo: imageUrl,
    caption: caption || undefined,
    parse_mode: 'HTML' as const,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.description || 'Failed to send Telegram message');
  }
}

export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, message: 'Invalid bot token' };
    }

    const data = await response.json();
    
    if (!data.ok) {
      return { success: false, message: 'Bot token validation failed' };
    }

    return { 
      success: true, 
      message: `Connected as @${data.result.username}` 
    };
  } catch (error) {
    return { success: false, message: 'Connection failed' };
  }
}
