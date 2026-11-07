import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProprietateCard from '../components/ProprietateCard';

interface Eveniment {
  id: number;
  nume: string;
  oras: string;
  dataStart: string;
  dataEnd: string;
  ora: string;
  categorie: string;
  imagine: string;
  linkBilete: string;
}

interface ProprietateDistanta {
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
  distantaKm: number;
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function perioadaText(start: string, end: string) {
  if (start === end) return fmtData(start);
  return `${fmtData(start)} – ${fmtData(end)}`;
}

export default function CazariEveniment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eveniment, setEveniment] = useState<Eveniment | null>(null);
  const [cazari, setCazari] = useState<ProprietateDistanta[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [persoane, setPersoane] = useState(2);

  useEffect(() => {
    if (!id) return;
    api.get(`/evenimente/${id}`).then(r => setEveniment(r.data));
  }, [id]);

  useEffect(() => {
    if (!eveniment) return;
    incarcaCazari();
  }, [eveniment]);

  const incarcaCazari = async () => {
    if (!eveniment) return;
    setSeIncarca(true);
    try {
      const params: Record<string, string> = {
        checkIn: eveniment.dataStart,
        checkOut: eveniment.dataEnd,
        persoane: String(persoane),
      };
      const { data } = await api.get(`/evenimente/${id}/cazari`, { params });
      setCazari(data);
    } finally {
      setSeIncarca(false);
    }
  };

  if (!eveniment) return <p style={{ textAlign: 'center', padding: '2rem' }}>Se încarcă...</p>;

  return (
    <div>
      <div style={styles.header}>
        <button onClick={() => navigate('/evenimente')} style={styles.backBtn}>
          ← Înapoi la evenimente
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.titlu}>{eveniment.nume}</h1>
          <div style={styles.meta}>
            <span>📍 {eveniment.oras}</span>
            <span>📅 {perioadaText(eveniment.dataStart, eveniment.dataEnd)}</span>
            {eveniment.ora && <span>🕐 {eveniment.ora.slice(0, 5)}</span>}
          </div>
          {eveniment.linkBilete && (
            <a href={eveniment.linkBilete} target="_blank" rel="noopener noreferrer" style={styles.btnBilete}>
              Cumpără bilete
            </a>
          )}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.filtrePersoane}>
          <span style={styles.filtreLabel}>Persoane:</span>
          <button onClick={() => setPersoane(p => Math.max(1, p - 1))} style={styles.counterBtn}>−</button>
          <span style={styles.counterVal}>{persoane}</span>
          <button onClick={() => setPersoane(p => Math.min(20, p + 1))} style={styles.counterBtn}>+</button>
          <button onClick={incarcaCazari} style={styles.btnCauta}>Caută</button>
        </div>

        <div style={styles.resultHeader}>
          {seIncarca ? 'Se caută...' : (
            cazari.length === 0
              ? 'Nu s-au găsit cazări cu coordonate GPS în raza de 20 km.'
              : `${cazari.length} cazări găsite în raza de 20 km, sortate după distanță`
          )}
        </div>

        {seIncarca ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Se încarcă...</p>
        ) : (
          <div style={styles.grid}>
            {cazari.map(p => (
              <div key={p.id} style={styles.cardWrap}>
                <div style={styles.distantaBadge}>
                  📍 {p.distantaKm} km de eveniment
                </div>
                <ProprietateCard {...p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    padding: '2rem 1rem',
  },
  backBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff', padding: '6px 14px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem',
  },
  headerContent: { maxWidth: '1200px', margin: '0 auto' },
  titlu: { margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 700 },
  meta: { display: 'flex', gap: '1.5rem', fontSize: '0.95rem', opacity: 0.85, flexWrap: 'wrap' },
  btnBilete: {
    display: 'inline-block', marginTop: '1rem',
    background: '#febb02', color: '#003580',
    padding: '8px 20px', borderRadius: '6px',
    textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
  },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' },
  filtrePersoane: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#f0f4ff', padding: '0.75rem 1rem',
    borderRadius: '8px', marginBottom: '1.5rem',
  },
  filtreLabel: { fontWeight: 600, color: '#003580', fontSize: '0.9rem' },
  counterBtn: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '2px solid #003580', background: '#fff', color: '#003580',
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  counterVal: { fontSize: '1rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' },
  btnCauta: {
    background: '#003580', color: '#fff', border: 'none',
    padding: '7px 18px', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
  },
  resultHeader: { color: '#555', fontSize: '0.92rem', marginBottom: '1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  cardWrap: { display: 'flex', flexDirection: 'column', gap: '0' },
  distantaBadge: {
    background: '#e8f4fd', color: '#0071c2',
    fontSize: '0.8rem', fontWeight: 700,
    padding: '5px 10px', borderRadius: '6px 6px 0 0',
    borderBottom: '2px solid #0071c2',
  },
};
