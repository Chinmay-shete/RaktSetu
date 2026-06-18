import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: 'Arjun Malhotra',
    age: '29',
    gender: 'Male',
    bloodGroup: 'O-Positive',
    city: 'New Delhi',
    pincode: '110001',
    weight: '78',
    chronicIllness: false,
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    const registered = localStorage.getItem('raktsetu_registered_donor');
    const base = {};
    if (registered) Object.assign(base, JSON.parse(registered));
    if (stored) Object.assign(base, JSON.parse(stored));
    const merged = { ...profile, ...base };
    setProfile(merged);
    setOriginalProfile(merged);
  }, []);

  useEffect(() => {
    if (!originalProfile) return;
    setHasChanges(JSON.stringify(profile) !== JSON.stringify(originalProfile));
  }, [profile, originalProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    await new Promise((r) => setTimeout(r, 900));
    const existing = JSON.parse(localStorage.getItem('raktsetu_donor_profile') || '{}');
    localStorage.setItem('raktsetu_donor_profile', JSON.stringify({ ...existing, ...profile }));
    setOriginalProfile({ ...profile });
    setSaveState('saved');
    setHasChanges(false);
    setTimeout(() => {
      setSaveState('idle');
      navigate('/dashboard');
    }, 1500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText('RS-2024-8892').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputCls = 'input-field custom-select';
  const sectionHdg = 'font-serif text-[18px] font-[600] italic text-[#BE1F2E] mb-1';
  const sectionSub = 'text-[13px] text-[#8A8078] mt-0.5';

  return (
    <div className="min-h-screen bg-[#F5F0EB]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#E0DAD4] w-full sticky top-0 z-50" style={{ height: 64 }}>
        <div className="flex justify-between items-center h-full px-6 md:px-10 max-w-[1280px] mx-auto">
          <a className="font-serif text-[22px] font-bold text-[#BE1F2E]" href="/dashboard" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</a>
          <nav className="hidden md:flex items-center gap-8">
            {['Find Camps', 'My Impact', 'Profile'].map((l, i) => (
              <a key={l} href="#" className={`text-[14px] font-[500] transition-colors ${i === 2 ? 'text-[#BE1F2E] font-[700] border-b-2 border-[#BE1F2E] pb-px' : 'text-[#5A5A5A] hover:text-[#BE1F2E]'}`}>{l}</a>
            ))}
          </nav>
          <button onClick={() => navigate('/dashboard')} className="btn-dark" style={{ fontSize: 13, padding: '9px 18px' }}>
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      {/* ── STICKY UNSAVED BAR ─────────────────────────────────────────── */}
      {hasChanges && (
        <div className="sticky-save-bar animate-fade-in">
          <p className="text-[14px] font-[500] text-[#5A5A5A]">You have unsaved changes</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setProfile({ ...originalProfile }); setHasChanges(false); }}
              className="text-[14px] font-[500] text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors"
            >
              Discard
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px', minHeight: 36, fontSize: 13 }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="pt-12 pb-24 px-4 md:px-10 max-w-4xl mx-auto">

        {/* Page Header */}
        <header className="mb-12">
          <h1 className="font-serif mb-4" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, color: '#1A0A0A', lineHeight: 1.05, fontFeatureSettings: '"liga" 0' }}>
            Edit <span className="italic text-[#BE1F2E]">Profile</span>
          </h1>
          <p className="text-[17px] text-[#5A5A5A] leading-[1.6] max-w-xl">
            Maintain your medical logistics profile to ensure accurate donor matching and clinical readiness.
          </p>
        </header>

        <form onSubmit={handleSave}>
          <section className="bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Card Header — Donor Credentials */}
            <div className="px-8 md:px-12 py-8 border-b border-[#EDE7E1] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-[28px] font-[600] italic text-[#1A0A0A]" style={{ fontFeatureSettings: '"liga" 0' }}>Donor Credentials</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-[600] text-[#9A9A9A] uppercase tracking-wider">Patient ID:</span>
                <span className="text-[14px] font-[700] text-[#1A1A1A]">RS-2024-8892</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="ml-1 p-1.5 rounded-lg text-[#9A9A9A] hover:bg-[#F5F0EB] hover:text-[#5A5A5A] transition-all relative"
                  title="Copy ID"
                >
                  <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[11px] px-2 py-1 rounded whitespace-nowrap">Copied!</span>
                  )}
                </button>
              </div>
            </div>

            {/* ── IDENTITY SECTION ───────────────────────────────────── */}
            <div className="px-8 md:px-12 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className={sectionHdg}>Identity</h3>
                <p className={sectionSub}>Official donor identification details.</p>
              </div>
              <div className="md:col-span-8 space-y-5">
                <div>
                  <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="fullName">Full Name</label>
                  <input id="fullName" name="fullName" type="text" value={profile.fullName} onChange={handleChange} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="age">Age</label>
                    <input id="age" name="age" type="number" min="18" max="65" value={profile.age} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="gender">Gender</label>
                    <select id="gender" name="gender" value={profile.gender} onChange={handleChange} className={`${inputCls} custom-select`}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-8 md:mx-12 border-t border-[#E0DAD4]" />

            {/* ── GEOGRAPHY SECTION ──────────────────────────────────── */}
            <div className="px-8 md:px-12 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className={sectionHdg}>Geography</h3>
                <p className={sectionSub}>Logistics optimization parameters.</p>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="city">City</label>
                  <input id="city" name="city" type="text" value={profile.city} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" type="text" maxLength="6" value={profile.pincode} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            </div>

            <div className="mx-8 md:mx-12 border-t border-[#E0DAD4]" />

            {/* ── MEDICAL SECTION ────────────────────────────────────── */}
            <div className="px-8 md:px-12 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className={sectionHdg}>Medical</h3>
                <p className={sectionSub}>Clinical data for safe extraction.</p>
              </div>
              <div className="md:col-span-8 space-y-5">
                {/* Blood Group — read-only */}
                <div className="flex items-center justify-between border border-[rgba(190,31,46,0.2)] bg-[rgba(190,31,46,0.03)] rounded-xl p-5">
                  <div>
                    <p className="text-[14px] font-[600] text-[#5A5A5A]">Blood Group</p>
                    <p className="text-[12px] text-[#9A9A9A] mt-0.5">Requires verification to change</p>
                  </div>
                  <span className="font-serif text-[28px] font-[700] italic text-[#BE1F2E]">{profile.bloodGroup}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5" htmlFor="weight">Weight (kg)</label>
                    <input id="weight" name="weight" type="number" value={profile.weight} onChange={handleChange} className={inputCls} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="text-[14px] font-[600] text-[#5A5A5A] block mb-1.5">Chronic Illness</label>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, chronicIllness: !p.chronicIllness }))}
                      className={`toggle-track ${profile.chronicIllness ? 'on' : ''}`}
                      role="switch"
                      aria-checked={profile.chronicIllness}
                    >
                      <span className="toggle-thumb" />
                    </button>
                    <p className="text-[12px] text-[#9A9A9A] mt-2 leading-[1.5]">Indicates a long-term medical condition affecting donation eligibility</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACTIONS ────────────────────────────────────────────── */}
            <div className="px-8 md:px-12 py-8 border-t border-[#EDE7E1] flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[15px] font-[500] text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveState === 'saving'}
                className="btn-primary"
                style={{ minWidth: 160, minHeight: 52 }}
              >
                {saveState === 'saving' && (
                  <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Saving…</>
                )}
                {saveState === 'saved' && (
                  <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved ✓</>
                )}
                {saveState === 'idle' && 'Save Changes'}
              </button>
            </div>
          </section>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A0A0A] py-12 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <a className="font-serif text-[22px] font-bold text-white" href="#" style={{ fontFeatureSettings: '"liga" 0' }}>RaktSetu</a>
          <div className="flex flex-wrap justify-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Donor Guidelines', 'Contact Medical Team'].map((l) => (
              <a key={l} className="text-[#A09890] hover:text-white transition-colors text-[14px]" href="#">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[14px] text-white">
            <span className="w-2 h-2 rounded-full bg-[#22A06B] pulse-dot" />
            <span className="text-white/70">Live Network</span>
          </div>
        </div>
        <p className="text-center text-[#6A6062] text-[13px] mt-8">© 2024 RaktSetu. Clinical Excellence.</p>
      </footer>
    </div>
  );
};

export default EditProfile;
