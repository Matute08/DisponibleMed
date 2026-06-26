import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function authErrorMessage(message = '') {
  const raw = message.toLowerCase();
  if (raw.includes('already')) return 'Ya existe una cuenta con ese email.';
  if (raw.includes('rate limit')) return 'Supabase limito los intentos. Espera un momento y vuelve a probar.';
  if (raw.includes('invalid')) return 'El email o la contrasena no tienen un formato valido.';
  return 'No se pudo crear la cuenta.';
}

authRouter.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ code: 'invalid_register_data', message: 'Ingresa un email valido y una contrasena de al menos 6 caracteres.' });
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return res.status(400).json({ code: error.code || 'register_error', message: authErrorMessage(error.message) });
  }

  return res.status(201).json({ id: data.user.id, email: data.user.email });
});
