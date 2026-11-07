import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import ProprietateCard from '../components/ProprietateCard';

interface EvenimentPreview {
  id: number;
  nume: string;
  oras: string;
  dataStart: string;
  dataEnd: string;
  categorie: string;
  imagine: string;
}

interface Proprietate {
  id: number;
  nume: string;
  oras: string;
  tara: string;
  tip: string;
  stele: number;
  imaginePrincipala?: string;
  ratingMediu?: number;
  numarRecenzii?: number;
  pretMinimCamera?: number;
  disponibila?: boolean;
}

const TIPURI_CU_STELE = ['HOTEL', 'VILA'];

const CULORI_CATEGORIE: Record<string, string> = {
  CONCERT: '#7c3aed', FESTIVAL: '#d97706', SPORT: '#059669', CULTURAL: '#0284c7', ALTELE: '#6b7280',
};

function fmtDataScurta(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

export default function Home() {
  const navigate = useNavigate();
  const [proprietati, setProprietati] = useState<Proprietate[]>([]);
  const [evenimente, setEvenimente] = useState<EvenimentPreview[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [destinatie, setDestinatie] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [persoane, setPersoane] = useState(2);
  const [tip, setTip] = useState('');
  const [stele, setStele] = useState('');

  const schimbaTip = (val: string) => {
    setTip(val);
    if (val && !TIPURI_CU_STELE.includes(val)) setStele('');
  };

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const incarca = async () => {
    setSeIncarca(true);
    try {
      const p: Record<string, string> = {};
      if (destinatie) p.oras = destinatie;
      if (tip) p.tip = tip;
      if (stele) p.stele = stele;
      if (checkIn) p.checkIn = fmt(checkIn);
      if (checkOut) p.checkOut = fmt(checkOut);
      if (checkIn && checkOut && persoane > 0) p.persoane = String(persoane);
      const { data } = await api.get('/proprietati', { params: p });
      setProprietati(data);
    } finally {
      setSeIncarca(false);
    }
  };

  useEffect(() => {
    incarca();
    api.get('/evenimente').then(r => setEvenimente(r.data.slice(0, 4)));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') incarca();
  };

  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Găsește cazarea perfectă</h1>
        <p style={styles.heroSub}>Hoteluri, apartamente, vile și mai mult te așteaptă</p>

        <div style={styles.searchBox}>
          <div style={styles.searchRow}>
            <div style={styles.searchField}>
              <span style={styles.fieldIcon}>🔍</span>
              <input
                placeholder="Unde vrei să mergi?"
                value={destinatie}
                onChange={e => setDestinatie(e.target.value)}
                onKeyDown={handleKeyDown}
                style={styles.fieldInput}
              />
            </div>

            <div style={styles.fieldDivider} />

            <div style={styles.searchField}>
              <span style={styles.fieldIcon}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel}>Check-in</div>
                <DatePicker
                  selected={checkIn}
                  onChange={(d: Date | null) => {
                    setCheckIn(d);
                    if (d && checkOut && d >= checkOut) setCheckOut(null);
                  }}
                  selectsStart
                  startDate={checkIn ?? undefined}
                  endDate={checkOut ?? undefined}
                  minDate={new Date()}
                  dateFormat="dd MMM yyyy"
                  placeholderText="Adaugă data"
                  customInput={<input style={styles.dateInput} />}
                />
              </div>
            </div>

            <div style={styles.fieldDivider} />

            <div style={styles.searchField}>
              <span style={styles.fieldIcon}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel}>Check-out</div>
                <DatePicker
                  selected={checkOut}
                  onChange={(d: Date | null) => setCheckOut(d)}
                  selectsEnd
                  startDate={checkIn ?? undefined}
                  endDate={checkOut ?? undefined}
                  minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                  dateFormat="dd MMM yyyy"
                  placeholderText="Adaugă data"
                  customInput={<input style={styles.dateInput} />}
                />
              </div>
            </div>

            <div style={styles.fieldDivider} />

            <div style={{ ...styles.searchField, minWidth: '140px' }}>
              <span style={styles.fieldIcon}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={styles.fieldLabel}>Persoane</div>
                <div style={styles.counter}>
                  <button onClick={() => setPersoane(p => Math.max(1, p - 1))} style={styles.counterBtn}>−</button>
                  <span style={styles.counterVal}>{persoane} {persoane === 1 ? 'adult' : 'adulți'}</span>
                  <button onClick={() => setPersoane(p => Math.min(20, p + 1))} style={styles.counterBtn}>+</button>
                </div>
              </div>
            </div>

            <button onClick={incarca} style={styles.searchBtn}>Caută</button>
          </div>

          <div style={styles.filtersRow}>
            <select value={tip} onChange={e => schimbaTip(e.target.value)} style={styles.filterSelect}>
              <option value="">Toate tipurile</option>
              <option value="HOTEL">Hotel</option>
              <option value="APARTAMENT">Apartament</option>
              <option value="VILA">Vilă</option>
              <option value="HOSTEL">Hostel</option>
            </select>
            {(!tip || TIPURI_CU_STELE.includes(tip)) && (
              <select value={stele} onChange={e => setStele(e.target.value)} style={styles.filterSelect}>
                <option value="">Toate clasificările</option>
                {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} stele</option>)}
              </select>
            )}
            {(checkIn || checkOut || tip || stele) && (
              <button
                onClick={() => { setCheckIn(null); setCheckOut(null); setTip(''); setStele(''); setDestinatie(''); }}
                style={styles.resetBtn}
              >
                ✕ Resetează filtrele
              </button>
            )}
          </div>
        </div>
      </div>

      {evenimente.length > 0 && (
        <div style={styles.evenimenteSection}>
          <div style={styles.evenimenteHeader}>
            <h2 style={styles.evenimenteTitlu}>Evenimente în curând</h2>
            <button onClick={() => navigate('/evenimente')} style={styles.veziToate}>
              Vezi toate →
            </button>
          </div>
          <div style={styles.evenimenteGrid}>
            {evenimente.map(ev => (
              <div
                key={ev.id}
                style={styles.evCard}
                onClick={() => navigate(`/evenimente/${ev.id}/cazari`)}
              >
                {ev.imagine ? (
                  <img src={`http://localhost:8080${ev.imagine}`} alt={ev.nume} style={styles.evImg} />
                ) : (
                  <div style={{ ...styles.evImg, ...styles.evPlaceholder }}>
                    <span style={{ fontSize: '2rem' }}>
                      {ev.categorie === 'CONCERT' ? '🎵' : ev.categorie === 'FESTIVAL' ? '🎪' : ev.categorie === 'SPORT' ? '⚽' : '🎭'}
                    </span>
                  </div>
                )}
                <div style={styles.evBody}>
                  <span style={{ ...styles.evBadge, background: CULORI_CATEGORIE[ev.categorie] }}>
                    {ev.categorie}
                  </span>
                  <p style={styles.evNume}>{ev.nume}</p>
                  <p style={styles.evMeta}>📍 {ev.oras} · {fmtDataScurta(ev.dataStart)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.resultHeader}>
          <span style={styles.resultCount}>
            {seIncarca ? 'Se caută...' : `${proprietati.length} proprietăți găsite`}
          </span>
        </div>
        {seIncarca ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Se încarcă...</p>
        ) : proprietati.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
            Nu s-au găsit proprietăți pentru criteriile selectate.
          </p>
        ) : (
          <div style={styles.grid}>
            {proprietati.map(p => <ProprietateCard key={p.id} {...p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)',
    color: '#fff',
    padding: '3rem 1rem 2rem',
    textAlign: 'center',
  },
  heroTitle: { margin: '0 0 0.4rem', fontSize: '2.2rem', fontWeight: 700 },
  heroSub: { margin: '0 0 2rem', fontSize: '1.05rem', opacity: 0.85 },
  searchBox: {
    background: '#fff',
    borderRadius: '8px',
    padding: '0',
    maxWidth: '1100px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    overflow: 'hidden',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '72px',
  },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    flex: 1,
    cursor: 'text',
  },
  fieldIcon: { fontSize: '1.1rem', flexShrink: 0 },
  fieldLabel: { fontSize: '0.72rem', color: '#666', fontWeight: 600, marginBottom: '2px' },
  fieldInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.95rem',
    width: '100%',
    background: 'transparent',
    color: '#1a1a1a',
  },
  dateInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
    background: 'transparent',
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  fieldDivider: { width: '1px', background: '#e0e0e0', alignSelf: 'stretch', margin: '12px 0' },
  counter: { display: 'flex', alignItems: 'center', gap: '8px' },
  counterBtn: {
    width: '26px', height: '26px', borderRadius: '50%',
    border: '2px solid #0071c2', background: '#fff', color: '#0071c2',
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  },
  counterVal: { fontSize: '0.88rem', color: '#1a1a1a', minWidth: '64px', textAlign: 'center' },
  searchBtn: {
    background: '#0071c2',
    color: '#fff',
    border: 'none',
    padding: '0 28px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    flexShrink: 0,
    borderRadius: '0 6px 0 0',
  },
  filtersRow: {
    display: 'flex',
    gap: '0.6rem',
    padding: '10px 14px',
    background: '#f0f4ff',
    borderTop: '1px solid #dde4f5',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterSelect: {
    padding: '6px 10px',
    border: '1px solid #c8d6e8',
    borderRadius: '4px',
    fontSize: '0.85rem',
    background: '#fff',
    color: '#003580',
    cursor: 'pointer',
  },
  resetBtn: {
    background: 'transparent',
    border: '1px solid #aaa',
    color: '#666',
    padding: '5px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    marginLeft: 'auto',
  },
  evenimenteSection: { background: '#f8f9ff', padding: '1.5rem 1rem', borderBottom: '1px solid #e8edf5' },
  evenimenteHeader: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  evenimenteTitlu: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#003580' },
  veziToate: { background: 'transparent', border: 'none', color: '#0071c2', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  evenimenteGrid: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  evCard: { background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.15s' },
  evImg: { width: '100%', height: '120px', objectFit: 'cover', display: 'block' } as React.CSSProperties,
  evPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' },
  evBody: { padding: '0.75rem' },
  evBadge: { color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '4px' },
  evNume: { margin: '4px 0 2px', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' },
  evMeta: { margin: 0, fontSize: '0.78rem', color: '#666' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' },
  resultHeader: { marginBottom: '1rem' },
  resultCount: { color: '#555', fontSize: '0.92rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
};
