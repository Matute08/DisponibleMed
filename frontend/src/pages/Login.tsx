import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/Primitives';
import { supabase } from '../lib/supabase';
import { authMessage } from '../lib/messages';
import { api } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(authMessage(error));
    try {
      const { data: profile } = await api.get('/api/me/profile');
      navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
    } catch {
      navigate('/onboarding');
    }
  };

  const resetPassword = async () => {
    if (!email) return toast.error('Ingresa tu email primero');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) toast.error(authMessage(error));
    else toast.success('Te enviamos un email de recuperacion');
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <p className="text-sm font-semibold text-med-700">Bienvenida</p>
        <h1 className="mt-1 text-3xl font-bold text-med-900">DisponibleMed</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Ingresa para administrar disponibilidad, guardias, contactos y mensajes.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Contrasena" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button loading={loading} className="w-full">Entrar</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link className="text-med-700" to="/register">Crear cuenta</Link>
          <button className="text-slate-600" onClick={resetPassword}>Recuperar contrasena</button>
        </div>
      </Card>
    </main>
  );
}
