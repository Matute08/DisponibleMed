import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDir, '../.env'), override: false });

function readEnv(name: string) {
  const raw = process.env[name] || '';
  const directValue = raw.split(/\r?\n[A-Z0-9_]+=/)[0]?.trim() || '';
  if (raw !== directValue && raw.includes('\n')) {
    console.warn(`Environment variable ${name} contains extra lines. Using only its first value.`);
  }
  return directValue;
}

function readEnvWithEmbeddedFallback(name: string) {
  const directValue = readEnv(name);
  if (directValue) return directValue;

  for (const value of Object.values(process.env)) {
    if (!value || !value.includes(`${name}=`)) continue;
    const lines = value.split(/\r?\n/);
    const found = lines.find((line) => line.startsWith(`${name}=`));
    if (found) {
      console.warn(`Environment variable ${name} was found embedded in another variable. Fix this in Render settings.`);
      return found.slice(name.length + 1).trim();
    }
  }

  return '';
}

function assertHeaderSafe(name: string, value: string) {
  if (/[\r\n]/.test(value)) {
    console.warn(`Environment variable ${name} contains line breaks and cannot be used as a header.`);
    return value.replace(/[\r\n].*$/s, '').trim();
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  supabaseUrl: readEnv('SUPABASE_URL'),
  supabaseAnonKey: assertHeaderSafe('SUPABASE_ANON_KEY', readEnvWithEmbeddedFallback('SUPABASE_ANON_KEY')),
  supabaseServiceRoleKey: assertHeaderSafe('SUPABASE_SERVICE_ROLE_KEY', readEnvWithEmbeddedFallback('SUPABASE_SERVICE_ROLE_KEY')),
  frontendOrigin: readEnv('FRONTEND_ORIGIN') || 'http://localhost:5173',
  n8nGlobalApiKey: assertHeaderSafe('N8N_GLOBAL_API_KEY', readEnvWithEmbeddedFallback('N8N_GLOBAL_API_KEY')),
};

for (const [key, value] of Object.entries(env)) {
  if (key.startsWith('supabase') && !value) console.warn(`Missing env: ${key}`);
}
