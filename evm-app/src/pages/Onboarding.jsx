import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, CheckCircle2, AlertCircle } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Vote className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">EVM Simulator</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          ഇന്ത്യൻ തിരഞ്ഞെടുപ്പ് പ്രക്രിയയും വോട്ടിംഗ് മെഷീനും (EVM) എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് മനസ്സിലാക്കാൻ ഈ ആപ്പ് സഹായിക്കും.
        </p>

        <div className="text-left space-y-4 mb-10 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">സ്ഥാനാർത്ഥികളെയും ചിഹ്നങ്ങളെയും ചേർത്ത് സ്വന്തമായി തിരഞ്ഞെടുപ്പ് നടത്താം.</p>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">Control Unit, Ballot Unit എന്നിവയുടെ യഥാർത്ഥ പ്രവർത്തനം പഠിക്കാം.</p>
          </div>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-700">100% Offline. ഇന്റർനെറ്റ് ആവശ്യമില്ല.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          തുടങ്ങാം 
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
