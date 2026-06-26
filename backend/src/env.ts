import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDir, '../.env') });

export const env = {
  port: Number(process.env.PORT || 4000),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  n8nGlobalApiKey: process.env.N8N_GLOBAL_API_KEY || '',
};

for (const [key, value] of Object.entries(env)) {
  if (key.startsWith('supabase') && !value) console.warn(`Missing env: ${key}`);
}
