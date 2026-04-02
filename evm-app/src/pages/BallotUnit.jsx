import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, XCircle } from 'lucide-react';
import { getElectionById, updateElection } from '../utils/db';

const BallotUnit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState('idle'); // idle, voting, voted
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    loadElectionData();
  }, [id]);

  const loadElectionData = async () => {
    const data = await getElectionById(id);
    if (data) setElection(data);
    else navigate('/dashboard');
  };

  // EVM ബീപ്പ് ശബ്ദം ഉണ്ടാക്കാനുള്ള ഫങ്ക്ഷൻ (ഓഫ്‌ലൈൻ)
  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime); // ശബ്ദത്തിന്റെ ഫ്രീക്വൻസി
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    // 2 സെക്കന്റ് കഴിഞ്ഞ് ശബ്ദം നിർത്തുക
    setTimeout(() => { osc.stop(); }, 2000); 
  };

  const handleVote = async (candidateId, candidateName, candidateLogo) => {
    if (votingStatus !== 'idle') return; // ഒരാൾ ഒന്നിൽ കൂടുതൽ തവണ അമർത്തുന്നത് തടയാൻ
    
    setVotingStatus('voting');
    playBeep();
    setSelectedCandidate({ id: candidateId, name: candidateName, logo: candidateLogo });

    // വോട്ട് ഡാറ്റാബേസിൽ അപ്ഡേറ്റ് ചെയ്യുക
    const updatedVotes = { ...election.votes };
    updatedVotes[candidateId] = (updatedVotes[candidateId] || 0) + 1;
    await updateElection(id, { votes: updatedVotes });

    // 2.5 സെക്കന്റിന് ശേഷം തിരികെ കൺട്രോൾ യൂണിറ്റിലേക്ക് പോകുക
    setTimeout(() => {
      navigate(`/control-unit/${id}`);
    }, 2500);
  };

  if (!election) return <div className="p-10 text-center text-lg font-bold">Loading Ballot Unit...</div>;

  // NOTA ഓപ്ഷൻ എപ്പോഴും അവസാനം വരാൻ വേണ്ടി സ്ഥാനാർത്ഥികളുടെ ലിസ്റ്റിലേക്ക് ചേർക്കുന്നു
  const allCandidates = [
    ...election.candidates,
    { id: 'nota', name: 'NOTA (None of the Above)', logo: null, isNota: true }
  ];

  return (
    <div className="min-h-screen bg-gray-200 p-4 flex flex-col items-center justify-center relative">
      
      {/* VVPAT സ്ക്രീൻ (വോട്ട് ചെയ്യുമ്പോൾ മാത്രം കാണിക്കാൻ) */}
      {votingStatus === 'voting' && selectedCandidate && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 w-64 border-8 border-gray-300 flex flex-col items-center text-center animate-pulse">
            <p className="text-xs font-bold text-gray-500 mb-2 border-b w-full pb-1">VVPAT SLIP</p>
            {selectedCandidate.logo ? (
              <img src={selectedCandidate.logo} alt="logo" className="w-16 h-16 object-cover mb-3 grayscale" />
            ) : selectedCandidate.id === 'nota' ? (
              <XCircle className="w-16 h-16 text-black mb-3" />
            ) : (
              <User className="w-16 h-16 text-black mb-3" />
            )}
            <h2 className="text-xl font-extrabold uppercase text-black">{selectedCandidate.name}</h2>
            <p className="text-xs font-bold mt-4 pt-2 border-t w-full text-gray-400">EVM Simulator</p>
          </div>
        </div>
      )}

      {/* Ballot Unit (EVM മെഷീൻ ഡിസൈൻ) */}
      <div className="bg-gray-100 p-4 rounded-xl shadow-2xl w-full max-w-md border-x-4 border-b-8 border-t-2 border-gray-400">
        <div className="bg-white p-1 rounded-lg border-2 border-gray-300">
          
          {/* മുകളിലെ ഹെഡ്ഡിംഗ് */}
          <div className="bg-green-100 flex justify-between items-center p-2 mb-2 border-b-2 border-gray-300 rounded-t-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-inner"></div>
              <p className="text-[10px] font-bold text-green-800">READY</p>
            </div>
            <p className="text-xs font-black text-gray-600">BALLOT UNIT</p>
          </div>

          {/* സ്ഥാനാർത്ഥികളുടെ ലിസ്റ്റ് */}
          <div className="space-y-1">
            {allCandidates.map((c, index) => (
              <div key={c.id} className="flex items-center bg-gray-50 border-b-2 border-gray-300 p-2 gap-3">
                
                {/* Serial Number */}
                <div className="w-8 h-8 bg-white border border-gray-300 flex items-center justify-center font-bold text-sm shadow-inner rounded-sm">
                  {index + 1}
                </div>

                {/* Name & Logo Area */}
                <div className="flex-1 bg-white border border-gray-300 p-1 flex items-center justify-between shadow-inner rounded-sm h-14">
                  <p className={`font-bold text-sm ml-2 ${c.isNota ? 'text-red-600' : 'text-gray-900'} uppercase max-w-[120px] truncate`}>
                    {c.name}
                  </p>
                  <div className="w-10 h-10 border border-gray-200 flex items-center justify-center bg-gray-50 mr-1">
                    {c.logo ? (
                      <img src={c.logo} alt="symbol" className="w-full h-full object-cover" />
                    ) : c.isNota ? (
                      <XCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Red Light Indicator */}
                <div className={`w-4 h-4 rounded-full border-2 border-gray-400 shadow-inner ${votingStatus === 'voting' && selectedCandidate?.id === c.id ? 'bg-red-600 shadow-red-500/50 shadow-lg' : 'bg-red-900'}`}></div>

                {/* Blue Voting Button */}
                <button 
                  onClick={() => handleVote(c.id, c.name, c.logo)}
                  disabled={votingStatus !== 'idle'}
                  className="w-12 h-10 bg-blue-600 rounded-full border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-md flex items-center justify-center cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed"
                >
                </button>
              </div>
            ))}
          </div>

        </div>
        
        <p className="text-center text-[10px] font-bold text-gray-500 mt-3">ELECTION COMMISSION SIMULATOR</p>
      </div>

    </div>
  );
};

export default BallotUnit;
