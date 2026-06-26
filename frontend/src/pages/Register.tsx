import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/Primitives';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { authMessage } from '../lib/messages';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { email, password });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Cuenta creada');
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(authMessage(error.response?.data || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <p className="text-sm font-semibold text-med-700">Nueva cuenta</p>
        <h1 className="mt-1 text-3xl font-bold text-med-900">Crear cuenta</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Contrasena" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button loading={loading} className="w-full">Registrarme</Button>
        </form>
        <Link className="mt-4 block text-sm text-med-700" to="/login">Ya tengo cuenta</Link>
      </Card>
    </main>
  );
}
