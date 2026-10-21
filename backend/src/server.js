import app from './app.js';
import { config } from './config/index.js';
import { NotificationService } from './services/NotificationService.js';

const PORT = config.port;

process.on('uncaughtException', (err) => {
  if (err?.source === 'timeout' || err?.message?.includes('Timed out') || err?.code === 'ECONNRESET' || err?.source === 'socket') {
    console.warn('[Server] Caught background network/socket error (prevented crash):', err?.message || err);
    return;
  }
  console.error('[Server] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Server] Unhandled Rejection:', reason?.message || reason);
});

// Periodic background worker to drain the notification queue every 5 seconds
let isProcessingNotifications = false;
setInterval(async () => {
  if (isProcessingNotifications) return;
  isProcessingNotifications = true;
  try {
    const stats = await NotificationService.processBounded();
    if (stats.processed > 0) {
      console.log(`[NotificationWorker] Processed ${stats.processed} events (${stats.notifications} notifications created)`);
    }
  } catch (err) {
    console.warn('[NotificationWorker] Processing error:', err.message);
  } finally {
    isProcessingNotifications = false;
  }
}, 5000);

app.listen(PORT, () => {
  console.log(`Edugate CRM Backend Server running on port ${PORT}`);
});
