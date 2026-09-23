import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://uhaheixapuowzyqlddcg.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_zXwX_d0hXmg7HX4fr3Eshg_MDOA7Fzn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);