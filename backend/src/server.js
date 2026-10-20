import app from './app.js';
import { config } from './config/index.js';

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

app.listen(PORT, () => {
  console.log(`Edugate CRM Backend Server running on port ${PORT}`);
});

