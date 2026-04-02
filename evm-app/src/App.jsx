
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import ControlUnit from './pages/ControlUnit';
import BallotUnit from './pages/BallotUnit';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/control-unit/:id" element={<ControlUnit />} />
          <Route path="/ballot-unit/:id" element={<BallotUnit />} />
          <Route path="/results/:id" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
