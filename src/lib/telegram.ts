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
    const description = error.description || 'Failed to send Telegram message';
    
    // Make error messages more user-friendly
    if (description.includes('failed to get HTTP URL content')) {
      throw new Error('Image URL expired or invalid. Please re-upload the image.');
    }
    if (description.includes('chat not found')) {
      throw new Error('Chat not found. Make sure you clicked START on the bot and the Channel ID is correct.');
    }
    if (description.includes('bot was blocked')) {
      throw new Error('Bot was blocked. Please unblock @peni_pixeldrop_bot in Telegram.');
    }
    
    throw new Error(description);
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
