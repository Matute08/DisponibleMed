import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, ConfirmDialog, EmptyState, Input, Toggle } from '../components/Primitives';
import { formatDateTime, toDateTimeLocal } from '../lib/format';

export function OnCall() {
  const initial = { starts_at: '', ends_at: '', notes: '', active: true };
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const load = () => api.get('/api/on-call').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const body = { ...form, starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString() };
    if (editing) await api.put(`/api/on-call/${editing}`, body);
    else await api.post('/api/on-call', body);
    setForm(initial); setEditing(null); await load(); toast.success('Guardia guardada');
  };
  const remove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/on-call/${deleteId}`);
    setDeleteId(null);
    await load();
    toast.success('Guardia eliminada');
  };

  return (
    <div className="space-y-5">
      <header><p className="text-sm font-semibold text-med-700">Cobertura especial</p><h1 className="mt-1 text-3xl font-bold text-med-900">Guardias</h1><p className="mt-2 text-sm leading-6 text-slate-600">Registra los periodos en los que la profesional se encuentra de guardia.</p></header>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="font-semibold">{editing ? 'Editar guardia' : 'Nueva guardia'}</h2>
          <form onSubmit={save} className="mt-4 space-y-3">
            <label className="grid gap-2 text-sm text-slate-700">Empieza<Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required /></label>
            <label className="grid gap-2 text-sm text-slate-700">Termina<Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} required /></label>
            <Input placeholder="Nota opcional" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <label className="flex items-center justify-between text-sm">Guardia activa<Toggle checked={form.active} onChange={(active) => setForm({ ...form, active })} /></label>
            <Button>{editing ? 'Guardar cambios' : 'Agregar guardia'}</Button>
          </form>
        </Card>
        <div className="space-y-3">
          {items.length === 0 && <EmptyState title="Todavia no hay guardias cargadas" />}
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-med-50 text-med-700"><CalendarClock size={18} /></span><div><p className="font-semibold">{formatDateTime(item.starts_at)}</p><p className="text-sm text-slate-600">hasta {formatDateTime(item.ends_at)}</p>{item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}</div></div>
              <div className="flex gap-2"><button className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(item.id); setForm({ ...item, starts_at: toDateTimeLocal(item.starts_at), ends_at: toDateTimeLocal(item.ends_at) }); }}>Editar</button><button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setDeleteId(item.id)}>Eliminar</button></div>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar guardia" description="Este periodo dejara de figurar como guardia activa o programada." onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
