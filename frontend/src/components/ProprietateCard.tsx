import { Link } from 'react-router-dom';

interface Props {
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

export default function ProprietateCard(p: Props) {
  const disponibila = p.disponibila !== false;
  const areStele = TIPURI_CU_STELE.includes(p.tip) && p.stele > 0;
  const sirStele = areStele ? '★'.repeat(p.stele) + '☆'.repeat(5 - p.stele) : null;
  const pretAfisat = p.pretMinimCamera != null
    ? (p.tip === 'APARTAMENT' ? `${p.pretMinimCamera} RON / noapte` : `de la ${p.pretMinimCamera} RON / noapte`)
    : null;

  return (
    <div style={{ ...styles.card, ...(disponibila ? {} : styles.cardIndisponibil) }}>
      <div style={styles.imgWrap}>
        {p.imaginePrincipala ? (
          <img src={p.imaginePrincipala} alt={p.nume} style={{ ...styles.img, ...(disponibila ? {} : styles.imgIndisponibil) }} />
        ) : (
          <div style={styles.placeholder}>🏨</div>
        )}
        {!disponibila && (
          <div style={styles.indisponibilBadge}>Indisponibil</div>
        )}
      </div>

      <div style={styles.body}>
        <h3 style={{ ...styles.title, ...(disponibila ? {} : { color: '#999' }) }}>{p.nume}</h3>
        <p style={styles.loc}>📍 {p.oras}, {p.tara}</p>
        <p style={styles.meta}>
          <span style={{ ...styles.tip, ...(disponibila ? {} : { background: '#aaa' }) }}>{p.tip}</span>
          {sirStele && <span style={styles.stars}>{sirStele}</span>}
        </p>
        {p.ratingMediu != null && (
          <p style={styles.rating}>
            ⭐ {p.ratingMediu.toFixed(1)} ({p.numarRecenzii} recenzii)
          </p>
        )}
        {pretAfisat && <p style={{ ...styles.pret, ...(disponibila ? {} : { color: '#aaa' }) }}>{pretAfisat}</p>}

        {disponibila ? (
          <Link to={`/proprietati/${p.id}`} style={styles.btn}>
            Vezi detalii →
          </Link>
        ) : (
          <Link to={`/proprietati/${p.id}`} style={styles.btnIndisponibil}>
            Vezi detalii →
          </Link>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s',
  },
  cardIndisponibil: {
    border: '1px solid #d0d0d0',
    boxShadow: 'none',
    opacity: 0.75,
  },
  imgWrap: { height: '180px', background: '#f0f4ff', overflow: 'hidden', position: 'relative' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgIndisponibil: { filter: 'grayscale(80%)' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' },
  indisponibilBadge: {
    position: 'absolute', top: '10px', left: '10px',
    background: 'rgba(80,80,80,0.85)', color: '#fff',
    padding: '4px 12px', borderRadius: '4px',
    fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
  },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 },
  title: { margin: 0, fontSize: '1.05rem', color: '#003580' },
  loc: { margin: 0, color: '#555', fontSize: '0.9rem' },
  meta: { margin: 0, display: 'flex', justifyContent: 'space-between' },
  tip: { background: '#003580', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' },
  stars: { color: '#febb02', fontSize: '0.85rem' },
  rating: { margin: 0, fontSize: '0.85rem', color: '#444' },
  pret: { margin: 0, fontWeight: 700, color: '#003580', fontSize: '0.95rem' },
  btn: {
    marginTop: 'auto', textAlign: 'center', background: '#003580', color: '#fff',
    padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600,
  },
  btnIndisponibil: {
    marginTop: 'auto', textAlign: 'center', background: '#aaa', color: '#fff',
    padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600,
    pointerEvents: 'none' as const,
  },
};
