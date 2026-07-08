import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';
import { useToast } from '../hooks/useToast';

// Leaflet marker icon configurations
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const INDIA_STATES_DISTRICTS = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Nellore", "Vishakhapatnam", "Vizianagaram", "West Godavari", "Cuddapah"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kurung Kumey", "Lohit", "Longding", "Lower Dibang Valley", "Lower Subansiri", "Namsai", "Papum Pare", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Bandipore", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Mamban", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Trissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khurda", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Subhash Nagar", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur", "Paschim Bardhaman", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Ladakh": ["Leh", "Kargil"]
};

const STATE_COORDS = {
  "Delhi": [28.6139, 77.2090],
  "Maharashtra": [19.7515, 75.7139],
  "Karnataka": [15.3173, 75.7139],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Gujarat": [22.2587, 71.1924],
  "Rajasthan": [27.0238, 74.2179],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Kerala": [10.8505, 76.2711],
  "Andhra Pradesh": [15.9129, 79.7400],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Bihar": [25.0961, 85.3131],
  "Punjab": [31.1471, 75.3412],
  "Haryana": [29.0588, 76.0856],
  "Assam": [26.2006, 92.9376],
  "Chhattisgarh": [21.2787, 81.8661],
  "Jharkhand": [23.6102, 85.2799],
  "Odisha": [20.9517, 85.0985],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Uttarakhand": [30.0668, 79.0193],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Goa": [15.2993, 74.1240],
  "Tripura": [23.9408, 91.9882],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Nagaland": [26.1584, 94.5624],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Mizoram": [23.1645, 92.9376],
  "Sikkim": [27.5330, 88.5122],
  "Andaman and Nicobar Islands": [11.7401, 92.6586],
  "Chandigarh": [30.7333, 76.7794],
  "Dadra and Nagar Haveli and Daman and Diu": [20.1809, 73.0169],
  "Lakshadweep": [10.5667, 72.6417],
  "Puducherry": [11.9416, 79.8083],
  "Ladakh": [34.1526, 77.5771]
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FindCamps = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Kolhapur');
  const [activeDistrict, setActiveDistrict] = useState('Kolhapur');
  const [activeState, setActiveState] = useState('Maharashtra');
  const [campDate, setCampDate] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Mobile navigation tabs: 'requests' | 'map'
  const [mobileTab, setMobileTab] = useState('requests');

  // Appointment Modal state
  const [bookingCamp, setBookingCamp] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Profile context fallbacks
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [initialLetter, setInitialLetter] = useState('D');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user profile & auto-detect location
  useEffect(() => {
    const stored = localStorage.getItem('raktsetu_donor_profile');
    if (!stored) {
      navigate('/');
      return;
    }
    const data = JSON.parse(stored);
    if (data.fullName) setInitialLetter(data.fullName.charAt(0).toUpperCase());
    if (data.photoUrl) setProfilePhoto(data.photoUrl);

    if (data.city) {
      Object.keys(INDIA_STATES_DISTRICTS).forEach(st => {
        if (INDIA_STATES_DISTRICTS[st].includes(data.city)) {
          setSelectedState(st);
          setSelectedDistrict(data.city);
          setActiveState(st);
          setActiveDistrict(data.city);
        }
      });
    }

    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setGpsLoading(false);
          if (!sessionStorage.getItem('raktsetu_location_toast_shown')) {
            toast.success("Location detected. Proximity sorting active!");
            sessionStorage.setItem('raktsetu_location_toast_shown', 'true');
          }
        },
        () => {
          setGpsLoading(false);
        }
      );
    }
  }, [navigate]);

  // Generate 3 camps dynamically based on active state and district
  const getCamps = () => {
    const coords = STATE_COORDS[activeState] || [19.7515, 75.7139];
    const baseLat = coords[0];
    const baseLng = coords[1];

    const list = [
      {
        id: 1,
        name: `${activeDistrict} District Red Cross Camp`,
        type: 'High Need',
        typeColor: '#ffdad8',
        typeTextColor: '#92001c',
        location: `Civil Lines Area, ${activeDistrict}`,
        lat: baseLat + 0.008,
        lng: baseLng + 0.012,
        date: 'Tomorrow, 9 AM - 5 PM'
      },
      {
        id: 2,
        name: `${activeDistrict} Community Blood Drive`,
        type: 'Standard',
        typeColor: '#eae8e5',
        typeTextColor: '#685c59',
        location: `Central Park Ground, ${activeDistrict}`,
        lat: baseLat - 0.012,
        lng: baseLng - 0.005,
        date: 'Oct 24, 10 AM - 4 PM'
      },
      {
        id: 3,
        name: `Apex Hospital Donor Center`,
        type: 'Standard',
        typeColor: '#eae8e5',
        typeTextColor: '#685c59',
        location: `Sector-3 bypass, ${activeDistrict}`,
        lat: baseLat + 0.004,
        lng: baseLng - 0.015,
        date: 'Oct 26, 8 AM - 8 PM'
      }
    ];

    if (userCoords) {
      return list.map(c => {
        const dist = getDistance(userCoords.lat, userCoords.lng, c.lat, c.lng);
        return {
          ...c,
          distance: dist,
          distanceStr: `${dist.toFixed(1)} km away`
        };
      }).sort((a, b) => a.distance - b.distance);
    }

    return list.map((c, idx) => ({
      ...c,
      distanceStr: `${(idx + 1.2).toFixed(1)} km away`
    }));
  };

  const activeCamps = getCamps();

  // Initialize Map
  useEffect(() => {
    // If the map container ref is not mounted in the DOM, clean up and exit
    if (!mapContainerRef.current) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

    const baseCoords = STATE_COORDS[activeState] || [19.7515, 75.7139];

    // Safely remove any existing map instance to avoid container reuse errors
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Initialize Map
    mapInstance.current = L.map(mapContainerRef.current).setView(baseCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

    // Populate markers
    activeCamps.forEach(camp => {
      L.marker([camp.lat, camp.lng])
        .bindPopup(`<strong>${camp.name}</strong><br/>${camp.location}`)
        .addTo(markersGroup.current);
    });

    // Invalidate size after layout completes
    const timer = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeState, activeDistrict, mobileTab, isMobile]); // Re-run when mobileTab switches to render correctly!

  const handleSearch = () => {
    setActiveState(selectedState);
    setActiveDistrict(selectedDistrict);
  };

  const handleBookAppointment = (camp) => {
    setBookingCamp(camp);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingSuccess(false);
  };

  const submitBooking = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    toast.success(`Appointment successfully booked at ${bookingCamp.name}!`);
    setTimeout(() => {
      setBookingCamp(null);
    }, 2000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen selection:bg-[#ffdad8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="noise-filter" />

      {!isMobile ? (
        /* ──────────────────────────────────────────────────────── */
        /* ── DESKTOP LAYOUT ────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div>
          <DonorNavbar />

          <main className="pt-28 pb-24 w-full px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
            <header className="mb-8">
              <p className="text-[12px] font-[600] uppercase tracking-widest text-[#BE1F2E] mb-2">Locator</p>
              <h1 className="font-serif italic leading-none tracking-[-0.04em] text-[80px] mb-4">Find Blood Camps</h1>
              <p className="text-[#737373] text-[18px] max-w-xl leading-relaxed">
                Locate blood donation camps and centers near you. Book your slot directly to contribute to the local supply chain.
              </p>
            </header>

            {/* Filters */}
            <div className="bg-white border border-[rgba(26,18,16,0.09)] shadow-sm rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/4">
                <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select State</label>
                <select
                  className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    const firstDist = INDIA_STATES_DISTRICTS[e.target.value][0];
                    setSelectedDistrict(firstDist);
                  }}
                >
                  {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/4">
                <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select District</label>
                <select
                  className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {(INDIA_STATES_DISTRICTS[selectedState] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/4">
                <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Camp Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={campDate}
                  onChange={(e) => setCampDate(e.target.value)}
                  className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                />
              </div>

              <div className="w-full md:w-1/4">
                <button
                  onClick={handleSearch}
                  className="w-full bg-[#1a1210] text-white px-6 py-3.5 rounded-xl text-[14px] font-[600] hover:bg-[#BE1F2E] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Search Camps
                </button>
              </div>
            </div>

            {/* Map & List container */}
            <section className="bg-white border border-[rgba(26,18,16,0.09)] shadow-sm rounded-xl overflow-hidden flex flex-col lg:flex-row h-[700px]">
              <div className="w-full lg:w-2/3 relative h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-[rgba(26,18,16,0.09)]">
                <div ref={mapContainerRef} className="w-full h-full z-10"></div>
              </div>
              <div className="w-full lg:w-1/3 bg-white h-1/2 lg:h-full overflow-y-auto flex flex-col">
                <div className="p-5 border-b border-[rgba(26,18,16,0.09)] sticky top-0 bg-white z-20">
                  <h3 className="text-[20px] font-serif italic text-[#1a1210]">Available Camps ({activeDistrict})</h3>
                  {userCoords && <p className="text-[11px] text-[#22A06B] font-semibold mt-1">Sorted by nearest proximity</p>}
                </div>

                <div className="divide-y divide-[rgba(26,18,16,0.07)] flex-1">
                  {activeCamps.map((camp) => (
                    <div key={camp.id} className="p-5 hover:bg-[#faf8f5] transition-colors flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-[16px] font-[600] text-[#1a1210]">{camp.name}</h4>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: camp.typeColor, color: camp.typeTextColor }}
                        >
                          {camp.type}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#737373] mb-1">{camp.location}</p>
                      <p className="text-[12px] text-[#BE1F2E] font-medium mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">my_location</span>
                        {camp.distanceStr}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[12px] text-[#685c59] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {camp.date}
                        </span>
                        <button
                          onClick={() => handleBookAppointment(camp)}
                          className="bg-[#1a1210] hover:bg-[#BE1F2E] text-white text-[12px] font-bold px-4 py-2 rounded-full transition-colors active:scale-95"
                        >
                          Book Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
          <DonorFooter />
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────── */
        /* ── MOBILE LAYOUT ─────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────── */
        <div className="bg-[#faf8f5] min-h-screen">
          {/* TopAppBar */}
          <header className="fixed top-0 w-full z-50 bg-[#faf8f5] border-b border-[rgba(26,18,16,0.09)] flex items-center px-4 h-16 justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="font-serif text-[24px] font-bold text-[#BE1F2E] tracking-tight shrink-0"
                style={{ fontFeatureSettings: '"liga" 0' }}
              >
                RaktSetu
              </Link>
            </div>
            {/* Mobile subheader tab selector */}
            <div className="flex bg-[#eae8e5]/60 rounded-full p-1 max-w-[200px]">
              <button
                type="button"
                onClick={() => setMobileTab('requests')}
                className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all duration-200 ${
                  mobileTab === 'requests' ? 'bg-[#9e001f] text-white' : 'text-[#5c403f]'
                }`}
              >
                Camps
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all duration-200 ${
                  mobileTab === 'map' ? 'bg-[#9e001f] text-white' : 'text-[#5c403f]'
                }`}
              >
                Map
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full overflow-hidden border border-[#BE1F2E]/20 bg-[#eae8e5] flex items-center justify-center cursor-pointer shrink-0"
                onClick={() => navigate('/edit-profile')}
              >
                {profilePhoto ? (
                  <img className="w-full h-full object-cover" src={profilePhoto} alt="Profile" />
                ) : (
                  <span className="text-[13px] font-bold text-[#BE1F2E]">{initialLetter}</span>
                )}
              </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="pt-20 pb-32 px-4 max-w-lg mx-auto">
            {mobileTab === 'requests' ? (
              <div className="space-y-6">
                {/* Personalized Page Header */}
                <section className="mb-2">
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Find Camps</h2>
                  <p className="text-[#5c403f] text-[16px] mt-1">Book your slots in regional donation drives</p>
                </section>

                {/* Filters styled identically to edit profile */}
                <section className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-end justify-between border-b border-[#e5bdbb] pb-2">
                    <h3 className="text-[20px] font-serif text-[#9e001f] italic leading-none">Location & Date</h3>
                    <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest">Filter</span>
                  </div>
                  <div className="space-y-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5c403f]">Select State</label>
                      <div className="relative">
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            const firstDist = INDIA_STATES_DISTRICTS[e.target.value][0];
                            setSelectedDistrict(firstDist);
                          }}
                          className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] appearance-none"
                        >
                          {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#906f6e] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5c403f]">Select District</label>
                      <div className="relative">
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] appearance-none"
                        >
                          {(INDIA_STATES_DISTRICTS[selectedState] || []).map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#906f6e] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5c403f]">Camp Date</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={campDate}
                        onChange={(e) => setCampDate(e.target.value)}
                        className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="w-full bg-[#9e001f] text-white py-3 rounded-full font-semibold active:scale-95 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      Find Camps
                    </button>
                  </div>
                </section>

                {/* Camps Card List */}
                <section className="space-y-4">
                  <div className="flex justify-between items-end border-b border-[#e5bdbb] pb-2 mb-2">
                    <h3 className="text-[22px] font-serif text-[#1a1210] italic">Camps in {activeDistrict}</h3>
                    {userCoords && <span className="text-[10px] font-bold text-[#22A06B] uppercase tracking-wider">Nearby sorted</span>}
                  </div>
                  {activeCamps.map((camp) => (
                    <div key={camp.id} className="bg-white border border-[rgba(26,18,16,0.09)] p-5 rounded-xl shadow-sm relative hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="pr-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#9e001f]/10 text-[#9e001f] mb-1.5">
                            {camp.type}
                          </span>
                          <h4 className="text-[17px] font-semibold text-[#1a1210] leading-tight">{camp.name}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#ffdad8] text-[#9e001f] flex items-center justify-center font-bold text-[14px] shrink-0">
                          {camp.distanceStr.split(' ')[0]}k
                        </div>
                      </div>
                      <p className="text-[#5c403f] text-[13px] mb-3 leading-normal">{camp.location}</p>
                      <div className="flex items-center justify-between border-t border-[rgba(26,18,16,0.05)] pt-3 mt-1">
                        <span className="text-[12px] text-[#737373] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {camp.date.split(',')[0]}
                        </span>
                        <button
                          onClick={() => handleBookAppointment(camp)}
                          className="bg-[#1a1210] hover:bg-[#9e001f] text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-colors active:scale-95 shadow-md"
                        >
                          Book Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            ) : (
              <div className="space-y-4 h-[500px] flex flex-col">
                <section className="mb-2">
                  <h2 className="text-[32px] font-serif text-[#9e001f] italic leading-none">Map View</h2>
                  <p className="text-[#5c403f] text-[16px] mt-1">Showing blood camps near {activeDistrict}</p>
                </section>
                <div className="flex-grow bg-white border border-[rgba(26,18,16,0.09)] rounded-xl overflow-hidden relative shadow-sm z-10 h-[450px]">
                  <div ref={mapContainerRef} className="w-full h-full z-10"></div>
                </div>
              </div>
            )}
          </main>

          {/* Mobile BottomNavBar */}
          <nav className="fixed bottom-0 w-full z-50 bg-[#1a1210] flex justify-around items-center px-4 py-3 h-20 shadow-xl">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center justify-center text-[#737373] hover:text-[#ffb3b1] transition-colors px-4 py-1"
            >
              <span className="material-symbols-outlined">home</span>
              <span className="text-[12px] font-medium mt-0.5">Home</span>
            </button>
            <button
              onClick={() => { setMobileTab('requests'); }}
              className={`flex flex-col items-center justify-center transition-all ${
                mobileTab === 'requests' ? 'bg-[#9e001f] text-white rounded-full px-5 py-1.5' : 'text-[#737373] hover:text-[#ffb3b1] px-4 py-1'
              }`}
            >
              <span className="material-symbols-outlined">bloodtype</span>
              <span className="text-[12px] font-medium mt-0.5">Requests</span>
            </button>
            <button
              onClick={() => { setMobileTab('map'); }}
              className={`flex flex-col items-center justify-center transition-all ${
                mobileTab === 'map' ? 'bg-[#9e001f] text-white rounded-full px-5 py-1.5' : 'text-[#737373] hover:text-[#ffb3b1] px-4 py-1'
              }`}
            >
              <span className="material-symbols-outlined">explore</span>
              <span className="text-[12px] font-medium mt-0.5">Map</span>
            </button>
            <button
              onClick={() => navigate('/edit-profile')}
              className="flex flex-col items-center justify-center text-[#737373] hover:text-[#ffb3b1] transition-colors px-4 py-1"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="text-[12px] font-medium mt-0.5">Profile</span>
            </button>
          </nav>
        </div>
      )}

      {/* Appointment Modal */}
      {bookingCamp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EDE7E1] rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="font-serif italic text-[24px] mb-2">Book Slot</h3>
            <p className="text-[14px] text-[#737373] mb-6">{bookingCamp.name}</p>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-[#22A06B] text-[48px] mb-3">check_circle</span>
                <p className="font-bold text-[16px] mb-2">Appointment Confirmed!</p>
                <p className="text-[13px] text-[#737373]">A confirmation SMS and email have been sent with your appointment details.</p>
              </div>
            ) : (
              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Preferred Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Time Slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                  >
                    <option>09:00 AM - 10:30 AM</option>
                    <option>10:30 AM - 12:00 PM</option>
                    <option>12:00 PM - 01:30 PM</option>
                    <option>02:30 PM - 04:00 PM</option>
                    <option>04:00 PM - 05:30 PM</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setBookingCamp(null)}
                    className="flex-1 py-3 border border-[#D8D0CA] rounded-full text-[13px] font-[600] text-[#685c59] hover:bg-[#f5f0eb] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#BE1F2E] text-white rounded-full text-[13px] font-[600] hover:bg-[#a31825] transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindCamps;
