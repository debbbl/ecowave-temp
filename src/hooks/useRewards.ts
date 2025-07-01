import { useState, useEffect } from 'react';
import { dataService, Reward, RewardRedemption } from '../lib/dataService';
import { adminLogger } from '../lib/adminLogger';

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await dataService.getRewards();
      setRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async (rewardId?: string) => {
    try {
      const data = await dataService.getRedemptions(rewardId);
      setRedemptions(data);
      return data;
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      return [];
    }
  };

  const getRedemptionStats = (rewardId: string) => {
    const rewardRedemptions = redemptions.filter(r => r.reward_id.toString() === rewardId);
    const totalRedemptions = rewardRedemptions.length;
    const totalPointsUsed = rewardRedemptions.reduce((sum, r) => sum + r.points_deducted, 0);
    
    return {
      totalRedemptions,
      totalPointsUsed,
      recentRedemptions: rewardRedemptions.slice(0, 5)
    };
  };

  const createReward = async (rewardData: Omit<Reward, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating reward with data:', rewardData);
      
      const result = await dataService.createReward(rewardData);
      
      if (!result.error && result.data) {
        console.log('Reward created successfully:', result.data);
        
        // Log with concise description
        try {
          await adminLogger.logCreate(
            'REWARD',
            parseInt(result.data.id),
            `Created reward: ${rewardData.name}`,
            {
              reward_name: rewardData.name,
              points_required: rewardData.points_required,
              stock: rewardData.stock
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Add to local state
        setRewards(prevRewards => [result.data!, ...prevRewards]);
      }
      
      return result;
    } catch (err) {
      console.error('Create reward error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the reward';
      return { data: null, error: errorMessage };
    }
  };

  const updateReward = async (id: string, rewardData: Partial<Reward>) => {
    try {
      const currentReward = rewards.find(r => r.id === id);
      
      const result = await dataService.updateReward(id, rewardData);
      
      if (!result.error && result.data) {
        // Log with concise description
        try {
          const changes = Object.keys(rewardData).filter(key => key !== 'updated_at');
          await adminLogger.logUpdate(
            'REWARD',
            parseInt(id),
            `Updated reward: ${result.data.name}`,
            {
              reward_name: result.data.name,
              fields_modified: changes,
              changes: rewardData
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Update local state
        setRewards(prevRewards => 
          prevRewards.map(reward => 
            reward.id === id ? { ...reward, ...rewardData } : reward
          )
        );
      }
      
      return result;
    } catch (err) {
      console.error('Update reward error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the reward';
      return { data: null, error: errorMessage };
    }
  };

  const deleteReward = async (id: string) => {
    try {
      const rewardToDelete = rewards.find(r => r.id === id);
      const stats = getRedemptionStats(id);
      
      const result = await dataService.deleteReward(id);
      
      if (!result.error) {
        // Log with concise description
        try {
          await adminLogger.logDelete(
            'REWARD',
            parseInt(id),
            `Deleted reward: ${rewardToDelete?.name}`,
            {
              reward_name: rewardToDelete?.name,
              points_required: rewardToDelete?.points_required,
              total_redemptions: stats.totalRedemptions
            }
          );
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
        
        // Remove from local state
        setRewards(prevRewards => prevRewards.filter(reward => reward.id !== id));
      }
      
      return result;
    } catch (err) {
      console.error('Delete reward error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the reward';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchRedemptions();
  }, []);

  return {
    rewards,
    redemptions,
    loading,
    error,
    createReward,
    updateReward,
    deleteReward,
    fetchRedemptions,
    getRedemptionStats,
    refetch: fetchRewards
  };
}