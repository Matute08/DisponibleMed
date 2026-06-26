import { Router } from 'express';
import { env } from '../env.js';
import { supabaseAdmin } from '../supabase.js';

export const statusRouter = Router();

async function checkStatus() {
  const startedAt = Date.now();
  const envReady = Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey);
  let database: 'ok' | 'error' | 'not_configured' = envReady ? 'ok' : 'not_configured';

  if (envReady) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (error) database = 'error';
  }

  const ok = envReady && database === 'ok';

  return {
    ok,
    status: ok ? 'ok' : 'degraded',
    app: 'DisponibleMed API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startedAt,
    services: {
      api: 'ok',
      database,
    },
  };
}

statusRouter.get(['/status', '/api/status'], async (_req, res) => {
  const status = await checkStatus();
  res.status(status.ok ? 200 : 503).json(status);
});
