import { useState, useEffect } from 'react';
import { dataService, AdminHistory } from '../lib/dataService';

export function useAdminHistory() {
  const [history, setHistory] = useState<AdminHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching admin activity log from data service...');
      
      const data = await dataService.getAdminHistory();
      
      console.log('✅ Successfully fetched admin activity log:', data.length, 'entries');
      
      setHistory(data);
    } catch (err) {
      console.log('⚠️ Error fetching admin history:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Generate mock data as fallback
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = (): AdminHistory[] => {
    const actions = [
      { type: 'CREATE', entity: 'EVENT', description: 'Created event: Beach Cleanup Drive' },
      { type: 'UPDATE', entity: 'USER', description: 'Updated user: john.doe@example.com' },
      { type: 'DELETE', entity: 'REWARD', description: 'Deleted reward: Eco-friendly Water Bottle' },
      { type: 'CREATE', entity: 'REWARD', description: 'Created reward: Sustainable Tote Bag' },
      { type: 'UPDATE', entity: 'EVENT', description: 'Updated event: Tree Planting Initiative' },
      { type: 'DELETE', entity: 'USER', description: 'Deleted user: inactive@example.com' },
      { type: 'CREATE', entity: 'EVENT', description: 'Created event: Recycling Workshop' },
      { type: 'UPDATE', entity: 'REWARD', description: 'Updated reward: Solar Power Bank' },
      { type: 'EXPORT', entity: 'SYSTEM', description: 'Exported participant data' },
      { type: 'UPDATE', entity: 'USER', description: 'Changed user role to moderator' }
    ];

    return actions.map((action, index) => ({
      id: (index + 1).toString(),
      log_id: index + 1,
      admin_id: Math.floor(Math.random() * 3) + 1,
      action_type: action.type,
      action: action.type,
      entity_type: action.entity,
      entity_id: index + 1,
      details: action.description,
      created_at: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString(),
      admin_name: ['Admin User', 'Sarah Wilson', 'Mike Chen'][Math.floor(Math.random() * 3)],
      admin_email: ['admin@ecowave.com', 'sarah.wilson@ecowave.com', 'mike.chen@ecowave.com'][Math.floor(Math.random() * 3)],
      admin_avatar: null
    }));
  };

  const filterHistory = (timeRange: string) => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return history;
    }

    return history.filter(item => new Date(item.created_at) >= startDate);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    error,
    filterHistory,
    refetch: fetchHistory
  };
}