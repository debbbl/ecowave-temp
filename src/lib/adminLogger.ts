import { supabase } from './supabase';

interface AdminLogEntry {
  admin_id: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT';
  entity_type: 'USER' | 'EVENT' | 'REWARD' | 'FEEDBACK' | 'SYSTEM';
  entity_id?: number;
  details: string;
}

class AdminLogger {
  private static instance: AdminLogger;
  private currentAdminId: number = 1;
  private databaseAvailable: boolean = false;

  private constructor() {}

  public static getInstance(): AdminLogger {
    if (!AdminLogger.instance) {
      AdminLogger.instance = new AdminLogger();
    }
    return AdminLogger.instance;
  }

  public setCurrentAdminId(adminId: number) {
    this.currentAdminId = adminId;
    console.log('🔧 Admin Logger: Set current admin ID to', adminId);
  }

  public async logAction(entry: Omit<AdminLogEntry, 'admin_id'> & { metadata?: Record<string, any> }) {
    try {
      // Create log entry without metadata column (since it doesn't exist in your schema)
      const logEntry = {
        admin_id: this.currentAdminId,
        action_type: entry.action_type,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || 1, // entity_id is required in your schema
        details: entry.details,
        created_at: new Date().toISOString()
      };

      console.log('🔄 Logging admin action:', {
        action: entry.action_type,
        entity: entry.entity_type,
        details: entry.details.substring(0, 50) + '...'
      });

      // Only try database if it's available
      if (this.databaseAvailable) {
        try {
          const { data, error } = await supabase
            .from('admin_activity_log')
            .insert([logEntry])
            .select();

          if (error) {
            console.error('❌ Database error:', error.message);
            this.databaseAvailable = false;
            this.logToLocalStorage({ ...logEntry, metadata: entry.metadata || {} });
            return;
          }

          console.log('✅ Successfully logged to database');
        } catch (dbError: any) {
          console.error('❌ Database connection error:', dbError.message);
          this.databaseAvailable = false;
          this.logToLocalStorage({ ...logEntry, metadata: entry.metadata || {} });
        }
      } else {
        console.log('📝 Database unavailable, logging to localStorage');
        this.logToLocalStorage({ ...logEntry, metadata: entry.metadata || {} });
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      this.logToLocalStorage({
        admin_id: this.currentAdminId,
        action_type: entry.action_type,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || 1,
        details: entry.details,
        metadata: entry.metadata || {},
        created_at: new Date().toISOString()
      });
    }
  }

  private logToLocalStorage(entry: any) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('admin_activity_log') || '[]');
      existingLogs.unshift({
        ...entry,
        log_id: Date.now() + Math.random(),
        id: (Date.now() + Math.random()).toString()
      });
      
      if (existingLogs.length > 100) {
        existingLogs.splice(100);
      }
      
      localStorage.setItem('admin_activity_log', JSON.stringify(existingLogs));
      console.log('💾 Stored in localStorage as fallback');
    } catch (err) {
      console.warn('Failed to store in localStorage:', err);
    }
  }

  // Enhanced convenience methods with concise, change-focused descriptions
  public async logCreate(entityType: AdminLogEntry['entity_type'], entityId: number, details: string, metadata?: Record<string, any>) {
    const conciseDescription = this.createConciseDescription('CREATE', entityType, details, metadata);
    await this.logAction({
      action_type: 'CREATE',
      entity_type: entityType,
      entity_id: entityId,
      details: conciseDescription,
      metadata
    });
  }

  public async logUpdate(entityType: AdminLogEntry['entity_type'], entityId: number, details: string, metadata?: Record<string, any>) {
    const conciseDescription = this.createConciseDescription('UPDATE', entityType, details, metadata);
    await this.logAction({
      action_type: 'UPDATE',
      entity_type: entityType,
      entity_id: entityId,
      details: conciseDescription,
      metadata
    });
  }

  public async logDelete(entityType: AdminLogEntry['entity_type'], entityId: number, details: string, metadata?: Record<string, any>) {
    const conciseDescription = this.createConciseDescription('DELETE', entityType, details, metadata);
    await this.logAction({
      action_type: 'DELETE',
      entity_type: entityType,
      entity_id: entityId,
      details: conciseDescription,
      metadata
    });
  }

  public async logExport(entityType: AdminLogEntry['entity_type'], details: string, metadata?: Record<string, any>) {
    await this.logAction({
      action_type: 'EXPORT',
      entity_type: entityType,
      entity_id: 1, // Required field, using 1 as default for system exports
      details: `Exported ${entityType.toLowerCase()} data - ${details}`,
      metadata
    });
  }

  public async logLogin(details: string = 'Admin logged in', metadata?: Record<string, any>) {
    const loginDetails = metadata?.user_email 
      ? `Admin logged in: ${metadata.user_email}`
      : 'Admin logged in';
    
    await this.logAction({
      action_type: 'LOGIN',
      entity_type: 'SYSTEM',
      entity_id: 1, // Required field
      details: loginDetails,
      metadata
    });
  }

  public async logLogout(details: string = 'Admin logged out', metadata?: Record<string, any>) {
    const logoutDetails = metadata?.user_email 
      ? `Admin logged out: ${metadata.user_email}`
      : 'Admin logged out';
    
    await this.logAction({
      action_type: 'LOGOUT',
      entity_type: 'SYSTEM',
      entity_id: 1, // Required field
      details: logoutDetails,
      metadata
    });
  }

  private createConciseDescription(action: string, entityType: string, originalDetails: string, metadata?: Record<string, any>): string {
    // Create concise descriptions that focus only on what changed
    switch (entityType) {
      case 'USER':
        if (action === 'CREATE') {
          const email = metadata?.user_email || 'unknown';
          const role = metadata?.user_role || metadata?.role || 'user';
          return `Created user: ${email} (${role})`;
        }
        
        if (action === 'UPDATE') {
          const email = metadata?.user_email || 'unknown user';
          
          if (metadata?.points_added) {
            return `Added ${metadata.points_added} points to ${email}`;
          }
          
          if (metadata?.old_role && metadata?.new_role) {
            return `Changed role: ${email} from ${metadata.old_role} to ${metadata.new_role}`;
          }
          
          if (metadata?.fields_modified && metadata?.fields_modified.length > 0) {
            const changes = this.formatFieldChanges(metadata.fields_modified, metadata.old_values, metadata.changes);
            return `Updated user: ${email} - ${changes}`;
          }
          
          return `Updated user: ${email}`;
        }
        
        if (action === 'DELETE') {
          const email = metadata?.user_email || 'unknown user';
          return `Deleted user: ${email}`;
        }
        break;

      case 'EVENT':
        if (action === 'CREATE') {
          const title = metadata?.event_title || 'Unknown Event';
          const date = metadata?.event_date || 'unknown date';
          return `Created event: "${title}" on ${date}`;
        }
        
        if (action === 'UPDATE') {
          const title = metadata?.event_title || 'Unknown Event';
          
          if (metadata?.fields_modified && metadata?.fields_modified.length > 0) {
            const changes = this.formatFieldChanges(metadata.fields_modified, metadata.old_values, metadata.changes);
            return `Updated event: "${title}" - ${changes}`;
          }
          
          return `Updated event: "${title}"`;
        }
        
        if (action === 'DELETE') {
          const title = metadata?.event_title || 'Unknown Event';
          const participantCount = metadata?.participant_count || 0;
          const participantInfo = participantCount > 0 ? ` (${participantCount} participants affected)` : '';
          return `Deleted event: "${title}"${participantInfo}`;
        }
        break;

      case 'REWARD':
        if (action === 'CREATE') {
          const name = metadata?.reward_name || 'Unknown Reward';
          const points = metadata?.points_required || 0;
          return `Created reward: "${name}" (${points} points)`;
        }
        
        if (action === 'UPDATE') {
          const name = metadata?.reward_name || 'Unknown Reward';
          
          if (metadata?.fields_modified && metadata?.fields_modified.length > 0) {
            const changes = this.formatFieldChanges(metadata.fields_modified, metadata.old_values, metadata.changes);
            return `Updated reward: "${name}" - ${changes}`;
          }
          
          return `Updated reward: "${name}"`;
        }
        
        if (action === 'DELETE') {
          const name = metadata?.reward_name || 'Unknown Reward';
          const totalRedemptions = metadata?.total_redemptions || 0;
          const redemptionInfo = totalRedemptions > 0 ? ` (${totalRedemptions} redemptions)` : '';
          return `Deleted reward: "${name}"${redemptionInfo}`;
        }
        break;

      case 'FEEDBACK':
        if (action === 'DELETE') {
          const userName = metadata?.user_name || 'Unknown User';
          const eventTitle = metadata?.event_title;
          const rating = metadata?.rating;
          
          const eventInfo = eventTitle ? ` for "${eventTitle}"` : '';
          const ratingInfo = rating ? ` (${rating}★)` : '';
          
          return `Deleted feedback from ${userName}${eventInfo}${ratingInfo}`;
        }
        
        if (action === 'UPDATE') {
          const userName = metadata?.user_name || 'Unknown User';
          const eventTitle = metadata?.event_title;
          const eventInfo = eventTitle ? ` for "${eventTitle}"` : '';
          
          if (metadata?.action === 'mark_as_read') {
            return `Marked feedback as read from ${userName}${eventInfo}`;
          }
          
          return `Updated feedback from ${userName}${eventInfo}`;
        }
        break;

      case 'SYSTEM':
        if (action === 'EXPORT') {
          return `Exported ${originalDetails}`;
        }
        break;
    }

    // Fallback: return original details if no specific formatting is available
    return originalDetails;
  }

  private formatFieldChanges(fieldsModified: string[], oldValues?: Record<string, any>, newValues?: Record<string, any>): string {
    if (!oldValues || !newValues) {
      return `modified ${fieldsModified.join(', ')}`;
    }

    const changes = fieldsModified.map(field => {
      const oldValue = oldValues[field];
      const newValue = newValues[field];
      
      // Format specific field types for better readability
      switch (field) {
        case 'points_required':
          return `points: ${oldValue} → ${newValue}`;
        case 'stock':
          return `stock: ${oldValue} → ${newValue}`;
        case 'redeemable_points':
          return `points: ${oldValue} → ${newValue}`;
        case 'first_name':
        case 'last_name':
          return `name: "${oldValue}" → "${newValue}"`;
        case 'email':
          return `email: ${oldValue} → ${newValue}`;
        case 'role':
          return `role: ${oldValue} → ${newValue}`;
        case 'title':
          return `title: "${oldValue}" → "${newValue}"`;
        case 'description':
          // Truncate long descriptions
          const oldDesc = oldValue?.length > 30 ? oldValue.substring(0, 30) + '...' : oldValue;
          const newDesc = newValue?.length > 30 ? newValue.substring(0, 30) + '...' : newValue;
          return `description: "${oldDesc}" → "${newDesc}"`;
        case 'location':
          return `location: "${oldValue}" → "${newValue}"`;
        case 'start_date':
        case 'end_date':
        case 'date':
          // Format dates nicely
          const oldDate = oldValue ? new Date(oldValue).toLocaleDateString() : oldValue;
          const newDate = newValue ? new Date(newValue).toLocaleDateString() : newValue;
          return `${field.replace('_', ' ')}: ${oldDate} → ${newDate}`;
        default:
          // For other fields, show a simple change indicator
          if (typeof oldValue === 'string' && typeof newValue === 'string') {
            if (oldValue.length > 20 || newValue.length > 20) {
              return `${field}: updated`;
            }
            return `${field}: "${oldValue}" → "${newValue}"`;
          }
          return `${field}: ${oldValue} → ${newValue}`;
      }
    });

    return changes.join(', ');
  }

  public async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing admin_activity_log table with log_id...');
      
      // Test the table using log_id instead of activity_id
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('log_id')
        .limit(1);

      if (!error) {
        console.log('✅ Database connection successful - log_id column found');
        this.databaseAvailable = true;
        return true;
      } else {
        console.warn('⚠️ Database connection test failed:', error.message);
        this.databaseAvailable = false;
        return false;
      }
    } catch (err) {
      console.error('❌ Database test error:', err);
      this.databaseAvailable = false;
      return false;
    }
  }
}

export const adminLogger = AdminLogger.getInstance();