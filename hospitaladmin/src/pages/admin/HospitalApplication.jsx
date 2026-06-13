import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { ArrowLeft, Check, Upload, AlertCircle, FileText, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (!formData.hospitalName) tempErrors.hospitalName = "Hospital Name is required";
    if (!formData.regNumber) tempErrors.regNumber = "Registration Number is required";
    if (!formData.licenseNumber) tempErrors.licenseNumber = "License Number is required";
    if (!formData.bloodBankLicense) tempErrors.bloodBankLicense = "Blood Bank License is required";
    if (!formData.address) tempErrors.address = "Address is required";
    if (!formData.city) tempErrors.city = "City is required";
    if (!formData.state) tempErrors.state = "State is required";
    
    if (!formData.pincode) {
      tempErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      tempErrors.pincode = "Pincode must be exactly 6 digits";
    }

    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Enter a valid email address";
    }

    if (!formData.phone) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        submitApplication({
          ...formData,
          fileName: file.name
        });
        navigate('/admin/pending');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-y-auto py-10 px-4 sm:px-6">
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full z-10">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hospital Registration</h1>
              <p className="text-slate-400 text-xs mt-0.5">Please provide accurate verification details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospital Name *</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  placeholder="e.g. Apex Multi Speciality Hospital"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.hospitalName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.hospitalName && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.hospitalName}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospital Type *</label>
                <select
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600"
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Number *</label>
                <input
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  placeholder="REG123456"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.regNumber ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.regNumber && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.regNumber}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="LIC-998877"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.licenseNumber ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.licenseNumber && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.licenseNumber}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blood Bank License *</label>
                <input
                  type="text"
                  name="bloodBankLicense"
                  value={formData.bloodBankLicense}
                  onChange={handleInputChange}
                  placeholder="BB-LIC-5544"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.bloodBankLicense ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.bloodBankLicense && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.bloodBankLicense}</span>}
              </div>
            </div>

            {/* Address Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                placeholder="Street address, building name, locality"
                className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                  errors.address ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                }`}
              />
              {errors.address && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.address}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Pune"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.city ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.city && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.city}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Maharashtra"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.state ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.state && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.state}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="411001"
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.pincode ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.pincode && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.pincode}</span>}
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Authorized Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@hospital.com"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.email && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-white text-sm focus:outline-none transition-all ${
                    errors.phone ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-600'
                  }`}
                />
                {errors.phone && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</span>}
              </div>
            </div>

            {/* Upload Documents */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload License Document *</label>
              
              <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 bg-slate-950/50 hover:bg-slate-950/80 transition-all flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {file ? (
                  <div className="flex items-center gap-3 text-slate-200">
                    <FileText className="text-red-500" size={28} />
                    <div className="text-left">
                      <p className="text-sm font-semibold max-w-[250px] truncate">{file.name}</p>
                      <p className="text-slate-400 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <Upload className="text-slate-400 group-hover:text-red-500 transition-colors mb-2" size={28} />
                    <p className="text-sm font-medium text-slate-300">Click or drag file to upload</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
              {fileError && <span className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {fileError}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/35 transition-all text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Verification...</span>
                </>
              ) : (
                <span>Submit Registration Application</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalApplication;
