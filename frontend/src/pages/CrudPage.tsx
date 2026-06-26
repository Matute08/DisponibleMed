import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, ConfirmDialog, EmptyState, Input, TextArea, Toggle } from '../components/Primitives';

type Field = { name: string; label: string; type?: string; textarea?: boolean };

export function CrudPage({ title, endpoint, fields, initial }: { title: string; endpoint: string; fields: Field[]; initial: Record<string, any> }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => api.get(endpoint).then((r) => setItems(r.data));
  useEffect(() => { load().catch(() => toast.error('No se pudo cargar')); }, [endpoint]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing) await api.put(`${endpoint}/${editing}`, form);
      else await api.post(endpoint, form);
      setForm(initial);
      setEditing(null);
      await load();
      toast.success('Guardado');
    } catch {
      toast.error('No se pudo guardar');
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    await api.delete(`${endpoint}/${deleteId}`);
    setDeleteId(null);
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <h1 className="text-xl font-bold text-med-900">{title}</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {fields.map((field) => field.textarea ? (
            <TextArea key={field.name} placeholder={field.label} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
          ) : field.type === 'checkbox' ? (
            <label key={field.name} className="flex items-center justify-between text-sm">{field.label}<Toggle checked={Boolean(form[field.name])} onChange={(checked) => setForm({ ...form, [field.name]: checked })} /></label>
          ) : (
            <Input key={field.name} type={field.type || 'text'} placeholder={field.label} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })} />
          ))}
          <Button>{editing ? 'Actualizar' : 'Crear'}</Button>
        </form>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <EmptyState title="Todavia no hay datos cargados" />}
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold">{item.name || item.notes || item.phone || `${item.start_time || item.starts_at} - ${item.end_time || item.ends_at}`}</p>
              <p className="text-slate-500">{Object.entries(item).filter(([k]) => !['id','user_id','created_at','updated_at'].includes(k)).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(item.id); setForm(item); }}>Editar</button>
              <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setDeleteId(item.id)}>Eliminar</button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar" description="Esta accion no se puede deshacer." onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
