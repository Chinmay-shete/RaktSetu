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

  // Verify if there is any real database data returned
  const hasRealData = data && (
    data.totalCollected > 0 ||
    data.totalTransfers > 0 ||
    (data.monthlyUsage && data.monthlyUsage.some(d => d.usage > 0 || d.collections > 0)) ||
    (data.bloodDemandByGroup && (
      (data.bloodDemandByGroup.demand && data.bloodDemandByGroup.demand.some(v => v > 0)) ||
      (data.bloodDemandByGroup.supply && data.bloodDemandByGroup.supply.some(v => v > 0))
    ))
  );

  if (!hasRealData) {
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

        <div className="flex flex-col items-center justify-center bg-white border border-[#EDE7E1] rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto my-8 w-full">
          <div className="w-16 h-16 rounded-full bg-[#ffdad8]/60 flex items-center justify-center text-[#BE1F2E] mb-6">
            <span className="material-symbols-outlined text-[32px]">insights</span>
          </div>
          <h2 className="text-[22px] font-serif italic text-[#1A1210] mb-3">No Analytical Data Available</h2>
          <p className="text-[14px] text-[#70605D] max-w-md leading-relaxed mb-8">
            This dashboard displays regional trends, collection-to-usage histories, and peer transfer metrics.
            Once your facility adds blood bags to inventory, registers upcoming donation camps, or logs surgical schedules, these analytics will populate in real time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/staff/inventory"
              className="bg-[#1A1210] text-white hover:bg-[#BE1F2E] px-6 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 duration-200"
            >
              Add Blood Bag
            </a>
            <a
              href="/staff/surgical-schedule"
              className="border border-[#D8D0CA] bg-[#faf8f5] text-[#1A1210] hover:border-[#BE1F2E] px-6 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 duration-200"
            >
              Schedule Surgery
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback data structure if not provided by backend/AI service (though we compute it now)
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

  const successRate = data?.transferSuccessRate !== undefined ? Math.round(data.transferSuccessRate) : 100;
  const failedRate = 100 - successRate;

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
        data: [successRate, failedRate],
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
              <span className="text-3xl font-serif text-[#1A1210]">{successRate}%</span>
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
