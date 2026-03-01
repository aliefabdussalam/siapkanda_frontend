import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProgressChart from '@/components/ProgressChart';
import DeadlineNotifications from '@/components/DeadlineNotifications';
import IndonesiaMap from '@/components/IndonesiaMap';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_directives: 0,
    in_progress: 0,
    implemented: 0,
    pending: 0,
    total_regions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kementerian');
  const [directives, setDirectives] = useState([]);
  const [values, setValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    fetchData();
  }, [viewMode, selectedValue]);

  const fetchData = async () => {
    try {
      const params = { type: viewMode };
      if (selectedValue) {
        params.value = selectedValue;
      }

      const [statsRes, directivesRes, valuesRes] = await Promise.all([
        axiosInstance.get('/stats', { params }),
        axiosInstance.get('/directives', { params }),
        axiosInstance.get('/values', { params: { type: viewMode } }),
      ]);

      setStats(statsRes.data);
      setDirectives(directivesRes.data);
      setValues(valuesRes.data.values);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'TOTAL DIRECTIVES',
      value: stats.total_directives,
      subtitle: 'All time',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      testId: 'stat-total-directives'
    },
    {
      title: 'ON PROGRESS',
      value: stats.in_progress,
      subtitle: 'Currently active',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      testId: 'stat-in-progress'
    },
    {
      title: 'IMPLEMENTED',
      value: stats.implemented,
      subtitle: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      testId: 'stat-implemented'
    },
    {
      title: 'REGIONS',
      value: stats.total_regions,
      subtitle: 'Active regions',
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      testId: 'stat-regions'
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-0' },
      in_progress: { label: 'On Progress', className: 'bg-blue-100 text-blue-700 border-0' },
      implemented: { label: 'Implemented', className: 'bg-emerald-100 text-emerald-700 border-0' },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const latestDirectives = directives.slice(0, 4);

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome to Transmigration Ministry Dashboard</p>
        </div>

        {/* Toggle View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1" data-testid="view-mode-toggle">
            <button
              data-testid="toggle-kementerian"
              onClick={() => {
                setViewMode('kementerian');
                setSelectedValue('');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'kementerian'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Kementerian
            </button>
            <button
              data-testid="toggle-dapil"
              onClick={() => {
                setViewMode('dapil');
                setSelectedValue('');
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'dapil'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Dapil
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={stat.testId}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.title}</p>
                        <p className="text-4xl font-bold text-slate-800">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-2xl shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{stat.subtitle}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts Section */}
          <ProgressChart directives={directives} viewMode={viewMode} />

          {/* Main Content - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Directives */}
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Latest Directives</h2>
                  <select
                    data-testid="filter-select"
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <option value="">All {viewMode === 'kementerian' ? 'Kementerian' : 'Dapil'}</option>
                    {values.map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  {latestDirectives.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Tidak ada arahan</p>
                  ) : (
                    latestDirectives.map((directive) => {
                      const statusConfig = getStatusBadge(directive.status);
                      return (
                        <div
                          key={directive.id}
                          className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all cursor-pointer border border-slate-100"
                          data-testid={`latest-directive-${directive.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm flex-1">
                              {directive.type === 'kementerian' 
                                ? (directive.nomor_surat || 'No Number')
                                : (directive.title || 'No Title')}
                            </h4>
                            <Badge className={statusConfig.className}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            {directive.type === 'kementerian' ? (
                              <>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                  {directive.asal_surat || 'No Origin'}
                                </span>
                                <span>{directive.tanggal_masuk_surat || 'No Date'}</span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                  {directive.value}
                                </span>
                                <span>{directive.start_date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>

            {/* Deadline Notifications */}
            <DeadlineNotifications directives={directives} />

            {/* Indonesia Map */}
            <IndonesiaMap directives={directives} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
