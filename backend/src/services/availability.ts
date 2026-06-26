import { supabaseAdmin } from '../supabase.js';
import { timeToMinutes, zonedParts } from '../utils/time.js';

export async function isInsideOfficeHours(userId: string, datetime: Date, timezone: string) {
  const { dayOfWeek, minutes } = zonedParts(datetime, timezone);
  const { data } = await supabaseAdmin.from('office_hours').select('*').eq('user_id', userId).eq('day_of_week', dayOfWeek).eq('active', true);
  return (data || []).some((row) => {
    const start = timeToMinutes(row.start_time);
    const end = timeToMinutes(row.end_time);
    if (end >= start) return minutes >= start && minutes <= end;
    return minutes >= start || minutes <= end;
  });
}

export async function isOnCall(userId: string, datetime: Date) {
  const iso = datetime.toISOString();
  const { data } = await supabaseAdmin
    .from('on_call_shifts')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('starts_at', iso)
    .gte('ends_at', iso)
    .limit(1);
  return Boolean(data?.length);
}

export async function recentlyReplied(userId: string, fromPhone: string, antiSpamHours: number, now: Date) {
  const since = new Date(now.getTime() - antiSpamHours * 60 * 60 * 1000).toISOString();
  const { data } = await supabaseAdmin
    .from('automation_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('from_phone', fromPhone)
    .in('decision', ['outside_hours_contact_enabled', 'replied'])
    .gte('replied_at', since)
    .limit(1);
  return Boolean(data?.length);
}

export async function officeHoursLabel(userId: string) {
  const { data } = await supabaseAdmin.from('office_hours').select('*').eq('user_id', userId).eq('active', true).order('day_of_week');
  if (!data?.length) return 'Consultar horarios de atencion';
  return data.map((h) => `${h.day_of_week}: ${h.start_time.slice(0, 5)}-${h.end_time.slice(0, 5)}`).join(', ');
}
