import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, ConfirmDialog, EmptyState, Input, Toggle } from '../components/Primitives';
import { formatTime, weekDays } from '../lib/format';

export function Schedules() {
  const initial = { day_of_week: 1, start_time: '08:00', end_time: '12:00', active: true };
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const load = () => api.get('/api/schedules').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (editing) await api.put(`/api/schedules/${editing}`, form);
    else await api.post('/api/schedules', form);
    setForm(initial); setEditing(null); await load(); toast.success('Horario guardado');
  };
  const remove = async () => {
    if (!deleteId) return;
    await api.delete(`/api/schedules/${deleteId}`);
    setDeleteId(null);
    await load();
    toast.success('Horario eliminado');
  };

  return (
    <div className="space-y-5">
      <header><p className="text-sm font-semibold text-med-700">Disponibilidad semanal</p><h1 className="mt-1 text-3xl font-bold text-med-900">Horarios de atencion</h1><p className="mt-2 text-sm leading-6 text-slate-600">Define las franjas habituales de atencion para cada dia.</p></header>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <h2 className="font-semibold">{editing ? 'Editar horario' : 'Nuevo horario'}</h2>
          <form onSubmit={save} className="mt-4 space-y-3">
            <select className="min-h-10 w-full rounded-md border border-slate-300 px-3 text-sm" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>
              {weekDays.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <label className="flex items-center justify-between text-sm">Horario activo<Toggle checked={form.active} onChange={(active) => setForm({ ...form, active })} /></label>
            <Button>{editing ? 'Guardar cambios' : 'Agregar horario'}</Button>
          </form>
        </Card>
        <div className="space-y-3">
          {items.length === 0 && <EmptyState title="Todavia no hay horarios cargados" />}
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-med-50 text-med-700"><Clock size={18} /></span><div><p className="font-semibold">{weekDays[item.day_of_week]}</p><p className="text-sm text-slate-600">{formatTime(item.start_time)} a {formatTime(item.end_time)} {item.active ? '' : '- pausado'}</p></div></div>
              <div className="flex gap-2"><button className="rounded-md border px-3 py-2 text-sm" onClick={() => { setEditing(item.id); setForm(item); }}>Editar</button><button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setDeleteId(item.id)}>Eliminar</button></div>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar horario" description="Esta franja dejara de formar parte de tu disponibilidad semanal." onCancel={() => setDeleteId(null)} onConfirm={remove} />
    </div>
  );
}
