import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

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
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const statusColor: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  RESOLVED: 'bg-green-100 text-green-700',
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

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Talep Detayı</h1>
        <Link
          to="/tickets"
          className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 px-3 py-1 rounded transition"
        >
          ← Listeye Dön
        </Link>
      </header>

      <main className="p-6 max-w-2xl">
        {loading && <p className="text-gray-500 text-sm">Yükleniyor...</p>}

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && ticket && (
          <div className="space-y-6">
            {/* Ticket bilgileri */}
            <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
              <div>
                <span className="text-xs text-gray-400 uppercase font-medium">Başlık</span>
                <p className="text-gray-800 font-semibold mt-0.5">{ticket.title}</p>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase font-medium">Açıklama</span>
                <p className="text-gray-700 mt-0.5 whitespace-pre-wrap">
                  {ticket.description || <span className="text-gray-400 italic">—</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Durum</span>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColor[ticket.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Öncelik</span>
                  <p className="text-gray-700 mt-0.5">{ticket.priority}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Kategori</span>
                  <p className="text-gray-700 mt-0.5">{ticket.category}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Oluşturulma Tarihi</span>
                  <p className="text-gray-700 mt-0.5">
                    {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Oluşturan</span>
                  <p className="text-gray-700 mt-0.5">{ticket.user?.name ?? '—'}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase font-medium">Email</span>
                  <p className="text-gray-700 mt-0.5">{ticket.user?.email ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Durum güncelleme */}
            <div className="bg-white border border-gray-200 rounded p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Durum Güncelle</h2>

              <div className="flex items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setUpdateSuccess('');
                    setUpdateError('');
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleUpdate}
                  disabled={updating || selectedStatus === ticket.status}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {updating ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>

              {updateSuccess && (
                <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  ✓ {updateSuccess}
                </p>
              )}

              {updateError && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  ✗ {updateError}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
