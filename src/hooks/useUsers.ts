import { useState, useEffect } from 'react';
import { dataService, User } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await dataService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const currentUser = users.find(u => u.id === id);
      const result = await dataService.updateUser(id, userData);
      
      if (!result.error && result.data) {
        // Log the admin action with detailed changes
        try {
          const changes = Object.keys(userData);
          const changeDetails = changes.map(key => {
            const oldValue = currentUser ? (currentUser as any)[key] : 'unknown';
            const newValue = (userData as any)[key];
            return `${key}: "${oldValue}" → "${newValue}"`;
          }).join(', ');
          
          await adminLogger.logUpdate(
            'USER',
            parseInt(id),
            `Updated user profile for "${result.data.email}" - Changes: ${changeDetails}`,
            {
              user_email: result.data.email,
              user_name: result.data.full_name,
              changes: userData,
              fields_modified: changes,
              old_values: currentUser ? {
                email: currentUser.email,
                role: currentUser.role,
                points: currentUser.points,
                full_name: currentUser.full_name
              } : {}
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, ...userData } : user
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Update user error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the user';
      return { data: null, error: errorMessage };
    }
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      const currentUser = users.find(u => u.id === id);
      const oldRole = currentUser?.role || 'unknown';
      
      const result = await dataService.updateUserRole(id, role);
      
      if (!result.error && result.data) {
        // Log the admin action with role change details
        try {
          await adminLogger.logUpdate(
            'USER',
            parseInt(id),
            `Changed user role for "${result.data.email}" from "${oldRole}" to "${role}" - This affects user permissions and access levels`,
            {
              user_email: result.data.email,
              user_name: result.data.full_name,
              old_role: oldRole,
              new_role: role,
              permission_change: true,
              security_impact: role === 'admin' ? 'elevated_privileges' : 'standard_access'
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, role } : user
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Update user role error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the user role';
      return { data: null, error: errorMessage };
    }
  };

  const addPointsToUser = async (id: string, pointsToAdd: number) => {
    try {
      const currentUser = users.find(u => u.id === id);
      const oldPoints = currentUser?.points || 0;
      
      const result = await dataService.addPointsToUser(id, pointsToAdd);
      
      if (!result.error && result.data) {
        // Log the admin action with points transaction details
        try {
          await adminLogger.logUpdate(
            'USER',
            parseInt(id),
            `Added ${pointsToAdd} points to user "${result.data.email}" (${oldPoints} → ${result.data.points} points) - Manual points adjustment by admin`,
            {
              user_email: result.data.email,
              user_name: result.data.full_name,
              points_added: pointsToAdd,
              old_points: oldPoints,
              new_points: result.data.points,
              transaction_type: 'admin_adjustment',
              points_difference: `+${pointsToAdd}`
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, points: result.data!.points } : user
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Add points error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding points';
      return { data: null, error: errorMessage };
    }
  };

  const createUser = async (userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    username?: string;
  }) => {
    try {
      console.log('Creating user with data:', userData);
      
      const userToCreate = {
        email: userData.email,
        full_name: `${userData.first_name} ${userData.last_name}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        points: 0
      };
      
      const result = await dataService.createUser(userToCreate);
      
      if (!result.error && result.data) {
        console.log('User created successfully:', result.data);
        
        // Log the admin action with new user details
        try {
          await adminLogger.logCreate(
            'USER',
            parseInt(result.data.id),
            `Created new user account for "${userData.email}" with role "${userData.role}" and name "${userData.first_name} ${userData.last_name}" - Manual account creation by admin`,
            {
              user_email: userData.email,
              user_role: userData.role,
              full_name: `${userData.first_name} ${userData.last_name}`,
              username: userData.username || userData.email.split('@')[0],
              initial_points: 0,
              account_type: 'manual_creation',
              created_by_admin: true
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Add to local state
        setUsers(prevUsers => [result.data!, ...prevUsers]);
      }
      
      return result;
    } catch (err) {
      console.error('Create user error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the user';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    updateUser,
    updateUserRole,
    addPointsToUser,
    createUser,
    refetch: fetchUsers
  };
}