import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProgressChart = ({ directives, viewMode }) => {
  // Group by value and count statuses
  const valueGroups = {};
  
  directives.forEach(directive => {
    const key = directive.value;
    if (!valueGroups[key]) {
      valueGroups[key] = {
        name: key,
        pending: 0,
        in_progress: 0,
        implemented: 0,
        total: 0
      };
    }
    valueGroups[key][directive.status]++;
    valueGroups[key].total++;
  });

  const chartData = Object.values(valueGroups).sort((a, b) => b.total - a.total).slice(0, 5);

  // Pie chart data for overall status distribution
  const statusData = [
    { name: 'Menunggu', value: directives.filter(d => d.status === 'pending').length, color: '#F59E0B' },
    { name: 'Sedang Berjalan', value: directives.filter(d => d.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Dilaksanakan', value: directives.filter(d => d.status === 'implemented').length, color: '#059669' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Progress per {viewMode === 'kementerian' ? 'Kementerian' : 'Dapil'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="pending" name="Menunggu" fill="#F59E0B" />
            <Bar dataKey="in_progress" name="Sedang Berjalan" fill="#3B82F6" />
            <Bar dataKey="implemented" name="Dilaksanakan" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie Chart */}
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Distribusi Status Keseluruhan
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-slate-600">{item.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressChart;
