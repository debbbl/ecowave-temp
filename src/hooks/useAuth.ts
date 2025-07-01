import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../lib/supabase';
import { dataService } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';
import { imageUploadService } from '../lib/imageUpload';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Test database connection first (non-blocking)
      adminLogger.testDatabaseConnection().then(dbConnected => {
        if (dbConnected) {
          console.log('✅ Admin activity logging is ready');
        } else {
          console.warn('⚠️ Admin activity logging will use localStorage fallback');
        }
      }).catch(err => {
        console.warn('⚠️ Admin activity logging initialization failed:', err);
      });

      // Get current user from data service
      const currentUser = await dataService.getCurrentUser();
      
      if (currentUser) {
        // Transform to match expected format
        const mockUser = {
          id: currentUser.id,
          email: currentUser.email,
          user_metadata: {
            full_name: currentUser.full_name
          }
        } as User;
        
        setUser(mockUser);
        setProfile({
          ...currentUser,
          user_id: parseInt(currentUser.id),
          sso_id: currentUser.id,
          username: currentUser.email.split('@')[0],
          redeemable_points: currentUser.points,
          profile_picture: currentUser.avatar_url
        } as Profile);
        
        // Set the current admin ID for logging and image upload service
        adminLogger.setCurrentAdminId(parseInt(currentUser.id));
        imageUploadService.setCurrentUserId(parseInt(currentUser.id));
      }
    } catch (error) {
      console.error('Error in auth initialization:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const result = await dataService.signIn(email, password);
      
      if (result.error) {
        console.error('Sign in error:', result.error);
        
        // Log failed login attempt (non-blocking)
        adminLogger.logAction({
          action_type: 'LOGIN',
          entity_type: 'SYSTEM',
          details: `Failed login attempt for ${email}: ${result.error.message}`,
          metadata: {
            user_email: email,
            error_code: result.error.message,
            login_method: 'email_password',
            success: false
          }
        }).catch(err => console.warn('Failed to log failed login:', err));
        
        throw result.error;
      }
      
      console.log('Sign in successful:', result.data?.user?.email);
      
      // Refresh auth state
      await initializeAuth();
      
      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('Sign in failed:', error.message);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'admin') => {
    try {
      console.log('Attempting sign up for:', email);
      
      const result = await dataService.signUp(email, password, fullName, role);
      
      if (result.error) {
        console.error('Sign up error:', result.error);
        
        // Log failed signup attempt (non-blocking)
        adminLogger.logAction({
          action_type: 'CREATE',
          entity_type: 'USER',
          details: `Failed account creation attempt for ${email}: ${result.error.message}`,
          metadata: {
            user_email: email,
            error_code: result.error.message,
            role: role,
            success: false
          }
        }).catch(err => console.warn('Failed to log failed signup:', err));
        
        throw result.error;
      }
      
      console.log('Sign up successful:', result.data?.user?.email);
      
      // Log the account creation (non-blocking)
      adminLogger.logCreate(
        'USER',
        parseInt(result.data?.user?.id || '1'),
        `New admin account created for ${email} with role "${role}" and full name "${fullName}"`,
        { 
          email, 
          role, 
          full_name: fullName,
          account_type: 'new_signup',
          requires_email_confirmation: true
        }
      ).catch(err => console.warn('Failed to log account creation:', err));
      
      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('Sign up failed:', error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Log logout before signing out (non-blocking)
      if (user && profile) {
        adminLogger.logLogout(`Admin ${profile.full_name} (${user.email}) logged out`, {
          user_email: user.email,
          admin_name: profile.full_name,
          session_duration: 'unknown'
        }).catch(err => console.warn('Failed to log logout:', err));
      }
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      
      // Sign out from data service
      const result = await dataService.signOut();
      
      if (result.error) {
        console.warn('Data service signout warning (but continuing):', result.error);
      }
      
      console.log('✅ Successfully signed out');
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setProfile(null);
      return { error };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };
}