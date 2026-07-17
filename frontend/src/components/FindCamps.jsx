import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

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

const DISTRICT_COORDS = {
  // Maharashtra
  "Pune": [18.5204, 73.8567],
  "Mumbai": [19.0760, 72.8777],
  "Mumbai City": [19.0760, 72.8777],
  "Mumbai Suburban": [19.0760, 72.8777],
  "Satara": [17.6805, 73.9918],
  "Nashik": [19.9975, 73.7898],
  "Nagpur": [21.1458, 79.0882],
  "Thane": [19.2183, 72.9781],
  "Aurangabad": [19.8762, 75.3433],
  "Jalgaon": [21.0077, 75.5626],
  "Kolhapur": [16.7050, 74.2433],
  "Solapur": [17.6599, 75.9064],
  "Amravati": [20.9374, 77.7796],
  "Nanded": [19.1383, 77.3210],
  "Sangli": [16.8524, 74.5815],
  "Latur": [18.4088, 76.5604],
  "Ahmednagar": [19.0948, 74.7480],
  "Akola": [20.7002, 77.0082],
  "Jalna": [19.8410, 75.8864],
  
  // Gujarat
  "Ahmedabad": [23.0225, 72.5714],
  "Surat": [21.1702, 72.8311],
  "Vadodara": [22.3072, 73.1812],
  "Rajkot": [22.3039, 70.8022],
  
  // Karnataka
  "Bengaluru": [12.9716, 77.5946],
  "Bengaluru Urban": [12.9716, 77.5946],
  "Mysuru": [12.2958, 76.6394],
  "Belagavi": [15.8497, 74.4977],
  "Hubli": [15.3647, 75.1240],
  "Dharwad": [15.4589, 75.0078],
  
  // Delhi
  "New Delhi": [28.6139, 77.2090],
  "Central Delhi": [28.6448, 77.2167],
  "South Delhi": [28.4817, 77.1873],
};

const getDistrictCoords = (district, state) => {
  if (!district) return STATE_COORDS[state] || [19.7515, 75.7139];
  
  // 1. Direct match
  if (DISTRICT_COORDS[district]) return DISTRICT_COORDS[district];
  
  // 2. Substring match (e.g. "Punawale" contains "Pune")
  const normalizedDistrict = district.toLowerCase().trim();
  const keys = Object.keys(DISTRICT_COORDS);
  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    if (normalizedDistrict.includes(normalizedKey) || normalizedKey.includes(normalizedDistrict)) {
      return DISTRICT_COORDS[key];
    }
  }
  
  // 3. Fallback to State coords
  return STATE_COORDS[state] || [19.7515, 75.7139];
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

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('');
  const [activeState, setActiveState] = useState('');
  const [campDate, setCampDate] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [dbCamps, setDbCamps] = useState([]);
  const [dbHospitals, setDbHospitals] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

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

  // Load user profile avatar/name & get GPS coords for proximity sorting only
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/donor/profile');
        const data = response.data;
        // Only load display info — location dropdowns are NEVER auto-filled
        if (data.fullName) setInitialLetter(data.fullName.charAt(0).toUpperCase());
        if (data.photoUrl) setProfilePhoto(data.photoUrl);
      } catch (err) {
        console.error('Failed to fetch profile in FindCamps:', err);
        const stored = localStorage.getItem('raktsetu_donor_profile');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.fullName) setInitialLetter(data.fullName.charAt(0).toUpperCase());
          if (data.photoUrl) setProfilePhoto(data.photoUrl);
        }
      }
    };

    fetchProfile();

    // GPS is used ONLY for proximity distance sorting — never auto-selects state/district
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
          // No auto-select — user always chooses state & district manually
        },
        () => {
          setGpsLoading(false);
        }
      );
    }
  }, [navigate]);

  // Fetch real camps and hospitals in the district from the database
  useEffect(() => {
    if (!activeState || !activeDistrict) {
      setDbCamps([]);
      setDbHospitals([]);
      return;
    }
    let isMounted = true;
    const fetchData = async () => {
      setApiLoading(true);
      try {
        const [campsRes, hospitalsRes] = await Promise.all([
          api.get('/landing/camps', { params: { state: activeState, district: activeDistrict } }),
          api.get('/landing/hospitals', { params: { state: activeState, district: activeDistrict } })
        ]);
        
        if (!isMounted) return;
        
        setDbCamps(campsRes.data || []);
        setDbHospitals(hospitalsRes.data || []);
      } catch (err) {
        console.error('Error fetching real camps/hospitals:', err);
      } finally {
        if (isMounted) setApiLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeState, activeDistrict]);

  // Combine real camps and hospitals with exact GPS distance calculation
  const getCombinedItems = () => {
    const items = [
      ...dbCamps.map(c => ({
        id: `camp-${c.id}`,
        name: c.name,
        type: 'Camp (Upcoming)',
        typeColor: '#ffdad8',
        typeTextColor: '#92001c',
        location: c.address,
        lat: parseFloat(c.lat),
        lng: parseFloat(c.lng),
        date: new Date(c.camp_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` (${c.organizer || 'Upcoming'})`,
        isCamp: true,
        original: c
      })),
      ...dbHospitals.map(h => ({
        id: `hosp-${h.id}`,
        name: h.name,
        type: `Hospital (${h.type})`,
        typeColor: '#e0f2fe',
        typeTextColor: '#0369a1',
        location: h.address,
        lat: parseFloat(h.lat),
        lng: parseFloat(h.lng),
        date: `Contact: ${h.contact || 'N/A'}`,
        isHospital: true,
        original: h
      }))
    ];

    // Filter out items that have invalid coordinates
    const validItems = items.filter(item => !isNaN(item.lat) && !isNaN(item.lng));

    if (userCoords) {
      return validItems.map(item => {
        const dist = getDistance(userCoords.lat, userCoords.lng, item.lat, item.lng);
        return {
          ...item,
          distance: dist,
          distanceStr: `${dist.toFixed(1)} km away`
        };
      }).sort((a, b) => a.distance - b.distance);
    }

    return validItems.map((item, idx) => ({
      ...item,
      distanceStr: 'Location unknown'
    }));
  };

  const activeItems = getCombinedItems();

  // 1. Initialize Map Canvas once on mount or tab/layout shifts
  useEffect(() => {
    if (!mapContainerRef.current) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

    const baseCoords = getDistrictCoords(activeDistrict, activeState);

    // Safely remove any existing map instance to avoid container reuse errors
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Reset container Leaflet state to prevent container reuse crashes
    if (mapContainerRef.current) {
      mapContainerRef.current._leaflet_id = null;
    }

    // Initialize Map Canvas
    const hasLocation = activeState && activeDistrict;
    const initialZoom = hasLocation ? 13 : 6;
    mapInstance.current = L.map(mapContainerRef.current).setView(baseCoords, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);
    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

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
  }, [mobileTab, isMobile]);

  // 2. Reactively update markers and map focus when district or DB items load/change
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    // Clear old markers
    markersGroup.current.clearLayers();

    const baseCoords = getDistrictCoords(activeDistrict, activeState);
    const hasLocation = activeState && activeDistrict;
    const initialZoom = hasLocation ? 13 : 6;
    mapInstance.current.setView(baseCoords, initialZoom);



    // Populate markers
    const coordinateCounts = {};
    activeItems.forEach(item => {
      let lat = item.lat;
      let lng = item.lng;
      const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (coordinateCounts[coordKey]) {
        const count = coordinateCounts[coordKey];
        const angle = count * (2 * Math.PI / 8); // Spread in 8 directions
        const radius = 0.00015 * count; // Spiral outwards slightly
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
        coordinateCounts[coordKey] = count + 1;
      } else {
        coordinateCounts[coordKey] = 1;
      }

      const popupContent = `
        <strong>${item.isCamp ? '🔴 Camp' : '🏥 Hospital'}: ${item.name}</strong><br/>
        ${item.location}<br/>
        <span style="color: #BE1F2E; font-weight: bold;">${item.distanceStr}</span>
      `;
      L.marker([lat, lng])
        .bindPopup(popupContent)
        .addTo(markersGroup.current);
    });

    // Automatically fit the map view to display all markers in the district
    if (activeItems.length > 0) {
      try {
        const bounds = L.latLngBounds(activeItems.map(item => [item.lat, item.lng]));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (err) {
        console.error('Error fitting map bounds:', err);
      }
    }
  }, [activeState, activeDistrict, mobileTab, isMobile, dbCamps, dbHospitals]); // Re-run when layout switches or items load!

  const handleSearch = () => {
    if (!selectedState || !selectedDistrict) {
      toast.error('Please select both a state and a district to search.');
      return;
    }
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

  const submitBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('raktsetu_auth_token');
    if (!token) {
      toast.error('You must log in as a donor to book a donation slot!');
      navigate('/login');
      return;
    }

    try {
      await api.post('/donor/appointments', {
        itemId: bookingCamp.id,
        date: bookingDate,
        timeSlot: bookingTime
      });
      setBookingSuccess(true);
      toast.success(`Appointment successfully booked at ${bookingCamp.name}!`);
      setTimeout(() => {
        setBookingCamp(null);
      }, 2000);
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(err.response?.data?.message || 'Failed to book slot. Please try again.');
    }
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
                <label htmlFor="select-state-1" className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select State</label>
                <select id="select-state-1"
                  className="w-full h-[48px] border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                  }}
                >
                  <option value="">— Select State —</option>
                  {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/4">
                <label htmlFor="select-district-2" className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Select District</label>
                <select id="select-district-2"
                  className={`w-full h-[48px] border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 text-[14px] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer ${
                    !selectedState ? 'opacity-50 cursor-not-allowed text-[#9A9A9A]' : 'text-[#1a1210]'
                  }`}
                  value={selectedDistrict}
                  disabled={!selectedState}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">— Select District —</option>
                  {(INDIA_STATES_DISTRICTS[selectedState] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-1/4">
                <label htmlFor="camp-date-3" className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Camp Date</label>
                <input id="camp-date-3"
                  type="date"
                  min={todayStr}
                  value={campDate}
                  onChange={(e) => setCampDate(e.target.value)}
                  className="w-full h-[48px] border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E] cursor-pointer"
                />
              </div>

              <div className="w-full md:w-1/4">
                <button type="button"
                  onClick={handleSearch}
                  className="w-full h-[48px] bg-[#1a1210] text-white px-6 rounded-xl text-[14px] font-[600] hover:bg-[#BE1F2E] transition-colors flex items-center justify-center gap-2 active:scale-95 duration-200"
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
                  <h3 className="text-[20px] font-serif italic text-[#1a1210]">
                    {activeDistrict ? `Available Places (${activeDistrict})` : 'Blood Camps & Hospitals'}
                  </h3>
                  {userCoords && activeDistrict && <p className="text-[11px] text-[#22A06B] font-semibold mt-1">Sorted by nearest proximity</p>}
                </div>

                {!activeDistrict ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full text-[#685c59] my-auto">
                    <span className="material-symbols-outlined text-[48px] text-[#BE1F2E]/40 mb-3">location_searching</span>
                    <h4 className="text-[16px] font-semibold text-[#1a1210] mb-1">Select Your Location</h4>
                    <p className="text-[13px] text-[#9A9A9A]">Choose a state and district from the filters above, then click <strong>Search Camps</strong> to see nearby blood donation camps and hospitals.</p>
                  </div>
                ) : apiLoading ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full text-[#685c59]">
                    <span className="material-symbols-outlined text-[36px] animate-spin text-[#BE1F2E] mb-3">progress_activity</span>
                    <p className="text-[13px] text-[#9A9A9A]">Fetching registered hospitals & camps...</p>
                  </div>
                ) : activeItems.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full text-[#685c59] my-auto">
                    <span className="material-symbols-outlined text-[48px] text-[#A8A0A0] mb-3">location_off</span>
                    <h4 className="text-[16px] font-semibold text-[#1a1210] mb-1">No Camps or Hospitals Found</h4>
                    <p className="text-[13px] text-[#9A9A9A]">There are no registered hospitals or scheduled blood donation camps in {activeDistrict} at this time.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[rgba(26,18,16,0.07)] flex-1">
                    {activeItems.map((item) => (
                      <div key={item.id} className="p-5 hover:bg-[#faf8f5] transition-colors flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="text-[16px] font-[600] text-[#1a1210]">{item.name}</h4>
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                            style={{ backgroundColor: item.typeColor, color: item.typeTextColor }}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#737373] mb-1">{item.location}</p>
                        <p className="text-[12px] text-[#BE1F2E] font-medium mb-4 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">my_location</span>
                          {item.distanceStr}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[12px] text-[#685c59] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              {item.isCamp ? 'calendar_today' : 'contact_phone'}
                            </span>
                            {item.date}
                          </span>
                          <button type="button"
                            onClick={() => handleBookAppointment(item)}
                            className="bg-[#1a1210] hover:bg-[#BE1F2E] text-white text-[12px] font-bold px-4 py-2 rounded-full transition-colors active:scale-95"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <button type="button"
                
                onClick={() => setMobileTab('requests')}
                className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all duration-200 ${
                  mobileTab === 'requests' ? 'bg-[#9e001f] text-white' : 'text-[#5c403f]'
                }`}
              >
                Camps
              </button>
              <button type="button"
                
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
                role="button"
                aria-label="Edit Profile"
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
                      <label htmlFor="select-state-4" className="text-[13px] font-medium text-[#5c403f]">Select State</label>
                      <div className="relative">
                        <select id="select-state-4"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedDistrict('');
                          }}
                          className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] appearance-none"
                        >
                          <option value="">— Select State —</option>
                          {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#906f6e] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="select-district-5" className="text-[13px] font-medium text-[#5c403f]">Select District</label>
                      <div className="relative">
                        <select id="select-district-5"
                          value={selectedDistrict}
                          disabled={!selectedState}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className={`w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f] appearance-none ${
                            !selectedState ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">— Select District —</option>
                          {(INDIA_STATES_DISTRICTS[selectedState] || []).map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#906f6e] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="camp-date-6" className="text-[13px] font-medium text-[#5c403f]">Camp Date</label>
                      <input id="camp-date-6"
                        type="date"
                        min={todayStr}
                        value={campDate}
                        onChange={(e) => setCampDate(e.target.value)}
                        className="w-full bg-white border border-[rgba(26,18,16,0.09)] rounded-lg px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9e001f]/40 focus:border-[#9e001f]"
                      />
                    </div>
                    <button type="button"
                      onClick={handleSearch}
                      className="w-full bg-[#9e001f] text-white py-3 rounded-full font-semibold active:scale-95 shadow-xl shadow-[#9e001f]/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      Find Camps
                    </button>
                  </div>
                </section>

                {/* Camps & Hospitals Card List */}
                <section className="space-y-4">
                  <div className="flex justify-between items-end border-b border-[#e5bdbb] pb-2 mb-2">
                    <h3 className="text-[22px] font-serif text-[#1a1210] italic">
                      {activeDistrict ? `Places in ${activeDistrict}` : 'Blood Camps & Hospitals'}
                    </h3>
                    {userCoords && activeDistrict && <span className="text-[10px] font-bold text-[#22A06B] uppercase tracking-wider">Nearby sorted</span>}
                  </div>
                  
                  {!activeDistrict ? (
                    <div className="bg-white border border-[rgba(26,18,16,0.09)] p-8 rounded-xl text-center flex flex-col items-center justify-center text-[#5c403f] shadow-sm">
                      <span className="material-symbols-outlined text-[40px] text-[#BE1F2E]/40 mb-2">location_searching</span>
                      <h4 className="text-[16px] font-bold text-[#1a1210] mb-1">Select Your Location</h4>
                      <p className="text-[13px] text-[#737373]">Choose a state and district above, then tap <strong>Find Camps</strong> to see nearby blood donation camps and hospitals.</p>
                    </div>
                  ) : apiLoading ? (
                    <div className="bg-white border border-[rgba(26,18,16,0.09)] p-8 rounded-xl text-center flex flex-col items-center justify-center text-[#5c403f] shadow-sm">
                      <span className="material-symbols-outlined text-[32px] animate-spin text-[#9e001f] mb-2">progress_activity</span>
                      <p className="text-[13px] text-[#737373]">Fetching places...</p>
                    </div>
                  ) : activeItems.length === 0 ? (
                    <div className="bg-white border border-[rgba(26,18,16,0.09)] p-8 rounded-xl text-center flex flex-col items-center justify-center text-[#5c403f] shadow-sm">
                      <span className="material-symbols-outlined text-[40px] text-[#906f6e] mb-2">location_off</span>
                      <h4 className="text-[16px] font-bold text-[#1a1210] mb-1">No Camps or Hospitals Found</h4>
                      <p className="text-[13px] text-[#737373]">There are no registered hospitals or scheduled blood donation camps in {activeDistrict} at this time.</p>
                    </div>
                  ) : (
                    activeItems.map((item) => (
                      <div key={item.id} className="bg-white border border-[rgba(26,18,16,0.09)] p-5 rounded-xl shadow-sm relative hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="pr-2">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ backgroundColor: item.typeColor, color: item.typeTextColor }}
                            >
                              {item.type}
                            </span>
                            <h4 className="text-[17px] font-semibold text-[#1a1210] leading-tight">{item.name}</h4>
                          </div>
                          <div className="w-16 h-10 rounded-full bg-[#ffdad8] text-[#9e001f] flex items-center justify-center font-bold text-[12px] shrink-0 px-2 text-center">
                            {item.distanceStr.split(' ')[0]} {item.distanceStr.split(' ')[1] || ''}
                          </div>
                        </div>
                        <p className="text-[#5c403f] text-[13px] mb-3 leading-normal">{item.location}</p>
                        <div className="flex items-center justify-between border-t border-[rgba(26,18,16,0.05)] pt-3 mt-1">
                          <span className="text-[12px] text-[#737373] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">
                              {item.isCamp ? 'calendar_today' : 'contact_phone'}
                            </span>
                            {item.date.split(',')[0]}
                          </span>
                          <button type="button"
                            onClick={() => handleBookAppointment(item)}
                            className="bg-[#1a1210] hover:bg-[#9e001f] text-white text-[12px] font-bold px-5 py-2.5 rounded-full transition-colors active:scale-95 shadow-md"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
              { name: 'Home', action: () => navigate('/dashboard'), icon: 'home', active: false },
              { name: 'Camps', action: () => { setMobileTab('requests'); }, icon: 'bloodtype', active: mobileTab === 'requests' },
              { name: 'Map', action: () => { setMobileTab('map'); }, icon: 'explore', active: mobileTab === 'map' },
              { name: 'Profile', action: () => navigate('/edit-profile'), icon: 'person', active: false }
            ].map((item) => {
              const isActive = item.active;
              return (
                <button type="button"
                  key={item.name}
                  onClick={item.action}
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
                  <label htmlFor="preferred-date-7" className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Preferred Date</label>
                  <input id="preferred-date-7"
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full border border-[#D8D0CA] bg-[#faf8f5] rounded-xl px-4 py-3 text-[14px] text-[#1a1210] font-[500] outline-none focus:border-[#BE1F2E]"
                  />
                </div>
                <div>
                  <label htmlFor="time-slot-8" className="block text-[11px] font-[600] uppercase tracking-widest text-[#685c59] mb-2">Time Slot</label>
                  <select id="time-slot-8"
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
                  <button type="button"
                    
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
