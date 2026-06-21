import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initOrchestrationQueue } from './services/orchestration.js';
import { seedAgents } from './agents/seed.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

initSocket(server, env.CLIENT_URL);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/pdfs', express.static(path.join(__dirname, '../storage/pdfs')));

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', service: 'NxtBiz' });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  await seedAgents();
  initOrchestrationQueue();
  server.listen(env.PORT, () => {
    console.log(`NxtBiz server running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
