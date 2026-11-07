import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Utilizator {
  id: number; nume: string; prenume: string; email: string;
  telefon: string; rol: 'CLIENT' | 'ADMIN' | 'PROPRIETAR'; creatLa: string;
}

export default function AdminUtilizatori() {
  const { user } = useAuth();
  const [utilizatori, setUtilizatori] = useState<Utilizator[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [filtrare, setFiltrare] = useState('');
  const [idInStergere, setIdInStergere] = useState<number | null>(null);
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    api.get('/utilizatori').then(r => {
      setUtilizatori(r.data);
      setSeIncarca(false);
    });
  }, []);

  // Sterge definitiv contul unui utilizator (actiune ireversibila)
  const stergeUtilizator = async (u: Utilizator) => {
    if (!confirm(`Ești sigur că vrei să ștergi definitiv contul lui ${u.nume} ${u.prenume} (${u.email})? Acțiunea este ireversibilă.`)) return;
    setEroare('');
    setIdInStergere(u.id);
    try {
      await api.delete(`/admin/utilizatori/${u.id}`);
      setUtilizatori(prev => prev.filter(x => x.id !== u.id));
    } catch (e: any) {
      setEroare(e.response?.data?.eroare || 'Eroare la ștergerea contului');
    } finally {
      setIdInStergere(null);
    }
  };

  const vizibili = utilizatori.filter(u => {
    const q = filtrare.toLowerCase();
    return (
      u.nume.toLowerCase().includes(q) ||
      u.prenume.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const nrClienti = utilizatori.filter(u => u.rol === 'CLIENT').length;
  const nrProprietari = utilizatori.filter(u => u.rol === 'PROPRIETAR').length;
  const nrAdmini = utilizatori.filter(u => u.rol === 'ADMIN').length;

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>👥 Gestionare Utilizatori</h1>

      {/* Statistici rapide */}
      <div style={s.statsRow}>
        <div style={s.stat}><strong>{utilizatori.length}</strong><br />Total utilizatori</div>
        <div style={s.stat}><strong>{nrClienti}</strong><br />Clienți</div>
        <div style={s.stat}><strong>{nrProprietari}</strong><br />Proprietari</div>
        <div style={s.stat}><strong>{nrAdmini}</strong><br />Administratori</div>
      </div>

      {/* Bara de cautare */}
      <div style={s.searchRow}>
        <input
          style={s.searchInput}
          placeholder="Caută după nume, email sau rol..."
          value={filtrare}
          onChange={e => setFiltrare(e.target.value)}
        />
        <span style={s.count}>{vizibili.length} rezultate</span>
      </div>

      {eroare && <div style={s.eroare}>{eroare}</div>}

      {seIncarca ? (
        <p style={{ color: '#888' }}>Se încarcă utilizatorii...</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>#</th>
                <th style={s.th}>Nume</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Telefon</th>
                <th style={s.th}>Rol</th>
                <th style={s.th}>Înregistrat la</th>
                <th style={s.th}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {vizibili.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={s.td}>{u.id}</td>
                  <td style={s.td}>
                    <div style={s.avatar}>{u.nume.charAt(0)}{u.prenume.charAt(0)}</div>
                    <span style={{ marginLeft: '0.5rem' }}>{u.nume} {u.prenume}</span>
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.telefon || '—'}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.rolBadge,
                      background: u.rol === 'ADMIN' ? '#003580' : u.rol === 'PROPRIETAR' ? '#0a7c3e' : '#e8f4fd',
                      color: u.rol === 'ADMIN' || u.rol === 'PROPRIETAR' ? '#fff' : '#003580',
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={s.td}>
                    {u.creatLa ? new Date(u.creatLa).toLocaleDateString('ro-RO') : '—'}
                  </td>
                  <td style={s.td}>
                    {u.email !== user?.email && (
                      <button
                        onClick={() => stergeUtilizator(u)}
                        style={s.deleteBtn}
                        disabled={idInStergere === u.id}
                      >
                        {idInStergere === u.id ? 'Se șterge...' : '🗑️ Șterge'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {vizibili.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#888', padding: '2rem' }}>
                    Niciun utilizator găsit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  title: { color: '#003580', marginBottom: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  stat: { background: '#f0f4ff', borderRadius: '8px', padding: '1.2rem', textAlign: 'center', fontSize: '1.1rem' },
  searchRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  searchInput: { flex: 1, padding: '9px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  count: { color: '#888', fontSize: '0.88rem', whiteSpace: 'nowrap' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  thead: { background: '#003580', color: '#fff' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.88rem' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: '0.88rem' },
  avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: '#003580', color: '#fff', fontSize: '0.75rem', fontWeight: 700, verticalAlign: 'middle' },
  rolBadge: { padding: '3px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 },
  deleteBtn: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  eroare: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.88rem' },
};
