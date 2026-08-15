import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  // ─── Status & Priority badge renkleri ───────────────────────────
  const statusColor: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-gray-100 text-gray-600',
    RESOLVED: 'bg-green-100 text-green-700',
  };

  const priorityColor: Record<string, string> = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Destek Talepleri</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 px-3 py-1 rounded transition"
        >
          Çıkış Yap
        </button>
      </header>

      {/* Content */}
      <main className="p-6">
        {loading && (
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        )}

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Toplam {tickets.length} talep bulundu.
            </p>

            {tickets.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz hiç talep yok.</p>
            ) : (
              <div className="overflow-x-auto rounded border border-gray-200 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Başlık</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Öncelik</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Oluşturan</th>
                      <th className="px-4 py-3">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-400">{ticket.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {ticket.title}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColor[ticket.status] ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              priorityColor[ticket.priority] ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{ticket.category}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {ticket.user?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
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
