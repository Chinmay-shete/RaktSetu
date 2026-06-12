import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../../../services/mockApi';
import { exportToCSV } from '../../../utils/csvExport';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import {
  Search,
  Filter,
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
    queryFn: mockApi.getInventory
  });

  const deleteMutation = useMutation({
    mutationFn: mockApi.deleteInventory,
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
  const filteredInventory = inventory.filter(item => {
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            Expired
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30">
            <Clock className="h-3.5 w-3.5" />
            Expiring Soon
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-650 border border-red-200/50 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/20">
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
            Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30">
            <CheckCircle className="h-3.5 w-3.5" />
            Available
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
            Blood Stock Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, search, and manage registered blood bag batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-650 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/hospital/update-stock')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Blood Bag
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-slate-950/40 border border-slate-250/50 dark:border-slate-800/40 shadow-inner w-full md:max-w-xs focus-within:ring-2 focus-within:ring-rose-500/15">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search group, source, remarks..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Group</span>
            <select
              value={groupFilter}
              onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
            >
              <option value="All">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table Grid */}
      {filteredInventory.length === 0 ? (
        <EmptyState 
          title="No inventory match" 
          description="We couldn't find any blood bags matching your query. Add fresh stock or adjust your filters."
        />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-md flex-grow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 text-xxs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Quantity Available</th>
                  <th className="px-6 py-4">Reserved Quantity</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/30 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {paginatedInventory.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-base font-extrabold font-outfit text-slate-800 dark:text-slate-100">
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.units - item.reservedUnits}
                      </span>
                      <span className="text-[10px] font-normal text-slate-400 ml-1">units</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.reservedUnits > 0 ? (
                        <span className="text-blue-500 dark:text-blue-450 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/15">
                          {item.reservedUnits} units
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-normal">
                      <span className={item.status === 'Expired' ? 'text-rose-600 font-bold' : ''}>
                        {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBag(item)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 hover:text-slate-855 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-550 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete Batch"
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 text-xs font-semibold text-slate-500">
              <span>
                Showing page <strong className="text-slate-750 dark:text-slate-300">{currentPage}</strong> of <strong className="text-slate-755 dark:text-slate-300">{totalPages}</strong> ({filteredInventory.length} items)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
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
            <div className="flex items-center gap-4 bg-slate-100/40 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
              <span className="text-4xl font-extrabold text-rose-600 font-outfit">
                {selectedBag.bloodGroup}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Quantity</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {selectedBag.units} units <span className="text-xs font-normal text-slate-450">({selectedBag.reservedUnits} reserved)</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-650">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                <p className="text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Collection Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(selectedBag.collectionDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                <p className="text-slate-400 mb-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Expiry Date</p>
                <p className={`font-bold ${selectedBag.status === 'Expired' ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {new Date(selectedBag.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                <p className="text-slate-400 mb-1 flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Source</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedBag.source}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 rounded-xl">
                <p className="text-slate-400 mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Risk Level</p>
                <p className="font-bold text-slate-850 dark:text-slate-200">
                  {selectedBag.daysRemaining < 0 
                    ? `Expired (${Math.abs(selectedBag.daysRemaining)} days ago)` 
                    : `${selectedBag.daysRemaining} days remaining`}
                </p>
              </div>
            </div>

            {selectedBag.remarks && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/40 rounded-xl text-xs">
                <p className="text-slate-400 mb-1 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Batch Remarks</p>
                <p className="font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{selectedBag.remarks}</p>
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
          <div className="mx-auto bg-rose-100 dark:bg-rose-950/50 p-4 rounded-full text-rose-600 w-16 h-16 flex items-center justify-center">
            <Trash2 className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-outfit">
            Are you sure you want to remove this batch?
          </h3>
          <p className="text-xs text-slate-450 leading-relaxed">
            This action cannot be undone. Removing this batch will delete all recorded blood units of this lot from your available storage.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="w-1/2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-550 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="w-1/2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
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
