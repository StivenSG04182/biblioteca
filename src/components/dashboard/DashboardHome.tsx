import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

interface Stats {
  totalVisits: number;
  totalQuestions: number;
  mostAskedQuestion: string;
  leastAskedQuestion: string;
  recentActivity: Array<{
    id: number;
    action: string;
    timestamp: string;
  }>;
}

function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalQuestions: 0,
    mostAskedQuestion: '',
    leastAskedQuestion: '',
    recentActivity: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Resumen del Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Visitas</p>
              <p className="text-2xl font-bold">{stats.totalVisits}</p>
            </div>
            <Users className="w-8 h-8 text-cyan-500" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Preguntas Disponibles</p>
              <p className="text-2xl font-bold">{stats.totalQuestions}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-cyan-500" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Más Consultada</p>
              <p className="text-sm text-gray-300 mt-1">{stats.mostAskedQuestion}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Menos Consultada</p>
              <p className="text-sm text-gray-300 mt-1">{stats.leastAskedQuestion}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <div>
                <p className="text-sm">{activity.action}</p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;