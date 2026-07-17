import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { Loader } from './ui/Loader';
import { ErrorState } from './ui/ErrorState';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    let rafId;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  // When target is falsy, derive 0 directly instead of resetting via effect
  return target ? value : 0;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [donorName, setDonorName] = useState('Donor');
  const [initialLetter, setInitialLetter] = useState('D');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ totalDonations: 0, livesImpacted: 0, nextEligibleDate: 'Eligible Now' });
  const [donations, setDonations] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);

  const totalDonations = useCountUp(stats.totalDonations);
  const livesImpacted  = useCountUp(stats.livesImpacted);

  const handleLogout = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('raktsetu_')) localStorage.removeItem(key);
    });
    navigate('/');
  };

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);
    try {
      const [statsRes, donationsRes, urgentRes] = await Promise.all([
        api.get('/donor/stats'),
        api.get('/donor/donations'),
        api.get('/donor/urgent-requests')
      ]);
      const newStats = {
        totalDonations:  statsRes.data.totalDonations,
        livesImpacted:   statsRes.data.livesImpacted,
        nextEligibleDate: statsRes.data.nextEligibleDate
          ? new Date(statsRes.data.nextEligibleDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Eligible Now'
      };
      setStats(newStats);
      setDonations(donationsRes.data.donations || []);
      setUrgentRequests(urgentRes.data.requests || []);

      // Cache the loaded dashboard data
      localStorage.setItem('raktsetu_cached_stats', JSON.stringify(newStats));
      localStorage.setItem('raktsetu_cached_donations', JSON.stringify(donationsRes.data.donations || []));
      localStorage.setItem('raktsetu_cached_urgent', JSON.stringify(urgentRes.data.requests || []));
    } catch (err) {
      console.error('Dashboard load error', err);
      const status = err?.response?.status;
      const code   = err?.response?.data?.code;

      if (status === 401) {
        // Token expired and refresh failed — send to login
        Object.keys(localStorage).forEach(k => { if (k.startsWith('raktsetu_')) localStorage.removeItem(k); });
        navigate('/login');
        return;
      }

      if (status === 404 || code === 'PROFILE_NOT_FOUND') {
        // Donor completed auth but never finished profile setup
        navigate('/profile-setup');
        return;
      }

      if (!isSilent) {
        setError('Failed to load your dashboard. Please try again.');
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (!stored) { navigate('/'); return; }
    const data = JSON.parse(stored);
    if (data.fullName) {
      setDonorName(data.fullName.split(' ')[0]);
      setInitialLetter(data.fullName.charAt(0).toUpperCase());
    }
    if (data.photoUrl) {
      setProfilePhoto(data.photoUrl);
    }

    // Try loading from SWR cache first for instant render
    const cachedStats = localStorage.getItem('raktsetu_cached_stats');
    const cachedDonations = localStorage.getItem('raktsetu_cached_donations');
    const cachedUrgent = localStorage.getItem('raktsetu_cached_urgent');

    if (cachedStats && cachedDonations && cachedUrgent) {
      try {
        setStats(JSON.parse(cachedStats));
        setDonations(JSON.parse(cachedDonations));
        setUrgentRequests(JSON.parse(cachedUrgent));
        setIsLoading(false); // Bypass loading spinner!
        fetchDashboardData(true); // Silent validation in background
        return;
      } catch (e) {
        // Parse error fallback to full load
      }
    }

    fetchDashboardData(false);
  }, [navigate, fetchDashboardData]);

  const handlePledge = async (emergencyId) => {
    try {
      await api.post('/donor/pledge', { emergencyId: parseInt(emergencyId, 10), units: 1 });
      toast.success('Thank you! Your pledge has been registered.');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit pledge.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#fbf9f6] min-h-screen flex items-center justify-center">
        <Loader message="Loading donor profile and stats..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fbf9f6] min-h-screen flex items-center justify-center px-4">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── DESKTOP LAYOUT (md:block hidden) ───────────────────── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <DonorNavbar />
        <main className="pt-28 pb-24 w-full px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
          {/* Greeting + Availability Toggle */}
          <section className="mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="min-w-0">
              <h1 className="font-serif italic leading-none tracking-[-0.04em] break-words text-[60px] lg:text-[100px]">
                Welcome back, <span className="text-[#BE1F2E]">{donorName}.</span>
              </h1>
              <p className="text-[16px] lg:text-[18px] text-[#737373] mt-3 max-w-2xl leading-relaxed">
                Your commitment supports local trauma centers. Your precision saves lives.
              </p>
            </div>

            {/* Availability Toggle */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-2xl p-4 flex items-center gap-4 shadow-sm shrink-0">
              <div>
                <p className="text-[14px] font-[600] text-[#1b1c1a]">Available to Donate</p>
                <p className="text-[12px] text-[#737373]">
                  {isAvailable ? 'Emergency alerts active' : 'Alerts paused'}
                </p>
              </div>
              <button aria-label="Toggle donation availability" type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex shrink-0 ${
                  isAvailable ? 'bg-[#10B981]' : 'bg-[#D8D0CA]'
                }`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </section>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-8 rounded-xl border border-[rgba(26,18,16,0.09)] relative overflow-hidden group shadow-sm">
              <span className="absolute -bottom-4 -right-2 font-serif text-[100px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110 pointer-events-none">01</span>
              <p className="text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-3">Total Donations</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-none text-[#BE1F2E]">{totalDonations}</h2>
                <span className="text-[13px] font-[500] text-[#737373] mb-2 italic">Units</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[rgba(26,18,16,0.09)] relative overflow-hidden group shadow-sm">
              <span className="absolute -bottom-4 -right-2 font-serif text-[100px] text-[#BE1F2E]/5 select-none transition-transform group-hover:scale-110 pointer-events-none">02</span>
              <p className="text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-3">Lives Impacted</p>
              <div className="flex items-end gap-2">
                <h2 className="font-serif text-[60px] leading-none text-[#BE1F2E]">{livesImpacted}</h2>
                <span className="text-[13px] font-[500] text-[#737373] mb-2 italic">Lives</span>
              </div>
            </div>

            <div className="bg-[#1a1210] p-8 rounded-xl relative overflow-hidden shadow-sm">
              <p className="text-[11px] font-[600] tracking-[0.05em] text-white/50 uppercase mb-3">Next Eligible Date</p>
              <h2 className="text-[26px] font-[500] leading-tight text-white">{stats.nextEligibleDate}</h2>
              <div className="mt-4 inline-flex items-center gap-2 text-[#ffb3b1]">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="text-[13px] font-[500]">Keep logging your donations</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Donations + Urgent Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-xl border border-[rgba(26,18,16,0.09)] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
                <h3 className="text-[24px] font-[500] italic">Recent Donations</h3>
                <Link to="/find-camps" className="text-[13px] font-[600] text-[#BE1F2E] hover:underline">
                  Find a camp →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[400px]">
                  <thead className="bg-[#f5f3f0]">
                    <tr>
                      {['Date', 'Location', 'Type', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-[11px] font-[600] tracking-[0.05em] text-[#737373] uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(26,18,16,0.06)]">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-[14px] text-[#737373]">
                          No donations recorded yet.{' '}
                          <Link to="/find-camps" className="text-[#BE1F2E] font-[600] hover:underline">Find a camp</Link>
                        </td>
                      </tr>
                    ) : (
                      donations.map((d, idx) => (
                        <tr key={d.id || idx} className="hover:bg-[#faf8f5] transition-colors">
                          <td className="px-6 py-4 text-[14px] font-[500] whitespace-nowrap">{d.date}</td>
                          <td className="px-6 py-4 text-[14px] text-[#685c59] max-w-[180px] truncate">{d.location}</td>
                          <td className="px-6 py-4 text-[14px] text-[#685c59]">{d.type}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-[11px] font-[700] bg-[rgba(34,160,107,0.1)] text-[#22A06B]">
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

            <div className="lg:col-span-4 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#BE1F2E] animate-pulse" />
                <h3 className="text-[22px] font-[500] italic text-[#BE1F2E]">Urgent Requests</h3>
              </div>

              {urgentRequests.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-[40px] text-[#D8D0CA] block mb-3">water_drop</span>
                  <p className="text-[13px] text-[#737373]">No urgent requests in your area.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {urgentRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-[#f5f3f0] rounded-xl border border-[rgba(26,18,16,0.07)]">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-[700] uppercase tracking-wider bg-[#BE1F2E]/10 text-[#BE1F2E] mb-1">
                            {req.urgencyLabel || 'Critical'}
                          </span>
                          <h4 className="text-[15px] font-[500] leading-tight truncate">{req.hospitalName}</h4>
                          <p className="text-[12px] text-[#737373]">{req.distanceKm} km away</p>
                        </div>
                        <div className="bg-[#BE1F2E] text-white w-10 h-10 flex items-center justify-center rounded-lg font-[700] text-[14px] shrink-0">
                          {req.bloodGroup}
                        </div>
                      </div>

                      {req.message && (
                        <p className="text-[12px] text-[#5A5A5A] mb-3 italic leading-relaxed">"{req.message}"</p>
                      )}

                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] font-[600] text-[#737373] mb-1">
                          <span>Fulfillment</span>
                          <span>{req.fulfillmentProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#eae8e5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#BE1F2E] transition-all" style={{ width: `${req.fulfillmentProgress}%` }} />
                        </div>
                      </div>

                      <button type="button"
                        onClick={() => handlePledge(req.id)}
                        className="w-full bg-[#BE1F2E] text-white py-3 rounded-full text-[13px] font-[600] hover:bg-[#a31825] active:scale-95 transition-all"
                      >
                        Pledge to Donate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <DonorFooter />
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── MOBILE LAYOUT (block md:hidden) ────────────────────── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="block md:hidden">
        {/* TopAppBar Shell */}
        <header className="fixed top-0 w-full z-50 bg-[#faf8f5]/95 backdrop-blur-lg border-b border-[rgba(26,18,16,0.09)] flex items-center px-4 h-16 justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="font-serif text-[24px] font-bold text-[#C8102E] tracking-tight shrink-0"
              style={{ fontFeatureSettings: '"liga" 0' }}
            >
              RaktSetu
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="material-symbols-outlined text-[#5c403f] hover:opacity-80 transition-opacity" onClick={() => toast.success("No new notifications.")}>notifications</button>
            
            {/* Profile avatar */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
              style={{ borderColor: 'rgba(200, 16, 46, 0.20)', background: '#eae8e5' }}
              onClick={() => navigate('/edit-profile')}
              role="button"
              aria-label="Edit Profile"
            >
              {profilePhoto ? (
                <img className="w-full h-full object-cover" src={profilePhoto} alt="Profile" />
              ) : (
                <span className="text-[13px] font-bold text-[#C8102E]">{initialLetter}</span>
              )}
            </div>

            {/* Logout button */}
            <button type="button"
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl bg-red-50/60 border border-[rgba(200, 16, 46, 0.15)] text-[#C8102E] hover:bg-red-50 cursor-pointer shadow-sm transition-all"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </header>

        <main className="pt-24 pb-32 px-4 max-w-lg mx-auto">
          {/* Personalized Welcome */}
          <section className="mb-8">
            <h2 className="text-[32px] text-[#1b1c1a] font-serif font-normal leading-tight">
              Welcome back, <span className="italic text-[#BE1F2E]">{donorName}.</span>
            </h2>
            <p className="text-[#5c403f] text-[16px] mt-1">Your next safe donation window is approaching.</p>
          </section>

          {/* Key Metrics Cards */}
          <section className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-[rgba(26,18,16,0.09)] p-6 rounded-xl relative overflow-hidden">
              <span className="absolute -bottom-2 -right-2 font-serif text-[60px] text-[#BE1F2E]/5 select-none pointer-events-none">01</span>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#5c403f] mb-2">Total Donations</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-bold text-[#1b1c1a]">{totalDonations}</span>
                <span className="text-[14px] text-[#BE1F2E] font-semibold">Units</span>
              </div>
            </div>
            <div className="bg-white border border-[rgba(26,18,16,0.09)] p-6 rounded-xl relative overflow-hidden">
              <span className="absolute -bottom-2 -right-2 font-serif text-[60px] text-[#BE1F2E]/5 select-none pointer-events-none">02</span>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#5c403f] mb-2">Lives Impacted</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-bold text-[#1b1c1a]">{livesImpacted}</span>
                <span className="text-[14px] text-[#BE1F2E] font-semibold">Saved</span>
              </div>
            </div>
          </section>

          {/* Next Eligibility Card */}
          <section className="mb-6">
            <div className="bg-[#1a1210] text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BE1F2E]/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[12px] uppercase tracking-widest opacity-60 mb-1">Next Eligibility</p>
                    <h3 className="text-[32px] font-serif italic leading-none">{stats.nextEligibleDate}</h3>
                  </div>
                  <span className="material-symbols-outlined text-[#ffdad8] text-4xl">event_available</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                  <div className="bg-[#BE1F2E] h-full w-[85%] transition-all duration-1000"></div>
                </div>
                <button type="button"
                  onClick={() => navigate('/find-camps')}
                  className="w-full py-3 bg-[#BE1F2E] text-white rounded-full text-[14px] font-[500] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Schedule Appointment
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* Urgent Requests */}
          <section className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <h4 className="text-[24px] font-medium text-[#1b1c1a]">Urgent Requests</h4>
              <Link className="text-[14px] text-[#BE1F2E] font-semibold border-b border-[#BE1F2E]/20 pb-0.5" to="/find-camps">View Map</Link>
            </div>
            
            {urgentRequests.length === 0 ? (
              <p className="text-[14px] text-[#737373] py-4">No active urgent requests.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x">
                {urgentRequests.map((req, idx) => (
                  <div key={req.id || idx} className="min-w-[280px] bg-white border border-[rgba(26,18,16,0.09)] p-5 rounded-xl snap-center relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-[#BE1F2E]/10 text-[#BE1F2E] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">priority_high</span>
                        {req.urgencyLabel || 'Critical'}
                      </div>
                      <span className="text-[12px] text-[#5c403f] font-medium">{req.distanceKm}km away</span>
                    </div>
                    <h5 className="text-[18px] font-semibold text-[#1a1210] mb-1">{req.hospitalName}</h5>
                    <p className="text-[#5c403f] text-[13px] mb-4 leading-normal line-clamp-2">
                      {req.message || `Urgent need for ${req.bloodGroup} blood units.`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ffdad8] text-[#BE1F2E] flex items-center justify-center font-bold text-[14px]">
                          {req.bloodGroup}
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => handlePledge(req.id)}
                        className="bg-[#1a1210] text-white px-4 py-2 rounded-full text-[12px] font-semibold active:scale-95 transition-all"
                      >
                        Donate Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Supply Chain Insight */}
          <section className="mb-6">
            <div className="bg-[#1a1210]/5 border border-[rgba(26,18,16,0.08)] p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#BE1F2E] shadow-sm shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1b1c1a]">Regional Supply Insight</p>
                <p className="text-[12px] text-[#5c403f] leading-normal">
                  Donations are up 12% this week. O-Positive remains the highest priority for medical units.
                </p>
              </div>
            </div>
          </section>

          {/* Recent Donations */}
          <section className="mb-4">
            <h4 className="text-[24px] font-medium text-[#1b1c1a] mb-3">Recent Donations</h4>
            <div className="space-y-3">
              {donations.length === 0 ? (
                <p className="text-[14px] text-[#737373]">No recent donations recorded.</p>
              ) : (
                donations.slice(0, 3).map((d, idx) => (
                  <div key={d.id || idx} className="flex items-center justify-between p-4 bg-white border border-[rgba(26,18,16,0.09)] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#5c403f]">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1b1c1a]">{d.date}</p>
                        <p className="text-[12px] text-[#5c403f]">{d.location}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100">
                      {d.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        {/* BottomNavBar Shell */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-2 py-2 flex items-center justify-around"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(26,18,16,0.09)',
            boxShadow: '0 -4px 24px rgba(26,18,16,0.08)',
          }}
        >
          {[
            { name: 'Home', path: '/dashboard', icon: 'home' },
            { name: 'Camps', path: '/find-camps', icon: 'bloodtype' },
            { name: 'Map', path: '/location', icon: 'explore' },
            { name: 'Profile', path: '/edit-profile', icon: 'person' }
          ].map((item) => {
            const isActive = item.path === '/dashboard'; // Home is active
            return (
              <button type="button"
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl flex-1 transition-all cursor-pointer"
                style={{
                  color: isActive ? '#C8102E' : '#5C403F',
                  background: isActive ? 'rgba(200,16,46,0.06)' : 'transparent',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-[700] uppercase tracking-wider text-center" style={{ fontSize: '9px' }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
