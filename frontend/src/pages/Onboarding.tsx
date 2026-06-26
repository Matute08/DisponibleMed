import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, Input } from '../components/Primitives';

export function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    professional_name: '',
    whatsapp_phone: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/onboarding', form);
      toast.success('Configuracion inicial guardada');
      navigate('/dashboard');
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-6">
      <Card className="w-full max-w-xl">
        <p className="text-sm font-semibold text-med-700">Configuracion inicial</p>
        <h1 className="mt-1 text-3xl font-bold text-med-900">Empecemos</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Solo necesitamos identificar a la profesional y su telefono de contacto.</p>
        <form onSubmit={submit} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">Nombre de la profesional
            <Input placeholder="Ej: Dra. Maria Perez" value={form.professional_name} onChange={(e) => { update('professional_name', e.target.value); update('full_name', e.target.value); }} required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Telefono profesional
            <Input placeholder="Ej: 2954 123456" value={form.whatsapp_phone} onChange={(e) => update('whatsapp_phone', e.target.value)} required />
          </label>
          <Button loading={loading}>Guardar y entrar</Button>
        </form>
      </Card>
    </main>
  );
}
