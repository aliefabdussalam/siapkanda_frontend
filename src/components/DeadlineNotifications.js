import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, AlertTriangle } from 'lucide-react';

const DeadlineNotifications = ({ directives }) => {
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return directives
      .filter(directive => {
        const endDate = new Date(directive.end_date);
        return endDate >= today && endDate <= sevenDaysFromNow && directive.status !== 'implemented';
      })
      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
      .slice(0, 5);
  }, [directives]);

  const getDaysUntilDeadline = (endDate) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days) => {
    if (days <= 2) return 'text-red-600 bg-red-50';
    if (days <= 4) return 'text-orange-600 bg-orange-50';
    return 'text-amber-600 bg-amber-50';
  };

  if (upcomingDeadlines.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Notifikasi Deadline</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">Tidak ada deadline dalam 7 hari ke depan</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">Notifikasi Deadline</h3>
          <p className="text-xs text-slate-500">Arahan yang akan berakhir dalam 7 hari</p>
        </div>
        <Badge className="bg-red-100 text-red-700 border-0">
          {upcomingDeadlines.length} urgent
        </Badge>
      </div>
      <div className="space-y-3">
        {upcomingDeadlines.map((directive) => {
          const daysLeft = getDaysUntilDeadline(directive.end_date);
          const urgencyColor = getUrgencyColor(daysLeft);
          
          return (
            <div
              key={directive.id}
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border-l-4 border-red-500"
              data-testid={`deadline-notification-${directive.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-800 text-sm flex-1 pr-2">
                  {directive.title}
                </h4>
                <Badge className={`${urgencyColor} border-0 text-xs font-bold`}>
                  {daysLeft === 0 ? 'Hari ini!' : `${daysLeft} hari`}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {directive.end_date}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  {directive.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DeadlineNotifications;
