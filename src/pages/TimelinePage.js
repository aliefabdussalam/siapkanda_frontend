import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

moment.locale('id', {
  months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
  monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Agu_Sep_Okt_Nov_Des'.split('_'),
  weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
  weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
  weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
});

const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = ({ date, onNavigate }) => {
  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToToday = () => {
    onNavigate('TODAY');
  };

  const label = () => {
    const dateObj = moment(date);
    return dateObj.format('MMMM YYYY');
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={goToBack}
          variant="outline"
          size="sm"
          className="h-9 px-3"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          onClick={goToToday}
          variant="outline"
          size="sm"
          className="h-9 px-4"
        >
          Hari Ini
        </Button>
        <Button
          onClick={goToNext}
          variant="outline"
          size="sm"
          className="h-9 px-3"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{label()}</h3>
      <div className="w-[120px]"></div>
    </div>
  );
};

const TimelinePage = () => {
  const [directives, setDirectives] = useState([]);
  const [events, setEvents] = useState([]);
  const [values, setValues] = useState([]);
  const [viewMode, setViewMode] = useState('kementerian');
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  useEffect(() => {
    filterAndConvertToEvents();
  }, [directives, selectedValue]);

  const fetchData = async () => {
    try {
      const params = { type: viewMode };
      const [directivesRes, valuesRes] = await Promise.all([
        axiosInstance.get('/directives', { params }),
        axiosInstance.get('/values', { params }),
      ]);
      setDirectives(directivesRes.data);
      setValues(valuesRes.data.values);
      setSelectedValue('');
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filterAndConvertToEvents = () => {
    let filtered = [...directives];
    if (selectedValue) {
      filtered = filtered.filter(d => d.value === selectedValue);
    }

    const convertedEvents = filtered.map(directive => ({
      id: directive.id,
      title: directive.title,
      start: new Date(directive.start_date),
      end: new Date(directive.end_date),
      resource: directive,
    }));

    setEvents(convertedEvents);
  };

  const eventStyleGetter = (event) => {
    const statusColors = {
      pending: '#F59E0B',
      in_progress: '#3B82F6',
      implemented: '#059669',
    };
    const backgroundColor = statusColors[event.resource.status] || '#64748B';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        padding: '2px 5px',
      },
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { label: 'Sedang Berjalan', className: 'bg-blue-100 text-blue-700 border-0' },
      implemented: { label: 'Dilaksanakan', className: 'bg-emerald-100 text-emerald-700 border-0' },
      pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700 border-0' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div data-testid="timeline-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Timeline Kalender</h1>
          <p className="text-slate-500 text-sm mt-1">Lihat jadwal arahan dalam bentuk kalender</p>
        </div>

        {/* Toggle View Mode */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1" data-testid="view-mode-toggle">
          <button
            data-testid="toggle-kementerian"
            onClick={() => setViewMode('kementerian')}
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
            onClick={() => setViewMode('dapil')}
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

      {/* Filter Section */}
      <Card className="p-4 bg-white border-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {viewMode === 'kementerian' ? (
              <Building2 className="w-5 h-5 text-slate-600" />
            ) : (
              <MapPin className="w-5 h-5 text-slate-600" />
            )}
            <span className="text-sm font-medium text-slate-700">
              {viewMode === 'kementerian' ? 'Kementerian' : 'Daerah Pemilihan'}:
            </span>
          </div>
          <select
            data-testid="filter-select"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="flex-1 h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">Semua {viewMode === 'kementerian' ? 'Kementerian' : 'Dapil'}</option>
            {values.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="calendar-view">
              <div style={{ height: '700px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleSelectEvent}
                  views={['month']}
                  defaultView="month"
                  date={currentDate}
                  onNavigate={(newDate) => setCurrentDate(newDate)}
                  components={{
                    toolbar: CustomToolbar,
                  }}
                  messages={{
                    noEventsInRange: 'Tidak ada arahan dalam periode ini.',
                  }}
                />
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="event-details">
              <h3 className="font-semibold text-slate-800 mb-4">Detail Arahan</h3>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Judul</p>
                    <p className="font-medium text-slate-800">{selectedEvent.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Deskripsi</p>
                    <p className="text-sm text-slate-700">{selectedEvent.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      {selectedEvent.type === 'kementerian' ? 'Kementerian' : 'Daerah Pemilihan'}
                    </p>
                    <p className="text-sm text-slate-700">{selectedEvent.value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Daerah</p>
                    <p className="text-sm text-slate-700">{selectedEvent.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Periode</p>
                    <p className="text-sm text-slate-700">
                      {selectedEvent.start_date} - {selectedEvent.end_date}
                    </p>
                  </div>
                  {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Lampiran</p>
                      <p className="text-sm text-slate-700">{selectedEvent.attachments.length} file</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Klik pada event di kalender untuk melihat detail
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
