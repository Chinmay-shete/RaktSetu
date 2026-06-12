import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { StatCard } from '../../components/ui/StatCard';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Heart,
  Activity,
  Flame,
  ArrowLeftRight,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const { data: inventory = [], isLoading: invLoading, isError: invError, refetch: refetchInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory
  });

  const { data: transfers = [], isLoading: transLoading, isError: transError, refetch: refetchTrans } = useQuery({
    queryKey: ['transfers'],
    queryFn: mockApi.getTransferRequests
  });

  const { data: emergencies = [], isLoading: emergLoading, isError: emergError, refetch: refetchEmerg } = useQuery({
    queryKey: ['emergencies'],
    queryFn: mockApi.getEmergencyRequests
  });

  if (invLoading || transLoading || emergLoading) {
    return <Loader message="Fetching hospital metrics..." />;
  }

  if (invError || transError || emergError) {
    return (
      <ErrorState
        message="An error occurred while retrieving live dashboard statistics."
        onRetry={() => {
          refetchInv();
          refetchTrans();
          refetchEmerg();
        }}
      />
    );
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const availableUnits = inventory.reduce((sum, item) => sum + Math.max(0, item.units - item.reservedUnits), 0);
  const expiringSoonCount = inventory.filter(item => item.status === 'Expiring Soon').length;
  
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;
  const pendingEmergenciesCount = emergencies.filter(e => e.status === 'Pending').length;
  const acceptedTransfersCount = transfers.filter(t => t.status === 'Approved').length;
  const rejectedTransfersCount = transfers.filter(t => t.status === 'Rejected').length;

  const criticalGroups = inventory
    .filter(item => (item.units - item.reservedUnits) <= 3 && item.status !== 'Expired')
    .map(item => item.bloodGroup);

  const uniqueCriticalGroups = [...new Set(criticalGroups)];
  const hasSOS = pendingEmergenciesCount > 0;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className={`relative p-8 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 border ${
        hasSOS 
          ? 'bg-rose-500/5 dark:bg-rose-950/5 border-rose-500/30 text-slate-800 dark:text-slate-100' 
          : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white dark:border-slate-800'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl -z-10" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl -z-10" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasSOS ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${hasSOS ? 'bg-rose-600' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`text-xxs font-bold uppercase tracking-wider ${hasSOS ? 'text-rose-500' : 'text-emerald-400'}`}>
              {hasSOS ? 'CRITICAL: SOS Emergency Pending' : 'Live Status: Online & Stable'}
            </span>
          </div>

          <h1 className={`text-2xl md:text-3xl font-extrabold font-outfit leading-tight ${hasSOS ? 'text-slate-800 dark:text-white' : 'text-white'}`}>
            Welcome, {user.name}
          </h1>
          <p className={`text-sm max-w-lg ${hasSOS ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400'}`}>
            Inventory status, blood transfer pipelines, and active regional hospital requests are monitored in real time.
          </p>
        </div>

        <div className={`flex flex-wrap items-center gap-6 md:gap-10 pt-6 md:pt-0 md:pl-10 border-t md:border-t-0 md:border-l ${
          hasSOS ? 'border-slate-300 dark:border-slate-800' : 'border-slate-700/50'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Current Blood Stock
            </span>
            <span className={`text-2xl font-black font-outfit ${hasSOS ? 'text-slate-850 dark:text-white' : 'text-white'}`}>
              {totalUnits} <span className="text-xs font-medium text-slate-450">Units</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Active Transfers
            </span>
            <span className={`text-2xl font-black font-outfit ${hasSOS ? 'text-slate-850 dark:text-white' : 'text-white'}`}>
              {pendingTransfersCount} <span className="text-xs font-medium text-slate-450">Pending</span>
            </span>
          </div>
          {uniqueCriticalGroups.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Critical Groups
              </span>
              <div className="flex gap-1 mt-1">
                {uniqueCriticalGroups.slice(0, 3).map(group => (
                  <span key={group} className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Blood Units"
          value={totalUnits}
          icon={Heart}
          color="red"
          description="Gross storage count"
        />
        <StatCard
          title="Available Units"
          value={availableUnits}
          icon={Activity}
          color="green"
          description="Excludes reserved stock"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          icon={AlertTriangle}
          color="amber"
          description="Expiring in <30 days"
        />
        <StatCard
          title="Transfer Requests"
          value={pendingTransfersCount}
          icon={ArrowLeftRight}
          color="blue"
          description="Awaiting decision"
        />
        <StatCard
          title="Emergency Requests"
          value={pendingEmergenciesCount}
          icon={Flame}
          color="red"
          description="Active SOS alarms"
        />
        <StatCard
          title="Accepted Requests"
          value={acceptedTransfersCount}
          icon={ThumbsUp}
          color="green"
          description="Dispatched successfully"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedTransfersCount}
          icon={ThumbsDown}
          color="slate"
          description="Declined requests"
        />
        <StatCard
          title="Monthly Donations"
          value={245}
          icon={Calendar}
          color="blue"
          description="Camp collections"
        />
      </div>

      {hasSOS && (
        <div className="animate-pulse bg-rose-600 border border-rose-500/25 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-2xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Urgent SOS Emergency Dispatch Requested!</p>
              <p className="text-xs text-rose-100 mt-0.5">There are active emergency blood requests in your region. Response required immediately.</p>
            </div>
          </div>
          <Link
            to="/hospital/emergency"
            className="flex-shrink-0 bg-white text-rose-600 hover:bg-rose-50 font-bold px-4 py-2 rounded-2xl text-xs transition-colors shadow-md cursor-pointer whitespace-nowrap"
          >
            Open SOS Panel
          </Link>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
