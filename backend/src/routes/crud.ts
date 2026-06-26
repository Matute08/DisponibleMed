import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';
import { normalizePhoneAR } from '../utils/normalize.js';

const tables: Record<string, string> = {
  schedules: 'office_hours',
  'on-call': 'on_call_shifts',
  messages: 'reply_messages',
  contacts: 'contacts',
};

export const crudRouter = Router();

for (const [path, table] of Object.entries(tables)) {
  crudRouter.get(`/api/${path}`, async (req, res) => {
    const { data, error } = await supabaseAdmin.from(table).select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  crudRouter.post(`/api/${path}`, async (req, res) => {
    const body = { ...req.body, user_id: req.userId };
    if (table === 'contacts') body.phone = normalizePhoneAR(body.phone);
    const { data, error } = await supabaseAdmin.from(table).insert(body).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  });

  crudRouter.put(`/api/${path}/:id`, async (req, res) => {
    const body = { ...req.body };
    delete body.id; delete body.user_id; delete body.created_at; delete body.updated_at;
    if (table === 'contacts' && body.phone) body.phone = normalizePhoneAR(body.phone);
    const { data, error } = await supabaseAdmin.from(table).update(body).eq('id', req.params.id).eq('user_id', req.userId).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  crudRouter.delete(`/api/${path}/:id`, async (req, res) => {
    const { error } = await supabaseAdmin.from(table).delete().eq('id', req.params.id).eq('user_id', req.userId);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  });
}
