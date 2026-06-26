import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, Clock, Contact, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { Card, Toggle } from '../components/Primitives';

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const loadDashboard = useCallback(() => {
    api.get('/api/dashboard')
      .then((r) => setData(r.data))
      .catch((error) => {
        if (error.response?.status === 404) navigate('/onboarding');
        else toast.error('No se pudo cargar el inicio');
      });
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const setAutomation = async (checked: boolean) => {
    const previous = data;
    setData((prev: any) => ({
      ...prev,
      status: checked ? 'Actualizando estado...' : 'Avisos pausados',
      profile: { ...prev.profile, automation_enabled: checked },
    }));
    try {
      await api.put('/api/settings', { automation_enabled: checked });
      await loadDashboard();
      toast.success(checked ? 'Avisos activos' : 'Avisos pausados');
    } catch {
      setData(previous);
      toast.error('No se pudieron actualizar los avisos');
    }
  };
  if (!data) return <div>Cargando...</div>;
  const automationText = data.profile.automation_enabled ? 'Avisos activos' : 'Avisos pausados';
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-med-700">Panel principal</p>
          <h1 className="mt-1 text-3xl font-bold text-med-900">Resumen de disponibilidad</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Administra horarios, guardias, contactos y mensajes de ausencia desde un solo lugar.</p>
        </div>
      </div>
      <Card className="flex flex-col gap-4 border-med-100 bg-gradient-to-br from-med-50 to-calm-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-med-700">{automationText}</p>
          <p className="mt-1 text-3xl font-bold text-med-900">{data.status}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">El estado se calcula con tus horarios y guardias cargadas.</p>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/85 px-4 py-3 shadow-sm ring-1 ring-white sm:justify-start"><span className="text-sm font-semibold text-slate-700">Avisos</span><Toggle checked={data.profile.automation_enabled} onChange={setAutomation} /></div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-2 text-slate-500"><Clock size={18} /><p className="text-sm font-medium">Horario de hoy</p></div><p className="mt-3 text-lg font-bold text-slate-900">{data.todayHours || 'Sin horario cargado'}</p></Card>
        <Card><div className="flex items-center gap-2 text-slate-500"><CalendarClock size={18} /><p className="text-sm font-medium">Proxima guardia</p></div><p className="mt-3 text-lg font-bold leading-7 text-slate-900">{data.nextOnCall || 'Sin guardias proximas'}</p></Card>
        <Card><div className="flex items-center gap-2 text-slate-500"><Contact size={18} /><p className="text-sm font-medium">Contactos habilitados</p></div><p className="mt-3 text-3xl font-bold text-slate-900">{data.enabledContacts}</p></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <button onClick={() => navigate('/contactos')} className="rounded-lg border border-white/80 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-med-200"><Contact className="text-med-700" /><p className="mt-3 font-semibold">Contactos</p><p className="mt-1 text-sm leading-6 text-slate-600">Define quienes pueden recibir avisos de disponibilidad.</p></button>
        <button onClick={() => navigate('/horarios')} className="rounded-lg border border-white/80 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-med-200"><Clock className="text-med-700" /><p className="mt-3 font-semibold">Horarios</p><p className="mt-1 text-sm leading-6 text-slate-600">Indica las franjas en las que normalmente atiendes.</p></button>
        <button onClick={() => navigate('/mensajes')} className="rounded-lg border border-white/80 bg-white/90 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-med-200"><MessageSquare className="text-med-700" /><p className="mt-3 font-semibold">Mensajes</p><p className="mt-1 text-sm leading-6 text-slate-600">Prepara respuestas claras para los momentos fuera de horario.</p></button>
      </div>
      <Card>
        <h2 className="font-semibold">Ultimos movimientos</h2>
        <div className="mt-3 space-y-2">
          {data.logs.length === 0 && <p className="text-sm text-slate-600">Todavia no hay respuestas registradas.</p>}
          {data.logs.map((log: any) => <div key={log.id} className="rounded-md bg-slate-50 p-3 text-sm"><b>{log.from_phone}</b><span className="text-slate-600"> - {log.message_sent ? 'se envio un aviso' : 'sin aviso enviado'}</span></div>)}
        </div>
      </Card>
    </div>
  );
}
