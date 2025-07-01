import { useState, useEffect } from 'react';
import { dataService, DashboardStats, MonthlyEngagement } from '../lib/dataService';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeEvents: 0,
    rewardsRedeemed: 0,
    engagementRate: 0
  });
  const [monthlyEngagement, setMonthlyEngagement] = useState<MonthlyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats and monthly engagement
      const [dashboardStats, monthlyData] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getMonthlyEngagement()
      ]);

      setStats(dashboardStats);
      setMonthlyEngagement(monthlyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Use mock data as fallback
      const mockData = generateMockMonthlyData();
      setMonthlyEngagement(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMonthlyData = (): MonthlyEngagement[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return months.map((month, index) => ({
      month,
      year: currentYear,
      participants: Math.floor(Math.random() * 50) + 20, // 20-70 participants
      events: Math.floor(Math.random() * 8) + 2, // 2-10 events
      feedback: Math.floor(Math.random() * 30) + 10, // 10-40 feedback
      rewards_redeemed: Math.floor(Math.random() * 15) + 5 // 5-20 rewards
    }));
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    monthlyEngagement,
    loading,
    error,
    refetch: fetchDashboardStats
  };
}