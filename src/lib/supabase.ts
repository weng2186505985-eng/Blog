import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase dashboard and put them in .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhb...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  level: number;
  exp: number;
  title: string;
  is_admin: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  read_time: number;
  published: boolean;
  created_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile; // Joined data
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  status: 'in_progress' | 'completed' | 'abandoned';
  difficulty: number;
  reward_exp: number;
  start_date: string;
  end_date: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'legend';
  unlock_condition: string;
  is_unlocked: boolean;
  unlocked_at: string;
};
