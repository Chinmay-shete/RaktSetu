import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { hospitalApi } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  MapPin,
  User,
  Phone,
  Filter,
  Loader2,
  Mail
} from 'lucide-react';

export const DonorSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Contact details modal states
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      bloodGroup: 'O+',
      location: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const results = await hospitalApi.searchDonors({
        bloodGroup: data.bloodGroup,
        location: data.location
      });
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setSearchError('Failed to retrieve matching donors. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenContact = (donor) => {
    setSelectedDonor(donor);
    setContactSuccess(false);
    setContactMessage(`Hello ${donor.name},\n\nWe urgently require ${donor.bloodGroup} blood donations at our facility. Since you are in our partner network and eligible to donate, please consider visiting us to make a life-saving contribution.\n\nThank you.`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSubmittingContact(true);
    try {
      await hospitalApi.contactDonor(selectedDonor.id, { message: contactMessage });
      setContactSuccess(true);
      setTimeout(() => {
        setSelectedDonor(null);
        setContactSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to dispatch contact outreach.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const fieldLabel = "text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] ml-1 block mb-2";

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="border-b border-[#EDE7E1] pb-6">
        <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
          Donor Search
        </h1>
        <p className="text-[14px] text-[#5A5A5A]">
          Locate eligible donors by blood group and location for targeted emergency outreach.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#EDE7E1]">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label htmlFor="blood-group-1" className={fieldLabel}>Blood Group</label>
            <select id="blood-group-1"
              {...register("bloodGroup")}
              className="input-field custom-select"
            >
              <option value="">Any Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label htmlFor="location-city-district-2" className={fieldLabel}>Location (City / District)</label>
            <div className="relative">
              <input id="location-city-district-2"
                type="text"
                placeholder="e.g. New Delhi"
                {...register("location")}
                className="input-field !pl-10"
              />
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7A5F5F]" />
            </div>
          </div>

          <div className="md:col-span-3">
            <button type="submit" disabled={isSearching} className="btn-primary w-full" style={{ minHeight: 48 }}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Donors
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EDE7E1] overflow-hidden mt-2">
          {isSearching ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-[#7A5F5F]">
              <Loader2 className="h-8 w-8 animate-spin text-[#BE1F2E]" />
              <p className="text-xs font-bold uppercase tracking-wider">Locating eligible donors...</p>
            </div>
          ) : searchError ? (
            <div className="p-8 text-center text-[#BE1F2E] text-[13px] font-semibold">
              {searchError}
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-[#EDE7E1] bg-[#FAF8F5] flex justify-between items-center">
                <div>
                  <h3 className="text-[18px] font-[600] text-[#1A1210]">Search Results</h3>
                  <p className="text-[13px] text-[#7A5F5F] mt-1">Found {searchResults.length} matching donors.</p>
                </div>
                <button type="button" className="text-[13px] font-[600] text-[#BE1F2E] flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[rgba(190,31,46,0.06)] transition-colors border border-[#BE1F2E]/20">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EDE7E1]">
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Donor Info</th>
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Blood Group</th>
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Location</th>
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Last Donated</th>
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F]">Status</th>
                      <th className="px-4 py-3 text-[11px] font-[600] uppercase tracking-widest text-[#7A5F5F] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(donor => (
                      <tr key={donor.id} className="border-b border-[#EDE7E1] hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E0DAD4] flex items-center justify-center text-[#5A5A5A]">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[13px] font-[600] text-[#1A1210]">{donor.name}</p>
                              <p className="text-[11px] text-[#7A5F5F] mt-0.5">{donor.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center px-2 py-1 bg-[#BE1F2E]/10 text-[#BE1F2E] text-[11px] font-[700] rounded uppercase tracking-wider">
                            {donor.bloodGroup}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">{donor.location}</td>
                        <td className="px-4 py-4 text-[13px] text-[#5A5A5A]">{donor.lastDonated || 'Never'}</td>
                        <td className="px-4 py-4">
                          {donor.status === 'Eligible' ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#22A06B]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B]"></span>
                              Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[12px] font-[600] text-[#E07B00]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E07B00]"></span>
                              Not Eligible
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button type="button"
                            onClick={() => handleOpenContact(donor)}
                            className="text-[13px] font-[600] text-[#BE1F2E] hover:underline"
                            disabled={donor.status !== 'Eligible'}
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                    {searchResults.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center text-[#7A5F5F] text-[13px]">
                          No donors found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Contact outreach details Modal */}
      {selectedDonor && (
        <Modal
          isOpen={!!selectedDonor}
          onClose={() => setSelectedDonor(null)}
          title="Contact Donor Outreach"
        >
          {contactSuccess ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#22A06B]">
                <Mail className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#1A1210]">Outreach Dispatched</h4>
              <p className="text-xs text-[#7A5F5F]">Emergency message has been broadcasted and emailed to the donor.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE7E1] space-y-2">
                <h4 className="text-[13px] font-bold text-[#1A1210]">Donor Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#7A5F5F] block text-xxs uppercase tracking-wider">Full Name</span>
                    <span className="font-semibold text-[#1A1210]">{selectedDonor.name}</span>
                  </div>
                  <div>
                    <span className="text-[#7A5F5F] block text-xxs uppercase tracking-wider">Blood Group</span>
                    <span className="font-extrabold text-[#BE1F2E]">{selectedDonor.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-[#7A5F5F] block text-xxs uppercase tracking-wider">Phone Number</span>
                    <span className="font-semibold text-[#1A1210] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#7A5F5F]" /> {selectedDonor.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7A5F5F] block text-xxs uppercase tracking-wider">Email Address</span>
                    <span className="font-semibold text-[#1A1210] flex items-center gap-1 truncate sm:max-w-[150px]">
                      <Mail className="w-3.5 h-3.5 text-[#7A5F5F]" /> {selectedDonor.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="outreach-notification-message-3" className={fieldLabel}>Outreach Notification Message</label>
                <textarea id="outreach-notification-message-3"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows="5"
                  className="input-field resize-none text-xs leading-relaxed"
                  placeholder="Enter custom emergency message details..."
                  required
                />
              </div>

              <div className="flex gap-3 border-t border-[#EDE7E1] pt-4 mt-2">
                <button type="button"
                  
                  onClick={() => setSelectedDonor(null)}
                  className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmittingContact ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Send Alert
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default DonorSearch;
