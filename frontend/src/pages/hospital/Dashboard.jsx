import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Heart,
  Activity,
  ArrowLeftRight,
  AlertTriangle,
  Database,
  PlusCircle,
  Clock,
  ChevronRight,
  UserPlus,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const toast = useToast();
  const queryClient = useQueryClient();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: inventory = [], isLoading: invLoading, isError: invError, refetch: refetchInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: hospitalApi.getInventory
  });

  const { data: transfers = [], isLoading: transLoading, isError: transError, refetch: refetchTrans } = useQuery({
    queryKey: ['transfers'],
    queryFn: hospitalApi.getTransferRequests
  });

  const { data: emergencies = [], isLoading: emerLoading } = useQuery({
    queryKey: ['emergencies'],
    queryFn: hospitalApi.getEmergencyRequests,
    refetchInterval: 10000 // Refetch every 10s for live timers
  });

  const { data: notifications = [], isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: hospitalApi.getNotifications
  });

  const emergencyMutation = useMutation({
    mutationFn: ({ id, status }) => hospitalApi.updateEmergencyStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (variables.status === 'Accepted') {
        toast.success(`Emergency Dispatch Authorized for ${data.hospitalName}`);
      } else {
        toast.error(`Emergency Request Declined.`);
      }
    }
  });

  if (invLoading || transLoading || emerLoading || notifLoading) {
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

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeTransfers = Array.isArray(transfers) ? transfers : [];

  const totalUnits = safeInventory.reduce((sum, item) => sum + item.units, 0);
  const availableUnits = safeInventory.reduce((sum, item) => sum + Math.max(0, item.units - item.reservedUnits), 0);
  const expiringSoonCount = safeInventory.filter(item => item.status === 'Expiring Soon').length;
  const pendingTransfersCount = safeTransfers.filter(t => t.status?.toLowerCase() === 'pending').length;

  const criticalGroups = safeInventory
    .filter(item => (item.units - item.reservedUnits) <= 3 && item.status !== 'Expired')
    .map(item => item.bloodGroup);

  const uniqueCriticalGroups = [...new Set(criticalGroups)];

  // Map real notifications to recent activities
  const recentActivities = notifications.slice(0, 4).map(n => ({
    id: n.id,
    text: `${n.title}: ${n.message}`,
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recent'
  }));

  const quickActions = [
    { label: 'Update Stock', path: '/update-stock', icon: PlusCircle, bg: 'bg-[#BE1F2E]/10 text-[#BE1F2E]' },
    { label: 'Review Transfers', path: '/transfer-request', icon: ArrowLeftRight, bg: 'bg-blue-500/10 text-blue-600' },
    { label: 'Invite Staff', path: '/invite', icon: UserPlus, bg: 'bg-amber-500/10 text-[#E07B00]' }
  ];

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in select-none">
      
      {/* Editorial Header Section */}
      <section className="mb-16">
        <h1 className="font-serif text-[60px] md:text-[100px] italic leading-none mb-4 tracking-[-0.04em] text-[#1A1210]">
          Welcome back, <span className="text-[#c8102e]">{user?.name?.split(' ')[0]}.</span>
        </h1>
        <p className="text-[18px] text-[#737373] max-w-2xl leading-[28px]">
          Hospital command console. Real-time blood inventory tracking, cold storage expiration alarms, and P2P peer transfers are managed from this terminal.
        </p>
      </section>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
          <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#c8102e]/5 select-none transition-transform group-hover:scale-110">01</span>
          <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Total Blood Units</p>
          <div className="flex items-end gap-2">
            <h2 className="font-serif text-[60px] leading-[54px] text-[#c8102e]">{totalUnits}</h2>
            <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Units</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
          <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#22A06B]/5 select-none transition-transform group-hover:scale-110">02</span>
          <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Available Units</p>
          <div className="flex items-end gap-2">
            <h2 className="font-serif text-[60px] leading-[54px] text-[#22A06B]">{availableUnits}</h2>
            <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Units</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
          <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-[#E07B00]/5 select-none transition-transform group-hover:scale-110">03</span>
          <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Expiring Soon</p>
          <div className="flex items-end gap-2">
            <h2 className="font-serif text-[60px] leading-[54px] text-[#E07B00]">{expiringSoonCount}</h2>
            <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Units</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-[rgba(26,18,16,0.09)] relative overflow-hidden group">
          <span className="absolute -bottom-4 -right-2 font-serif text-[120px] text-blue-600/5 select-none transition-transform group-hover:scale-110">04</span>
          <p className="text-[12px] font-[600] tracking-[0.05em] text-[#737373] uppercase mb-4">Transfer Requests</p>
          <div className="flex items-end gap-2">
            <h2 className="font-serif text-[60px] leading-[54px] text-blue-600">{pendingTransfersCount}</h2>
            <span className="text-[14px] font-[500] text-[#737373] mb-4 italic">Pending</span>
          </div>
        </div>
      </div>

      {/* Core Modules Bento Grid */}
      <div>
        <h2 className="text-sm font-bold text-[#7A5F5F] uppercase tracking-wider mb-4">Core Portal Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModuleCard
            title="Blood Inventory"
            description="Inspect available counts, reserved stocks, and individual unit status details."
            icon={Database}
            color="rose"
            onClick={() => navigate('/staff/inventory')}
          />
          <ModuleCard
            title="Update Stock"
            description="Add collected blood units, modify metrics, or discard depleted resources."
            icon={PlusCircle}
            color="emerald"
            onClick={() => navigate('/staff/update-stock')}
          />
          <ModuleCard
            title="Expiry Alerts"
            description="Track critical blood units nearing expiration dates with real-time timers."
            icon={AlertTriangle}
            color="amber"
            onClick={() => navigate('/staff/expiry-alerts')}
          />
          <ModuleCard
            title="Transfer Requests"
            description="Accept or reject peer-to-peer blood transfers from regional healthcare centers."
            icon={ArrowLeftRight}
            color="blue"
            onClick={() => navigate('/staff/transfer-request')}
          />
        </div>
      </div>

      {/* Audit Logs, Shortcuts, and Shortages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Shortages & Shortcuts */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Emergency SOS Dispatch */}
          <div className="bg-[#1A1210] border border-[#BE1F2E]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(190,31,46,0.15)] mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BE1F2E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BE1F2E]"></span>
              </span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Emergency SOS Dispatch</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {emergencies.filter(e => e.status === 'Pending').length > 0 ? (
                emergencies.filter(e => e.status === 'Pending').map(req => {
                  const timeLeftMs = Math.max(0, req.targetTimestamp - now);
                  const mins = Math.floor(timeLeftMs / 60000);
                  const secs = Math.floor((timeLeftMs % 60000) / 1000);
                  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
                  const isCriticalTime = timeLeftMs < 5 * 60000;

                  return (
                    <div key={req.id} className="bg-[#2A1F1D] border border-[#3D2B2B] rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#BE1F2E] px-2 py-0.5 bg-[#BE1F2E]/10 rounded border border-[#BE1F2E]/20">
                            {req.bloodGroup} Blood Required
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] font-bold ${isCriticalTime ? 'text-[#BE1F2E] animate-pulse' : 'text-[#E07B00]'}`}>
                            <Timer className="h-3 w-3" /> T-minus {timeString}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{req.hospitalName}</h4>
                        <p className="text-xs text-[#A8A0A0] leading-snug">{req.message}</p>
                        <p className="text-xs font-bold text-white mt-2">Required: <span className="text-[#BE1F2E] text-sm">{req.unitsRequired} units</span> (Distance: {req.distance}km)</p>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <button 
                          onClick={() => emergencyMutation.mutate({ id: req.id, status: 'Accepted' })}
                          disabled={emergencyMutation.isPending}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#BE1F2E] text-white hover:bg-[#9E1825] transition-colors rounded-lg text-xs font-bold w-full disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Dispatch Now
                        </button>
                        <button 
                          onClick={() => emergencyMutation.mutate({ id: req.id, status: 'Declined' })}
                          disabled={emergencyMutation.isPending}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-transparent border border-[#3D2B2B] text-[#A8A0A0] hover:text-white hover:bg-[#3D2B2B] transition-colors rounded-lg text-xs font-bold w-full disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-[#22A06B] mb-2 opacity-80" />
                  <p className="text-sm font-bold text-[#A8A0A0]">No active trauma SOS requests</p>
                  <p className="text-xs text-[#7A5F5F]">Regional emergency grid is stable.</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Shortages */}
          <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider mb-4">Critical Shortages</h3>
            {uniqueCriticalGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {uniqueCriticalGroups.map(group => (
                  <div key={group} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-[#BE1F2E]/10 text-[#BE1F2E] text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BE1F2E] animate-pulse" />
                    {group} is Critically Low (≤3 units)
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5A5A5A] italic">All blood group reserves are currently optimal.</p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider">Quick Shortcuts</h3>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    to={action.path}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-[#EDE7E1] transition-all gap-2 text-center group cursor-pointer hover:border-[#BE1F2E]/30 ${action.bg}`}
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xxs font-bold tracking-wide uppercase">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audit activity logs */}
        <div className="bg-white border border-[#EDE7E1] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider mb-4">Recent Audit Activity</h3>
            <div className="flex flex-col gap-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#7A5F5F] mt-0.5 border border-[#EDE7E1]">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1A1210] leading-snug">{activity.text}</p>
                    <span className="text-[10px] text-[#7A5F5F] block mt-0.5">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link to="/staff/inventory" className="text-xxs font-bold text-[#BE1F2E] uppercase tracking-widest hover:text-[#9E1825] transition-colors flex items-center justify-center gap-1 mt-6 pt-4 border-t border-[#EDE7E1]">
            Audit Full Inventory <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

// Module card helper component
const ModuleCard = ({ title, description, icon: Icon, color, onClick }) => {
  const colorMap = {
    rose: 'hover:border-[#BE1F2E]/40 text-[#BE1F2E]',
    emerald: 'hover:border-[#22A06B]/40 text-[#22A06B]',
    amber: 'hover:border-[#E07B00]/40 text-[#E07B00]',
    blue: 'hover:border-blue-600/40 text-blue-600',
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl bg-white border border-[#EDE7E1] transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between gap-4 group ${colorMap[color] || ''}`}
    >
      <div className="flex flex-col gap-2">
        <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#7A5F5F] w-fit group-hover:scale-105 transition-transform border border-[#EDE7E1]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[18px] font-medium text-[#1A1210] font-serif mt-1">{title}</h3>
        <p className="text-xxs text-[#5A5A5A] leading-relaxed font-semibold">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xxs font-bold uppercase tracking-widest mt-2">
        Open Module <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

export default Dashboard;
