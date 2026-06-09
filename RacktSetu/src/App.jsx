import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DonorRegistration from './components/DonorRegistration';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register-donor" element={<DonorRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
