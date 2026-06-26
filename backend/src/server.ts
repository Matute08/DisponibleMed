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

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, '');
const allowedOrigins = env.frontendOrigin.split(',').map(normalizeOrigin).filter(Boolean);
const isDevOrigin = (origin: string) => /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
const isKnownDeployOrigin = (origin: string) => /^https:\/\/[a-z0-9-]+(\.vercel\.app|\.onrender\.com|\.netlify\.app)$/.test(origin);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : '';
    if (!origin || env.frontendOrigin === '*' || allowedOrigins.includes(normalizedOrigin) || isDevOrigin(normalizedOrigin) || isKnownDeployOrigin(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ ok: true, app: 'DisponibleMed API' }));
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
