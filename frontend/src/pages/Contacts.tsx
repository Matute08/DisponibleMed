import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Contact as ContactIcon } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, ConfirmDialog, EmptyState, Input, Toggle } from '../components/Primitives';

export function Contacts() {
  const initial = { name: '', phone: '', group_name: '', source: 'manual', auto_reply_enabled: true, active: true };
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initial);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const load = () => api.get('/api/contacts').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (editing) await api.put(`/api/contacts/${editing}`, form);
    else await api.post('/api/contacts', form);
    setForm(initial); setEditing(null); await load(); toast.success('Contacto guardado');
  };
  const remove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/contacts/${deleteId}`);
    setDeleteId(null);
    await load();
    toast.success('Contacto eliminado');
  };
  const visible = items.filter((item) => `${item.name} ${item.phone} ${item.group_name || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <header><p className="text-sm font-semibold text-med-700">Agenda</p><h1 className="mt-1 text-3xl font-bold text-med-900">Contactos</h1><p className="mt-2 text-sm leading-6 text-slate-600">Gestiona las personas que pueden recibir avisos de disponibilidad.</p></header>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="font-semibold">{editing ? 'Editar contacto' : 'Nuevo contacto'}</h2>
          <form onSubmit={save} className="mt-4 space-y-3">
            <Input placeholder="Nombre y apellido" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Telefono, ej: 2954 123456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input placeholder="Grupo opcional, ej: Doblas" value={form.group_name || ''} onChange={(e) => setForm({ ...form, group_name: e.target.value })} />
            <label className="flex items-center justify-between text-sm">Recibe avisos<Toggle checked={form.auto_reply_enabled} onChange={(auto_reply_enabled) => setForm({ ...form, auto_reply_enabled })} /></label>
            <label className="flex items-center justify-between text-sm">Contacto activo<Toggle checked={form.active} onChange={(active) => setForm({ ...form, active })} /></label>
            <Button>{editing ? 'Guardar cambios' : 'Agregar contacto'}</Button>
          </form>
        </Card>
        <div className="space-y-3">
          <Input placeholder="Buscar contacto" value={query} onChange={(e) => setQuery(e.target.value)} />
          {visible.length === 0 && <EmptyState title="No hay contactos para mostrar" />}
          {visible.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-med-50 text-med-700"><ContactIcon size={18} /></span><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.name}</p>{item.auto_reply_enabled && <span className="rounded-full bg-med-50 px-2 py-1 text-xs font-semibold text-med-700">recibe avisos</span>}{!item.active && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">pausado</span>}</div><p className="text-sm text-slate-600">{item.phone}{item.group_name ? ` - ${item.group_name}` : ''}</p></div></div>
              <div className="flex gap-2"><button className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(item.id); setForm(item); }}>Editar</button><button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setDeleteId(item.id)}>Eliminar</button></div>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar contacto" description="Este contacto dejara de estar disponible para futuros avisos." onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
