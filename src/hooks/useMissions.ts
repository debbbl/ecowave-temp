import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'upcoming' | 'completed';
  submission_count?: number;
}

export interface MissionSubmission {
  id: string;
  user_id: string;
  mission_id: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  photo_upload_count: number;
  status: 'pending' | 'approved' | 'rejected';
  month_year: string;
  photo_path_1?: string;
  photo_path_2?: string;
  photo_path_3?: string;
  created_at: string;
  updated_at: string;
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await dataService.getMissions();
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (missionId?: string) => {
    try {
      const data = await dataService.getMissionSubmissions(missionId);
      setSubmissions(data);
      return data;
    } catch (err) {
      console.error('Error fetching submissions:', err);
      return [];
    }
  };

  const createMission = async (missionData: Omit<Mission, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await dataService.createMission(missionData);
      if (!result.error && result.data) {
        // Log to admin log using data from the created mission (not from form)
        await adminLogger.logCreate(
          'MISSION',
          parseInt(result.data.id),
          `Created mission: "${result.data.title}" (${result.data.points} points)`,
          {
            mission_title: result.data.title,
            points_reward: result.data.points,
            created_at: result.data.created_at
          }
        );
        setMissions(prevMissions => [result.data!, ...prevMissions]);
      }
      return result;
    } catch (err) {
      console.error('Create mission error:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateMission = async (id: string, missionData: Partial<Mission>) => {
    try {
      const currentMission = missions.find(m => m.id === id);
      const result = await dataService.updateMission(id, missionData);
      
      if (!result.error && result.data) {
        await adminLogger.logUpdate(
          'MISSION',
          parseInt(id),
          `Updated mission: "${result.data.title}"`,
          {
            mission_title: result.data.title,
            changes: missionData,
            old_values: currentMission
          }
        );
        
        setMissions(prevMissions => 
          prevMissions.map(mission => 
            mission.id === id ? { ...mission, ...missionData } : mission
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Update mission error:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteMission = async (id: string) => {
    try {
      const missionToDelete = missions.find(m => m.id === id);
      const result = await dataService.deleteMission(id);
      
      if (!result.error) {
        await adminLogger.logDelete(
          'MISSION',
          parseInt(id),
          `Deleted mission: "${missionToDelete?.title}"`,
          {
            mission_title: missionToDelete?.title,
            submission_count: missionToDelete?.submission_count || 0
          }
        );
        
        setMissions(prevMissions => prevMissions.filter(mission => mission.id !== id));
      }
      
      return result;
    } catch (err) {
      console.error('Delete mission error:', err);
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };


  // Use approveSubmission and rejectSubmission from dataService, expects (userId, missionId)
  const approveSubmission = async (userId: string, missionId: string) => {
    try {
      const { error } = await dataService.approveSubmission(userId, missionId);
      if (!error) {
        await fetchSubmissions(missionId);
      }
      return { error };
    } catch (err) {
      console.error('Approve submission error:', err);
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const rejectSubmission = async (userId: string, missionId: string) => {
    try {
      const { error } = await dataService.rejectSubmission(userId, missionId);
      if (!error) {
        await fetchSubmissions(missionId);
      }
      return { error };
    } catch (err) {
      console.error('Reject submission error:', err);
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return {
    missions,
    submissions,
    loading,
    error,
    createMission,
    updateMission,
    deleteMission,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    refetch: fetchMissions
  };
}