import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, User } from 'lucide-react';

interface ChartListProps {
  onSelectChart: (chart: any) => void;
  onNewChart: () => void;
}

const ChartList: React.FC<ChartListProps> = ({ onSelectChart, onNewChart }) => {
  const { user } = useAuth();
  const [charts, setCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'charts'));
        const chartsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCharts(chartsData);
      } catch (error) {
        console.error("Error fetching charts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, [user]);

  if (loading) return <div className="text-white">Loading charts...</div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-vedic-gold">Your Cosmic Records</h2>
        <button 
          onClick={onNewChart}
          className="flex items-center space-x-2 px-4 py-2 bg-vedic-gold text-vedic-blue rounded-full hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <motion.div
            key={chart.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectChart(chart)}
            className="glass-panel p-6 rounded-xl cursor-pointer hover:border-vedic-gold/50 transition-colors group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/5 rounded-full group-hover:bg-vedic-gold/20 transition-colors">
                <User className="w-6 h-6 text-vedic-gold" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{chart.name}</h3>
                <p className="text-sm text-gray-400">{chart.date} • {chart.time}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              {chart.location?.name}
            </div>
          </motion.div>
        ))}

        {charts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No charts found. Create your first cosmic blueprint.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartList;
