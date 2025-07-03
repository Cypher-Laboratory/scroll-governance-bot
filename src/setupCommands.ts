import { Telegraf } from 'telegraf';
import "dotenv/config";

const BOT_TOKEN = process.env.BOT_TOKEN!;

if (!BOT_TOKEN) {
  console.error('Please set BOT_TOKEN in your environment variables.');
  process.exit(1);
}

export async function setupBotCommands(): Promise<void> {
  try {
    const bot = new Telegraf(BOT_TOKEN);
    
    console.log('🔧 Setting up Telegram bot commands...');
    
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Welcome message and introduction' },
      { command: 'subscribe', description: 'Subscribe to governance proposal notifications' },
      { command: 'unsubscribe', description: 'Unsubscribe from notifications' },
      { command: 'status', description: 'Check bot and subscription status' },
      { command: 'help', description: 'Show help message and available commands' }
    ]);
    
    console.log('✅ Bot commands successfully registered with Telegram');
  } catch (error) {
    console.error('❌ Error setting up bot commands:', error);
    throw error;
  }
}

// If this script is run directly, execute the setup
if (require.main === module) {
  setupBotCommands()
    .then(() => {
      console.log('🎉 Commands setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Commands setup failed:', error);
      process.exit(1);
    });
}