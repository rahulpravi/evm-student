import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, PlayCircle, Lock, LayoutDashboard, ChevronRight } from 'lucide-react';
import { getAllElections } from '../utils/db';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [elections, setElections] = useState([]);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    const data = await getAllElections();
    setElections(data);
  };

  const filteredElections = elections.filter(el => 
    activeTab === 'active' ? el.status === 'active' : el.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6" />
        <h1 className="text-xl font-bold">EVM Dashboard</h1>
      </header>

      <div className="flex bg-white shadow-sm mb-4">
        <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          <PlayCircle className="w-4 h-4" /> ആക്ടീവ് ഇലക്ഷൻ
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          <Clock className="w-4 h-4" /> ഹിസ്റ്ററി
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-24">
        {filteredElections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-20">
            <Lock className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-600">ലിസ്റ്റ് ലഭ്യമല്ല</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredElections.map(el => (
              <div 
                key={el.id} 
                onClick={() => navigate(activeTab === 'active' ? `/control-unit/${el.id}` : `/results/${el.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer active:scale-95"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{el.name}</h3>
                  <p className="text-xs text-gray-500">{el.candidates.length} സ്ഥാനാർത്ഥികൾ</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => navigate('/setup')} className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default Dashboard;
