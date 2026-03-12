import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, FileText, Paperclip, X, Eye, Download, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const AdminPage = () => {
  const [directives, setDirectives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kementerian');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'kementerian',
    value: '',
    region: '',
    kota_kabupaten: '',
    start_date: '',
    end_date: '',
    status: 'pending',
    // New fields for Kementerian
    tanggal_masuk_surat: '',
    tanggal_surat: '',
    nomor_surat: '',
    asal_surat: '',
    disposisi: '',
    tempat: '',
    acara: '',
    waktu: '',
    contact_person: '',
    pic: '',
    // New field for Dapil
    tujuan_program: '',
  });
  const [uploadingFor, setUploadingFor] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [editingDirective, setEditingDirective] = useState(null); // directive being edited
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchDirectives();
  }, [viewMode]);

  const fetchDirectives = async () => {
    try {
      const response = await axiosInstance.get('/directives', {
        params: { type: viewMode }
      });
      setDirectives(response.data);
    } catch (error) {
      toast.error('Gagal memuat data arahan');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/directives', formData);
      toast.success('Arahan berhasil ditambahkan');
      setFormData({
        title: '',
        description: '',
        type: 'kementerian',
        value: '',
        region: '',
        kota_kabupaten: '',
        start_date: '',
        end_date: '',
        status: 'pending',
        tanggal_masuk_surat: '',
        tanggal_surat: '',
        nomor_surat: '',
        asal_surat: '',
        disposisi: '',
        tempat: '',
        acara: '',
        waktu: '',
        contact_person: '',
        pic: '',
        tujuan_program: '',
      });
      fetchDirectives();
    } catch (error) {
      toast.error('Gagal menambahkan arahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus arahan ini?')) return;

    try {
      await axiosInstance.delete(`/directives/${id}`);
      toast.success('Arahan berhasil dihapus');
      fetchDirectives();
    } catch (error) {
      toast.error('Gagal menghapus arahan');
    }
  };

  const handleFileUpload = async (directiveId, file) => {
    if (!file) return;

    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_SIZE) {
      toast.error(`Ukuran file melebihi batas maksimal 25 MB`);
      return;
    }

    setUploadingFor(directiveId);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      await axiosInstance.post(`/directives/${directiveId}/attachments`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('File berhasil diunggah');
      fetchDirectives();
    } catch (error) {
      toast.error('Gagal mengunggah file');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleFileSelect = (directiveId, e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(directiveId, e.target.files[0]);
    }
  };

  const handleEditClick = (directive) => {
    setEditingDirective(directive.id);
    setEditFormData({ ...directive });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/directives/${editingDirective}`, editFormData);
      toast.success('Arahan berhasil diperbarui');
      setEditingDirective(null);
      setEditFormData({});
      fetchDirectives();
    } catch (error) {
      toast.error('Gagal memperbarui arahan');
    }
  };

  const handleEditCancel = () => {
    setEditingDirective(null);
    setEditFormData({});
  };

  const openPreview = (attachment) => {
    setPreviewAttachment(attachment);
  };

  const closePreview = () => {
    setPreviewAttachment(null);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_progress: { label: 'Sedang Berjalan', className: 'bg-blue-100 text-blue-700 border-0' },
      implemented: { label: 'Dilaksanakan', className: 'bg-emerald-100 text-emerald-700 border-0' },
      pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700 border-0' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isImageFile = (contentType) => {
    return contentType && contentType.startsWith('image/');
  };

  const isPdfFile = (contentType) => {
    return contentType === 'application/pdf';
  };

  return (
    <div data-testid="admin-page" className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data arahan kementerian</p>
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

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="add" data-testid="tab-add">Tambah Arahan</TabsTrigger>
          <TabsTrigger value="manage" data-testid="tab-manage">Kelola Arahan</TabsTrigger>
        </TabsList>

        <TabsContent value="add" data-testid="add-directive-form">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-slate-700 mb-2 block">
                  Tipe *
                </Label>
                <select
                  id="type"
                  name="type"
                  data-testid="input-type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="kementerian">Kementerian</option>
                  <option value="dapil">Dapil (Daerah Pemilihan)</option>
                </select>
              </div>

              {/* Conditional Form for Kementerian */}
              {formData.type === 'kementerian' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tanggal_masuk_surat" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tanggal Masuk Surat *
                    </Label>
                    <Input
                      id="tanggal_masuk_surat"
                      name="tanggal_masuk_surat"
                      type="date"
                      data-testid="input-tanggal-masuk-surat"
                      value={formData.tanggal_masuk_surat}
                      onChange={handleInputChange}
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tanggal_surat" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tanggal Surat
                    </Label>
                    <Input
                      id="tanggal_surat"
                      name="tanggal_surat"
                      type="date"
                      data-testid="input-tanggal-surat"
                      value={formData.tanggal_surat}
                      onChange={handleInputChange}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomor_surat" className="text-sm font-medium text-slate-700 mb-2 block">
                      Nomor Surat *
                    </Label>
                    <Input
                      id="nomor_surat"
                      name="nomor_surat"
                      data-testid="input-nomor-surat"
                      value={formData.nomor_surat}
                      onChange={handleInputChange}
                      placeholder="Contoh: agenda 0333"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="asal_surat" className="text-sm font-medium text-slate-700 mb-2 block">
                      Asal Surat *
                    </Label>
                    <Input
                      id="asal_surat"
                      name="asal_surat"
                      data-testid="input-asal-surat"
                      value={formData.asal_surat}
                      onChange={handleInputChange}
                      placeholder="Contoh: Surat Sekretaris Kabinet RI"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="disposisi" className="text-sm font-medium text-slate-700 mb-2 block">
                      Disposisi *
                    </Label>
                    <select
                      id="disposisi"
                      name="disposisi"
                      data-testid="input-disposisi"
                      value={formData.disposisi}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Pilih Disposisi</option>
                      <option value="Dirjen PPKTrans">Dirjen PPKTrans</option>
                      <option value="Dirjen PEMT">Dirjen PEMT</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="tempat" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tempat
                    </Label>
                    <Input
                      id="tempat"
                      name="tempat"
                      data-testid="input-tempat"
                      value={formData.tempat}
                      onChange={handleInputChange}
                      placeholder="Contoh: Istana Negara"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="acara" className="text-sm font-medium text-slate-700 mb-2 block">
                      Acara
                    </Label>
                    <Input
                      id="acara"
                      name="acara"
                      data-testid="input-acara"
                      value={formData.acara}
                      onChange={handleInputChange}
                      placeholder="Nama acara"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="waktu" className="text-sm font-medium text-slate-700 mb-2 block">
                      Waktu
                    </Label>
                    <Input
                      id="waktu"
                      name="waktu"
                      data-testid="input-waktu"
                      value={formData.waktu}
                      onChange={handleInputChange}
                      placeholder="Contoh: 13.30 WIB"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_person" className="text-sm font-medium text-slate-700 mb-2 block">
                      Contact Person
                    </Label>
                    <Input
                      id="contact_person"
                      name="contact_person"
                      data-testid="input-contact-person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      placeholder="Nomor telepon"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pic" className="text-sm font-medium text-slate-700 mb-2 block">
                      PIC (Person In Charge)
                    </Label>
                    <Input
                      id="pic"
                      name="pic"
                      data-testid="input-pic"
                      value={formData.pic}
                      onChange={handleInputChange}
                      placeholder="Nama PIC"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="region" className="text-sm font-medium text-slate-700 mb-2 block">
                      Provinsi
                    </Label>
                    <Input
                      id="region"
                      name="region"
                      data-testid="input-region"
                      value={formData.region}
                      onChange={handleInputChange}
                      list="provinsi-list"
                      placeholder="Ketik untuk mencari provinsi..."
                      className="h-10"
                    />
                    <datalist id="provinsi-list">
                      {/* Sumatera */}
                      <option value="Aceh" />
                      <option value="Sumatera Utara" />
                      <option value="Sumatera Barat" />
                      <option value="Riau" />
                      <option value="Kepulauan Riau" />
                      <option value="Jambi" />
                      <option value="Sumatera Selatan" />
                      <option value="Kepulauan Bangka Belitung" />
                      <option value="Bengkulu" />
                      <option value="Lampung" />
                      {/* Jawa */}
                      <option value="DKI Jakarta" />
                      <option value="Jawa Barat" />
                      <option value="Banten" />
                      <option value="Jawa Tengah" />
                      <option value="DI Yogyakarta" />
                      <option value="Jawa Timur" />
                      {/* Kalimantan */}
                      <option value="Kalimantan Barat" />
                      <option value="Kalimantan Tengah" />
                      <option value="Kalimantan Selatan" />
                      <option value="Kalimantan Timur" />
                      <option value="Kalimantan Utara" />
                      {/* Sulawesi */}
                      <option value="Sulawesi Utara" />
                      <option value="Gorontalo" />
                      <option value="Sulawesi Tengah" />
                      <option value="Sulawesi Barat" />
                      <option value="Sulawesi Selatan" />
                      <option value="Sulawesi Tenggara" />
                      {/* Bali & Nusa Tenggara */}
                      <option value="Bali" />
                      <option value="Nusa Tenggara Barat" />
                      <option value="Nusa Tenggara Timur" />
                      {/* Maluku */}
                      <option value="Maluku" />
                      <option value="Maluku Utara" />
                      {/* Papua */}
                      <option value="Papua Barat Daya" />
                      <option value="Papua Barat" />
                      <option value="Papua Tengah" />
                      <option value="Papua Pegunungan" />
                      <option value="Papua Selatan" />
                      <option value="Papua" />
                    </datalist>
                  </div>

                  <div>
                    <Label htmlFor="kota_kabupaten" className="text-sm font-medium text-slate-700 mb-2 block">
                      Kota/Kabupaten
                    </Label>
                    <Input
                      id="kota_kabupaten"
                      name="kota_kabupaten"
                      data-testid="input-kota-kabupaten"
                      value={formData.kota_kabupaten}
                      onChange={handleInputChange}
                      placeholder="Contoh: Bandung, Kabupaten Bogor"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-slate-700 mb-2 block">
                      Status *
                    </Label>
                    <select
                      id="status"
                      name="status"
                      data-testid="input-status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="in_progress">Sedang Berjalan</option>
                      <option value="implemented">Sudah Dilaksanakan</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                      Deskripsi
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      data-testid="input-description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Keterangan tambahan"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* Conditional Form for Dapil */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700 mb-2 block">
                      Judul Arahan *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      data-testid="input-title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Masukkan judul arahan"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tujuan_program" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tujuan Program
                    </Label>
                    <Input
                      id="tujuan_program"
                      name="tujuan_program"
                      data-testid="input-tujuan-program"
                      value={formData.tujuan_program}
                      onChange={handleInputChange}
                      placeholder="Masukkan tujuan program"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value" className="text-sm font-medium text-slate-700 mb-2 block">
                      Nama Dapil *
                    </Label>
                    <Input
                      id="value"
                      name="value"
                      data-testid="input-value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="Contoh: Jawa Barat I"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="region" className="text-sm font-medium text-slate-700 mb-2 block">
                      Provinsi *
                    </Label>
                    <Input
                      id="region"
                      name="region"
                      data-testid="input-region"
                      value={formData.region}
                      onChange={handleInputChange}
                      list="provinsi-list-dapil"
                      placeholder="Ketik untuk mencari provinsi..."
                      required
                      className="h-10"
                    />
                    <datalist id="provinsi-list-dapil">
                      {/* Sumatera */}
                      <option value="Aceh" />
                      <option value="Sumatera Utara" />
                      <option value="Sumatera Barat" />
                      <option value="Riau" />
                      <option value="Kepulauan Riau" />
                      <option value="Jambi" />
                      <option value="Sumatera Selatan" />
                      <option value="Kepulauan Bangka Belitung" />
                      <option value="Bengkulu" />
                      <option value="Lampung" />
                      {/* Jawa */}
                      <option value="DKI Jakarta" />
                      <option value="Jawa Barat" />
                      <option value="Banten" />
                      <option value="Jawa Tengah" />
                      <option value="DI Yogyakarta" />
                      <option value="Jawa Timur" />
                      {/* Kalimantan */}
                      <option value="Kalimantan Barat" />
                      <option value="Kalimantan Tengah" />
                      <option value="Kalimantan Selatan" />
                      <option value="Kalimantan Timur" />
                      <option value="Kalimantan Utara" />
                      {/* Sulawesi */}
                      <option value="Sulawesi Utara" />
                      <option value="Gorontalo" />
                      <option value="Sulawesi Tengah" />
                      <option value="Sulawesi Barat" />
                      <option value="Sulawesi Selatan" />
                      <option value="Sulawesi Tenggara" />
                      {/* Bali & Nusa Tenggara */}
                      <option value="Bali" />
                      <option value="Nusa Tenggara Barat" />
                      <option value="Nusa Tenggara Timur" />
                      {/* Maluku */}
                      <option value="Maluku" />
                      <option value="Maluku Utara" />
                      {/* Papua */}
                      <option value="Papua Barat Daya" />
                      <option value="Papua Barat" />
                      <option value="Papua Tengah" />
                      <option value="Papua Pegunungan" />
                      <option value="Papua Selatan" />
                      <option value="Papua" />
                    </datalist>
                  </div>

                  <div>
                    <Label htmlFor="kota_kabupaten" className="text-sm font-medium text-slate-700 mb-2 block">
                      Kota/Kabupaten
                    </Label>
                    <Input
                      id="kota_kabupaten"
                      name="kota_kabupaten"
                      data-testid="input-kota-kabupaten"
                      value={formData.kota_kabupaten}
                      onChange={handleInputChange}
                      placeholder="Contoh: Bandung, Kabupaten Bogor"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tanggal Mulai *
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      data-testid="input-start-date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date" className="text-sm font-medium text-slate-700 mb-2 block">
                      Tanggal Selesai *
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      data-testid="input-end-date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-slate-700 mb-2 block">
                      Status *
                    </Label>
                    <select
                      id="status"
                      name="status"
                      data-testid="input-status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="in_progress">Sedang Berjalan</option>
                      <option value="implemented">Sudah Dilaksanakan</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                      Deskripsi *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      data-testid="input-description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Masukkan deskripsi arahan"
                      required
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                data-testid="submit-directive-button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Tambah Arahan'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="manage" data-testid="manage-directives">
          <div className="space-y-4">
            {directives.length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 shadow-sm">
                <p className="text-slate-600">Belum ada arahan {viewMode === 'kementerian' ? 'Kementerian' : 'Dapil'}</p>
              </Card>
            ) : (
              directives.map((directive) => (
                <Card key={directive.id} className="p-6 bg-white border-0 shadow-sm" data-testid={`manage-card-${directive.id}`}>
                  {editingDirective === directive.id ? (
                    /* ── EDIT FORM ── */
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-slate-800">Edit Arahan</h3>
                        <Button type="button" size="sm" variant="ghost" onClick={handleEditCancel} className="h-8 w-8 p-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {directive.type === 'kementerian' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tanggal Masuk Surat *</Label>
                            <input type="date" name="tanggal_masuk_surat" value={editFormData.tanggal_masuk_surat || ''} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tanggal Surat</Label>
                            <input type="date" name="tanggal_surat" value={editFormData.tanggal_surat || ''} onChange={handleEditInputChange} className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Nomor Surat *</Label>
                            <Input name="nomor_surat" value={editFormData.nomor_surat || ''} onChange={handleEditInputChange} required className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Asal Surat *</Label>
                            <Input name="asal_surat" value={editFormData.asal_surat || ''} onChange={handleEditInputChange} required className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Disposisi *</Label>
                            <select name="disposisi" value={editFormData.disposisi || ''} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                              <option value="">Pilih Disposisi</option>
                              <option value="Dirjen PPKTrans">Dirjen PPKTrans</option>
                              <option value="Dirjen PEMT">Dirjen PEMT</option>
                              <option value="lainnya">Lainnya</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tempat</Label>
                            <Input name="tempat" value={editFormData.tempat || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Acara</Label>
                            <Input name="acara" value={editFormData.acara || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Waktu</Label>
                            <Input name="waktu" value={editFormData.waktu || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Contact Person</Label>
                            <Input name="contact_person" value={editFormData.contact_person || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">PIC</Label>
                            <Input name="pic" value={editFormData.pic || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Provinsi</Label>
                            <Input name="region" value={editFormData.region || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Kota/Kabupaten</Label>
                            <Input name="kota_kabupaten" value={editFormData.kota_kabupaten || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Status *</Label>
                            <select name="status" value={editFormData.status || 'pending'} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                              <option value="pending">Menunggu</option>
                              <option value="in_progress">Sedang Berjalan</option>
                              <option value="implemented">Sudah Dilaksanakan</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Deskripsi</Label>
                            <Textarea name="description" value={editFormData.description || ''} onChange={handleEditInputChange} rows={3} className="resize-none" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Judul Arahan *</Label>
                            <Input name="title" value={editFormData.title || ''} onChange={handleEditInputChange} required className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tujuan Program</Label>
                            <Input name="tujuan_program" value={editFormData.tujuan_program || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Nama Dapil *</Label>
                            <Input name="value" value={editFormData.value || ''} onChange={handleEditInputChange} required className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Provinsi *</Label>
                            <Input name="region" value={editFormData.region || ''} onChange={handleEditInputChange} required className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Kota/Kabupaten</Label>
                            <Input name="kota_kabupaten" value={editFormData.kota_kabupaten || ''} onChange={handleEditInputChange} className="h-10" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tanggal Mulai *</Label>
                            <input type="date" name="start_date" value={editFormData.start_date || ''} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Tanggal Selesai *</Label>
                            <input type="date" name="end_date" value={editFormData.end_date || ''} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Status *</Label>
                            <select name="status" value={editFormData.status || 'pending'} onChange={handleEditInputChange} required className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                              <option value="pending">Menunggu</option>
                              <option value="in_progress">Sedang Berjalan</option>
                              <option value="implemented">Sudah Dilaksanakan</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Deskripsi *</Label>
                            <Textarea name="description" value={editFormData.description || ''} onChange={handleEditInputChange} required rows={4} className="resize-none" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Simpan Perubahan
                        </Button>
                        <Button type="button" variant="outline" onClick={handleEditCancel}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {directive.type === 'kementerian' 
                            ? (directive.nomor_surat || 'No Number')
                            : (directive.title || 'No Title')}
                        </h3>
                        {getStatusBadge(directive.status)}
                      </div>
                      
                      {directive.type === 'kementerian' ? (
                        /* Display for Kementerian */
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {directive.tanggal_masuk_surat && (
                              <div>
                                <span className="text-xs font-medium text-slate-500">Tanggal Masuk:</span>
                                <p className="text-sm text-slate-800">{directive.tanggal_masuk_surat}</p>
                              </div>
                            )}
                            {directive.tanggal_surat && (
                              <div>
                                <span className="text-xs font-medium text-slate-500">Tanggal Surat:</span>
                                <p className="text-sm text-slate-800">{directive.tanggal_surat}</p>
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
                            <p className="text-sm text-slate-600 mb-3">{directive.description}</p>
                          )}
                        </>
                      ) : (
                        /* Display for Dapil */
                        <>
                          {directive.tujuan_program && (
                            <div className="mb-3">
                              <span className="text-xs font-medium text-slate-500">Tujuan Program:</span>
                              <p className="text-sm text-slate-700 mt-1">{directive.tujuan_program}</p>
                            </div>
                          )}
                          <p className="text-sm text-slate-600 mb-3">{directive.description}</p>
                          <div className="text-xs text-slate-500 space-y-1 mb-4">
                            <div className="flex gap-4">
                              <span>Tipe: <span className="font-medium">{directive.type === 'kementerian' ? 'Kementerian' : 'Dapil'}</span></span>
                              <span>•</span>
                              <span>{directive.value}</span>
                            </div>
                            <div className="flex gap-4">
                              <span>Daerah: <span className="font-medium">{directive.region}</span></span>
                              <span>•</span>
                              <span>{directive.start_date} - {directive.end_date}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Attachments Section */}
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">
                              Lampiran ({directive.attachments?.length || 0})
                            </span>
                          </div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileSelect(directive.id, e)}
                              disabled={uploadingFor === directive.id}
                              data-testid={`file-input-${directive.id}`}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={uploadingFor === directive.id}
                              className="pointer-events-none"
                              data-testid={`upload-button-${directive.id}`}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              {uploadingFor === directive.id ? 'Mengunggah...' : 'Unggah File'}
                            </Button>
                          </label>
                        </div>

                        {directive.attachments && directive.attachments.length > 0 && (
                          <div className="space-y-2">
                            {directive.attachments.map((attachment, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                                data-testid={`attachment-${directive.id}-${idx}`}
                              >
                                <div className="flex items-center gap-3">
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
                                      <FileText className="w-5 h-5 text-slate-500" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                                      {attachment.filename}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {(attachment.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {(isImageFile(attachment.content_type) || isPdfFile(attachment.content_type)) && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openPreview(attachment)}
                                      data-testid={`preview-attachment-${idx}`}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="w-4 h-4 text-slate-600" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadAttachment(attachment)}
                                    data-testid={`download-attachment-${idx}`}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Download className="w-4 h-4 text-slate-600" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(!directive.attachments || directive.attachments.length === 0) && (
                          <p className="text-xs text-slate-400 italic">Belum ada lampiran</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(directive)}
                        data-testid={`edit-button-${directive.id}`}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(directive.id)}
                        data-testid={`delete-button-${directive.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
          data-testid="preview-modal"
        >
          <div 
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
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
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {isImageFile(previewAttachment.content_type) ? (
                <img
                  src={`data:${previewAttachment.content_type};base64,${previewAttachment.data}`}
                  alt={previewAttachment.filename}
                  className="max-w-full h-auto mx-auto rounded-lg"
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

export default AdminPage;