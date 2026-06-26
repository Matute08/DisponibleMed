import { Router } from 'express';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../supabase.js';
import { capitalize, contactMatchesKeyword, normalizePhoneAR } from '../utils/normalize.js';
import { isInsideOfficeHours, isOnCall } from '../services/availability.js';

export const frontendRouter = Router();

function formatDateTimeAR(value: string, timezone = 'America/Argentina/Buenos_Aires') {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

async function getProfile(userId: string) {
  const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

frontendRouter.get('/api/me/profile', async (req, res) => res.json(await getProfile(req.userId!)));

frontendRouter.put('/api/me/profile', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('profiles').upsert({ ...req.body, id: req.userId }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

frontendRouter.post('/api/onboarding', async (req, res) => {
  const apiKey = crypto.randomBytes(24).toString('hex');
  const phone = normalizePhoneAR(req.body.whatsapp_phone);
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: req.userId,
    full_name: req.body.full_name || req.body.professional_name,
    professional_name: req.body.professional_name || req.body.full_name,
    specialty: req.body.specialty || null,
    whatsapp_phone: phone,
    city: req.body.city || null,
    keyword: req.body.keyword || 'doblas',
    n8n_api_key: apiKey,
    onboarding_completed: true,
  });
  if (profileError) return res.status(400).json({ error: profileError.message });
  if (req.body.start_time && req.body.end_time) {
    await supabaseAdmin.from('office_hours').insert({ user_id: req.userId, day_of_week: 1, start_time: req.body.start_time, end_time: req.body.end_time, active: true });
  }
  const defaultBody = req.body.body || 'Hola, gracias por escribir. En este momento no estoy disponible. Te respondere cuando vuelva a atender.';
  await supabaseAdmin.from('reply_messages').insert({ user_id: req.userId, name: 'Fuera de horario', type: 'fuera_de_horario', body: defaultBody, is_default: true, active: true });
  res.status(201).json({ ok: true });
});

frontendRouter.get('/api/dashboard', async (req, res) => {
  const profile = await getProfile(req.userId!);
  if (!profile) return res.status(404).json({ error: 'profile_not_found' });
  const now = new Date();
  const inside = await isInsideOfficeHours(req.userId!, now, profile.timezone);
  const onCall = await isOnCall(req.userId!, now);
  const status = !profile.automation_enabled ? 'Avisos pausados' : onCall ? 'De guardia' : inside ? 'Disponible' : 'Fuera de horario';
  const { count } = await supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', req.userId).eq('auto_reply_enabled', true).eq('active', true);
  const { data: logs } = await supabaseAdmin.from('automation_logs').select('*').eq('user_id', req.userId).order('created_at', { ascending: false }).limit(5);
  const { data: shifts } = await supabaseAdmin.from('on_call_shifts').select('*').eq('user_id', req.userId).eq('active', true).gte('ends_at', now.toISOString()).order('starts_at').limit(1);
  const today = now.getDay();
  const { data: hours } = await supabaseAdmin.from('office_hours').select('*').eq('user_id', req.userId).eq('day_of_week', today).eq('active', true);
  res.json({
    profile,
    status,
    enabledContacts: count || 0,
    logs: logs || [],
    nextOnCall: shifts?.[0] ? `${formatDateTimeAR(shifts[0].starts_at, profile.timezone)} a ${formatDateTimeAR(shifts[0].ends_at, profile.timezone)}` : null,
    todayHours: hours?.map((h) => `${h.start_time.slice(0,5)} a ${h.end_time.slice(0,5)}`).join(', '),
  });
});

frontendRouter.get('/api/logs', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('automation_logs').select('*').eq('user_id', req.userId).order('received_at', { ascending: false }).limit(100);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

frontendRouter.get('/api/settings', async (req, res) => res.json(await getProfile(req.userId!)));

frontendRouter.put('/api/settings', async (req, res) => {
  const body = { ...req.body };
  delete body.id; delete body.created_at; delete body.updated_at;
  if (body.whatsapp_phone) body.whatsapp_phone = normalizePhoneAR(body.whatsapp_phone);
  const { data, error } = await supabaseAdmin.from('profiles').update(body).eq('id', req.userId).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

frontendRouter.post('/api/contacts/reprocess-keyword', async (req, res) => {
  const profile = await getProfile(req.userId!);
  const { data: contacts } = await supabaseAdmin.from('contacts').select('*').eq('user_id', req.userId);
  const updates = (contacts || []).map((contact) => supabaseAdmin.from('contacts').update({
    matched_keyword: contactMatchesKeyword(contact.name, profile.keyword) ? profile.keyword : null,
    auto_reply_enabled: contactMatchesKeyword(contact.name, profile.keyword),
    group_name: contactMatchesKeyword(contact.name, profile.keyword) ? capitalize(profile.keyword) : contact.group_name,
  }).eq('id', contact.id));
  await Promise.all(updates);
  res.json({ updated: updates.length });
});

frontendRouter.post('/api/google/import-preview', async (req, res) => {
  const profile = await getProfile(req.userId!);
  const contacts = (req.body.contacts || []).map((contact: any) => {
    const matched = contactMatchesKeyword(contact.name, profile.keyword);
    return {
      name: contact.name,
      phone: normalizePhoneAR(contact.phone),
      original_phone: contact.phone,
      source: 'google',
      matched_keyword: matched ? profile.keyword : null,
      group_name: matched ? capitalize(profile.keyword) : null,
      auto_reply_enabled: matched,
      active: true,
    };
  });
  res.json({ contacts });
});

frontendRouter.post('/api/google/import-confirm', async (req, res) => {
  const rows = (req.body.contacts || []).map((contact: any) => ({ ...contact, user_id: req.userId, last_synced_at: new Date().toISOString() }));
  const { data, error } = await supabaseAdmin.from('contacts').upsert(rows, { onConflict: 'user_id,phone' }).select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
