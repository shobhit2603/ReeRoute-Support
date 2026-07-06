import app from './src/app.js';
import connectDB from './src/config/db.js';
import env from './src/config/env.js';

const PORT = env.PORT;

let server;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`❤️  Health check at http://localhost:${PORT}/api/health`);
  });
});

// ─── Graceful Shutdown ──────────────────────────────────────────

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10s if graceful shutdown fails
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error('💥 Unexpected error:', error);
  gracefulShutdown('UNEXPECTED_ERROR');
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
