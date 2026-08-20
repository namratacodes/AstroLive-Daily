export type User = {
  id: string;
  whatsapp_id: string | null;
  name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  birth_time: string | null;
  birth_place: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type AstrologyProfile = {
  id: string;
  user_id: string;
  sun_sign: string | null;
  moon_sign: string | null;
  ascendant: string | null;
  nakshatra: string | null;
  planetary_data: Record<string, unknown>;
  houses_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStatus =
  | "FREE_TRIAL"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";
export type SubscriptionPlan = "FREE" | "PREMIUM";

export type Subscription = {
  id: string;
  user_id: string;
  trial_start: string | null;
  trial_end: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  created_at: string;
};

export type ConversationTopic =
  | "LOVE"
  | "CAREER"
  | "FINANCE"
  | "STUDIES"
  | "FAMILY"
  | "GENERAL"
  | "COMPATIBILITY";

export type Conversation = {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  topic: ConversationTopic;
  created_at: string;
};

export type Engagement = {
  id: string;
  user_id: string;
  horoscope_sent: number;
  horoscope_opened: number;
  questions_asked: number;
  cosmic_cards_shared: number;
  website_clicks: number;
  referral_signups: number;
  streak_days: number;
  last_active_at: string | null;
};

export type ReferralStatus = "PENDING" | "CONVERTED";

export type Referral = {
  id: string;
  referrer_user_id: string;
  referral_code: string;
  referred_user_id: string | null;
  status: ReferralStatus;
  created_at: string;
};