import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download,
  Building2,
  MapPin,
  Eye,
  X,
  Paperclip,
  Image
} from 'lucide-react';
import { toast } from 'sonner';

const DirectivesPage = () => {
  const [directives, setDirectives] = useState([]);
  const [filteredDirectives, setFilteredDirectives] = useState([]);
  const [values, setValues] = useState([]);
  const [viewMode, setViewMode] = useState('kementerian');
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewAttachment, setPreviewAttachment] = useState(null);

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

  const handleExportPDF = async () => {
    try {
      const params = { type: viewMode };
      const response = await axiosInstance.get('/directives/export-pdf', {
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arahan_${viewMode}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh PDF');
      console.error('Export error:', error);
    }
  };

  const handleExportSinglePDF = async (directiveId, name) => {
    try {
      const response = await axiosInstance.get(`/directives/${directiveId}/export-pdf`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arahan_${name}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh PDF');
      console.error('Export error:', error);
    }
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

  const downloadAttachment = (attachment) => {
    try {
      const link = document.createElement('a');
      link.href = `data:${attachment.content_type};base64,${attachment.data}`;
      link.download = attachment.filename;
      link.click();
      toast.success('File berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh file');
    }
  };

  const openPreview = (attachment) => {
    setPreviewAttachment(attachment);
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };

  const isImageFile = (contentType) => {
    return contentType && contentType.startsWith('image/');
  };

  const isPdfFile = (contentType) => {
    return contentType === 'application/pdf';
  };

  const getFileIcon = (contentType) => {
    if (isImageFile(contentType)) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div data-testid="directives-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Daftar Arahan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola dan lihat semua arahan kementerian</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export PDF Button */}
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>

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
      ) : filteredDirectives.length === 0 ? (
        <Card className="p-12 text-center bg-white border-0 shadow-sm">
          <p className="text-slate-600">Tidak ada arahan yang ditemukan</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDirectives.map((directive) => (
            <Card key={directive.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`directive-card-${directive.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {directive.type === 'kementerian' ? (
                    /* Display for Kementerian */
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {directive.tanggal_masuk_surat && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Tanggal Masuk Surat:</span>
                            <p className="text-sm text-slate-800">{directive.tanggal_masuk_surat}</p>
                          </div>
                        )}
                        {directive.tanggal_surat && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Tanggal Surat:</span>
                            <p className="text-sm text-slate-800">{directive.tanggal_surat}</p>
                          </div>
                        )}
                        {directive.nomor_surat && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Nomor Surat:</span>
                            <p className="text-sm text-slate-800">{directive.nomor_surat}</p>
                          </div>
                        )}
                        {directive.asal_surat && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Asal Surat:</span>
                            <p className="text-sm text-slate-800">{directive.asal_surat}</p>
                          </div>
                        )}
                        {directive.disposisi && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Disposisi:</span>
                            <p className="text-sm text-slate-800 font-medium">{directive.disposisi}</p>
                          </div>
                        )}
                        {directive.tempat && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Tempat:</span>
                            <p className="text-sm text-slate-800">{directive.tempat}</p>
                          </div>
                        )}
                        {directive.acara && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Acara:</span>
                            <p className="text-sm text-slate-800">{directive.acara}</p>
                          </div>
                        )}
                        {directive.waktu && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Waktu:</span>
                            <p className="text-sm text-slate-800">{directive.waktu}</p>
                          </div>
                        )}
                        {directive.contact_person && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Contact Person:</span>
                            <p className="text-sm text-slate-800">{directive.contact_person}</p>
                          </div>
                        )}
                        {directive.pic && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">PIC:</span>
                            <p className="text-sm text-slate-800">{directive.pic}</p>
                          </div>
                        )}
                        {directive.region && (
                          <div>
                            <span className="text-xs font-medium text-slate-500">Daerah:</span>
                            <p className="text-sm text-slate-800">{directive.region}</p>
                          </div>
                        )}
                      </div>
                      {directive.description && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-slate-500">Deskripsi:</span>
                          <p className="text-sm text-slate-600 mt-1">{directive.description}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Display for Dapil */
                    <>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">{directive.title}</h3>
                      {directive.tujuan_program && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-slate-500">Tujuan Program:</span>
                          <p className="text-sm text-slate-700 mt-1">{directive.tujuan_program}</p>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 mb-3">{directive.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
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
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getStatusBadge(directive.status)}
                  </div>
                </div>
                
                {/* Download PDF Button */}
                <Button
                  onClick={() => handleExportSinglePDF(
                    directive.id, 
                    directive.type === 'kementerian' 
                      ? directive.nomor_surat?.replace(/[/\s]/g, '_') 
                      : directive.title?.replace(/[/\s]/g, '_')
                  )}
                  variant="outline"
                  size="sm"
                  className="ml-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {directive.attachments && directive.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-700">
                      Lampiran ({directive.attachments.length})
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {directive.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all group"
                        data-testid={`attachment-item-${directive.id}-${idx}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {isImageFile(attachment.content_type) ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                              <img
                                src={`data:${attachment.content_type};base64,${attachment.data}`}
                                alt={attachment.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                              {getFileIcon(attachment.content_type)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-700 truncate font-medium">{attachment.filename}</p>
                            <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(isImageFile(attachment.content_type) || isPdfFile(attachment.content_type)) && (
                            <Button
                              data-testid={`preview-attachment-${idx}`}
                              size="sm"
                              variant="ghost"
                              onClick={() => openPreview(attachment)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </Button>
                          )}
                          <Button
                            data-testid={`download-attachment-${idx}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadAttachment(attachment)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
          data-testid="preview-modal"
        >
          <div 
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {getFileIcon(previewAttachment.content_type)}
                <div>
                  <h3 className="font-semibold text-slate-800">{previewAttachment.filename}</h3>
                  <p className="text-xs text-slate-500">{(previewAttachment.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAttachment(previewAttachment)}
                  data-testid="modal-download-button"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Unduh
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={closePreview}
                  data-testid="close-preview-button"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-slate-50">
              {isImageFile(previewAttachment.content_type) ? (
                <img
                  src={`data:${previewAttachment.content_type};base64,${previewAttachment.data}`}
                  alt={previewAttachment.filename}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                  data-testid="preview-image"
                />
              ) : isPdfFile(previewAttachment.content_type) ? (
                <iframe
                  src={`data:${previewAttachment.content_type};base64,${previewAttachment.data}`}
                  className="w-full h-[70vh] rounded-lg"
                  title={previewAttachment.filename}
                  data-testid="preview-pdf"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Preview tidak tersedia untuk tipe file ini</p>
                  <Button
                    className="mt-4"
                    onClick={() => downloadAttachment(previewAttachment)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectivesPage;