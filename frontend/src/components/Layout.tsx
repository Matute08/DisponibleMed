import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarClock, Clock, Contact, Home, LogOut, MessageSquare, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const items = [
  ['/dashboard', Home, 'Inicio'],
  ['/horarios', Clock, 'Horarios'],
  ['/guardias', CalendarClock, 'Guardias'],
  ['/mensajes', MessageSquare, 'Mensajes'],
  ['/contactos', Contact, 'Contactos'],
] as const;

export function Layout() {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-68 border-r border-slate-200/70 bg-white/88 p-5 shadow-sm backdrop-blur md:block">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-med-50 text-med-700 ring-1 ring-med-100"><ShieldCheck size={22} /></span>
          <div><p className="font-bold text-med-900">DisponibleMed</p><p className="text-xs text-slate-500">Gestion profesional</p></div>
        </div>
        <nav className="space-y-2">
          {items.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-med-50 text-med-700 shadow-sm ring-1 ring-med-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-5 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"><LogOut size={18} /> Salir</button>
      </aside>
      <main className="mx-auto max-w-6xl px-4 py-5 md:ml-64 md:px-8 md:py-8">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-slate-200 bg-white/95 shadow-[0_-10px_35px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        {items.slice(0, 5).map(([to, Icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium ${isActive ? 'text-med-700' : 'text-slate-500'}`}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
