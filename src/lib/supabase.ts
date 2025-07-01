import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching your existing schema
export interface Profile {
  user_id: number;
  sso_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  redeemable_points: number;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
  // Computed fields for app compatibility
  id?: string;
  full_name?: string;
  points?: number;
  avatar_url?: string;
}

export interface Event {
  event_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  points: number;
  created_by?: number;
  registration_id?: string;
  thumbnail_image?: string;
  created_at: string;
  updated_at: string;
  // Computed fields for app compatibility
  id?: string;
  date?: string;
  image_url?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  max_participants?: number;
  participant_count?: number;
}

export interface EventParticipant {
  participant_id: number;
  user_id: number;
  event_id: number;
  joined_at: string;
  status: string;
  // Computed fields for app compatibility
  id?: string;
  registered_at?: string;
}

export interface Reward {
  reward_id: number;
  name: string;
  description?: string;
  points_required: number;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // Computed fields for app compatibility
  id?: string;
  title?: string;
  is_active?: boolean;
}

export interface RewardRedemption {
  redemption_id: number;
  user_id: number;
  reward_id: number;
  points_deducted: number;
  redeemed_at: string;
  status: string;
  // Computed fields for app compatibility
  id?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  reward_name?: string;
}

export interface Feedback {
  feedback_id: number;
  user_id: number;
  event_id?: number;
  rating?: number;
  comment?: string;
  submitted_at: string;
  // Computed fields for app compatibility
  id?: string;
  subject?: string;
  message?: string;
  created_at?: string;
}

export interface AdminHistory {
  log_id?: number;
  admin_id: number;
  user_id?: number;
  action_type: string;
  action?: string;
  entity_type: string;
  target_type?: string;
  entity_id: number;
  target_id?: number;
  details?: string;
  description?: string;
  activity_description?: string;
  created_at: string;
  timestamp?: string;
  // Computed fields for app compatibility
  id?: string;
  admin_name?: string;
  admin_email?: string;
  admin_avatar?: string;
}

// New Image interface for the images table
export interface ImageRecord {
  id: number;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadTimestamp: string;
  uploadedByUserId: number;
  description?: string;
  thumbnailPath?: string;
  webpPath?: string;
  avifPath?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage helper functions
export const getImageUrl = (path: string): string => {
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
};

export const uploadImage = async (
  file: File, 
  path: string
): Promise<{ data: any; error: any }> => {
  return await supabase.storage.from('images').upload(path, file);
};

export const deleteImage = async (path: string): Promise<{ data: any; error: any }> => {
  return await supabase.storage.from('images').remove([path]);
};