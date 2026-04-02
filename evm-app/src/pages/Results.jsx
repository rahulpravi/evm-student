import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, BarChart3, Users, Loader2 } from 'lucide-react';
import { getElectionById } from '../utils/db';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryView, setIsHistoryView] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const data = await getElectionById(id);
    if (data) {
      setElection(data);
      // ഇലക്ഷൻ നേരത്തെ തന്നെ പൂർത്തിയായതാണെങ്കിൽ (History), ഇത് ഹിസ്റ്ററി വ്യൂ ആണ്
      if (data.status === 'completed') {
        setIsHistoryView(true);
        // ഹിസ്റ്ററി വ്യൂവിൽ ചെറിയൊരു ലോഡിംഗ് (1 സെക്കന്റ്)
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        setIsHistoryView(false);
        // പുതിയ റിസൾട്ട് ആണെങ്കിൽ വോട്ടെണ്ണൽ ആനിമേഷൻ (2.5 സെക്കന്റ്)
        setTimeout(() => setIsLoading(false), 2500);
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (!election) return null;

  // ലോഡിംഗ് അല്ലെങ്കിൽ വോട്ടെണ്ണൽ സ്ക്രീൻ
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-6 text-white text-center">
        {isHistoryView ? (
          <>
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-400" />
            <h2 className="text-xl font-medium opacity-80">Loading Result...</h2>
          </>
        ) : (
          <>
            <BarChart3 className="w-16 h-16 mb-6 animate-bounce text-blue-400" />
            <h2 className="text-2xl font-bold mb-2 animate-pulse">വോട്ടുകൾ എണ്ണുന്നു...</h2>
            <p className="text-gray-400">ദയവായി കാത്തിരിക്കുക</p>
          </>
        )}
      </div>
    );
  }

  const allCandidates = [
    ...election.candidates,
    { id: 'nota', name: 'NOTA', logo: null }
  ];

  const results = allCandidates.map(c => ({
    ...c,
    votes: election.votes?.[c.id] || 0
  })).sort((a, b) => b.votes - a.votes);

  const totalVotes = results.reduce((sum, c) => sum + c.votes, 0);
  const winner = results[0];
  const isTie = results.length > 1 && results[0].votes === results[1].votes && results[0].votes > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">തിരഞ്ഞെടുപ്പ് ഫലം</h1>
      </header>

      <div className="p-4 flex-1 overflow-y-auto pb-10 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
          <h2 className="text-xl font-bold text-gray-800 uppercase">{election.name}</h2>
          <div className="flex justify-center items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
            <Users className="w-4 h-4" /> ആകെ പോൾ ചെയ്ത വോട്ടുകൾ: {totalVotes}
          </div>
        </div>

        {totalVotes > 0 ? (
          <>
            <div className="bg-gradient-to-br from-yellow-100 to-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 text-center flex flex-col items-center">
              <Trophy className="w-16 h-16 text-yellow-500 mb-3" />
              <h3 className="text-sm font-bold text-amber-800 mb-1">
                {isTie ? "സമനില (TIE)!" : "വിജയി"}
              </h3>
              <h2 className="text-2xl font-extrabold text-gray-900 uppercase">
                {isTie ? "ഒന്നിലധികം പേർക്ക് തുല്യ വോട്ട്" : winner.name}
              </h2>
              {!isTie && <p className="text-amber-700 font-bold mt-2">{winner.votes} വോട്ടുകൾ</p>}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 uppercase text-sm tracking-wider">Results Detail</h3>
              <div className="space-y-4">
                {results.map((c, index) => {
                  const percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between items-end text-sm font-bold text-gray-700">
                        <span className="flex items-center gap-2 uppercase">
                          {index === 0 && !isTie && totalVotes > 0 && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                          {c.name}
                        </span>
                        <span>{c.votes} വോട്ട് ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${index === 0 && !isTie && c.votes > 0 ? 'bg-green-500' : c.id === 'nota' ? 'bg-red-400' : 'bg-blue-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
            <p className="text-gray-500 font-medium">ആരും വോട്ട് ചെയ്തിട്ടില്ല!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
