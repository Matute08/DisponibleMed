import { supabaseAdmin } from '../supabase.js';
import { normalizePhoneAR } from '../utils/normalize.js';
import { isInsideOfficeHours, isOnCall, officeHoursLabel, recentlyReplied } from './availability.js';
import { renderMessageTemplate } from './templates.js';
import { env } from '../env.js';

export type EvaluationBody = {
  professionalWhatsappPhone: string;
  fromPhone: string;
  messageText?: string;
  receivedAt?: string;
};

async function createLog(input: { userId?: string; contactId?: string | null; fromPhone: string; receivedAt: string; decision: string; message?: string | null; metadata?: object }) {
  if (!input.userId) return null;
  const { data } = await supabaseAdmin
    .from('automation_logs')
    .insert({
      user_id: input.userId,
      contact_id: input.contactId,
      from_phone: input.fromPhone,
      received_at: input.receivedAt,
      replied_at: input.message ? new Date().toISOString() : null,
      decision: input.decision,
      message_sent: input.message,
      metadata: input.metadata || {},
    })
    .select('id')
    .single();
  return data?.id || null;
}

export async function evaluateAutomation(body: EvaluationBody, apiKey?: string) {
  const professionalPhone = normalizePhoneAR(body.professionalWhatsappPhone);
  const fromPhone = normalizePhoneAR(body.fromPhone);
  const receivedAt = body.receivedAt || new Date().toISOString();
  const now = new Date(receivedAt);

  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('whatsapp_phone', professionalPhone).maybeSingle();
  if (!profile) return { shouldReply: false, reason: 'professional_not_found' };

  const validKey = apiKey && (apiKey === profile.n8n_api_key || apiKey === env.n8nGlobalApiKey);
  if (!validKey) return { shouldReply: false, reason: 'error', error: 'invalid_api_key', professionalId: profile.id };

  if (!profile.automation_enabled) {
    const logId = await createLog({ userId: profile.id, fromPhone, receivedAt, decision: 'automation_disabled' });
    return { shouldReply: false, reason: 'automation_disabled', professionalId: profile.id, logId };
  }

  const { data: contact } = await supabaseAdmin.from('contacts').select('*').eq('user_id', profile.id).eq('phone', fromPhone).eq('active', true).maybeSingle();

  if (await isInsideOfficeHours(profile.id, now, profile.timezone)) {
    const logId = await createLog({ userId: profile.id, contactId: contact?.id, fromPhone, receivedAt, decision: 'ignored_inside_hours' });
    return { shouldReply: false, reason: 'ignored_inside_hours', professionalId: profile.id, contactId: contact?.id, logId };
  }

  if (await isOnCall(profile.id, now)) {
    const logId = await createLog({ userId: profile.id, contactId: contact?.id, fromPhone, receivedAt, decision: 'ignored_on_call' });
    return { shouldReply: false, reason: 'ignored_on_call', professionalId: profile.id, contactId: contact?.id, logId };
  }

  if (!contact && !profile.reply_unknown_contacts) {
    const logId = await createLog({ userId: profile.id, fromPhone, receivedAt, decision: 'ignored_unknown' });
    return { shouldReply: false, reason: 'ignored_unknown', professionalId: profile.id, logId };
  }

  if (contact && !contact.auto_reply_enabled) {
    const logId = await createLog({ userId: profile.id, contactId: contact.id, fromPhone, receivedAt, decision: 'ignored_contact_not_enabled' });
    return { shouldReply: false, reason: 'ignored_contact_not_enabled', professionalId: profile.id, contactId: contact.id, logId };
  }

  if (await recentlyReplied(profile.id, fromPhone, profile.anti_spam_hours || 6, now)) {
    const logId = await createLog({ userId: profile.id, contactId: contact?.id, fromPhone, receivedAt, decision: 'ignored_recently_replied' });
    return { shouldReply: false, reason: 'ignored_recently_replied', professionalId: profile.id, contactId: contact?.id, logId };
  }

  const { data: defaultMessage } = await supabaseAdmin
    .from('reply_messages')
    .select('*')
    .eq('user_id', profile.id)
    .eq('type', 'fuera_de_horario')
    .eq('is_default', true)
    .eq('active', true)
    .maybeSingle();

  if (!defaultMessage) {
    const logId = await createLog({ userId: profile.id, contactId: contact?.id, fromPhone, receivedAt, decision: 'no_default_message' });
    return { shouldReply: false, reason: 'no_default_message', professionalId: profile.id, contactId: contact?.id, logId };
  }

  const message = renderMessageTemplate(defaultMessage.body, {
    nombre_profesional: profile.professional_name || profile.full_name || '',
    horario_atencion: await officeHoursLabel(profile.id),
    proxima_disponibilidad: 'proximo horario de atencion',
  });
  const logId = await createLog({ userId: profile.id, contactId: contact?.id, fromPhone, receivedAt, decision: 'outside_hours_contact_enabled', message });
  return { shouldReply: true, reason: 'outside_hours_contact_enabled', message, professionalId: profile.id, contactId: contact?.id, logId };
}
