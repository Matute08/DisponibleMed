export function authMessage(error: unknown) {
  const anyError = error as { code?: string; message?: string; status?: number };
  const raw = `${anyError.code || ''} ${anyError.message || ''}`.toLowerCase();

  if (raw.includes('email rate limit')) return 'Se alcanzo el limite de emails de Supabase. La cuenta de prueba se crea desde el servidor para evitar este envio.';
  if (raw.includes('email_address_invalid') || raw.includes('invalid email')) return 'El email no tiene un formato valido.';
  if (raw.includes('user_already_exists') || raw.includes('already registered') || raw.includes('already exists')) return 'Ya existe una cuenta con ese email.';
  if (raw.includes('invalid login credentials')) return 'Email o contrasena incorrectos.';
  if (raw.includes('email not confirmed')) return 'El email todavia no esta confirmado.';
  if (raw.includes('password')) return 'La contrasena debe tener al menos 6 caracteres.';
  if (raw.includes('network')) return 'No se pudo conectar con el servidor. Verifica que el backend este iniciado y que VITE_API_URL apunte a la direccion correcta.';
  if (anyError.status === 429) return 'Demasiados intentos seguidos. Espera un momento y vuelve a probar.';

  return anyError.message ? `No se pudo completar la accion: ${anyError.message}` : 'No se pudo completar la accion.';
}
