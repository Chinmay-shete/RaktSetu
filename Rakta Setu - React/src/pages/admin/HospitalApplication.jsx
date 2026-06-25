import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import api from '../../services/api';

const HospitalApplication = () => {
  const navigate = useNavigate();
  const { submitApplication } = useHospital();
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    regNumber: '',
    licenseNumber: '',
    bloodBankLicense: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    hospitalType: 'Government',
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.hospitalName.trim()) tempErrors.hospitalName = "Hospital Name is required";
    if (!formData.regNumber.trim()) tempErrors.regNumber = "Registration Number is required";
    if (!formData.licenseNumber.trim()) tempErrors.licenseNumber = "License Number is required";
    if (!formData.bloodBankLicense.trim()) tempErrors.bloodBankLicense = "Blood Bank License is required";
    if (!formData.address.trim()) tempErrors.address = "Address is required";
    if (!formData.city.trim()) tempErrors.city = "City is required";
    if (!formData.state.trim()) tempErrors.state = "State is required";
    
    if (!formData.pincode.trim()) {
      tempErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      tempErrors.pincode = "Pincode must be exactly 6 digits";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      tempErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!file) {
      setFileError("Please upload the license document (.pdf or .jpg/.png)");
    } else {
      setFileError("");
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0 && file !== null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5MB limit");
        setFile(null);
      } else {
        setFile(selectedFile);
        setFileError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setFileError('');
      try {
        const data = new FormData();
        data.append('license', file);

        const uploadRes = await api.post('/hospital/upload-license', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const uploadedFilename = uploadRes.data.filename;

        submitApplication({
          ...formData,
          licenseDocument: uploadedFilename,
          fileName: file.name
        });

        setIsSubmitting(false);
        navigate('/admin/pending');
      } catch (err) {
        setIsSubmitting(false);
        const errMsg = err.response?.data?.message || 'Failed to upload license document. Please try again.';
        setFileError(errMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col font-sans relative overflow-y-auto selection:bg-[#BE1F2E] selection:text-white">
      <div className="noise-filter" />

      {/* ── SIMPLIFIED AUTH NAVBAR ─────────────────────────────────────── */}
      <nav className="w-full bg-white border-b border-[#E0DAD4] sticky top-0 z-40">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 lg:px-16 w-full">
          <Link to="/" className="font-serif text-[22px] font-bold text-[#BE1F2E]" style={{ fontFeatureSettings: '"liga" 0' }}>
            RaktSetu
          </Link>
          <span className="text-[13px] text-[#9A9A9A] uppercase tracking-widest font-bold">
            Hospital Portal
          </span>
        </div>
      </nav>

      {/* ── MAIN CARD ──────────────────────────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[700px] bg-white border border-[#EDE7E1] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-10 relative overflow-hidden my-6">
          
          {/* Watermark */}
          <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[200px]" style={{ fontSize: 200 }}>medical_services</span>
          </div>

          {/* Header Row */}
          <div className="flex justify-between items-center mb-10">
            <span className="font-serif text-[20px] font-bold text-[#BE1F2E] italic">RaktSetu</span>
            <span className="badge-neutral">Hospital Onboarding</span>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif mb-2 text-[32px] font-[700] text-[#1A0A0A] leading-[1.1]" style={{ fontFeatureSettings: '"liga" 0' }}>
                Register Hospital
              </h1>
              <p className="text-[15px] text-[#9A9A9A] mb-8 leading-[1.6]">
                Submit verification details to join the RaktSetu blood logistics registry.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* General Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Hospital Name *</label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Multi Speciality Hospital"
                    className={`input-field ${errors.hospitalName ? 'error' : ''}`}
                    required
                  />
                  {errors.hospitalName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.hospitalName}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Hospital Type *</label>
                  <select
                    name="hospitalType"
                    value={formData.hospitalType}
                    onChange={handleInputChange}
                    className="input-field custom-select"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Trust">Trust</option>
                    <option value="Semi-Govt">Semi-Govt</option>
                  </select>
                </div>
              </div>

              {/* License Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Reg. Number *</label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleInputChange}
                    placeholder="REG123456"
                    className={`input-field ${errors.regNumber ? 'error' : ''}`}
                    required
                  />
                  {errors.regNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.regNumber}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="LIC-998877"
                    className={`input-field ${errors.licenseNumber ? 'error' : ''}`}
                    required
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.licenseNumber}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">BB License *</label>
                  <input
                    type="text"
                    name="bloodBankLicense"
                    value={formData.bloodBankLicense}
                    onChange={handleInputChange}
                    placeholder="BB-LIC-5544"
                    className={`input-field ${errors.bloodBankLicense ? 'error' : ''}`}
                    required
                  />
                  {errors.bloodBankLicense && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.bloodBankLicense}</p>}
                </div>
              </div>

              {/* Address Details */}
              <div className="mb-1">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Full Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Street address, building name, locality"
                  className={`input-field ${errors.address ? 'error' : ''}`}
                  required
                />
                {errors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Pune"
                    className={`input-field ${errors.city ? 'error' : ''}`}
                    required
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.city}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className={`input-field ${errors.state ? 'error' : ''}`}
                    required
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.state}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="411001"
                    maxLength={6}
                    className={`input-field ${errors.pincode ? 'error' : ''}`}
                    required
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.pincode}</p>}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Authorized Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@hospital.com"
                    className={`input-field ${errors.email ? 'error' : ''}`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>

                <div className="mb-1">
                  <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Contact Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`input-field ${errors.phone ? 'error' : ''}`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>}
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="text-[11px] font-[600] uppercase tracking-widest text-[#9A9A9A] ml-1 block mb-2">Upload License Document *</label>
                <div className="relative border-2 border-dashed border-[#D8D0CA] rounded-xl p-8 bg-white hover:bg-[#FDFBF9] transition-all flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required={!file}
                  />
                  {file ? (
                    <div className="text-center flex flex-col items-center">
                      <span className="material-symbols-outlined text-[#BE1F2E] text-[36px] mb-2 block">description</span>
                      <p className="text-sm font-semibold text-[#1A1A1A] max-w-[250px] truncate">{file.name}</p>
                      <p className="text-[#9A9A9A] text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center">
                      <span className="material-symbols-outlined text-[#9A9A9A] group-hover:text-[#BE1F2E] text-[36px] mb-2 block transition-colors">cloud_upload</span>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Click or drag file to upload</p>
                      <p className="text-xs text-[#9A9A9A] mt-1">PDF, JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                {fileError && <p className="text-red-500 text-xs mt-1 font-semibold">{fileError}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
                style={{ minHeight: 52 }}
              >
                {isSubmitting ? 'Submitting Registration…' : 'Submit Registration Application'}
              </button>
            </form>

            {/* Quick Link to Login */}
            <div className="mt-8 text-center text-xs text-[#5A5A5A]">
              Already registered?{' '}
              <Link to="/admin/login" className="text-link font-semibold">
                Sign In
              </Link>
            </div>
          </div>

          {/* Legal */}
          <p className="text-center text-[11px] text-[#9A9A9A] leading-relaxed mt-8 px-4">
            By submitting, you authorize RaktSetu to verify credentials against state regulatory databases.
          </p>
        </div>
      </main>

      {/* ── MINIMAL AUTH FOOTER ────────────────────────────────────────── */}
      <footer className="py-6 text-center text-[12px] text-[#9A9A9A]">
        © 2024 RaktSetu ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Privacy Policy</a> ·{' '}
        <a className="hover:text-[#BE1F2E] transition-colors" href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default HospitalApplication;
