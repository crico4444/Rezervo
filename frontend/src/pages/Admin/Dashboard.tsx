import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';

interface Rezervare {
  id: number; numeUtilizator: string; emailUtilizator: string;
  numeCamera: string; numeProprietate: string;
  dataCheckIn: string; dataCheckOut: string;
  pretTotal: number; status: string;
}

interface StatProprietar { numeProprietar: string; valoare: number; }
interface StatRating { numeProprietate: string; numeProprietar: string; ratingMediu: number; numarRecenzii: number; }
interface Statistici { topVenituri: StatProprietar[]; topFinalizate: StatProprietar[]; topRating: StatRating[]; }

// Culorile badge-urilor de status din tabelul de rezervari
const culoriStatus: Record<string, string> = {
  PENDING: '#0071c2', CONFIRMATA: '#0071c2', ANULATA: '#d9534f', FINALIZATA: '#5cb85c',
};

// Etichetele afisate in badge-urile de status
const eticheteStatus: Record<string, string> = {
  PENDING: 'În desfășurare', CONFIRMATA: 'În desfășurare', ANULATA: 'Anulată', FINALIZATA: 'Finalizată',
};

export default function AdminDashboard() {
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [statistici, setStatistici] = useState<Statistici | null>(null);
  const [arataStat, setArataStat] = useState(false);
  const [seIncarcaStat, setSeIncarcaStat] = useState(false);
  const [anulareMsg, setAnulareMsg] = useState<string | null>(null);
  const [anulareLoading, setAnulareLoading] = useState(false);

  // La montare, incarca toate rezervarile din sistem
  useEffect(() => {
    api.get('/rezervari').then(r => setRezervari(r.data));
  }, []);

  // Alterneaza vizibilitatea sectiunii de statistici;
  // la prima deschidere, incarca datele de la server
  const toggleStatistici = async () => {
    if (!arataStat && !statistici) {
      setSeIncarcaStat(true);
      const { data } = await api.get('/admin/statistici');
      setStatistici(data);
      setSeIncarcaStat(false);
    }
    setArataStat(v => !v);
  };

  // Schimba statusul unei rezervari si actualizeaza randului din tabel
  const schimbaStatus = async (id: number, status: string) => {
    const { data } = await api.put(`/rezervari/${id}/status?status=${status}`);
    setRezervari(prev => prev.map(r => r.id === id ? { ...r, status: data.status } : r));
  };

  // Calculeaza suma totala a veniturilor din rezervarile finalizate
  const totalVenituri = rezervari
    .filter(r => r.status === 'FINALIZATA')
    .reduce((suma, r) => suma + r.pretTotal, 0);

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>🛠️ Panou Administrare</h1>

      {/* Carduri cu statistici rapide: total, in desfasurare, finalizate */}
      <div style={s.statsRow}>
        <div style={s.stat}><strong>{rezervari.length}</strong><br />Total rezervări</div>
        <div style={s.stat}>
          <strong>{rezervari.filter(r => r.status === 'CONFIRMATA' || r.status === 'PENDING').length}</strong><br />În desfășurare
        </div>
        <div style={s.stat}><strong>{rezervari.filter(r => r.status === 'FINALIZATA').length}</strong><br />Finalizate</div>
        <div style={s.stat}><strong>{totalVenituri.toLocaleString('ro-RO')} RON</strong><br />Venituri totale</div>
      </div>

      {/* Navigare rapida si buton pentru afisarea graficelor */}
      <div style={s.nav}>
        <Link to="/admin/proprietati" style={s.navBtn}>🏨 Proprietăți</Link>
        <Link to="/admin/camere" style={s.navBtn}>🛏️ Camere</Link>
        <Link to="/admin/utilizatori" style={s.navBtn}>👥 Utilizatori</Link>
        <button onClick={toggleStatistici} style={s.statBtn}>
          {arataStat ? '📊 Ascunde statistici' : '📊 Arată statistici'}
        </button>
        <button
          onClick={async () => {
            setAnulareLoading(true);
            setAnulareMsg(null);
            try {
              await api.post('/admin/anuleaza-expirate');
              const { data } = await api.get('/rezervari');
              setRezervari(data);
              setAnulareMsg('Rezervările expirate au fost anulate.');
            } catch {
              setAnulareMsg('Eroare la anulare.');
            } finally {
              setAnulareLoading(false);
            }
          }}
          style={{ ...s.statBtn, background: '#d9534f' }}
          disabled={anulareLoading}
        >
          {anulareLoading ? '⏳ Se procesează...' : '🗑️ Anulează expirate'}
        </button>
      </div>
      {anulareMsg && <p style={{ color: '#d9534f', marginBottom: '1rem', fontWeight: 600 }}>{anulareMsg}</p>}

      {/* Sectiunea de statistici cu grafice si tabel de rating */}
      {arataStat && (
        <div style={s.statSection}>
          {seIncarcaStat ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Se încarcă statisticile...</p>
          ) : statistici && (
            <>
              <div style={s.chartsRow}>
                {/* Grafic bar: top proprietari dupa venituri totale din rezervari finalizate */}
                <div style={s.chartBox}>
                  <h3 style={s.chartTitle}>💰 Top proprietari după venituri (RON)</h3>
                  {statistici.topVenituri.length === 0 ? (
                    <p style={s.noData}>Nu există rezervări finalizate.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={statistici.topVenituri} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="numeProprietar" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => `${Number(v).toLocaleString()} RON`} />
                        <Bar dataKey="valoare" fill="#003580" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Grafic bar: top proprietari dupa numarul de rezervari finalizate */}
                <div style={s.chartBox}>
                  <h3 style={s.chartTitle}>🏆 Top proprietari după numărul de rezervări finalizate</h3>
                  {statistici.topFinalizate.length === 0 ? (
                    <p style={s.noData}>Nu există rezervări finalizate.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={statistici.topFinalizate} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="numeProprietar" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => `${Number(v)} rezervări`} />
                        <Bar dataKey="valoare" fill="#0071c2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Tabel cu top cazari dupa rating mediu din recenzii */}
              <div style={s.ratingBox}>
                <h3 style={s.chartTitle}>⭐ Top cazări după rating</h3>
                {statistici.topRating.length === 0 ? (
                  <p style={s.noData}>Nu există recenzii.</p>
                ) : (
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>#</th>
                        <th style={s.th}>Cazare</th>
                        <th style={s.th}>Proprietar</th>
                        <th style={s.th}>Rating mediu</th>
                        <th style={s.th}>Nr. recenzii</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistici.topRating.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={s.td}><strong>{i + 1}</strong></td>
                          <td style={s.td}>{r.numeProprietate}</td>
                          <td style={s.td}>{r.numeProprietar}</td>
                          <td style={s.td}>
                            <span style={s.ratingChip}>{'★'.repeat(Math.round(r.ratingMediu))} {r.ratingMediu.toFixed(1)}</span>
                          </td>
                          <td style={s.td}>{r.numarRecenzii}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabelul principal cu toate rezervarile si actiunile de gestionare */}
      <h2 style={s.subtitle}>Toate rezervările</h2>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>ID</th>
              <th style={s.th}>Client</th>
              <th style={s.th}>Proprietate / Cameră</th>
              <th style={s.th}>Perioadă</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {rezervari.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={s.td}>#{r.id}</td>
                <td style={s.td}><small>{r.numeUtilizator}<br />{r.emailUtilizator}</small></td>
                <td style={s.td}><small>{r.numeProprietate}<br />{r.numeCamera}</small></td>
                <td style={s.td}><small>{r.dataCheckIn}<br />→ {r.dataCheckOut}</small></td>
                <td style={s.td}><strong>{r.pretTotal} RON</strong></td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: culoriStatus[r.status] || '#888' }}>
                    {eticheteStatus[r.status] || r.status}
                  </span>
                </td>
                <td style={s.td}>
                  {/* Buton Finalizeaza: vizibil pentru rezervarile active */}
                  {(r.status === 'CONFIRMATA' || r.status === 'PENDING') && (
                    <button onClick={() => schimbaStatus(r.id, 'FINALIZATA')} style={{ ...s.actionBtn, background: '#5cb85c' }}>
                      ✓ Finalizează
                    </button>
                  )}
                  {/* Buton Anuleaza: vizibil pentru rezervarile care nu sunt deja anulate/finalizate */}
                  {r.status !== 'ANULATA' && r.status !== 'FINALIZATA' && (
                    <button onClick={() => schimbaStatus(r.id, 'ANULATA')} style={{ ...s.actionBtn, background: '#d9534f' }}>
                      ✗ Anulează
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' },
  title: { color: '#003580', marginBottom: '1.5rem' },
  subtitle: { color: '#003580', margin: '2rem 0 1rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  stat: { background: '#f0f4ff', borderRadius: '8px', padding: '1.2rem', textAlign: 'center', fontSize: '1.1rem' },
  nav: { marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  navBtn: { background: '#003580', color: '#fff', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700 },
  statBtn: { background: '#febb02', color: '#003580', padding: '10px 20px', borderRadius: '4px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' },
  statSection: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  chartBox: { background: '#f8f9fa', borderRadius: '8px', padding: '1rem' },
  chartTitle: { margin: '0 0 1rem', color: '#003580', fontSize: '1rem' },
  noData: { color: '#888', textAlign: 'center', padding: '2rem' },
  ratingBox: { background: '#f8f9fa', borderRadius: '8px', padding: '1rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  thead: { background: '#003580', color: '#fff' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.88rem' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: '0.88rem' },
  badge: { color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 },
  actionBtn: { color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '0.8rem' },
  ratingChip: { color: '#856404', background: '#fff3cd', padding: '3px 8px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 },
};
