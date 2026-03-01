import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const SortableDirectiveCard = ({ directive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: directive.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBorderColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      in_progress: '#3B82F6',
      implemented: '#059669',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: getBorderColor(directive.status) }}
      className="kanban-card"
      {...attributes}
      {...listeners}
      data-testid={`kanban-card-${directive.id}`}
    >
      {directive.type === 'kementerian' ? (
        <>
          <h4 className="font-semibold text-slate-800 text-sm mb-2">
            {directive.nomor_surat || 'No Number'}
          </h4>
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
            {directive.asal_surat || 'No Origin'}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {directive.disposisi && (
              <Badge variant="outline" className="text-xs border-slate-200">
                {directive.disposisi}
              </Badge>
            )}
            {directive.region && (
              <Badge variant="outline" className="text-xs border-slate-200">
                {directive.region}
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {directive.tanggal_masuk_surat || 'No Date'}
          </div>
        </>
      ) : (
        <>
          <h4 className="font-semibold text-slate-800 text-sm mb-2">{directive.title}</h4>
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{directive.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="text-xs border-slate-200">
              {directive.value}
            </Badge>
            <Badge variant="outline" className="text-xs border-slate-200">
              {directive.region}
            </Badge>
          </div>
          <div className="text-xs text-slate-500">
            {directive.start_date} - {directive.end_date}
          </div>
        </>
      )}
    </div>
  );
};

// Droppable column component
const DroppableColumn = ({ id, children, isEmpty }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column min-h-[200px] transition-all ${
        isOver ? 'bg-slate-100 ring-2 ring-slate-300 ring-dashed' : ''
      } ${isEmpty ? 'flex items-center justify-center' : ''}`}
    >
      {children}
    </div>
  );
};

const KanbanPage = () => {
  const [directives, setDirectives] = useState([]);
  const [filteredDirectives, setFilteredDirectives] = useState([]);
  const [values, setValues] = useState([]);
  const [viewMode, setViewMode] = useState('kementerian');
  const [selectedValue, setSelectedValue] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  useEffect(() => {
    filterDirectives();
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

  const filterDirectives = () => {
    let filtered = [...directives];
    if (selectedValue) {
      filtered = filtered.filter(d => d.value === selectedValue);
    }
    setFilteredDirectives(filtered);
  };

  const getDirectivesByStatus = (status) => {
    return filteredDirectives.filter(d => d.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeDirective = directives.find(d => d.id === active.id);
    
    // Determine target column - check if dropped on column itself or on an item in the column
    let targetColumn = over.id;
    
    // If dropped on another card, find that card's status
    const overDirective = directives.find(d => d.id === over.id);
    if (overDirective) {
      targetColumn = overDirective.status;
    }
    
    // Validate target column is one of the valid statuses
    const validStatuses = ['pending', 'in_progress', 'implemented'];
    if (!validStatuses.includes(targetColumn)) {
      return;
    }

    if (activeDirective && targetColumn && activeDirective.status !== targetColumn) {
      try {
        await axiosInstance.patch(`/directives/${activeDirective.id}/status`, {
          status: targetColumn,
        });

        setDirectives(prevDirectives =>
          prevDirectives.map(d =>
            d.id === activeDirective.id ? { ...d, status: targetColumn } : d
          )
        );

        const statusLabels = {
          pending: 'Menunggu',
          in_progress: 'Sedang Berjalan',
          implemented: 'Sudah Dilaksanakan'
        };

        toast.success(`Status diubah ke "${statusLabels[targetColumn]}"`);
      } catch (error) {
        toast.error('Gagal memperbarui status');
      }
    }
  };

  const columns = [
    { id: 'pending', title: 'Menunggu', icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: 'in_progress', title: 'Sedang Berjalan', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'implemented', title: 'Sudah Dilaksanakan', icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ];

  const activeDirective = activeId ? directives.find(d => d.id === activeId) : null;

  return (
    <div data-testid="kanban-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Papan Kanban</h1>
          <p className="text-slate-500 text-sm mt-1">Drag dan drop untuk mengubah status arahan</p>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="kanban-board">
            {columns.map((column) => {
              const Icon = column.icon;
              const columnDirectives = getDirectivesByStatus(column.id);
              const isEmpty = columnDirectives.length === 0;
              
              return (
                <div key={column.id} data-testid={`kanban-column-${column.id}`}>
                  <div className={`mb-4 flex items-center space-x-2 p-2 rounded-lg ${column.bgColor}`}>
                    <Icon className={`w-5 h-5 ${column.color}`} />
                    <h3 className="font-semibold text-slate-800">{column.title}</h3>
                    <Badge variant="secondary" className="ml-auto">{columnDirectives.length}</Badge>
                  </div>
                  
                  <DroppableColumn id={column.id} isEmpty={isEmpty}>
                    <SortableContext
                      id={column.id}
                      items={columnDirectives.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {isEmpty ? (
                        <p className="text-sm text-slate-400 text-center py-4">
                          Drop arahan di sini
                        </p>
                      ) : (
                        columnDirectives.map((directive) => (
                          <SortableDirectiveCard key={directive.id} directive={directive} />
                        ))
                      )}
                    </SortableContext>
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeDirective ? (
              <div
                className="kanban-card opacity-90 shadow-lg"
                style={{ borderLeftColor: '#3B82F6' }}
              >
                <h4 className="font-semibold text-slate-800 text-sm">{activeDirective.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Lepaskan untuk memindahkan</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default KanbanPage;
