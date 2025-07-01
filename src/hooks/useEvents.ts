import { useState, useEffect } from 'react';
import { dataService, Event } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await dataService.getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating event with data:', eventData);
      
      const result = await dataService.createEvent(eventData);
      
      if (!result.error && result.data) {
        console.log('Event created successfully:', result.data);
        
        // Log the admin action with event creation details
        try {
          await adminLogger.logCreate(
            'EVENT',
            parseInt(result.data.id),
            `Created new sustainability event "${eventData.title}" scheduled from ${new Date(result.data.start_date).toLocaleString()} to ${new Date(result.data.end_date).toLocaleString()} at ${eventData.location}`,
            {
              event_title: eventData.title,
              start_date: result.data.start_date,
              end_date: result.data.end_date,
              location: eventData.location,
              description: eventData.description,
              points_awarded: result.data.points,
              max_participants: eventData.max_participants || 50,
              event_type: 'sustainability_initiative'
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Add to local state
        setEvents(prevEvents => [result.data!, ...prevEvents]);
      }
      
      return result;
    } catch (err) {
      console.error('Create event error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the event';
      return { data: null, error: errorMessage };
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      const currentEvent = events.find(e => e.id === id);
      
      const result = await dataService.updateEvent(id, eventData);
      
      if (!result.error && result.data) {
        // Log the admin action with detailed changes
        try {
          const changes = Object.keys(eventData).filter(key => key !== 'updated_at');
          const changeDetails = changes.map(key => {
            const oldValue = currentEvent ? (currentEvent as any)[key] : 'unknown';
            const newValue = (eventData as any)[key];
            return `${key}: "${oldValue}" → "${newValue}"`;
          }).join(', ');
          
          await adminLogger.logUpdate(
            'EVENT',
            parseInt(id),
            `Updated event "${result.data.title}" - Changes: ${changeDetails}`,
            {
              event_title: result.data.title,
              changes: eventData,
              fields_modified: changes,
              old_values: currentEvent ? {
                title: currentEvent.title,
                start_date: currentEvent.start_date,
                end_date: currentEvent.end_date,
                location: currentEvent.location,
                description: currentEvent.description
              } : {},
              participant_count: currentEvent?.participant_count || 0
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === id ? { ...event, ...eventData } : event
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Update event error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the event';
      return { data: null, error: errorMessage };
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventToDelete = events.find(e => e.id === id);
      
      const result = await dataService.deleteEvent(id);
      
      if (!result.error) {
        // Log the admin action with event deletion details
        try {
          await adminLogger.logDelete(
            'EVENT',
            parseInt(id),
            `Deleted event "${eventToDelete?.title || 'Unknown Event'}" scheduled for ${eventToDelete?.date || 'unknown date'}`,
            {
              event_title: eventToDelete?.title,
              event_date: eventToDelete?.date,
              location: eventToDelete?.location,
              participant_count: eventToDelete?.participant_count || 0,
              event_status: eventToDelete?.status,
              deletion_impact: eventToDelete?.participant_count ? 'affects_participants' : 'no_participants'
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Remove from local state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      }
      
      return result;
    } catch (err) {
      console.error('Delete event error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the event';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
}