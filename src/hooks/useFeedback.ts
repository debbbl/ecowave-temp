import { useState, useEffect } from 'react';
import { dataService, Feedback } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await dataService.getFeedback();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      // Get feedback details before deletion for logging
      const feedbackToDelete = feedback.find(f => f.id === id);
      
      const result = await dataService.deleteFeedback(id);
      
      if (!result.error) {
        // Log the admin action with feedback deletion details
        const userName = feedbackToDelete?.user_name || 'Unknown User';
        
        await adminLogger.logDelete(
          'FEEDBACK',
          parseInt(id),
          `Deleted feedback from user "${userName}" ${feedbackToDelete?.event_title ? `for event "${feedbackToDelete.event_title}"` : '(general feedback)'} - Rating: ${feedbackToDelete?.rating || 'N/A'}/5`,
          {
            feedback_preview: feedbackToDelete?.message?.substring(0, 100) + (feedbackToDelete?.message && feedbackToDelete.message.length > 100 ? '...' : ''),
            user_email: feedbackToDelete?.user_email,
            user_name: userName,
            event_title: feedbackToDelete?.event_title,
            rating: feedbackToDelete?.rating,
            feedback_type: feedbackToDelete?.event_title ? 'event_feedback' : 'general_feedback'
          }
        );
        
        // Remove from local state
        setFeedback(prevFeedback => prevFeedback.filter(item => item.id !== id));
      }
      
      return result;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Get feedback details for logging
      const feedbackItem = feedback.find(f => f.id === id);
      
      const result = await dataService.markFeedbackAsRead(id);
      
      if (!result.error) {
        const userName = feedbackItem?.user_name || 'Unknown User';

        await adminLogger.logUpdate(
          'FEEDBACK',
          parseInt(id),
          `Marked feedback as read from user "${userName}" ${feedbackItem?.event_title ? `for event "${feedbackItem.event_title}"` : '(general feedback)'} - Admin has reviewed this feedback`,
          {
            action: 'mark_as_read',
            user_email: feedbackItem?.user_email,
            user_name: userName,
            event_title: feedbackItem?.event_title,
            admin_action: 'reviewed_feedback'
          }
        );
      }

      return result;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return {
    feedback,
    loading,
    error,
    deleteFeedback,
    markAsRead,
    refetch: fetchFeedback
  };
}