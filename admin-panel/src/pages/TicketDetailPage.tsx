import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { statusLabels, priorityLabels, label } from '../utils/labels';

interface TicketDetail {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  aiSummary?: string | null;
  aiSolution?: string | null;
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const statusColor: Record<string, string> = {
  OPEN:        'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-gray-800 text-gray-100',
  RESOLVED:    'bg-gray-200 text-gray-600',
  CLOSED:      'bg-gray-100 text-gray-400',
};

const priorityColor: Record<string, string> = {
  LOW:      'bg-gray-100 text-gray-500',
  MEDIUM:   'bg-gray-200 text-gray-700',
  HIGH:     'bg-gray-700 text-gray-100',
  CRITICAL: 'bg-gray-900 text-white',
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState('');

  // ─── İlk yükleme ─────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    api
      .get<TicketDetail>(`/tickets/${id}`)
      .then((res) => {
        setTicket(res.data);
        setSelectedStatus(res.data.status);
      })
      .catch(() => setError('Talep yüklenirken bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // ─── Status güncelleme ────────────────────────────────────────────
  const handleUpdate = async () => {
    setUpdateSuccess('');
    setUpdateError('');
    setUpdating(true);

    try {
      const res = await api.patch<TicketDetail>(`/tickets/${id}`, {
        status: selectedStatus,
      });
      setTicket(res.data);
      setSelectedStatus(res.data.status);
      setUpdateSuccess('Durum başarıyla güncellendi.');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setUpdateError('Bu işlem için yetkiniz yok. Sadece adminler durum güncelleyebilir.');
      } else {
        setUpdateError('Güncelleme sırasında bir hata oluştu.');
      }
    } finally {
      setUpdating(false);
    }
  };

  // ─── AI özet ─────────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    setSummaryError('');
    setSummaryLoading(true);

    try {
      const res = await api.post<TicketDetail>(`/tickets/${id}/ai-summary`);
      setTicket(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setSummaryError('Bu işlem için yetkiniz yok. Sadece adminler özet oluşturabilir.');
      } else {
        setSummaryError('Özet oluşturulurken bir hata oluştu.');
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  // ─── AI çözüm önerisi ────────────────────────────────────────────
  const handleGenerateSolution = async () => {
    setSolutionError('');
    setSolutionLoading(true);

    try {
      const res = await api.post<TicketDetail>(`/tickets/${id}/ai-solution`);
      setTicket(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setSolutionError('Bu işlem için yetkiniz yok. Sadece adminler çözüm önerisi oluşturabilir.');
      } else {
        setSolutionError('Çözüm önerisi oluşturulurken bir hata oluştu.');
      }
    } finally {
      setSolutionLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Talep Detayı</h1>
        <Link
          to="/tickets"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          ← Listeye Dön
        </Link>
      </header>

      <main className="px-8 py-8 max-w-[1600px]">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-12">Yükleniyor...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && ticket && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            <div className="space-y-4">

            {/* Ticket bilgileri */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">

              {/* Başlık */}
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Başlık</span>
                <p className="text-xl font-semibold text-gray-900 mt-1">{ticket.title}</p>
              </div>

              {/* Açıklama */}
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Açıklama</span>
                <p className="text-base text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {ticket.description || <span className="text-gray-400 italic">—</span>}
                </p>
              </div>

              {/* Meta bilgiler grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-500">Durum</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusColor[ticket.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {label(statusLabels, ticket.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Öncelik</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        priorityColor[ticket.priority] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {label(priorityLabels, ticket.priority)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Kategori</span>
                  <p className="text-base text-gray-900 mt-1">{ticket.category}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Oluşturulma Tarihi</span>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Oluşturan</span>
                  <p className="text-base text-gray-900 mt-1">{ticket.user?.name ?? '—'}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Email</span>
                  <p className="text-base text-gray-900 mt-1">{ticket.user?.email ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Durum güncelleme */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Durum Güncelle</h2>
              </div>
              <div className="px-8 py-5 space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setUpdateSuccess('');
                      setUpdateError('');
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {label(statusLabels, s)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleUpdate}
                    disabled={updating || selectedStatus === ticket.status}
                    className="bg-[#5c642a] text-white text-base px-4 py-2 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {updating ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>

                {updateSuccess && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    ✓ {updateSuccess}
                  </div>
                )}

                {updateError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                    {updateError}
                  </div>
                )}
              </div>
            </div>

            </div>{/* /lg:col-span-2 */}

            <div className="lg:sticky lg:top-8">
            {/* AI Destek Araçları */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-8 py-5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">AI Destek Araçları</h2>
              </div>
              <div className="px-8 py-5 space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="bg-[#5c642a] text-white text-base px-4 py-2 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {summaryLoading ? 'Oluşturuluyor...' : 'Özet Çıkar'}
                  </button>

                  <button
                    onClick={handleGenerateSolution}
                    disabled={solutionLoading}
                    className="bg-[#5c642a] text-white text-base px-4 py-2 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {solutionLoading ? 'Oluşturuluyor...' : 'Çözüm Öner'}
                  </button>
                </div>

                {summaryError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                    {summaryError}
                  </div>
                )}

                {solutionError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                    {solutionError}
                  </div>
                )}

                {ticket.aiSummary && (
                  <div>
                    <span className="text-xs text-gray-500">Özet</span>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base text-gray-700 whitespace-pre-wrap mt-1">
                      {ticket.aiSummary}
                    </div>
                  </div>
                )}

                {ticket.aiSolution && (
                  <div>
                    <span className="text-xs text-gray-500">Çözüm Önerisi</span>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-base text-gray-700 whitespace-pre-wrap mt-1">
                      {ticket.aiSolution}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>{/* /lg:sticky */}

          </div>
        )}
      </main>
    </div>
  );
}
