import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DonorRegistration from './components/DonorRegistration';
import ProfileSetup from './components/ProfileSetup';
import LocationPage from './components/LocationPage';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import FindCamps from './components/FindCamps';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register-donor" element={<DonorRegistration />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/find-camps" element={<FindCamps />} />
      </Routes>
    </Router>
  );
}

export default App;
