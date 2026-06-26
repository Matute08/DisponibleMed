import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, Input, Toggle } from '../components/Primitives';

export function Settings() {
  const [form, setForm] = useState<any>(null);
  useEffect(() => { api.get('/api/settings').then((r) => setForm(r.data)); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.put('/api/settings', form);
    toast.success('Configuracion guardada');
  };
  if (!form) return <div>Cargando...</div>;
  return (
    <Card className="max-w-2xl">
      <p className="text-sm font-semibold text-med-700">Preferencias</p>
      <h1 className="mt-1 text-3xl font-bold text-med-900">Datos profesionales</h1>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {['professional_name','whatsapp_phone','timezone','keyword','anti_spam_hours'].map((key) => (
          <Input key={key} placeholder={key} value={form[key] ?? ''} type={key === 'anti_spam_hours' ? 'number' : 'text'} onChange={(e) => setForm({ ...form, [key]: key === 'anti_spam_hours' ? Number(e.target.value) : e.target.value })} />
        ))}
        <label className="flex items-center justify-between text-sm">Responder a desconocidos<Toggle checked={form.reply_unknown_contacts} onChange={(v) => setForm({ ...form, reply_unknown_contacts: v })} /></label>
        <label className="flex items-center justify-between text-sm">Avisos activos<Toggle checked={form.automation_enabled} onChange={(v) => setForm({ ...form, automation_enabled: v })} /></label>
        <Button>Guardar</Button>
      </form>
    </Card>
  );
}
