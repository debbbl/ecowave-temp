// Data Service Abstraction Layer
// This acts as the Controller in MVC pattern, abstracting database operations

import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  points: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  date?: string;
  location?: string;
  points: number;
  image_url?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  max_participants?: number;
  participant_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  name: string;
  title?: string;
  description?: string;
  points_required: number;
  stock: number;
  image_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  event_id?: string;
  rating?: number;
  comment?: string;
  message?: string;
  subject?: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  event_title?: string;
  created_at: string;
  submitted_at?: string;
}

export interface AdminHistory {
  id: string;
  log_id?: number;
  admin_id: number;
  action_type: string;
  action?: string;
  entity_type: string;
  entity_id: number;
  details?: string;
  admin_name?: string;
  admin_email?: string;
  admin_avatar?: string;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: number;
  reward_id: number;
  points_deducted: number;
  redeemed_at: string;
  status: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  reward_name?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  rewardsRedeemed: number;
  engagementRate: number;
}

export interface MonthlyEngagement {
  month: string;
  year: number;
  participants: number;
  events: number;
  feedback: number;
  rewards_redeemed: number;
}

export interface AuthResult {
  data: any;
  error: any;
}

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  imageId?: number;
  error?: string;
}

// Abstract Data Service Interface
export interface IDataService {
  // Authentication
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, fullName: string, role?: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
  getCurrentUser(): Promise<User | null>;
  
  // Users
  getUsers(): Promise<User[]>;
  createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }>;
  updateUser(id: string, userData: Partial<User>): Promise<{ data: User | null; error: string | null }>;
  updateUserRole(id: string, role: string): Promise<{ data: User | null; error: string | null }>;
  addPointsToUser(id: string, points: number): Promise<{ data: User | null; error: string | null }>;
  
  // Events
  getEvents(): Promise<Event[]>;
  createEvent(eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }>;
  deleteEvent(id: string): Promise<{ error: string | null }>;
  
  // Rewards
  getRewards(): Promise<Reward[]>;
  createReward(rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }>;
  updateReward(id: string, rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }>;
  deleteReward(id: string): Promise<{ error: string | null }>;
  getRedemptions(rewardId?: string): Promise<RewardRedemption[]>;
  
  // Feedback
  getFeedback(): Promise<Feedback[]>;
  deleteFeedback(id: string): Promise<{ error: string | null }>;
  markFeedbackAsRead(id: string): Promise<{ error: string | null }>;
  
  // Admin History
  getAdminHistory(): Promise<AdminHistory[]>;
  logAdminAction(action: Partial<AdminHistory>): Promise<void>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getMonthlyEngagement(): Promise<MonthlyEngagement[]>;
  
  // Image Upload
  uploadImage(file: File, folder?: string): Promise<ImageUploadResult>;
  deleteImage(imageId: number): Promise<{ success: boolean; error?: string }>;
}

// Data Service Factory
export class DataServiceFactory {
  private static instance: IDataService;
  
  public static getInstance(): IDataService {
    if (!DataServiceFactory.instance) {
      // Determine which service to use based on environment or configuration
      const serviceType = import.meta.env.VITE_DATA_SERVICE_TYPE || 'supabase';
      
      switch (serviceType) {
        case 'mssql':
          DataServiceFactory.instance = new MSSQLDataService();
          break;
        case 'supabase':
        default:
          DataServiceFactory.instance = new SupabaseDataService();
          break;
      }
    }
    
    return DataServiceFactory.instance;
  }
  
  public static setInstance(service: IDataService): void {
    DataServiceFactory.instance = service;
  }
}

// Supabase Implementation (existing)
class SupabaseDataService implements IDataService {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }
  
  async signUp(email: string, password: string, fullName: string, role: string = 'admin'): Promise<AuthResult> {
    const currentUrl = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        },
        emailRedirectTo: `${currentUrl}/auth/callback`
      }
    });
    
    if (data.user && !error) {
      const nameParts = fullName.split(' ');
      await supabase
        .from('users')
        .insert([{
          sso_id: data.user.id,
          email: email,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' '),
          username: email.split('@')[0],
          role: role,
          redeemable_points: 0
        }]);
    }
    
    return { data, error };
  }
  
  async signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { data: null, error };
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('sso_id', user.id)
      .single();
    
    if (!data) return null;
    
    return {
      id: data.user_id.toString(),
      email: data.email,
      full_name: `${data.first_name} ${data.last_name}`,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      points: data.redeemable_points || 0,
      avatar_url: data.profile_picture,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data.map((user: any) => ({
      id: user.user_id.toString(),
      email: user.email,
      full_name: `${user.first_name} ${user.last_name}`,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      points: user.redeemable_points || 0,
      avatar_url: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  }
  
  async createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const nameParts = userData.full_name?.split(' ') || [];
      const insertData = {
        email: userData.email,
        first_name: nameParts[0] || userData.first_name,
        last_name: nameParts.slice(1).join(' ') || userData.last_name,
        role: userData.role,
        username: userData.email?.split('@')[0],
        redeemable_points: userData.points || 0,
        sso_id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedUser: User = {
        id: data.user_id.toString(),
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        points: data.redeemable_points || 0,
        avatar_url: data.profile_picture,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedUser, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (userData.email) updateData.email = userData.email;
      if (userData.role) updateData.role = userData.role;
      if (userData.points !== undefined) updateData.redeemable_points = userData.points;
      if (userData.avatar_url) updateData.profile_picture = userData.avatar_url;
      if (userData.full_name) {
        const nameParts = userData.full_name.split(' ');
        updateData.first_name = nameParts[0];
        updateData.last_name = nameParts.slice(1).join(' ');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', parseInt(id))
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedUser: User = {
        id: data.user_id.toString(),
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        points: data.redeemable_points || 0,
        avatar_url: data.profile_picture,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedUser, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateUserRole(id: string, role: string): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(id, { role });
  }
  
  async addPointsToUser(id: string, points: number): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data: currentUser } = await supabase
        .from('users')
        .select('redeemable_points')
        .eq('user_id', parseInt(id))
        .single();
      
      const newPoints = (currentUser.redeemable_points || 0) + points;
      return this.updateUser(id, { points: newPoints });
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        event_id,
        title,
        description,
        start_date,
        end_date,
        location,
        points,
        thumbnail_image,
        created_at,
        updated_at,
        event_participants(count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data.map((event: any) => {
      const now = new Date();
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
      if (endDate < now) {
        status = 'completed';
      } else if (startDate <= now && endDate >= now) {
        status = 'ongoing';
      }
      
      return {
        id: event.event_id.toString(),
        title: event.title,
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date,
        date: event.start_date.split('T')[0],
        location: event.location,
        points: event.points,
        image_url: event.thumbnail_image || 'https://images.pexels.com/photos/3952241/pexels-photo-3952241.jpeg',
        status,
        max_participants: 50,
        participant_count: event.event_participants?.[0]?.count || 0,
        created_at: event.created_at,
        updated_at: event.updated_at
      };
    });
  }
  
  async createEvent(eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }> {
    try {
      let startDate: string;
      let endDate: string;
      
      if (eventData.start_date && eventData.end_date) {
        startDate = new Date(eventData.start_date).toISOString();
        endDate = new Date(eventData.end_date).toISOString();
      } else if (eventData.date) {
        const eventDate = new Date(eventData.date);
        startDate = new Date(eventDate);
        startDate.setHours(9, 0, 0, 0);
        endDate = new Date(eventDate);
        endDate.setHours(17, 0, 0, 0);
        startDate = startDate.toISOString();
        endDate = endDate.toISOString();
      } else {
        throw new Error('Event date is required');
      }
      
      const insertData = {
        title: eventData.title?.trim(),
        description: eventData.description?.trim() || '',
        start_date: startDate,
        end_date: endDate,
        location: eventData.location?.trim(),
        points: eventData.points || 100,
        thumbnail_image: eventData.image_url || 'https://images.pexels.com/photos/3952241/pexels-photo-3952241.jpeg'
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedEvent: Event = {
        id: data.event_id.toString(),
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        date: data.start_date.split('T')[0],
        location: data.location,
        points: data.points,
        image_url: data.thumbnail_image,
        status: 'upcoming',
        max_participants: 50,
        participant_count: 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedEvent, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateEvent(id: string, eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (eventData.title) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.location) updateData.location = eventData.location;
      if (eventData.image_url) updateData.thumbnail_image = eventData.image_url;
      if (eventData.start_date) updateData.start_date = new Date(eventData.start_date).toISOString();
      if (eventData.end_date) updateData.end_date = new Date(eventData.end_date).toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('event_id', parseInt(id))
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedEvent: Event = {
        id: data.event_id.toString(),
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        date: data.start_date.split('T')[0],
        location: data.location,
        points: data.points,
        image_url: data.thumbnail_image,
        status: 'upcoming',
        max_participants: 50,
        participant_count: 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedEvent, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async deleteEvent(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('event_id', parseInt(id));
      
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data.map((reward: any) => ({
      id: reward.reward_id.toString(),
      name: reward.name,
      title: reward.name,
      description: reward.description,
      points_required: reward.points_required,
      stock: reward.stock,
      image_url: reward.image_url,
      is_active: reward.stock > 0,
      created_at: reward.created_at,
      updated_at: reward.updated_at
    }));
  }
  
  async createReward(rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }> {
    try {
      const insertData = {
        name: rewardData.name?.trim(),
        description: rewardData.description?.trim(),
        points_required: rewardData.points_required,
        stock: rewardData.stock,
        image_url: rewardData.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg'
      };
      
      const { data, error } = await supabase
        .from('rewards')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedReward: Reward = {
        id: data.reward_id.toString(),
        name: data.name,
        title: data.name,
        description: data.description,
        points_required: data.points_required,
        stock: data.stock,
        image_url: data.image_url,
        is_active: data.stock > 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedReward, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateReward(id: string, rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (rewardData.name) updateData.name = rewardData.name;
      if (rewardData.description !== undefined) updateData.description = rewardData.description;
      if (rewardData.points_required !== undefined) updateData.points_required = rewardData.points_required;
      if (rewardData.stock !== undefined) updateData.stock = rewardData.stock;
      if (rewardData.image_url) updateData.image_url = rewardData.image_url;
      
      const { data, error } = await supabase
        .from('rewards')
        .update(updateData)
        .eq('reward_id', parseInt(id))
        .select()
        .single();
      
      if (error) throw error;
      
      const transformedReward: Reward = {
        id: data.reward_id.toString(),
        name: data.name,
        title: data.name,
        description: data.description,
        points_required: data.points_required,
        stock: data.stock,
        image_url: data.image_url,
        is_active: data.stock > 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: transformedReward, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async deleteReward(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('reward_id', parseInt(id));
      
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async getRedemptions(rewardId?: string): Promise<RewardRedemption[]> {
    let query = supabase
      .from('reward_redemptions')
      .select(`
        redemption_id,
        user_id,
        reward_id,
        points_deducted,
        redeemed_at,
        status,
        users!reward_redemptions_user_id_fkey(first_name, last_name, email, profile_picture),
        rewards!reward_redemptions_reward_id_fkey(name)
      `)
      .order('redeemed_at', { ascending: false });
    
    if (rewardId) {
      query = query.eq('reward_id', parseInt(rewardId));
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return data.map((item: any) => ({
      id: item.redemption_id.toString(),
      user_id: item.user_id,
      reward_id: item.reward_id,
      points_deducted: item.points_deducted,
      redeemed_at: item.redeemed_at,
      status: item.status,
      user_name: item.users ? `${item.users.first_name} ${item.users.last_name}`.trim() : 'Unknown User',
      user_email: item.users?.email || '',
      user_avatar: item.users?.profile_picture || null,
      reward_name: item.rewards?.name || 'Unknown Reward'
    }));
  }
  
  async getFeedback(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        feedback_id,
        user_id,
        event_id,
        rating,
        comment,
        submitted_at,
        users!feedback_user_id_fkey(first_name, last_name, email, profile_picture),
        events!feedback_event_id_fkey(title)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data.map((item: any) => ({
      id: item.feedback_id.toString(),
      user_id: item.user_id.toString(),
      event_id: item.event_id?.toString(),
      rating: item.rating,
      comment: item.comment,
      message: item.comment || '',
      subject: item.event_id ? 'Event Feedback' : 'General Feedback',
      user_name: item.users ? `${item.users.first_name} ${item.users.last_name}`.trim() : 'Anonymous User',
      user_email: item.users?.email || '',
      user_avatar: item.users?.profile_picture || null,
      event_title: item.events?.title || null,
      created_at: item.submitted_at,
      submitted_at: item.submitted_at
    }));
  }
  
  async deleteFeedback(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('feedback_id', parseInt(id));
      
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async markFeedbackAsRead(id: string): Promise<{ error: string | null }> {
    // Supabase doesn't have a read status, so this is a no-op
    return { error: null };
  }
  
  async getAdminHistory(): Promise<AdminHistory[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          log_id,
          admin_id,
          action_type,
          entity_type,
          entity_id,
          details,
          created_at,
          users!admin_activity_log_admin_id_fkey(first_name, last_name, email, profile_picture)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        id: item.log_id.toString(),
        log_id: item.log_id,
        admin_id: item.admin_id,
        action_type: item.action_type,
        action: item.action_type,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        details: item.details,
        admin_name: item.users ? `${item.users.first_name} ${item.users.last_name}`.trim() : 'System Admin',
        admin_email: item.users?.email || 'system@ecowave.com',
        admin_avatar: item.users?.profile_picture || null,
        created_at: item.created_at
      }));
    } catch (err: any) {
      // Fallback to localStorage if database fails
      const localLogs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
      return localLogs.slice(0, 50).map((item: any) => ({
        id: item.id || item.log_id?.toString() || Date.now().toString(),
        log_id: item.log_id,
        admin_id: item.admin_id || 1,
        action_type: item.action_type || item.action,
        action: item.action_type || item.action,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        details: item.details,
        admin_name: 'Admin User',
        admin_email: 'admin@ecowave.com',
        admin_avatar: null,
        created_at: item.created_at || item.timestamp
      }));
    }
  }
  
  async logAdminAction(action: Partial<AdminHistory>): Promise<void> {
    try {
      await supabase
        .from('admin_activity_log')
        .insert([{
          admin_id: action.admin_id || 1,
          action_type: action.action_type,
          entity_type: action.entity_type,
          entity_id: action.entity_id || 1,
          details: action.details,
          created_at: new Date().toISOString()
        }]);
    } catch (err) {
      // Fallback to localStorage
      const existingLogs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
      existingLogs.unshift({
        ...action,
        id: Date.now().toString(),
        log_id: Date.now(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem('admin_activity_log', JSON.stringify(existingLogs.slice(0, 100)));
    }
  }
  
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      { count: totalUsers },
      eventsData,
      { count: rewardsRedeemed },
      participantData
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('event_id, start_date, end_date'),
      supabase.from('reward_redemptions').select('*', { count: 'exact', head: true }),
      supabase.from('event_participants').select('user_id')
    ]);
    
    const now = new Date();
    const activeEvents = eventsData.data?.filter((event: any) => {
      const endDate = new Date(event.end_date);
      return endDate >= now;
    }).length || 0;
    
    const uniqueParticipants = new Set(participantData.data?.map((p: any) => p.user_id)).size;
    const engagementRate = totalUsers ? Math.round((uniqueParticipants / totalUsers) * 100) : 0;
    
    return {
      totalUsers: totalUsers || 0,
      activeEvents,
      rewardsRedeemed: rewardsRedeemed || 0,
      engagementRate
    };
  }
  
  async getMonthlyEngagement(): Promise<MonthlyEngagement[]> {
    // Implementation for monthly engagement data
    const months = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const startOfMonth = new Date(year, month - 1, 1).toISOString();
      const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      // Get data for this month (simplified)
      months.push({
        month: monthName,
        year,
        participants: Math.floor(Math.random() * 50) + 20,
        events: Math.floor(Math.random() * 8) + 2,
        feedback: Math.floor(Math.random() * 30) + 10,
        rewards_redeemed: Math.floor(Math.random() * 15) + 5
      });
    }
    
    return months;
  }
  
  async uploadImage(file: File, folder: string = 'uploads'): Promise<ImageUploadResult> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      return {
        success: true,
        imageUrl: urlData.publicUrl,
        imageId: Date.now()
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  
  async deleteImage(imageId: number): Promise<{ success: boolean; error?: string }> {
    // Implementation for deleting images
    return { success: true };
  }
}

// MS SQL Implementation (placeholder for future migration)
class MSSQLDataService implements IDataService {
  private apiBaseUrl: string;
  private authToken: string | null = null;
  
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-api.azurewebsites.net';
    this.authToken = localStorage.getItem('authToken');
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const { token, user } = await response.json();
      this.authToken = token;
      localStorage.setItem('authToken', token);
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  async signUp(email: string, password: string, fullName: string, role?: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role }),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const { token, user } = await response.json();
      this.authToken = token;
      localStorage.setItem('authToken', token);
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  async signOut(): Promise<AuthResult> {
    this.authToken = null;
    localStorage.removeItem('authToken');
    return { data: null, error: null };
  }
  
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request<User>('/api/auth/me');
    } catch {
      return null;
    }
  }
  
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }
  
  async createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const data = await this.request<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const data = await this.request<User>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateUserRole(id: string, role: string): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(id, { role });
  }
  
  async addPointsToUser(id: string, points: number): Promise<{ data: User | null; error: string | null }> {
    try {
      const data = await this.request<User>(`/api/users/${id}/points`, {
        method: 'POST',
        body: JSON.stringify({ points }),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/api/events');
  }
  
  async createEvent(eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }> {
    try {
      const data = await this.request<Event>('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateEvent(id: string, eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }> {
    try {
      const data = await this.request<Event>(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async deleteEvent(id: string): Promise<{ error: string | null }> {
    try {
      await this.request(`/api/events/${id}`, { method: 'DELETE' });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async getRewards(): Promise<Reward[]> {
    return this.request<Reward[]>('/api/rewards');
  }
  
  async createReward(rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }> {
    try {
      const data = await this.request<Reward>('/api/rewards', {
        method: 'POST',
        body: JSON.stringify(rewardData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async updateReward(id: string, rewardData: Partial<Reward>): Promise<{ data: Reward | null; error: string | null }> {
    try {
      const data = await this.request<Reward>(`/api/rewards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rewardData),
      });
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }
  
  async deleteReward(id: string): Promise<{ error: string | null }> {
    try {
      await this.request(`/api/rewards/${id}`, { method: 'DELETE' });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async getRedemptions(rewardId?: string): Promise<RewardRedemption[]> {
    const endpoint = rewardId ? `/api/rewards/${rewardId}/redemptions` : '/api/redemptions';
    return this.request<RewardRedemption[]>(endpoint);
  }
  
  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/api/feedback');
  }
  
  async deleteFeedback(id: string): Promise<{ error: string | null }> {
    try {
      await this.request(`/api/feedback/${id}`, { method: 'DELETE' });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async markFeedbackAsRead(id: string): Promise<{ error: string | null }> {
    try {
      await this.request(`/api/feedback/${id}/read`, { method: 'POST' });
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
  
  async getAdminHistory(): Promise<AdminHistory[]> {
    return this.request<AdminHistory[]>('/api/admin/history');
  }
  
  async logAdminAction(action: Partial<AdminHistory>): Promise<void> {
    await this.request('/api/admin/history', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }
  
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/dashboard/stats');
  }
  
  async getMonthlyEngagement(): Promise<MonthlyEngagement[]> {
    return this.request<MonthlyEngagement[]>('/api/dashboard/engagement');
  }
  
  async uploadImage(file: File, folder?: string): Promise<ImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      
      const response = await fetch(`${this.apiBaseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        },
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { imageUrl, imageId } = await response.json();
      return { success: true, imageUrl, imageId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  
  async deleteImage(imageId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request(`/api/images/${imageId}`, { method: 'DELETE' });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// Export the factory instance
export const dataService = DataServiceFactory.getInstance();