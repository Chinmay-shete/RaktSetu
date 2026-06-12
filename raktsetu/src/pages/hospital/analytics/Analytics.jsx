import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../../services/mockApi';
import { useTheme } from '../../../context/ThemeContext';
import { Loader } from '../../../components/ui/Loader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ChartCard } from '../../../components/ui/ChartCard';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  AlertTriangle,
  ArrowLeftRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const Analytics = () => {
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState('6months');

  const { data: analytics, isLoading: isAnalLoading, isError: isAnalError, refetch: refetchAnal } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: mockApi.getAnalytics
  });

  const { data: inventory = [], isLoading: isInvLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: mockApi.getInventory
  });

  if (isAnalLoading || isInvLoading) return <Loader message="Compiling data charts..." />;
  if (isAnalError) return <ErrorState message="Could not compile charts." onRetry={refetchAnal} />;

  // Prepare colors for charts
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)';
  const textColor = isDark ? '#94A3B8' : '#475569';

  const lineAndBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'Outfit, sans-serif', size: 10, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        titleColor: isDark ? '#F8FAFC' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#475569',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit, sans-serif', size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit, sans-serif', size: 10 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          font: { family: 'Outfit, sans-serif', size: 10, weight: 'bold' },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        titleColor: isDark ? '#F8FAFC' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#475569',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12
      }
    }
  };

  // Chart 1: Area Chart (Usage & Collections)
  const areaChartData = {
    labels: analytics.monthlyUsage.map(d => d.month),
    datasets: [
      {
        fill: true,
        label: 'Usage Dispatched',
        data: analytics.monthlyUsage.map(d => d.usage),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        tension: 0.4
      },
      {
        fill: true,
        label: 'Collections Registered',
        data: analytics.monthlyUsage.map(d => d.collections),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.4
      }
    ]
  };

  // Chart 2: Bar Chart (Demand vs Supply per group)
  const barChartData = {
    labels: analytics.bloodDemandByGroup.labels,
    datasets: [
      {
        label: 'Allocated Demand (Units)',
        data: analytics.bloodDemandByGroup.demand,
        backgroundColor: 'rgba(220, 38, 38, 0.85)',
        borderRadius: 8
      },
      {
        label: 'Registered Supply (Units)',
        data: analytics.bloodDemandByGroup.supply,
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderRadius: 8
      }
    ]
  };

  // Chart 3: Doughnut (Inventory shares)
  // Calculate total units per group from current inventory
  const inventoryShares = inventory.reduce((acc, item) => {
    acc[item.bloodGroup] = (acc[item.bloodGroup] || 0) + item.units;
    return acc;
  }, {});

  const doughnutLabels = Object.keys(inventoryShares);
  const doughnutValues = Object.values(inventoryShares);

  const doughnutChartData = {
    labels: doughnutLabels.length ? doughnutLabels : ['Empty'],
    datasets: [
      {
        data: doughnutValues.length ? doughnutValues : [1],
        backgroundColor: [
          '#DC2626', '#E11D48', '#2563EB', '#3B82F6', 
          '#16A34A', '#10B981', '#F59E0B', '#FBBF24'
        ].slice(0, Math.max(1, doughnutLabels.length)),
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#1E293B' : '#FFFFFF'
      }
    ]
  };

  // Chart 4: Line Chart (Expiry Trend week-by-week)
  const lineChartData = {
    labels: analytics.expiryTrend.labels,
    datasets: [
      {
        label: 'Bags Expired',
        data: analytics.expiryTrend.expired,
        borderColor: '#EF4444',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointBackgroundColor: '#EF4444',
        tension: 0.35
      },
      {
        label: 'Bags Recycled/Resolved',
        data: analytics.expiryTrend.wasted,
        borderColor: '#F59E0B',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: '#F59E0B',
        tension: 0.35
      }
    ]
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Header and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100">
            Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit inventory usage rates, collection yields, and regional transfer efficiency statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-450" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
          >
            <option value="30days">Last 30 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Totals Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex flex-col shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Stock Dispatch Rate</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-rose-500" /> +14.2%
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] text-slate-455 uppercase font-bold block mb-1">Average Shelf-life</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-outfit">
            32 Days
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] text-slate-455 uppercase font-bold block mb-1">Expiry Rate</span>
          <span className="text-xl font-extrabold text-rose-500 font-outfit flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> 1.8%
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] text-slate-455 uppercase font-bold block mb-1">Transfer Efficiency</span>
          <span className="text-xl font-extrabold text-emerald-600 font-outfit flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> 98.4%
          </span>
        </div>
      </div>

      {/* Grid of Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Usage vs Collection Volume (Units)">
          <Line data={areaChartData} options={lineAndBarOptions} />
        </ChartCard>

        <ChartCard title="Demand vs Supply by Blood Group (Units)">
          <Bar data={barChartData} options={lineAndBarOptions} />
        </ChartCard>

        <ChartCard title="Available Stock Distribution (Units Share)">
          <Doughnut data={doughnutChartData} options={doughnutOptions} />
        </ChartCard>

        <ChartCard title="Weekly Expiry Trend (Bags)">
          <Line data={lineChartData} options={lineAndBarOptions} />
        </ChartCard>
      </div>
    </div>
  );
};
export default Analytics;
