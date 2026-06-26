import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './env.js';
import { requireAuth } from './middleware/auth.js';
import { crudRouter } from './routes/crud.js';
import { frontendRouter } from './routes/frontend.js';
import { automationRouter } from './routes/automation.js';
import { authRouter } from './routes/auth.js';
import { statusRouter } from './routes/status.js';

const app = express();

const allowedOrigins = env.frontendOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
const isDevOrigin = (origin: string) => /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigin === '*' || allowedOrigins.includes(origin) || isDevOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(statusRouter);
app.use(authRouter);
app.use(automationRouter);
app.use(requireAuth);
app.use(frontendRouter);
app.use(crudRouter);

app.listen(env.port, () => {
  console.log(`DisponibleMed API listening on ${env.port}`);
});
