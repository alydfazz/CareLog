'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Maintenance, MaintenancePayload } from '@/types/maintenance';

interface ItemSummary {
  itemName: string;
  lastServiceDate: string;
  lastServiceType: string;
  totalCost: number;
  count: number;
}

export default function MaintenancesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('ALL');

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<Maintenance[]>('/maintenances');
      setMaintenances(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal memuat riwayat perawatan';
      if (message.toLowerCase().includes('unauthorized')) {
        router.replace('/login');
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserName(JSON.parse(storedUser).name || '');
      } catch {
        setUserName('');
      }
    }

    fetchMaintenances();
  }, [router, fetchMaintenances]);

  const resetForm = () => {
    setEditingId(null);
    setItemName('');
    setServiceType('');
    setServiceDate('');
    setCost('');
    setNotes('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const payload: MaintenancePayload = {
      item_name: itemName.trim(),
      service_type: serviceType.trim(),
      service_date: serviceDate,
      cost: Number(cost),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    try {
      if (editingId !== null) {
        const updated = await apiRequest<Maintenance>(
          `/maintenances/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
        );
        setMaintenances((prev) =>
          prev
            .map((item) => (item.id === editingId ? updated : item))
            .sort(
              (a, b) =>
                new Date(b.service_date).getTime() -
                new Date(a.service_date).getTime(),
            ),
        );
      } else {
        const created = await apiRequest<Maintenance>('/maintenances', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMaintenances((prev) =>
          [created, ...prev].sort(
            (a, b) =>
              new Date(b.service_date).getTime() -
              new Date(a.service_date).getTime(),
          ),
        );
      }
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan catatan servis';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: Maintenance) => {
    setEditingId(item.id);
    setItemName(item.item_name);
    setServiceType(item.service_type);
    setServiceDate(item.service_date.slice(0, 10));
    setCost(String(item.cost));
    setNotes(item.notes || '');
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Yakin ingin menghapus catatan servis ini?',
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/maintenances/${id}`, { method: 'DELETE' });
      setMaintenances((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menghapus data';
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Ringkasan per barang: kapan terakhir dirawat & total biaya per barang
  const itemSummaries = useMemo<ItemSummary[]>(() => {
    const map = new Map<string, ItemSummary>();

    for (const entry of maintenances) {
      const key = entry.item_name.trim().toLowerCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          itemName: entry.item_name.trim(),
          lastServiceDate: entry.service_date,
          lastServiceType: entry.service_type,
          totalCost: entry.cost,
          count: 1,
        });
      } else {
        existing.totalCost += entry.cost;
        existing.count += 1;
        if (
          new Date(entry.service_date).getTime() >
          new Date(existing.lastServiceDate).getTime()
        ) {
          existing.lastServiceDate = entry.service_date;
          existing.lastServiceType = entry.service_type;
        }
      }
    }

    return Array.from(map.values());
  }, [maintenances]);

  // Filter berdasarkan barang terpilih & kata kunci pencarian
  const filteredMaintenances = useMemo(() => {
    const keyword = searchQuery.toLowerCase();
    return maintenances.filter((item) => {
      const matchesItem =
        selectedItemFilter === 'ALL' ||
        item.item_name.trim().toLowerCase() ===
          selectedItemFilter.toLowerCase();

      const matchesSearch =
        item.item_name.toLowerCase().includes(keyword) ||
        item.service_type.toLowerCase().includes(keyword) ||
        (item.notes && item.notes.toLowerCase().includes(keyword));

      return matchesItem && matchesSearch;
    });
  }, [maintenances, searchQuery, selectedItemFilter]);

  const totalCost = useMemo(
    () => maintenances.reduce((acc, item) => acc + item.cost, 0),
    [maintenances],
  );

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Maintenance & Service Log
            </h1>
            {userName && (
              <p className="text-xs text-slate-500">Halo, {userName}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Ringkasan Total Biaya & Jumlah Servis */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Biaya Perawatan
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {formatRupiah(totalCost)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Riwayat Servis
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {maintenances.length} Catatan
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Jumlah Barang Terdaftar
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {itemSummaries.length} Barang
            </p>
          </div>
        </section>

        {/* Status Perawatan Terakhir per Barang */}
        {itemSummaries.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Status Perawatan Terakhir per Barang (Klik untuk filter)
              </h2>
              {selectedItemFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedItemFilter('ALL')}
                  className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Tampilkan Semua Barang
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {itemSummaries.map((summary) => {
                const isSelected =
                  selectedItemFilter.toLowerCase() ===
                  summary.itemName.toLowerCase();

                return (
                  <button
                    key={summary.itemName}
                    type="button"
                    onClick={() =>
                      setSelectedItemFilter(
                        isSelected ? 'ALL' : summary.itemName,
                      )
                    }
                    className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {summary.itemName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {summary.count}x servis
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Terakhir dirawat:{' '}
                      <strong className="text-slate-700">
                        {formatDate(summary.lastServiceDate)}
                      </strong>
                    </p>
                    <p className="text-xs text-slate-500">
                      Servis terakhir: {summary.lastServiceType}
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 mt-2">
                      Total biaya: {formatRupiah(summary.totalCost)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Form Tambah / Edit Servis */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId !== null
              ? 'Edit Catatan Perawatan'
              : 'Tambah Catatan Perawatan Baru'}
          </h2>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Barang (item_name) *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Misal: Motor Vario / AC Kamar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Servis (service_type) *
              </label>
              <input
                type="text"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Misal: Ganti Oli / Cuci AC"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal Servis (service_date) *
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Biaya Perawatan dalam Rp (cost) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Misal: 75000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bengkel / Catatan Teknis (notes)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Bengkel AHASS Jl. Pemuda, KM 18.500 / Ganti freon R32"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition cursor-pointer"
              >
                {submitting
                  ? 'Menyimpan...'
                  : editingId !== null
                    ? 'Simpan Perubahan'
                    : 'Simpan Catatan Servis'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Daftar Riwayat Perawatan */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Riwayat Perawatan{' '}
              {selectedItemFilter !== 'ALL' ? `— ${selectedItemFilter}` : ''}
            </h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari barang, jenis servis, atau catatan..."
              className="w-full sm:w-72 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
              Memuat catatan perawatan...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={fetchMaintenances}
                className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && filteredMaintenances.length === 0 && (
            <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-700 font-medium">
                {searchQuery || selectedItemFilter !== 'ALL'
                  ? 'Tidak ada catatan yang cocok dengan filter.'
                  : 'Belum ada riwayat perawatan tercatat.'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || selectedItemFilter !== 'ALL'
                  ? 'Coba ubah kata kunci pencarian atau tampilkan semua barang.'
                  : 'Tambahkan catatan servis pertama melalui formulir di atas.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredMaintenances.length > 0 && (
            <div className="space-y-3">
              {filteredMaintenances.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        {item.item_name}
                      </span>
                      <h3 className="font-semibold text-slate-800">
                        {item.service_type}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500">
                      Tanggal Servis: {formatDate(item.service_date)}
                    </p>

                    {item.notes && (
                      <p className="text-sm text-slate-600 pt-1">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span className="text-base font-bold text-emerald-700">
                      {formatRupiah(item.cost)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}