# DisponibleMed

Aplicacion web responsive/PWA para gestionar respuestas automaticas administrativas de disponibilidad por WhatsApp para profesionales de salud.

No es un bot medico, no diagnostica y no responde consultas de salud. Solo decide si corresponde enviar un aviso administrativo fuera de horario.

## Estructura

- `frontend`: React + Vite + TypeScript + Tailwind + Material UI.
- `backend`: Node.js + Express + TypeScript para Koyeb.
- `supabase/migrations`: SQL de tablas, indices y RLS.

## Instalacion local

```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Configura las variables de Supabase y luego ejecuta:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta el SQL en `supabase/migrations/001_initial_schema.sql`.
3. Copia `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Usa la anon key en frontend y la service role key solo en backend.

## Deploy

### Vercel frontend

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`

### Koyeb backend

- Root directory: `backend`
- Build command: `npm run build`
- Run command: `npm start`
- Variables:
  - `PORT`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `FRONTEND_ORIGIN`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
  - `N8N_GLOBAL_API_KEY`

## n8n

1. Configura WhatsApp Cloud API para que el webhook llegue a n8n.
2. En n8n, normaliza los campos entrantes.
3. Llama al backend:

```http
POST https://tu-backend.koyeb.app/api/automation/evaluate-whatsapp-message
x-api-key: clave_n8n_del_profesional_o_global
content-type: application/json

{
  "professionalWhatsappPhone": "5492954123456",
  "fromPhone": "5492954999999",
  "messageText": "Hola",
  "receivedAt": "2026-06-26T21:00:00.000Z"
}
```

4. Si `shouldReply` es `true`, envia `message` por WhatsApp Cloud API.
5. Si `shouldReply` es `false`, no respondas.

## Google Contacts

El MVP deja preparados los endpoints `import-preview` e `import-confirm`. El frontend permite cargar contactos manualmente y el backend expone la estructura para conectar Google People API con OAuth de solo lectura.

## Seguridad

- El frontend usa Supabase Auth con persistencia de sesion.
- Las rutas del backend para el frontend requieren JWT de Supabase.
- Las tablas tienen RLS por `user_id`.
- La service role key no se expone al frontend.
- El endpoint de n8n se protege con `x-api-key`.
