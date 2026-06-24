import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { Loader } from './ui/Loader';
import { ErrorState } from './ui/ErrorState';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [donorName, setDonorName] = useState('Donor');
  const [navScrolled, setNavScrolled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesImpacted: 0,
    nextEligibleDate: 'Eligible Now'
  });
  const [donations, setDonations] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);

  const totalDonations = useCountUp(stats.totalDonations);
  const livesImpacted = useCountUp(stats.livesImpacted);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, donationsRes, urgentRes] = await Promise.all([
        api.get('/donor/stats'),
        api.get('/donor/donations'),
        api.get('/donor/urgent-requests')
      ]);
      
      setStats({
        totalDonations: statsRes.data.totalDonations,
        livesImpacted: statsRes.data.livesImpacted,
        nextEligibleDate: statsRes.data.nextEligibleDate 
          ? new Date(statsRes.data.nextEligibleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
          : 'Eligible Now'
      });
      setDonations(donationsRes.data.donations || []);
      setUrgentRequests(urgentRes.data || []);
    } catch (err) {
      console.error("Error loading donor dashboard data", err);
      setError("An error occurred while loading donor statistics and logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (!stored) {
      navigate('/');
      return;
    }
    
    const data = JSON.parse(stored);
    if (data.fullName) setDonorName(data.fullName.split(' ')[0]);

    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const handlePledge = async (emergencyId) => {
    try {
      await api.post('/donor/pledge', {
        emergencyId: parseInt(emergencyId, 10),
        units: 1
      });
      toast.success("Thank you! Your pledge to donate has been registered.");
      
      // Refresh dashboard data
      const [statsRes, donationsRes, urgentRes] = await Promise.all([
        api.get('/donor/stats'),
        api.get('/donor/donations'),
        api.get('/donor/urgent-requests')
      ]);
      setStats({
        totalDonations: statsRes.data.totalDonations,
        livesImpacted: statsRes.data.livesImpacted,
        nextEligibleDate: statsRes.data.nextEligibleDate 
          ? new Date(statsRes.data.nextEligibleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
          : 'Eligible Now'
      });
      setDonations(donationsRes.data.donations || []);
      setUrgentRequests(urgentRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit pledge. Please check eligibility.");
    }
  };

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) {
        localStorage.removeItem(key);
      }
    });
    navigate('/');
  };

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen selection:bg-[#c8102e] selection:text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-[#E0DAD4]'
            : 'bg-white/90 backdrop-blur-md border-b border-[#E0DAD4]'
        }`}
        style={{ height: 72 }}
      >
        <div className="flex justify-between items-center h-full w-full px-6 md:px-10 lg:px-16">
          <Link
            to="/dashboard"
            className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0"
            style={{ fontFeatureSettings: '"liga" 0' }}
          >
            RaktSetu
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link to="/find-camps" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">Find Camps</Link>
            <Link to="/dashboard" className="text-[14px] font-[600] text-[#BE1F2E] border-b-2 border-[#BE1F2E] pb-1 whitespace-nowrap">My Impact</Link>
            <Link to="/edit-profile" className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors whitespace-nowrap">Profile</Link>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            <button 
              onClick={handleLogout}
              className="px-5 py-2 text-[14px] font-[600] text-[#5A5A5A] hover:bg-[rgba(26,18,16,0.06)] rounded-full transition-all whitespace-nowrap"
            >
              Sign Out
            </button>
            <div className="w-10 h-10 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0" onClick={() => navigate('/edit-profile')}>
              <img className="w-full h-full object-cover" alt="Profile" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces" />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32 w-full px-6 md:px-10 lg:px-16">
        {isLoading ? (
          <Loader message="Loading donor profile and stats..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDashboardData} />
        ) : (
          <>
            {/* Editorial Greeting */}
        <section className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-serif text-[60px] md:text-[100px] italic leading-none mb-4 tracking-[-0.04em]">
              Welcome back, <span className="text-[#c8102e]">{donorName}.</span>
            </h1>
            <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
              Your commitment to the clinical supply chain directly supports local trauma centers. Your precision saves lives.
            </p>
          </div>
          
          {/* Availability Toggle */}
          <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-5 flex items-center gap-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] shrink-0">
            <div>
              <p className="text-[15px] font-[600] text-[#1b1c1a]">Available to Donate</p>
              <p className="text-[13px] text-[#737373]">
                {isAvailable ? 'Emergency alerts active' : 'Alerts paused'}
              </p>
            </div>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${isAvailable ? 'bg-[#10B981]' : 'bg-[#D8D0CA]'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Cards Bento */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr] gap-6">
              {/* Total Donations */}
              <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
                <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#c8102e]/5 select-none transition-transform group-hover:scale-110">01</span>
                <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Total Donations</p>
                <div className="flex items-end gap-2">
                  <h2 className="font-serif text-[60px] leading-[54px] text-[#c8102e]">{totalDonations}</h2>
                  <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Units</span>
                </div>
              </div>

              {/* Lives Impacted */}
              <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
                <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#c8102e]/5 select-none transition-transform group-hover:scale-110">02</span>
                <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Lives Impacted</p>
                <div className="flex items-end gap-2">
                  <h2 className="font-serif text-[60px] leading-[54px] text-[#c8102e]">{livesImpacted}</h2>
                  <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Lives</span>
                </div>
              </div>

              {/* Next Eligibility */}
              <div className="bg-[#1a1210] p-8 rounded-lg relative overflow-hidden group">
                <p className="text-[12px] font-[600] tracking-[0.05em] text-white/60 uppercase mb-4">Next Eligible Date</p>
                <h2 className="text-[24px] font-[500] leading-[32px] text-white">{stats.nextEligibleDate}</h2>
                <div className="mt-4 inline-flex items-center gap-2 text-[#ffb3b1]">
                  <span className="text-[14px] font-[500]">Keep tracking your logs</span>
                </div>
              </div>
            </div>

            {/* Recent Donations Table */}
            <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
              <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
                <h3 className="text-[24px] font-[500] italic">Recent Donations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f5f3f0]">
                    <tr>
                      <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Date</th>
                      <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Location</th>
                      <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Type</th>
                      <th className="px-6 py-4 text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(26,18,16,0.09)]">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-[#737373]">No recent donations recorded.</td>
                      </tr>
                    ) : (
                      donations.map((d, idx) => (
                        <tr key={d.id || idx} className="hover:bg-[#faf8f5] transition-colors">
                          <td className="px-6 py-4 text-[14px] font-[500]">{d.date}</td>
                          <td className="px-6 py-4 text-[16px] text-[#685c59]">{d.location}</td>
                          <td className="px-6 py-4 text-[16px] text-[#685c59]">{d.type}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[rgba(34,160,107,0.1)] text-[#22A06B]">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Urgent Requests Sidebar */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 text-[#c8102e] mb-6">
                <h3 className="text-[24px] font-[500] italic">Urgent Requests</h3>
              </div>

              <div className="space-y-8">
                {urgentRequests.length === 0 ? (
                  <p className="text-xs text-[#737373] text-center py-8">No active urgent requests within your radius.</p>
                ) : (
                  urgentRequests.map((req) => (
                    <div key={req.id} className="p-6 bg-[#f5f3f0] rounded-lg border border-[rgba(26,18,16,0.09)]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#BE1F2E]/10 text-[#BE1F2E]`}>
                            {req.urgencyLabel || 'Critical Shortage'}
                          </span>
                          <h4 className="text-[18px] font-[500] mt-2 leading-tight">{req.hospitalName}</h4>
                          <p className="text-xs text-[#737373] mt-0.5">{req.distanceKm} km away</p>
                        </div>
                        <div className="bg-[#c8102e] text-white w-10 h-10 flex items-center justify-center rounded font-bold text-lg shrink-0 ml-2">{req.bloodGroup}</div>
                      </div>
                      
                      {req.message && (
                        <p className="text-xs text-[#5A5A5A] mb-4 italic leading-relaxed">"{req.message}"</p>
                      )}

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-[12px] font-[600] text-[#737373]">
                          <span>Fulfillment Progress</span>
                          <span className="font-bold">{req.fulfillmentProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#eae8e5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#c8102e]" style={{ width: `${req.fulfillmentProgress}%` }}></div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handlePledge(req.id)}
                        className="w-full bg-[#BE1F2E] text-white py-3 rounded-full text-[14px] font-[600] hover:bg-[#a31825] hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Pledge to Donate
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1210] border-t border-white/10 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-6 md:px-10 lg:px-16 gap-16">
          <div className="max-w-sm">
            <div className="font-serif text-[40px] text-white italic mb-6 leading-none">RaktSetu</div>
            <p className="text-[#737373] text-[14px] leading-relaxed">
              © 2026 RaktSetu. Clinical Excellence in Blood Logistics. Operating at the intersection of medical science and logistical intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
