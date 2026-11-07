import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CONCERT: '#7c3aed', FESTIVAL: '#d97706', SPORT: '#059669', CULTURAL: '#0284c7', ALTELE: '#6b7280',
};

const EMOJI_CATEGORIE: Record<string, string> = {
  CONCERT: '🎵', FESTIVAL: '🎪', SPORT: '⚽', CULTURAL: '🎭', ALTELE: '📌',
};

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EvenimentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ev, setEv] = useState<Eveniment | null>(null);
  const [seIncarca, setSeIncarca] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    api.get(`/evenimente/${id}`)
      .then(r => setEv(r.data))
      .catch(() => navigate('/evenimente'))
      .finally(() => setSeIncarca(false));
  }, [id]);

  if (seIncarca) return <p style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Se încarcă...</p>;
  if (!ev) return null;

  const culoare = CULORI_CATEGORIE[ev.categorie] ?? '#6b7280';
  const emoji = EMOJI_CATEGORIE[ev.categorie] ?? '📌';
  const eMultizi = ev.dataStart !== ev.dataEnd;

  return (
    <div style={s.page}>

      {/* Cover */}
      <div style={s.cover}>
        {ev.imagine && !imgError ? (
          <img
            src={`http://localhost:8080${ev.imagine}`}
            alt={ev.nume}
            style={s.coverImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ ...s.coverImg, ...s.coverPlaceholder }}>
            <span style={{ fontSize: '5rem' }}>{emoji}</span>
          </div>
        )}
        <div style={s.coverOverlay} />
        <div style={s.coverContent}>
          <button onClick={() => navigate('/evenimente')} style={s.backBtn}>← Înapoi la evenimente</button>
          <div style={{ marginTop: 'auto' }}>
            <span style={{ ...s.catBadge, background: culoare }}>{ev.categorie}</span>
            <h1 style={s.coverTitle}>{ev.nume}</h1>
            <p style={s.coverLoc}>📍 {ev.oras}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        <div style={s.mainCol}>

          {/* Meta cards */}
          <div style={s.metaRow}>
            <div style={s.metaCard}>
              <span style={s.metaIcon}>📅</span>
              <div>
                <div style={s.metaLabel}>Data</div>
                <div style={s.metaVal}>
                  {eMultizi ? `${fmtData(ev.dataStart)} – ${fmtData(ev.dataEnd)}` : fmtData(ev.dataStart)}
                </div>
              </div>
            </div>
            {ev.ora && (
              <div style={s.metaCard}>
                <span style={s.metaIcon}>🕐</span>
                <div>
                  <div style={s.metaLabel}>Ora de start</div>
                  <div style={s.metaVal}>{ev.ora.slice(0, 5)}</div>
                </div>
              </div>
            )}
            <div style={s.metaCard}>
              <span style={s.metaIcon}>📍</span>
              <div>
                <div style={s.metaLabel}>Locație</div>
                <div style={s.metaVal}>{ev.oras}</div>
              </div>
            </div>
            <div style={s.metaCard}>
              <span style={s.metaIcon}>{emoji}</span>
              <div>
                <div style={s.metaLabel}>Categorie</div>
                <div style={s.metaVal}>{ev.categorie.charAt(0) + ev.categorie.slice(1).toLowerCase()}</div>
              </div>
            </div>
          </div>

          {/* Descriere */}
          {ev.descriere && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Despre eveniment</h2>
              <p style={s.descriere}>{ev.descriere}</p>
            </div>
          )}

          {/* Harta */}
          {ev.latitudine && ev.longitudine && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Locație pe hartă</h2>
              <div style={s.mapWrap}>
                <iframe
                  title="Harta eveniment"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${ev.longitudine - 0.02},${ev.latitudine - 0.01},${ev.longitudine + 0.02},${ev.latitudine + 0.01}&layer=mapnik&marker=${ev.latitudine},${ev.longitudine}`}
                  style={s.map}
                  loading="lazy"
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${ev.latitudine},${ev.longitudine}`}
                target="_blank"
                rel="noopener noreferrer"
                style={s.gmapsLink}
              >
                Deschide în Google Maps →
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <h3 style={s.sideTitle}>Acțiuni rapide</h3>
            <button
              onClick={() => navigate(`/evenimente/${ev.id}/cazari`)}
              style={s.btnCazari}
            >
              🏨 Vezi cazări în apropiere
            </button>
            {ev.linkBilete && (
              <a href={ev.linkBilete} target="_blank" rel="noopener noreferrer" style={s.btnBilete}>
                🎟️ Cumpără bilete
              </a>
            )}
            <div style={s.sideInfo}>
              <div style={s.sideInfoRow}>
                <span style={s.sideInfoLabel}>Data start</span>
                <span style={s.sideInfoVal}>{fmtData(ev.dataStart)}</span>
              </div>
              {eMultizi && (
                <div style={s.sideInfoRow}>
                  <span style={s.sideInfoLabel}>Data final</span>
                  <span style={s.sideInfoVal}>{fmtData(ev.dataEnd)}</span>
                </div>
              )}
              {ev.ora && (
                <div style={s.sideInfoRow}>
                  <span style={s.sideInfoLabel}>Ora</span>
                  <span style={s.sideInfoVal}>{ev.ora.slice(0, 5)}</span>
                </div>
              )}
              <div style={s.sideInfoRow}>
                <span style={s.sideInfoLabel}>Oraș</span>
                <span style={s.sideInfoVal}>{ev.oras}</span>
              </div>
              <div style={s.sideInfoRow}>
                <span style={s.sideInfoLabel}>Categorie</span>
                <span style={{ ...s.sideInfoVal, ...s.sideInfoBadge, background: culoare + '22', color: culoare }}>
                  {ev.categorie}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f6f8' },
  cover: { position: 'relative', height: '420px', overflow: 'hidden' },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  coverPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' },
  coverOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' },
  coverContent: { position: 'absolute', inset: 0, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column' },
  backBtn: {
    alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px',
    padding: '7px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(4px)',
  },
  catBadge: { color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', display: 'inline-block', marginBottom: '10px' },
  coverTitle: { margin: '0 0 8px', color: '#fff', fontSize: '2.4rem', fontWeight: 700, textShadow: '0 2px 12px rgba(0,0,0,0.5)', lineHeight: 1.2 },
  coverLoc: { margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '1rem' },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  mainCol: { flex: 1, minWidth: 0 },
  metaRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metaCard: {
    background: '#fff', borderRadius: '10px', padding: '1rem 1.2rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', gap: '12px', alignItems: 'center',
  },
  metaIcon: { fontSize: '1.6rem', flexShrink: 0 },
  metaLabel: { fontSize: '0.72rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' },
  metaVal: { fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a' },
  section: { background: '#fff', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700, color: '#1a1a2e' },
  descriere: { margin: 0, fontSize: '1rem', color: '#444', lineHeight: 1.8 },
  mapWrap: { borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem' },
  map: { width: '100%', height: '320px', border: 'none', display: 'block' },
  gmapsLink: { fontSize: '0.88rem', color: '#003580', fontWeight: 600, textDecoration: 'none' },
  sidebar: { width: '300px', flexShrink: 0 },
  sideCard: { background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', position: 'sticky', top: '1.5rem' },
  sideTitle: { margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e' },
  btnCazari: {
    display: 'block', width: '100%', background: '#003580', color: '#fff',
    border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', textAlign: 'center',
  },
  btnBilete: {
    display: 'block', width: '100%', background: '#fff', color: '#003580',
    border: '2px solid #003580', borderRadius: '8px', padding: '11px',
    fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem',
    textDecoration: 'none', textAlign: 'center',
  },
  sideInfo: { borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  sideInfoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' },
  sideInfoLabel: { color: '#888' },
  sideInfoVal: { fontWeight: 600, color: '#1a1a1a' },
  sideInfoBadge: { padding: '2px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' },
};
