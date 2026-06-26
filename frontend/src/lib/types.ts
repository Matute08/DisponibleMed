export type Profile = {
  id: string;
  full_name: string | null;
  professional_name: string | null;
  specialty: string | null;
  whatsapp_phone: string | null;
  city: string | null;
  timezone: string;
  keyword: string;
  automation_enabled: boolean;
  reply_unknown_contacts: boolean;
  anti_spam_hours: number;
  n8n_api_key: string | null;
  onboarding_completed: boolean;
};

export type OfficeHour = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

export type OnCallShift = {
  id: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  notes: string | null;
};

export type ReplyMessage = {
  id: string;
  name: string;
  type: string;
  body: string;
  is_default: boolean;
  active: boolean;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  original_phone: string | null;
  group_name: string | null;
  matched_keyword: string | null;
  source: string;
  auto_reply_enabled: boolean;
  active: boolean;
};
