import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../../services/api';
import { exportToCSV } from '../../../utils/csvExport';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import {
  Search,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export const BloodInventory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selectedBag, setSelectedBag] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: inventory = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: hospitalApi.getInventory
  });

  const deleteMutation = useMutation({
    mutationFn: hospitalApi.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Blood bag batch deleted successfully!");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete the selected batch.");
    }
  });

  if (isLoading) return <Loader message="Loading blood stock inventory..." />;
  if (isError) return <ErrorState message="Failed to load stock data." onRetry={refetch} />;

  // Filtering
  const filteredInventory = (Array.isArray(inventory) ? inventory : []).filter(item => {
    const matchesSearch = 
      item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.remarks && item.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || item.bloodGroup === groupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    if (!filteredInventory.length) {
      toast.warning("No stock items available to export");
      return;
    }
    const cleanData = filteredInventory.map(item => ({
      ID: item.id,
      "Blood Group": item.bloodGroup,
      "Available Units": item.units - item.reservedUnits,
      "Reserved Units": item.reservedUnits,
      "Total Units": item.units,
      Source: item.source,
      "Collection Date": item.collectionDate,
      "Expiry Date": item.expiryDate,
      Status: item.status,
      "Days Remaining": item.daysRemaining
    }));
    exportToCSV(cleanData, `RaktSetu_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success("CSV file downloaded successfully!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#BE1F2E]/10 text-[#BE1F2E] border border-[#BE1F2E]/15">
            <AlertTriangle className="h-3.5 w-3.5" />
            Expired
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E07B00]/10 text-[#E07B00] border border-[#E07B00]/15">
            <Clock className="h-3.5 w-3.5" />
            Expiring Soon
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#BE1F2E] border border-[#BE1F2E]/10">
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#22A06B]/10 text-[#22A06B] border border-[#22A06B]/15">
            <CheckCircle className="h-3.5 w-3.5" />
            Available
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in select-none">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EDE7E1] pb-6">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
            Blood Stock Inventory
          </h1>
          <p className="text-[14px] text-[#5A5A5A]">
            View, search, and manage registered blood bag batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EDE7E1] shadow-sm text-xs font-bold text-[#5A5A5A] hover:text-[#1A1210] hover:border-[#BE1F2E]/30 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button type="button"
            onClick={() => navigate('/staff/update-stock')}
            className="btn-primary"
            style={{ minHeight: 42, minWidth: 'auto', padding: '10px 20px', fontSize: 13 }}
          >
            <Plus className="h-4 w-4" />
            Add Blood Bag
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm border border-[#EDE7E1]">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE7E1] w-full md:max-w-xs focus-within:border-[#BE1F2E]/30">
          <Search className="h-4 w-4 text-[#7A5F5F]" />
          <input
            type="text"
            placeholder="Search group, source, remarks..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-xs w-full text-[#1A1210] placeholder-[#A8A0A0]"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="status-filter" className="text-[10px] uppercase font-bold tracking-wider text-[#7A5F5F]">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-field custom-select"
              style={{ padding: '8px 36px 8px 12px', fontSize: 12, borderRadius: 10 }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="group-filter" className="text-[10px] uppercase font-bold tracking-wider text-[#7A5F5F]">Group</label>
            <select
              id="group-filter"
              value={groupFilter}
              onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1); }}
              className="input-field custom-select"
              style={{ padding: '8px 36px 8px 12px', fontSize: 12, borderRadius: 10 }}
            >
              <option value="All">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <EmptyState 
          title="No inventory match" 
          description="We couldn't find any blood bags matching your query. Add fresh stock or adjust your filters."
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EDE7E1] flex-grow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE7E1] bg-[#FAF8F5] text-[11px] font-bold text-[#7A5F5F] uppercase tracking-wider">
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Quantity Available</th>
                  <th className="px-6 py-4">Reserved Quantity</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7E1] text-xs text-[#3D2B2B] font-medium">
                {paginatedInventory.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-[#FAF8F5] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-base font-extrabold text-[#BE1F2E] font-serif">
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1A1210]">
                        {item.units - item.reservedUnits}
                      </span>
                      <span className="text-[10px] font-normal text-[#7A5F5F] ml-1">units</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.reservedUnits > 0 ? (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/50">
                          {item.reservedUnits} units
                        </span>
                      ) : (
                        <span className="text-[#7A5F5F] font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-normal">
                      <span className={item.status === 'Expired' ? 'text-[#BE1F2E] font-bold' : 'text-[#3D2B2B]'}>
                        {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button"
                          onClick={() => setSelectedBag(item)}
                          className="p-2 rounded-xl bg-[#FAF8F5] text-[#5A5A5A] hover:text-[#BE1F2E] border border-[#EDE7E1] transition-colors cursor-pointer"
                          title="View Details"
                          aria-label="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button type="button"
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 rounded-xl bg-red-50 text-[#BE1F2E] hover:bg-red-100 border border-[#BE1F2E]/10 transition-colors cursor-pointer"
                          title="Delete Batch"
                          aria-label="Delete batch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#EDE7E1] bg-[#FAF8F5] text-xs font-semibold text-[#5A5A5A]">
              <span>
                Showing page <strong className="text-[#1A1210]">{currentPage}</strong> of <strong className="text-[#1A1210]">{totalPages}</strong> ({filteredInventory.length} items)
              </span>
              <div className="flex gap-2">
                <button type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-[#EDE7E1] bg-white disabled:opacity-50 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  Previous
                </button>
                <button type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl border border-[#EDE7E1] bg-white disabled:opacity-50 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bag Details Modal */}
      <Modal
        isOpen={!!selectedBag}
        onClose={() => setSelectedBag(null)}
        title={selectedBag ? `Batch details: ${selectedBag.id}` : ''}
      >
        {selectedBag && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE7E1]">
              <span className="text-4xl font-extrabold text-[#BE1F2E] font-serif">
                {selectedBag.bloodGroup}
              </span>
              <div>
                <p className="text-[11px] font-bold text-[#7A5F5F] uppercase tracking-wider">Total Quantity</p>
                <p className="text-lg font-bold text-[#1A1210]">
                  {selectedBag.units} units <span className="text-xs font-normal text-[#7A5F5F]">({selectedBag.reservedUnits} reserved)</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#3D2B2B]">
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl">
                <p className="text-[#7A5F5F] mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Collection Date</p>
                <p className="font-bold text-[#1A1210]">{new Date(selectedBag.collectionDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl">
                <p className="text-[#7A5F5F] mb-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Expiry Date</p>
                <p className={`font-bold ${selectedBag.status === 'Expired' ? 'text-[#BE1F2E]' : 'text-[#1A1210]'}`}>
                  {new Date(selectedBag.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl">
                <p className="text-[#7A5F5F] mb-1 flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Source</p>
                <p className="font-bold text-[#1A1210]">{selectedBag.source}</p>
              </div>
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl">
                <p className="text-[#7A5F5F] mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Risk Level</p>
                <p className="font-bold text-[#1A1210]">
                  {selectedBag.daysRemaining < 0 
                    ? `Expired (${Math.abs(selectedBag.daysRemaining)} days ago)` 
                    : `${selectedBag.daysRemaining} days remaining`}
                </p>
              </div>
            </div>

            {selectedBag.remarks && (
              <div className="p-3 bg-white border border-[#EDE7E1] rounded-xl text-xs">
                <p className="text-[#7A5F5F] mb-1 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Batch Remarks</p>
                <p className="font-bold text-[#3D2B2B] leading-relaxed">{selectedBag.remarks}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto bg-red-50 p-4 rounded-full text-[#BE1F2E] w-16 h-16 flex items-center justify-center border border-[#BE1F2E]/10">
            <Trash2 className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[#1A1210] font-serif">
            Are you sure you want to remove this batch?
          </h3>
          <p className="text-xs text-[#5A5A5A] leading-relaxed">
            This action cannot be undone. Removing this batch will delete all recorded blood units of this lot from your available storage.
          </p>
          <div className="flex gap-3 mt-2">
            <button type="button"
              onClick={() => setDeleteId(null)}
              className="w-1/2 px-4 py-2.5 rounded-full border border-[#EDE7E1] text-xs font-bold text-[#5A5A5A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button type="button"
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="w-1/2 px-4 py-2.5 rounded-full bg-[#BE1F2E] hover:bg-[#9E1825] disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              {deleteMutation.isPending ? "Removing..." : "Yes, Delete Lot"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default BloodInventory;
