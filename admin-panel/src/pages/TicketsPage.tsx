import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { statusLabels, priorityLabels, label } from '../utils/labels';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  category: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Route guard: token yoksa login'e yönlendir
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // GET /tickets
    api
      .get<Ticket[]>('/tickets')
      .then((res) => setTickets(res.data))
      .catch(() => setError('Talepler yüklenirken bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  };

  // ─── Status & Priority badge renkleri (nötr palet) ───────────────
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

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Destek Talepleri</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Çıkış Yap
        </button>
      </header>

      {/* Content */}
      <main className="px-8 py-8">

        {/* Yükleniyor */}
        {loading && (
          <p className="text-sm text-gray-400 text-center py-12">Yükleniyor...</p>
        )}

        {/* Hata */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Özet */}
            <p className="text-xs text-gray-400 mb-4">
              Toplam {tickets.length} talep
            </p>

            {tickets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">
                Henüz hiç talep yok.
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Başlık</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Durum</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Öncelik</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Kategori</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Oluşturan</th>
                        <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer align-middle"
                        >
                          <td className="px-5 py-4 text-gray-400 text-sm align-middle">{ticket.id}</td>
                          <td className="px-5 py-4 font-medium text-gray-900 text-base align-middle">
                            {ticket.title}
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColor[ticket.status] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {label(statusLabels, ticket.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                priorityColor[ticket.priority] ?? 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {label(priorityLabels, ticket.priority)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-base align-middle">{ticket.category}</td>
                          <td className="px-5 py-4 text-gray-500 text-base align-middle">
                            {ticket.user?.name ?? '—'}
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-sm align-middle">
                            {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
