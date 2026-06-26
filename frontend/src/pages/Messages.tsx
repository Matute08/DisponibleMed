import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, ConfirmDialog, EmptyState, Input, TextArea, Toggle } from '../components/Primitives';

export function Messages() {
  const initial = { name: '', type: 'fuera_de_horario', body: '', is_default: false, active: true };
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const load = () => api.get('/api/messages').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const body = { ...form, type: 'fuera_de_horario' };
    if (editing) await api.put(`/api/messages/${editing}`, body);
    else await api.post('/api/messages', body);
    setForm(initial); setEditing(null); await load(); toast.success('Mensaje guardado');
  };
  const remove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/messages/${deleteId}`);
    setDeleteId(null);
    await load();
    toast.success('Mensaje eliminado');
  };

  return (
    <div className="space-y-5">
      <header><p className="text-sm font-semibold text-med-700">Comunicacion</p><h1 className="mt-1 text-3xl font-bold text-med-900">Mensajes</h1><p className="mt-2 text-sm leading-6 text-slate-600">Crea textos breves y profesionales para informar disponibilidad fuera de horario.</p></header>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="font-semibold">{editing ? 'Editar mensaje' : 'Nuevo mensaje'}</h2>
          <form onSubmit={save} className="mt-4 space-y-3">
            <Input placeholder="Titulo, ej: Fuera de horario" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextArea placeholder="Texto del aviso" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            <div className="rounded-md bg-calm-50 p-3 text-xs leading-5 text-slate-600">Puedes personalizar el texto con nombre profesional, horario de atencion y proxima disponibilidad.</div>
            <label className="flex items-center justify-between text-sm">Usar como mensaje principal<Toggle checked={form.is_default} onChange={(is_default) => setForm({ ...form, is_default })} /></label>
            <label className="flex items-center justify-between text-sm">Mensaje activo<Toggle checked={form.active} onChange={(active) => setForm({ ...form, active })} /></label>
            <Button>{editing ? 'Guardar cambios' : 'Agregar mensaje'}</Button>
          </form>
        </Card>
        <div className="space-y-3">
          {items.length === 0 && <EmptyState title="Todavia no hay mensajes cargados" />}
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-med-50 text-med-700"><MessageSquare size={18} /></span><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.name}</p>{item.is_default && <span className="rounded-full bg-med-50 px-2 py-1 text-xs font-semibold text-med-700">principal</span>}{!item.active && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">pausado</span>}</div><p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p></div></div>
              <div className="flex gap-2 sm:self-start"><button className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(item.id); setForm(item); }}>Editar</button><button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setDeleteId(item.id)}>Eliminar</button></div>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar mensaje" description="Este texto dejara de estar disponible para futuros avisos." onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
