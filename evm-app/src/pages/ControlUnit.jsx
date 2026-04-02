import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Power, RotateCcw, ShieldCheck } from 'lucide-react';
import { getElectionById, updateElection } from '../utils/db';

const ControlUnit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  
  // സുരക്ഷയ്ക്കുള്ള സ്റ്റേറ്റുകൾ
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    loadElectionData();
  }, [id]);

  const loadElectionData = async () => {
    const data = await getElectionById(id);
    if (data) {
      setElection(data);
    } else {
      alert("ഇലക്ഷൻ വിവരങ്ങൾ ലഭ്യമല്ല!");
      navigate('/dashboard');
    }
  };

  // വോട്ടുകളുടെ എണ്ണം കാൽക്കുലേറ്റ് ചെയ്യാൻ
  const getTotalVotesPolled = () => {
    if (!election || !election.votes) return 0;
    return Object.values(election.votes).reduce((sum, count) => sum + count, 0);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === election.pin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleUnlockBallot = () => {
    // വോട്ട് ചെയ്യാൻ Ballot Unit ലേക്ക് പോകുന്നു
    navigate(`/ballot-unit/${id}`);
  };

  const handleClearData = async () => {
    if (window.confirm("ഉറപ്പാണോ? ഇതുവരെ ചെയ്ത വോട്ടുകൾ എല്ലാം ഡിലീറ്റ് ആകും! (Mock Poll Clear)")) {
      await updateElection(id, { votes: {} });
      loadElectionData();
      alert("വോട്ടുകൾ എല്ലാം മായ്ച്ചു (Cleared)!");
    }
  };

  const handleCloseElection = async () => {
    if (window.confirm("ഇലക്ഷൻ ക്ലോസ് ചെയ്യുകയാണോ? പിന്നീട് ആർക്കും വോട്ട് ചെയ്യാൻ കഴിയില്ല.")) {
      await updateElection(id, { status: 'completed' });
      navigate(`/results/${id}`);
    }
  };

  if (!election) return <div className="p-10 text-center">Loading...</div>;

  // പാസ്‌വേർഡ് ചോദിക്കുന്ന സ്ക്രീൻ (Locked Screen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Control Unit Locked</h2>
          <p className="text-sm text-gray-500 mb-6">{election.name} തുറക്കാൻ PIN നൽകുക</p>
          
          <form onSubmit={handlePinSubmit}>
            <input 
              type="password" 
              maxLength="4" 
              pattern="\d{4}" 
              value={pinInput} 
              onChange={(e) => setPinInput(e.target.value)} 
              className={`w-full border rounded-xl p-3 text-center tracking-widest text-2xl font-bold outline-none focus:ring-2 ${pinError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} mb-4`} 
              placeholder="****" 
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm mb-4">തെറ്റായ PIN! വീണ്ടും ശ്രമിക്കുക.</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700">
              Unlock EVM
            </button>
          </form>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // യഥാർത്ഥ Control Unit സ്ക്രീൻ (Unlocked)
  const totalPolled = getTotalVotesPolled();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-800 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-slate-700 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Control Unit (CU)</h1>
        </div>
        <ShieldCheck className="w-6 h-6 text-green-400" />
      </header>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* ഇലക്ഷൻ വിവരങ്ങൾ */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-extrabold text-gray-800">{election.name}</h2>
          <div className="flex justify-center gap-6 mt-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">TOTAL VOTERS</p>
              <p className="text-xl font-bold text-blue-700">{election.totalVoters || 'N/A'}</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">VOTES POLLED</p>
              <p className="text-xl font-bold text-green-700">{totalPolled}</p>
            </div>
          </div>
        </div>

        {/* മെയിൻ കൺട്രോളുകൾ */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center gap-6">
          
          <button 
            onClick={handleUnlockBallot}
            className="w-full bg-blue-600 active:bg-blue-800 text-white font-bold py-6 rounded-2xl shadow-xl shadow-blue-200 flex flex-col items-center justify-center gap-2 transform active:scale-95 transition-all"
          >
            <Unlock className="w-10 h-10 mb-1" />
            <span className="text-lg uppercase tracking-wider">Unlock Ballot Unit</span>
            <span className="text-xs font-normal opacity-80">(അടുത്ത ആൾക്ക് വോട്ട് ചെയ്യാൻ)</span>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button 
              onClick={handleClearData}
              className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold py-4 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="text-sm">Clear (Mock Poll)</span>
            </button>
            
            <button 
              onClick={handleCloseElection}
              className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-4 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-transform"
            >
              <Power className="w-6 h-6" />
              <span className="text-sm">Close Election</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ControlUnit;
