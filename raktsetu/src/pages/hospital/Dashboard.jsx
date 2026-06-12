import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
  Database,
  PlusCircle,
  Clock,
  ChevronRight,
  Settings
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: inventory = [], isLoading: invLoading, isError: invError, refetch: refetchInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory
  });

  const { data: transfers = [], isLoading: transLoading, isError: transError, refetch: refetchTrans } = useQuery({
    queryKey: ['transfers'],
    queryFn: mockApi.getTransferRequests
  });

  if (invLoading || transLoading) {
    return <Loader message="Fetching dashboard status..." />;
  }

  if (invError || transError) {
    return (
      <ErrorState
        message="An error occurred while retrieving live dashboard statistics."
        onRetry={() => {
          refetchInv();
          refetchTrans();
        }}
      />
    );
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const availableUnits = inventory.reduce((sum, item) => sum + Math.max(0, item.units - item.reservedUnits), 0);
  const expiringSoonCount = inventory.filter(item => item.status === 'Expiring Soon').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;

  const criticalGroups = inventory
    .filter(item => (item.units - item.reservedUnits) <= 3 && item.status !== 'Expired')
    .map(item => item.bloodGroup);

  const uniqueCriticalGroups = [...new Set(criticalGroups)];

  // Simple mock recent activities
  const recentActivities = [
    { id: 1, type: 'stock', text: 'Added 5 units of O+ blood to inventory', time: '10 mins ago' },
    { id: 2, type: 'transfer', text: 'Approved transfer request from Red Cross Hospital', time: '1 hour ago' },
    { id: 3, type: 'expiry', text: 'Alert: 2 units of AB- are expiring in 5 days', time: '3 hours ago' },
    { id: 4, type: 'stock', text: 'Discarded 1 expired unit of B-', time: 'Yesterday' }
  ];

  const quickActions = [
    { label: 'Update Stock', path: '/update-stock', icon: PlusCircle, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
    { label: 'Review Transfers', path: '/transfer-request', icon: ArrowLeftRight, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
    { label: 'Invite Staff', path: '/invite', icon: UserPlusIconShim, color: 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20' }
  ];

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in select-none">
      
      {/* Welcome banner */}
      <div className="relative p-8 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 border bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white dark:border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl -z-10 animate-pulse" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl -z-10" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
              Live System Status: Secured & Operational
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black font-outfit leading-tight text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-lg">
            Manage your local blood bank stock levels, handle remote peer-to-peer transfer requests, and monitor upcoming expiry dates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-6 md:pt-0 md:pl-10 border-t md:border-t-0 md:border-l border-slate-800/80">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Current Blood Stock
            </span>
            <span className="text-2xl font-black font-outfit text-white">
              {totalUnits} <span className="text-xs font-semibold text-slate-500">Units</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Active Transfers
            </span>
            <span className="text-2xl font-black font-outfit text-white">
              {pendingTransfersCount} <span className="text-xs font-semibold text-slate-500">Pending</span>
            </span>
          </div>
        </div>
      </div>

      {/* Core Stats Overview */}
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
      </div>

      {/* The Four Large Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white font-outfit mb-4">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModuleCard
            title="Blood Inventory"
            description="Inspect available counts, reserved stocks, and individual unit status details."
            icon={Database}
            color="rose"
            onClick={() => navigate('/inventory')}
          />
          <ModuleCard
            title="Update Stock"
            description="Add collected blood units, modify metrics, or discard depleted resources."
            icon={PlusCircle}
            color="emerald"
            onClick={() => navigate('/update-stock')}
          />
          <ModuleCard
            title="Expiry Alerts"
            description="Track critical blood units nearing expiration dates with real-time timers."
            icon={AlertTriangle}
            color="amber"
            onClick={() => navigate('/expiry-alerts')}
          />
          <ModuleCard
            title="Transfer Requests"
            description="Accept or reject peer-to-peer blood transfers from regional healthcare centers."
            icon={ArrowLeftRight}
            color="blue"
            onClick={() => navigate('/transfer-request')}
          />
        </div>
      </div>

      {/* Critical Info, Activities, & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Groups & Quick Actions */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Critical Shortages</h3>
            {uniqueCriticalGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {uniqueCriticalGroups.map(group => (
                  <div key={group} className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {group} is Critically Low (≤3 units)
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">All blood group reserves are currently optimal.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quick Shortcuts</h3>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    to={action.path}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 transition-all gap-2 text-center group cursor-pointer ${action.color}`}
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xxs font-bold tracking-wide uppercase">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Audit Activity</h3>
          <div className="flex flex-col gap-4 flex-grow justify-between">
            <div className="flex flex-col gap-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-250 leading-snug">{activity.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/inventory" className="text-xxs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center justify-center gap-1 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              Audit Full Inventory <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-component for Module Navigation Cards
const ModuleCard = ({ title, description, icon: Icon, color, onClick }) => {
  const colorMap = {
    rose: 'border-rose-500/10 hover:border-rose-500/40 text-rose-500 hover:bg-rose-500/5',
    emerald: 'border-emerald-500/10 hover:border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/5',
    amber: 'border-amber-500/10 hover:border-amber-500/40 text-amber-500 hover:bg-amber-500/5',
    blue: 'border-blue-500/10 hover:border-blue-500/40 text-blue-500 hover:bg-blue-500/5',
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-[2rem] bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between gap-4 group ${colorMap[color] || ''}`}
    >
      <div className="flex flex-col gap-2">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 w-fit group-hover:scale-105 transition-transform">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-black text-slate-800 dark:text-white font-outfit mt-1">{title}</h3>
        <p className="text-xxs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xxs font-bold uppercase tracking-widest mt-2">
        Open Module <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

// Quick shim for UserPlus Icon to avoid importing user-plus when doing fast setup
const UserPlusIconShim = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

export default Dashboard;
