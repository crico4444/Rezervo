import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Eveniment {
  id: number;
  nume: string;
  descriere: string;
  oras: string;
  dataStart: string;
  dataEnd: string;
  ora: string;
  imagine: string;
  linkBilete: string;
  categorie: string;
  latitudine: number;
  longitudine: number;
}

const CULORI_CATEGORIE: Record<string, string> = {
  CONCERT:  '#7c3aed',
  FESTIVAL: '#d97706',
  SPORT:    '#059669',
  CULTURAL: '#0284c7',
  ALTELE:   '#6b7280',
};

const ETICHETE_CATEGORIE: Record<string, string> = {
  CONCERT:  'Concert',
  FESTIVAL: 'Festival',
  SPORT:    'Sport',
  CULTURAL: 'Cultural',
  ALTELE:   'Altele',
};

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function perioadaText(start: string, end: string) {
  if (start === end) return fmtData(start);
  return `${fmtData(start)} – ${fmtData(end)}`;
}

export default function Evenimente() {
  const [evenimente, setEvenimente] = useState<Eveniment[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [filtruCategorie, setFiltruCategorie] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/evenimente').then(r => setEvenimente(r.data)).finally(() => setSeIncarca(false));
  }, []);

  const filtrate = filtruCategorie
    ? evenimente.filter(e => e.categorie === filtruCategorie)
    : evenimente;

  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Evenimente</h1>
        <p style={styles.heroSub}>Descoperă evenimente și găsește cazare în apropiere</p>
      </div>

      <div style={styles.container}>
        <div style={styles.filtre}>
          {['', 'CONCERT', 'FESTIVAL', 'SPORT', 'CULTURAL', 'ALTELE'].map(cat => (
            <button
              key={cat}
              onClick={() => setFiltruCategorie(cat)}
              style={{
                ...styles.filtruBtn,
                background: filtruCategorie === cat ? '#003580' : '#fff',
                color: filtruCategorie === cat ? '#fff' : '#003580',
              }}
            >
              {cat === '' ? 'Toate' : ETICHETE_CATEGORIE[cat]}
            </button>
          ))}
        </div>

        {seIncarca ? (
          <p style={styles.mesaj}>Se încarcă...</p>
        ) : filtrate.length === 0 ? (
          <p style={styles.mesaj}>Nu există evenimente disponibile.</p>
        ) : (
          <div style={styles.grid}>
            {filtrate.map(ev => (
              <div key={ev.id} style={{ ...styles.card, cursor: 'pointer' }} onClick={() => navigate(`/evenimente/${ev.id}`)}>
                <div style={styles.cardImgWrap}>
                  {ev.imagine ? (
                    <img src={`http://localhost:8080${ev.imagine}`} alt={ev.nume} style={styles.cardImg} />
                  ) : (
                    <div style={{ ...styles.cardImg, ...styles.placeholderImg }}>
                      <span style={{ fontSize: '3rem' }}>
                        {ev.categorie === 'CONCERT' ? '🎵' : ev.categorie === 'FESTIVAL' ? '🎪' : ev.categorie === 'SPORT' ? '⚽' : '🎭'}
                      </span>
                    </div>
                  )}
                  <span style={{ ...styles.badge, background: CULORI_CATEGORIE[ev.categorie] }}>
                    {ETICHETE_CATEGORIE[ev.categorie]}
                  </span>
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitlu}>{ev.nume}</h3>
                  <div style={styles.cardInfo}>
                    <span>📍 {ev.oras}</span>
                    <span>📅 {perioadaText(ev.dataStart, ev.dataEnd)}</span>
                    {ev.ora && <span>🕐 {ev.ora.slice(0, 5)}</span>}
                  </div>
                  {ev.descriere && <p style={styles.cardDescriere}>{ev.descriere}</p>}
                  <div style={styles.cardActiuni}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/evenimente/${ev.id}`); }}
                      style={styles.btnCazari}
                    >
                      Vezi detalii →
                    </button>
                    {ev.linkBilete && (
                      <a
                        href={ev.linkBilete}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.btnBilete}
                        onClick={e => e.stopPropagation()}
                      >
                        Bilete
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    padding: '3rem 1rem 2.5rem',
    textAlign: 'center',
  },
  heroTitle: { margin: '0 0 0.4rem', fontSize: '2.2rem', fontWeight: 700 },
  heroSub: { margin: 0, fontSize: '1.05rem', opacity: 0.8 },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' },
  filtre: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filtruBtn: {
    padding: '7px 16px',
    border: '2px solid #003580',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  mesaj: { textAlign: 'center', color: '#888', padding: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' },
  placeholderImg: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f0f4ff',
  },
  badge: {
    position: 'absolute', top: '10px', left: '10px',
    color: '#fff', padding: '4px 10px', borderRadius: '12px',
    fontSize: '0.75rem', fontWeight: 700,
  },
  cardBody: { padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardTitlu: { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#555' },
  cardDescriere: {
    margin: 0, fontSize: '0.85rem', color: '#666',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardActiuni: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' },
  btnCazari: {
    flex: 1, background: '#003580', color: '#fff',
    border: 'none', borderRadius: '6px', padding: '9px 12px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
  },
  btnBilete: {
    background: '#fff', color: '#003580',
    border: '2px solid #003580', borderRadius: '6px', padding: '9px 12px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
    textDecoration: 'none', display: 'flex', alignItems: 'center',
  },
};
