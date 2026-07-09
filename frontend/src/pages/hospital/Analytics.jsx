import React from 'react';
import { hospitalApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: hospitalApi.getAnalytics
  });

  if (isLoading) return <Loader message="Compiling regional analytics..." />;
  if (isError) return <ErrorState message="Failed to load analytics engine." onRetry={refetch} />;

  // Fallback data structure if not provided by backend/AI service
  const monthlyUsage = data?.monthlyUsage || [
    { month: 'Jan', usage: 120, collections: 135 },
    { month: 'Feb', usage: 145, collections: 150 },
    { month: 'Mar', usage: 180, collections: 195 },
    { month: 'Apr', usage: 150, collections: 165 },
    { month: 'May', usage: 220, collections: 240 },
    { month: 'Jun', usage: 190, collections: 210 }
  ];

  const bloodDemandByGroup = data?.bloodDemandByGroup || {
    labels: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
    demand: [90, 75, 80, 45, 30, 25, 20, 10],
    supply: [110, 85, 70, 40, 25, 20, 15, 8]
  };

  // Chart Configurations
  const lineChartData = {
    labels: monthlyUsage.map(d => d.month),
    datasets: [
      {
        label: 'Blood Usage',
        data: monthlyUsage.map(d => d.usage),
        borderColor: '#BE1F2E',
        backgroundColor: 'rgba(190, 31, 46, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Blood Collections',
        data: monthlyUsage.map(d => d.collections),
        borderColor: '#22A06B',
        backgroundColor: 'rgba(34, 160, 107, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  const barChartData = {
    labels: bloodDemandByGroup.labels,
    datasets: [
      {
        label: 'Demand',
        data: bloodDemandByGroup.demand,
        backgroundColor: '#BE1F2E',
        borderRadius: 4,
      },
      {
        label: 'Supply',
        data: bloodDemandByGroup.supply,
        backgroundColor: '#E07B00',
        borderRadius: 4,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  const doughnutData = {
    labels: ['Successful Transfers', 'Failed / Rejected'],
    datasets: [
      {
        data: [96, 4], // Using average from success rate
        backgroundColor: ['#22A06B', '#BE1F2E'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EDE7E1] pb-6">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] italic leading-none mb-2 tracking-[-0.03em] text-[#1A1210]">
            Advanced Analytics
          </h1>
          <p className="text-[14px] text-[#5A5A5A]">
            Regional intelligence, supply chain forecasting, and clinical demand metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Line Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EDE7E1] shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider mb-6">Supply vs Usage Trends</h3>
          <div className="h-[300px] w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EDE7E1] shadow-sm">
          <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider mb-6">Peer Transfer Success</h3>
          <div className="h-[300px] w-full relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-3xl font-serif text-[#1A1210]">96%</span>
              <span className="text-[10px] uppercase font-bold text-[#7A5F5F]">Success Rate</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EDE7E1] shadow-sm lg:col-span-3">
          <h3 className="text-xs font-bold text-[#7A5F5F] uppercase tracking-wider mb-6">Blood Demand by Group</h3>
          <div className="h-[300px] w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
