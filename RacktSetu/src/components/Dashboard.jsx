import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
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
  const [donorName, setDonorName] = useState('Aarav');
  const [navScrolled, setNavScrolled] = useState(false);
  const totalDonations = useCountUp(12);
  const livesImpacted = useCountUp(36);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.fullName) setDonorName(data.fullName.split(' ')[0]);
    }
  }, []);

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
            to="/"
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
            <button className="px-5 py-2 text-[14px] font-[600] text-[#BE1F2E] hover:bg-[rgba(190,31,46,0.06)] rounded-full transition-all whitespace-nowrap hidden sm:block">
              Emergency Request
            </button>
            <div className="w-10 h-10 rounded-full bg-[#eae8e5] flex items-center justify-center border border-[rgba(26,18,16,0.09)] overflow-hidden cursor-pointer shrink-0" onClick={() => navigate('/edit-profile')}>
              <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4LePSzF9UlW9h3IVZNZA-jV2c_WlVBNOPY2YRf99m4LW6pnZCOJow0bRw6skvc_LwP1Sjs85QaT6fzeIhBQQwGz1cr7qSI-8pe5tYU7UGinXprHgh-PK3cqnJI4GSnh0oPXhDHqPSKEOnfTxKJG5Rq2yoBTo7yub1N3Vml9LsMa5dsvmQIi2q31bqbhLaYDbmBFE5idwcqyYnZUlrzUizutMwPtY0Wobo9nsUpDKigPRPnhBg27638USNnXdaUSlGAlX-APGnWJw" />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32 w-full px-6 md:px-10 lg:px-16">
        {/* Editorial Greeting */}
        <section className="mb-16">
          <h1 className="font-serif text-[60px] md:text-[100px] italic leading-none mb-4 tracking-[-0.04em]">
            Welcome back, <span className="text-[#c8102e]">{donorName}.</span>
          </h1>
          <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
            Your commitment to the clinical supply chain has directly supported three local trauma centers this month. Your precision saves lives.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Cards Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <h2 className="text-[24px] font-[500] leading-[32px] text-white">Oct 24, 2024</h2>
                <div className="mt-4 inline-flex items-center gap-2 text-[#ffb3b1]">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span className="text-[14px] font-[500]">Mark Calendar</span>
                </div>
              </div>
            </div>

            {/* Recent Donations Table */}
            <div className="bg-white rounded-lg border border-[rgba(26,18,16,0.09)] overflow-hidden">
              <div className="p-6 border-b border-[rgba(26,18,16,0.09)] flex justify-between items-center">
                <h3 className="text-[24px] font-[500] italic">Recent Donations</h3>
                <button className="text-[14px] font-[500] text-[#c8102e] hover:underline">Download Reports</button>
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
                    <tr className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-4 text-[14px] font-[500]">Aug 12, 2024</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Apollo Medical Center</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Whole Blood</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#c8102e]/10 text-[#c8102e] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">Completed</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-4 text-[14px] font-[500]">May 05, 2024</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Red Cross - City Plaza</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Plasma</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#c8102e]/10 text-[#c8102e] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">Completed</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-6 py-4 text-[14px] font-[500]">Feb 20, 2024</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Fortis Logistics Hub</td>
                      <td className="px-6 py-4 text-[16px] text-[#685c59]">Whole Blood</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#c8102e]/10 text-[#c8102e] px-3 py-1 rounded-full text-[12px] font-[600] uppercase">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Eligibility CTA */}
            <div className="relative rounded-lg overflow-hidden h-64 flex items-center bg-[#c8102e] group">
              <img className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 transition-transform duration-700 group-hover:scale-110" alt="CTA Background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPibRz0Po3cADqWVeJotqwI5fjq6J_LGtmvf97Pejz_dB8BC95-AYRDHtr68mR1jSCGNyrNHad216bN9r8ZhfCzM6rMBVRpJaOPeTLR4LLYeuwgM631WjmL6mQq6TjXgaNgswV-M_rMRC-HGyfZKVcbfV5xztNZInaEPUjsO6E3CucCbAOR1GnD3CEVbeEFvaZotTR3Z9HKRE9CnyH30i9UXdVMJk2zfx-MeQaE8o0lDXZbgCfsFl7E_HVMJo_QrxKg2gVJoco21Q" />
              <div className="relative z-10 p-12 w-full flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="font-serif text-[48px] text-white italic leading-tight">Ready for your next impact?</h3>
                  <p className="text-white/80 text-[16px] mt-2">Our 2-minute eligibility check ensures you're medically ready.</p>
                </div>
                <button className="bg-white text-[#c8102e] px-10 py-4 rounded-full text-[14px] font-[500] hover:scale-105 active:scale-95 transition-transform duration-400 whitespace-nowrap">
                  Check Eligibility
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Urgent Requests Sidebar */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 text-[#c8102e] mb-6">
                <span className="material-symbols-outlined text-[24px]">priority_high</span>
                <h3 className="text-[24px] font-[500] italic">Urgent Requests</h3>
              </div>

              <div className="space-y-8">
                {/* Request Card 1 */}
                <div className="p-6 bg-[#f5f3f0] rounded-lg border border-[rgba(26,18,16,0.09)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-[#ffdad6] text-[#93000a] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Critical Shortage</span>
                      <h4 className="text-[20px] font-[500] mt-2">City General Hospital</h4>
                    </div>
                    <div className="bg-[#c8102e] text-white w-12 h-12 flex items-center justify-center rounded font-bold text-xl">O+</div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[12px] font-[600] text-[#737373]">
                      <span>Fulfillment Progress</span>
                      <span className="font-bold">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#eae8e5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#c8102e]" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <button className="w-full bg-[#1a1210] text-white py-3 rounded-full text-[14px] font-[500] hover:scale-105 active:scale-95 transition-transform duration-400">
                    Pledge to Donate
                  </button>
                </div>

                {/* Request Card 2 */}
                <div className="p-6 border border-[rgba(26,18,16,0.09)] rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-[#eae8e5] text-[#685c59] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Moderate Need</span>
                      <h4 className="text-[20px] font-[500] mt-2">Metro Children's Wing</h4>
                    </div>
                    <div className="bg-[#685c59] text-white w-12 h-12 flex items-center justify-center rounded font-bold text-xl">B-</div>
                  </div>
                  <p className="text-[16px] text-[#737373] mb-6">Pediatric plasma units required for scheduled surgeries on Friday.</p>
                  <button className="w-full border border-[#1a1210] text-[#1a1210] py-3 rounded-full text-[14px] font-[500] hover:bg-[#1a1210] hover:text-white transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Logistics Insight Card */}
            <div className="bg-[#1a1210] p-8 rounded-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[#c8102e] text-[32px] mb-4">insights</span>
                <h4 className="text-[24px] font-[500] mb-4 italic">Supply Chain Insight</h4>
                <p className="text-white/70 text-[16px] mb-6 leading-relaxed">
                  Your donation type (O+) is currently in the highest demand globally. 1 unit can be split into components that help up to 3 separate neonatal cases.
                </p>
                <a className="inline-flex items-center gap-2 text-[#c8102e] text-[14px] font-[500] group" href="#">
                  Read the 2024 Impact Report
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1210] border-t border-white/10 py-32">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-6 md:px-10 lg:px-16 gap-16">
          <div className="max-w-sm">
            <div className="font-serif text-[60px] text-white italic mb-6 leading-none">RaktSetu</div>
            <p className="text-[#737373] text-[16px] leading-relaxed">
              © 2024 RaktSetu. Clinical Excellence in Blood Logistics. Operating at the intersection of medical science and logistical intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-4">
              <p className="text-white font-bold uppercase tracking-widest text-xs mb-6">Resources</p>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">Donor Guidelines</a>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">Privacy Policy</a>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">Terms of Service</a>
            </div>
            <div className="space-y-4">
              <p className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support</p>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">Contact Medical Team</a>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">Emergency Access</a>
              <a className="block text-[#737373] hover:text-white transition-colors" href="#">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
