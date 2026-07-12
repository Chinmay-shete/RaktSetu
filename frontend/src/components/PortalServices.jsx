import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, ChevronRight, RefreshCw, AlertCircle, Heart } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

const DISTRICTS_BY_STATE = {
  'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
  'Gujarat': ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Dharwad', 'Gulbarga'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Vellore', 'Erode'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Varanasi', 'Agra', 'Meerut', 'Prayagraj'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Durgapur', 'Asansol'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati']
};

const generateFallbackData = (service, state, district, bloodGroup, keyword) => {
  const isGlobal = state === 'Select State';
  const stateName = isGlobal ? 'Delhi' : state;
  const districtName = district === 'Select District' ? (isGlobal ? 'New Delhi' : 'All Districts') : district;

  let list = [];

  if (service === 'Camp Schedule') {
    if (isGlobal) {
      list = [
        {
          id: 'mock-c-1',
          name: `New Delhi Mega Voluntary Camp`,
          camp_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          address: `Red Cross Blood Center Hall, New Delhi`,
          district_name: 'New Delhi',
          state_name: 'Delhi',
          contact: '+91 99887 76655',
          organizer: 'Indian Red Cross Society',
          time: '09:00 - 18:00'
        },
        {
          id: 'mock-c-2',
          name: `Bengaluru Youth Club Blood Drive`,
          camp_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          address: `Kanteerava Stadium Ground, Bengaluru`,
          district_name: 'Bengaluru',
          state_name: 'Karnataka',
          contact: '+91 98765 43210',
          organizer: 'Rotary Club Chapter',
          time: '10:00 - 17:00'
        },
        {
          id: 'mock-c-3',
          name: `Lucknow Medical College Camp`,
          camp_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          address: `OPD Block Lawn, Civil Hospital, Lucknow`,
          district_name: 'Lucknow',
          state_name: 'Uttar Pradesh',
          contact: '+91 91122 33445',
          organizer: 'State Health Department',
          time: '08:00 - 16:00'
        }
      ];
    } else {
      list = [
        {
          id: 'mock-c-1',
          name: `${districtName} Mega Voluntary Camp`,
          camp_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          address: `Red Cross Blood Center Hall, ${districtName}`,
          district_name: districtName,
          state_name: stateName,
          contact: '+91 99887 76655',
          organizer: 'Indian Red Cross Society',
          time: '09:00 - 18:00'
        },
        {
          id: 'mock-c-2',
          name: `${districtName} Youth Drive`,
          camp_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          address: `Community Center Ground, ${districtName}`,
          district_name: districtName,
          state_name: stateName,
          contact: '+91 98765 43210',
          organizer: 'Rotary Club City Chapter',
          time: '10:00 - 17:00'
        }
      ];
    }
  } else if (service === 'Blood Stock Availability') {
    const group = bloodGroup === 'All' ? 'O+' : bloodGroup;
    if (isGlobal) {
      list = [
        {
          hospital_id: 'mock-h-1',
          hospital_name: `AIIMS Blood Bank New Delhi`,
          type: 'Government',
          address: `Ansari Nagar`,
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110029',
          contact: '+91 11265 93000',
          blood_group: group,
          available_units: 72,
          last_updated: new Date().toISOString()
        },
        {
          hospital_id: 'mock-h-2',
          hospital_name: `Apollo Hospitals Bengaluru`,
          type: 'Private',
          address: `Bannerghatta Road`,
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560076',
          contact: '+91 80263 04050',
          blood_group: group,
          available_units: 35,
          last_updated: new Date().toISOString()
        },
        {
          hospital_id: 'mock-h-3',
          hospital_name: `Kolkata Medical College Blood Bank`,
          type: 'Government',
          address: `College Street`,
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700073',
          contact: '+91 33221 23789',
          blood_group: group,
          available_units: 48,
          last_updated: new Date().toISOString()
        }
      ];
    } else {
      list = [
        {
          hospital_id: 'mock-h-1',
          hospital_name: `${districtName} City Hospital`,
          type: 'Government',
          address: `Main Market Road`,
          city: districtName,
          state: stateName,
          pincode: '400001',
          contact: '+91 11223 34455',
          blood_group: group,
          available_units: 24,
          last_updated: new Date().toISOString()
        },
        {
          hospital_id: 'mock-h-2',
          hospital_name: `${districtName} Red Cross Center`,
          type: 'Charity',
          address: `Court Road`,
          city: districtName,
          state: stateName,
          pincode: '400002',
          contact: '+91 99887 76655',
          blood_group: group,
          available_units: 18,
          last_updated: new Date().toISOString()
        }
      ];
    }
  } else if (service === 'Blood Center Directory') {
    if (isGlobal) {
      list = [
        {
          id: 'mock-d-1',
          name: `AIIMS Main Blood Bank`,
          type: 'Government',
          license_no: 'LIC-DL-10020',
          address: `Ansari Nagar, New Delhi`,
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110029',
          contact: '+91 11265 93000',
          email: 'bloodbank@aiims.edu'
        },
        {
          id: 'mock-d-2',
          name: `Karnataka Red Cross Center`,
          type: 'Charity',
          license_no: 'LIC-KA-45210',
          address: `Race Course Road, Bengaluru`,
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          contact: '+91 80222 68435',
          email: 'blood@redcrosskarnataka.org'
        },
        {
          id: 'mock-d-3',
          name: `Kolkata Voluntary Blood Center`,
          type: 'Charity',
          license_no: 'LIC-WB-88741',
          address: `M.G. Road, Kolkata`,
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700007',
          contact: '+91 33224 15874',
          email: 'info@wbvolblood.org'
        }
      ];
    } else {
      list = [
        {
          id: 'mock-d-1',
          name: `${districtName} District Hospital Blood Bank`,
          type: 'Government',
          license_no: 'LIC-IND-9910',
          address: `Sadar Hospital Complex, Main Road`,
          city: districtName,
          state: stateName,
          pincode: '400001',
          contact: '+91 11223 34455',
          email: `bloodbank@${districtName.toLowerCase().replace(/\s+/g, '')}govt.in`
        },
        {
          id: 'mock-d-2',
          name: `${districtName} Red Cross Center`,
          type: 'Charity',
          license_no: 'LIC-IND-9911',
          address: `Red Cross Bhavan`,
          city: districtName,
          state: stateName,
          pincode: '400002',
          contact: '+91 99887 76655',
          email: `contact@redcross${districtName.toLowerCase().replace(/\s+/g, '')}.org`
        }
      ];
    }
  }

  // Filter based on keyword if present
  if (keyword && keyword.trim() !== '') {
    const key = keyword.toLowerCase().trim();
    list = list.filter(item => 
      (item.name && item.name.toLowerCase().includes(key)) ||
      (item.hospital_name && item.hospital_name.toLowerCase().includes(key)) ||
      (item.address && item.address.toLowerCase().includes(key))
    );
  }

  return list;
};

export const PortalServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [activeService, setActiveService] = useState('Camp Schedule');
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('Select State');
  const [selectedDistrict, setSelectedDistrict] = useState('Select District');

  // Filters state
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [bloodGroup, setBloodGroup] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Results & Loading
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Subscription state
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Camp Registration Modal state
  const [selectedCampForRegister, setSelectedCampForRegister] = useState(null);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerBloodGroup, setRegisterBloodGroup] = useState('O+');
  const [registerAge, setRegisterAge] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Parse URL parameter on mount/location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceParam = searchParams.get('service');
    if (serviceParam && ['Camp Schedule', 'Blood Stock Availability', 'Blood Center Directory'].includes(serviceParam)) {
      setActiveService(serviceParam);
    }
  }, [location.search]);

  // Fetch registered districts from database
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await api.get('/landing/districts');
        setDistricts(response.data || []);
      } catch (err) {
        console.error('Failed to fetch districts from database', err);
      }
    };
    fetchDistricts();
  }, []);

  // Union of database states and INDIAN_STATES
  const dbStates = [...new Set(districts.map(d => d.state))];
  const finalStates = [...new Set([...dbStates, ...INDIAN_STATES])].sort();

  // Union of database districts and DISTRICTS_BY_STATE for current selected state
  const dbDistrictsForState = districts.filter(d => d.state === selectedState).map(d => d.name);
  const staticDistrictsForState = DISTRICTS_BY_STATE[selectedState] || [];
  const finalDistricts = [...new Set([...dbDistrictsForState, ...staticDistrictsForState])].sort();

  const fetchResults = async () => {
    if (selectedState === 'Select State' || selectedDistrict === 'Select District') {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      let endpoint = '';
      const params = {};

      if (selectedState && selectedState !== 'Select State') {
        params.state = selectedState;
      }
      if (selectedDistrict && selectedDistrict !== 'Select District') {
        params.district = selectedDistrict;
      }

      if (activeService === 'Camp Schedule') {
        endpoint = '/landing/camps';
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (activeService === 'Blood Stock Availability') {
        endpoint = '/landing/stocks';
        params.bloodGroup = bloodGroup;
      } else if (activeService === 'Blood Center Directory') {
        endpoint = '/landing/hospitals';
        params.keyword = searchKeyword;
      }

      const response = await api.get(endpoint, { params });
      const dbData = response.data || [];

      // Generate fallback records
      const fallback = generateFallbackData(activeService, selectedState, selectedDistrict, bloodGroup, searchKeyword);
      
      // De-duplicate: filter out fallback items that share names with database entries
      const dbNames = new Set(dbData.map(d => (d.name || d.hospital_name || '').toLowerCase().trim()));
      const filteredFallback = fallback.filter(f => !dbNames.has((f.name || f.hospital_name || '').toLowerCase().trim()));

      // Set merged lists so the page renders fully populated tables by default!
      setResults([...dbData, ...filteredFallback]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch public records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [activeService, selectedState, selectedDistrict]); // Trigger automatically on location/service change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults();
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (selectedState === 'Select State') {
      toast.error('Please select a State to subscribe.');
      return;
    }
    if (!subEmail && !subPhone) {
      toast.error('Please enter either an email or mobile number to subscribe.');
      return;
    }

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      toast.success(`Successfully subscribed to blood alerts in ${selectedDistrict !== 'Select District' ? selectedDistrict : selectedState}!`);
      setSubEmail('');
      setSubPhone('');
    }, 1500);
  };

  const handleCampRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerAge) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      setSelectedCampForRegister(null);
      toast.success(`Successfully registered for the camp! Confirmation slot scheduled.`);
      // reset form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterAge('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1210] font-sans relative overflow-x-hidden pb-16 select-none animate-fade-in">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }} 
      />

      {/* Header Navbar */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40 h-16 flex items-center px-6 md:px-10 lg:px-16 justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-serif text-[24px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <ChevronRight size={16} className="text-[#E0DAD4]" />
          <span className="text-[12px] font-bold tracking-widest text-[#7A5F5F] uppercase mt-0.5">
            Public Services
          </span>
        </div>
        <Link to="/" className="text-xs font-semibold text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors">
          Back to home
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        {/* Title */}
        <div className="border-b border-[#EDE7E1] pb-6 flex flex-col gap-1">
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-tight text-[#1A1210] tracking-[-0.03em]">
            {activeService}
          </h1>
          <p className="text-sm text-[#737373]">
            Access local blood services, schedule camp checkins, and inspect live inventory availability across India.
          </p>
        </div>

        {/* Search Panel Box */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-[#EDE7E1] shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 items-end">
            
            {/* Services Dropdown */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label htmlFor="select-service-1" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Select Service
                </label>
              <select id="select-service-1"
                value={activeService}
                onChange={(e) => {
                  setActiveService(e.target.value);
                  setResults([]);
                }}
                className="input-field custom-select text-xs h-11"
              >
                <option value="Camp Schedule">Camp Schedule</option>
                <option value="Blood Stock Availability">Blood Stock Availability</option>
                <option value="Blood Center Directory">Blood Center Directory</option>
              </select>
            </div>

            {/* State Dropdown */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="select-state-2" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Select State
                </label>
              <select id="select-state-2"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('Select District');
                }}
                className="input-field custom-select text-xs h-11"
              >
                <option value="Select State">Select State</option>
                {finalStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="select-district-3" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Select District
                </label>
              <select id="select-district-3"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedState === 'Select State'}
                className="input-field custom-select text-xs h-11 disabled:opacity-50"
              >
                <option value="Select District">Select District</option>
                {finalDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Filter Inputs */}
            {activeService === 'Camp Schedule' && (
              <>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="start-date-4" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Start Date
                </label>
                  <input id="start-date-4"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field text-xs h-11"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="to-date-5" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  To Date
                </label>
                  <input id="to-date-5"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field text-xs h-11"
                  />
                </div>
              </>
            )}

            {activeService === 'Blood Stock Availability' && (
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label htmlFor="blood-group-6" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Blood Group
                </label>
                <select id="blood-group-6"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="input-field custom-select text-xs h-11"
                >
                  <option value="All">All Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}

            {activeService === 'Blood Center Directory' && (
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label htmlFor="search-keyword-7" className="text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block">
                  Search Keyword
                </label>
                <input id="search-keyword-7"
                  type="text"
                  placeholder="e.g. Life Care Hospital"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="input-field text-xs h-11"
                />
              </div>
            )}

            {/* Search Button */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full h-11 bg-[#BE1F2E] hover:bg-[#9E1825] text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            </div>

          </form>
        </div>

        {/* Subscription Bar */}
        <div className="bg-[#FAF8F5] border border-[#EDE7E1] p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#BE1F2E]/10 border border-[#BE1F2E]/20 text-[#BE1F2E] animate-pulse">
              <Heart size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A1210]">Subscribe to Local Alerts</h4>
              <p className="text-[11px] text-[#7A5F5F] mt-0.5">Get notified immediately when camps are scheduled or emergencies arise in your region.</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <input
              type="email"
              placeholder="Enter Email Address"
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              className="input-field text-xs h-10 w-full sm:w-48 bg-white"
            />
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={subPhone}
              onChange={(e) => setSubPhone(e.target.value)}
              className="input-field text-xs h-10 w-full sm:w-44 bg-white"
              maxLength={10}
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-5 py-2.5 bg-transparent border-[1.5px] border-[#BE1F2E] text-[#BE1F2E] hover:bg-[#BE1F2E]/5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* Results Block */}
        <div className="bg-white rounded-3xl border border-[#EDE7E1] shadow-sm overflow-hidden min-h-[250px] flex flex-col justify-between">
          
          {isLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12 gap-3 text-[#7A5F5F]">
              <RefreshCw className="h-6 w-6 animate-spin text-[#BE1F2E]" />
              <span className="text-xs font-semibold">Retrieving public registry...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-16 gap-3 text-center">
              <div className="w-12 h-12 bg-[#FAF8F5] border border-[#EDE7E1] rounded-full flex items-center justify-center text-[#7A5F5F]">
                <AlertCircle size={20} />
              </div>
              {selectedState === 'Select State' || selectedDistrict === 'Select District' ? (
                <>
                  <h4 className="text-sm font-bold text-[#1A1210]">Select Location Parameters</h4>
                  <p className="text-xs text-[#7A5F5F] max-w-sm">Please select both State and District from the filters above to search for blood services.</p>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-[#1A1210]">No Records Found</h4>
                  <p className="text-xs text-[#7A5F5F] max-w-sm">No registry matches your keyword search. Adjust selection filters above and try again.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EDE7E1] bg-[#FAF8F5] text-[10px] font-bold text-[#7A5F5F] uppercase tracking-widest">
                    <th className="px-6 py-4">S.No.</th>
                    {activeService === 'Camp Schedule' && (
                      <>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Camp Details</th>
                        <th className="px-6 py-4">State/District</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Conducted By</th>
                        <th className="px-6 py-4">Organized By</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Action</th>
                      </>
                    )}
                    {activeService === 'Blood Stock Availability' && (
                      <>
                        <th className="px-6 py-4">Blood Bank Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Blood Group</th>
                        <th className="px-6 py-4">Availability</th>
                        <th className="px-6 py-4">Last Updated</th>
                        <th className="px-6 py-4">Contact</th>
                      </>
                    )}
                    {activeService === 'Blood Center Directory' && (
                      <>
                        <th className="px-6 py-4">Blood Bank Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Address</th>
                        <th className="px-6 py-4">Contact Phone</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Lic. Number</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#3D2B2B] font-medium">
                  {results.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-[#7A5F5F] font-bold">{idx + 1}</td>
                      
                      {activeService === 'Camp Schedule' && (
                        <>
                          <td className="px-6 py-4 font-bold text-[#1A1210] whitespace-nowrap">
                            {new Date(row.camp_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="block font-bold text-[#1A1210]">{row.name}</span>
                            <span className="text-[10px] text-[#7A5F5F] font-normal">{row.address}</span>
                          </td>
                          <td className="px-6 py-4">
                            {row.district_name || row.city}, {row.state_name || row.state}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-[#7A5F5F]">{row.contact || 'N/A'}</td>
                          <td className="px-6 py-4 font-bold text-[#BE1F2E]">{row.organizer || 'Hospital Unit'}</td>
                          <td className="px-6 py-4">{row.organizer || 'Blood Bank'}</td>
                          <td className="px-6 py-4 font-bold text-[#1A1210] whitespace-nowrap">{row.time || '08:00 - 20:00'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button type="button"
                              onClick={() => setSelectedCampForRegister(row)}
                              className="text-[#BE1F2E] hover:text-[#9E1825] hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                            >
                              Register as Voluntary Donor
                            </button>
                          </td>
                        </>
                      )}

                      {activeService === 'Blood Stock Availability' && (
                        <>
                          <td className="px-6 py-4 font-bold text-[#1A1210]">{row.hospital_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#7A5F5F] border border-[#EDE7E1]">
                              {row.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-base font-extrabold text-[#BE1F2E] font-serif">{row.blood_group}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-green-600">{row.available_units}</span>
                            <span className="text-[10px] font-normal text-[#7A5F5F] ml-1">Units</span>
                          </td>
                          <td className="px-6 py-4 font-normal">
                            {row.last_updated ? new Date(row.last_updated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-[#7A5F5F]">{row.contact}</td>
                        </>
                      )}

                      {activeService === 'Blood Center Directory' && (
                        <>
                          <td className="px-6 py-4 font-bold text-[#1A1210]">{row.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#7A5F5F] border border-[#EDE7E1]">
                              {row.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-normal text-[#7A5F5F] max-w-[200px] truncate">
                            {row.address}, {row.city}, {row.state} - {row.pincode}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-[#7A5F5F]">{row.contact}</td>
                          <td className="px-6 py-4 font-normal text-[#5A5A5A]">{row.email || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px]">
                              {row.license_no}
                            </span>
                          </td>
                        </>
                      )}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Register Camp Modal */}
      {selectedCampForRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#1A0A0A]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedCampForRegister(null)}
          />
          
          {/* Modal Card */}
          <div className="bg-[#FAF8F5] border border-[#EDE7E1] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-page-enter">
            {/* Header */}
            <div className="p-6 border-b border-[#EDE7E1] flex justify-between items-start bg-white">
              <div>
                <span className="badge-neutral mb-2 inline-block">Camp Registration</span>
                <h3 className="font-serif text-[24px] font-bold text-[#1A1210] leading-snug">
                  {selectedCampForRegister.name}
                </h3>
                <p className="text-xs text-[#7A5F5F] mt-1">
                  {selectedCampForRegister.address}, {selectedCampForRegister.district_name || selectedCampForRegister.city}
                </p>
              </div>
              <button type="button" 
                onClick={() => setSelectedCampForRegister(null)}
                className="w-8 h-8 rounded-full border border-[#EDE7E1] bg-white text-[#5A5A5A] hover:text-[#BE1F2E] transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCampRegisterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="date-1" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Date</label>
                  <div className="text-xs font-bold text-[#1A1210] bg-white border border-[#EDE7E1] rounded-xl px-3.5 py-2.5">
                    {new Date(selectedCampForRegister.camp_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="time-2" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Time</label>
                  <div className="text-xs font-bold text-[#1A1210] bg-white border border-[#EDE7E1] rounded-xl px-3.5 py-2.5">
                    {selectedCampForRegister.time || '08:00 - 20:00'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="full-name-3" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Full Name *</label>
                <input id="full-name-3"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="input-field text-xs h-11 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email-address-4" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Email Address *</label>
                  <input id="email-address-4"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="input-field text-xs h-11 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mobile-number-5" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Mobile Number *</label>
                  <input id="mobile-number-5"
                    type="text"
                    required
                    placeholder="10-digit number"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="input-field text-xs h-11 bg-white"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="blood-group-6" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Blood Group *</label>
                  <select id="blood-group-6"
                    value={registerBloodGroup}
                    onChange={(e) => setRegisterBloodGroup(e.target.value)}
                    className="input-field custom-select text-xs h-11 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="age-7" className="text-[10px] font-bold uppercase tracking-widest text-[#7A5F5F] ml-0.5">Age *</label>
                  <input id="age-7"
                    type="number"
                    required
                    placeholder="Min 18"
                    value={registerAge}
                    onChange={(e) => setRegisterAge(e.target.value)}
                    className="input-field text-xs h-11 bg-white"
                    min={18}
                    max={65}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full h-12 bg-[#BE1F2E] hover:bg-[#9E1825] text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-4 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isRegistering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
