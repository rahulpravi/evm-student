import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Settings, Save, ImagePlus } from 'lucide-react';
import { saveElection } from '../utils/db';

const Setup = () => {
  const navigate = useNavigate();
  const [electionName, setElectionName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [candidates, setCandidates] = useState([
    { id: 1, name: '', logo: null },
    { id: 2, name: '', logo: null }
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // പുതിയ ടൈം സ്റ്റേറ്റുകൾ
  const [totalVoters, setTotalVoters] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [resultTime, setResultTime] = useState('');

  const addCandidate = () => {
    setCandidates([...candidates, { id: Date.now(), name: '', logo: null }]);
  };

  const removeCandidate = (id) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter(c => c.id !== id));
    } else {
      alert("കുറഞ്ഞത് 2 സ്ഥാനാർത്ഥികൾ എങ്കിലും വേണം!");
    }
  };

  const handleCandidateChange = (id, value) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, name: value } : c));
  };

  const handleLogoChange = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCandidates(candidates.map(c => c.id === id ? { ...c, logo: reader.result } : c));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      alert('പാസ്‌വേർഡുകൾ (PIN) തമ്മിൽ ചേരുന്നില്ല!');
      return;
    }
    if (pin.length !== 4) {
      alert('പാസ്‌വേർഡ് 4 അക്ക നമ്പറായിരിക്കണം!');
      return;
    }

    const electionData = {
      name: electionName,
      pin,
      candidates,
      totalVoters: totalVoters || null,
      startTime: startTime || null,
      endTime: endTime || null,
      resultTime: resultTime || null
    };

    try {
      await saveElection(electionData);
      alert('ഇലക്ഷൻ വിജയകരമായി സേവ് ചെയ്തു!');
      navigate('/dashboard');
    } catch (error) {
      alert('സേവ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">പുതിയ ഇലക്ഷൻ</h1>
      </header>

      <form onSubmit={handleSave} className="p-4 space-y-6 flex-1 overflow-y-auto pb-20">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ഇലക്ഷന്റെ പേര്</label>
            <input required type="text" value={electionName} onChange={(e) => setElectionName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ഉദാ: School Parliament 2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
              <input required type="password" maxLength="4" pattern="\d{4}" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none text-center tracking-widest text-lg focus:ring-2 focus:ring-blue-500" placeholder="****" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
              <input required type="password" maxLength="4" pattern="\d{4}" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none text-center tracking-widest text-lg focus:ring-2 focus:ring-blue-500" placeholder="****" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-md font-bold text-gray-800">സ്ഥാനാർത്ഥികൾ</h2>
            <button type="button" onClick={addCandidate} className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium hover:bg-blue-200 transition-colors">
              <Plus className="w-4 h-4" /> ആഡ് ചെയ്യുക
            </button>
          </div>
          <div className="space-y-3">
            {candidates.map((c, index) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full text-xs font-bold text-gray-500 flex-shrink-0">{index + 1}</span>
                <label className="cursor-pointer flex-shrink-0">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange(c.id, e.target.files[0])} />
                  {c.logo ? (
                    <img src={c.logo} alt="logo" className="w-10 h-10 object-cover rounded-lg border border-gray-300" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-50 border border-dashed border-gray-400 rounded-lg flex items-center justify-center hover:bg-slate-100">
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </label>
                <input required type="text" value={c.name} onChange={(e) => handleCandidateChange(c.id, e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="സ്ഥാനാർത്ഥിയുടെ പേര്" />
                <button type="button" onClick={() => removeCandidate(c.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full text-left font-medium text-gray-700 outline-none">
            <span className="flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" /> അഡ്വാൻസ്ഡ് ഓപ്ഷൻസ്</span>
            <span>{showAdvanced ? '-' : '+'}</span>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ആകെ വോട്ടർമാർ (Optional)</label>
                <input type="number" value={totalVoters} onChange={(e) => setTotalVoters(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="ഉദാ: 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">വോട്ടിംഗ് തുടങ്ങുന്ന സമയം</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">വോട്ടിംഗ് അവസാനിക്കുന്ന സമയം</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">റിസൾട്ട് പബ്ലിഷ് ചെയ്യുന്ന സമയം</label>
                <input type="datetime-local" value={resultTime} onChange={(e) => setResultTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95">
          <Save className="w-5 h-5" /> ഇലക്ഷൻ സേവ് ചെയ്യുക
        </button>
      </form>
    </div>
  );
};

export default Setup;
