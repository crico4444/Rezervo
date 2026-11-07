import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChatModal from '../components/ChatModal';
import RatingModal from '../components/RatingModal';

interface Rezervare {
  id: number;
  numeProprietate: string;
  orasProprietate: string;
  taraProprietate: string;
  numeCamera: string;
  dataCheckIn: string;
  dataCheckOut: string;
  nrPersoane: number;
  pretTotal: number;
  status: 'PENDING' | 'CONFIRMATA' | 'ANULATA' | 'FINALIZATA';
  proprietateId: number;
  numeProprietar?: string;
  imaginePrincipala?: string;
  tipProprietate?: string;
  stele?: number;
  ratingMediu?: number;
  numarRecenzii?: number;
}

const configStatus: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:    { label: '⏳ În așteptare', bg: '#fff3cd', color: '#856404' },
  CONFIRMATA: { label: '✅ Confirmată',   bg: '#d4edda', color: '#155724' },
  ANULATA:    { label: '❌ Anulată',      bg: '#f8d7da', color: '#721c24' },
  FINALIZATA: { label: '✔ Finalizată',   bg: '#e2e3e5', color: '#383d41' },
};

const TIPURI_CU_STELE = ['HOTEL', 'VILA'];

const azi = new Date().toISOString().split('T')[0];

export default function RezervariMele() {
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [mesaj, setMesaj] = useState('');
  const [necitite, setNecitite] = useState<Record<number, number>>({});
  const [chatRezervareId, setChatRezervareId] = useState<number | null>(null);
  const [chatTitlu, setChatTitlu] = useState('');
  const [ratingProprietate, setRatingProprietate] = useState<{ id: number; nume: string } | null>(null);
  const [recenzate, setRecenzate] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      api.get('/rezervari/mele'),
      api.get('/mesaje/necitite'),
    ]).then(([r, n]) => {
      setRezervari(r.data);
      setNecitite(n.data);
    }).finally(() => setSeIncarca(false));
  }, []);

  const anuleaza = async (id: number) => {
    if (!confirm('Ești sigur că vrei să anulezi această rezervare?')) return;
    try {
      await api.put(`/rezervari/${id}/anuleaza`);
      setRezervari(prev => prev.map(r => r.id === id ? { ...r, status: 'ANULATA' } : r));
      setMesaj('Rezervarea a fost anulată.');
    } catch (e: any) {
      setMesaj('❌ ' + (e.response?.data?.eroare || 'Eroare la anulare'));
    }
  };

  const deschideChat = (r: Rezervare) => {
    setChatRezervareId(r.id);
    setChatTitlu(`Chat cu proprietarul — ${r.numeProprietate}`);
  };

  const laChatCitit = (rezervareId: number) => {
    setNecitite(prev => ({ ...prev, [rezervareId]: 0 }));
  };

  const poateAnula = (r: Rezervare) =>
    r.status === 'PENDING' || r.status === 'CONFIRMATA';

  const poateRecenza = (r: Rezervare) =>
    (r.status === 'CONFIRMATA' || r.status === 'FINALIZATA') &&
    r.dataCheckOut < azi &&
    !recenzate.has(r.proprietateId);

  if (seIncarca) return <p style={{ textAlign: 'center', padding: '3rem' }}>Se încarcă...</p>;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>🗓️ Rezervările mele</h1>

      {mesaj && (
        <div style={{ ...styles.msg, borderColor: mesaj.startsWith('❌') ? '#f5c6cb' : '#c3e6cb',
          background: mesaj.startsWith('❌') ? '#f8d7da' : '#d4edda',
          color: mesaj.startsWith('❌') ? '#721c24' : '#155724' }}>
          {mesaj}
        </div>
      )}

      {rezervari.length === 0 ? (
        <div style={styles.empty}>
          <p>Nu ai nicio rezervare încă.</p>
          <Link to="/" style={styles.exploreBtn}>Explorează cazări →</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {rezervari.map(r => {
            const cfg = configStatus[r.status] ?? configStatus.PENDING;
            const mesajeNoi = necitite[r.id] || 0;
            const areStele = r.tipProprietate && TIPURI_CU_STELE.includes(r.tipProprietate) && (r.stele ?? 0) > 0;
            const sirStele = areStele ? '★'.repeat(r.stele!) + '☆'.repeat(5 - r.stele!) : null;

            return (
              <div key={r.id} style={styles.card}>
                {/* Imaginea proprietatii — stil homepage */}
                <div style={styles.imgWrap}>
                  {r.imaginePrincipala ? (
                    <img src={r.imaginePrincipala} alt={r.numeProprietate} style={styles.img} />
                  ) : (
                    <div style={styles.imgPlaceholder}>🏨</div>
                  )}
                  <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color, ...styles.badgeOverlay }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Info proprietate — stil card anunt */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.propNume}>{r.numeProprietate}</h3>
                      <p style={styles.loc}>📍 {r.orasProprietate}, {r.taraProprietate}</p>
                      <div style={styles.metaRow}>
                        {r.tipProprietate && (
                          <span style={styles.tipChip}>{r.tipProprietate}</span>
                        )}
                        {sirStele && <span style={styles.stars}>{sirStele}</span>}
                        {r.ratingMediu != null && (
                          <span style={styles.rating}>
                            ⭐ {r.ratingMediu.toFixed(1)} ({r.numarRecenzii} recenzii)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Camera rezervata */}
                  <p style={styles.cameraInfo}>
                    🛏️ Camera: <strong>{r.numeCamera}</strong>
                    {r.numeProprietar && (
                      <> &nbsp;·&nbsp; 👤 Proprietar: <strong>{r.numeProprietar}</strong></>
                    )}
                  </p>

                  {/* Detalii rezervare */}
                  <div style={styles.detalii}>
                    <div style={styles.detaliiItem}>
                      <span style={styles.detaliiLabel}>Check-in</span>
                      <strong>{r.dataCheckIn}</strong>
                    </div>
                    <div style={styles.detaliiItem}>
                      <span style={styles.detaliiLabel}>Check-out</span>
                      <strong>{r.dataCheckOut}</strong>
                    </div>
                    <div style={styles.detaliiItem}>
                      <span style={styles.detaliiLabel}>Persoane</span>
                      <strong>{r.nrPersoane}</strong>
                    </div>
                    <div style={styles.detaliiItem}>
                      <span style={styles.detaliiLabel}>Total plată</span>
                      <strong style={{ color: '#003580' }}>{r.pretTotal} RON</strong>
                    </div>
                  </div>

                  {/* Butoane actiune */}
                  <div style={styles.cardActions}>
                    <Link to={`/proprietati/${r.proprietateId}`} style={styles.viewBtn}>
                      Vezi proprietatea →
                    </Link>
                    <button onClick={() => deschideChat(r)} style={styles.chatBtn}>
                      💬 Chat cu proprietarul
                      {mesajeNoi > 0 && (
                        <span style={styles.badge2}>{mesajeNoi}</span>
                      )}
                    </button>
                    {poateAnula(r) && (
                      <button onClick={() => anuleaza(r.id)} style={styles.cancelBtn}>
                        Anulează rezervarea
                      </button>
                    )}
                    {poateRecenza(r) && (
                      <button
                        onClick={() => setRatingProprietate({ id: r.proprietateId, nume: r.numeProprietate })}
                        style={styles.ratingBtn}
                      >
                        ⭐ Lasă o recenzie
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chatRezervareId !== null && (
        <ChatModal
          rezervareId={chatRezervareId}
          titlu={chatTitlu}
          onClose={() => setChatRezervareId(null)}
          onRead={() => laChatCitit(chatRezervareId)}
        />
      )}

      {ratingProprietate !== null && (
        <RatingModal
          proprietateId={ratingProprietate.id}
          numeProprietate={ratingProprietate.nume}
          onClose={() => setRatingProprietate(null)}
          onSuccess={() => setRecenzate(prev => new Set(prev).add(ratingProprietate!.id))}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' },
  title: { color: '#003580', marginBottom: '1.5rem' },
  msg: { padding: '10px 14px', borderRadius: '6px', border: '1px solid', marginBottom: '1rem', fontSize: '0.9rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#888' },
  exploreBtn: { display: 'inline-block', marginTop: '1rem', background: '#003580', color: '#fff', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  imgWrap: { position: 'relative', height: '200px', background: '#f0f4ff', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' },
  badgeOverlay: { position: 'absolute', top: '12px', right: '12px', borderRadius: '12px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 700 },
  badge: {},
  cardBody: { padding: '1.2rem' },
  cardTop: { marginBottom: '0.6rem' },
  propNume: { margin: '0 0 4px', color: '#003580', fontSize: '1.2rem', fontWeight: 700 },
  loc: { margin: '0 0 6px', color: '#555', fontSize: '0.9rem' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  tipChip: { background: '#003580', color: '#fff', fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px' },
  stars: { color: '#febb02', fontSize: '0.9rem' },
  rating: { fontSize: '0.85rem', color: '#444' },
  cameraInfo: { margin: '0.5rem 0 0.8rem', color: '#666', fontSize: '0.88rem' },
  detalii: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#f8f9fa', borderRadius: '6px', padding: '0.8rem', marginBottom: '1rem' },
  detaliiItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  detaliiLabel: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' },
  cardActions: { display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' },
  viewBtn: { color: '#0071c2', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' },
  chatBtn: { position: 'relative', background: '#f0f4ff', border: '1px solid #0071c2', color: '#003580', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  badge2: { background: '#dc3545', color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
  cancelBtn: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  ratingBtn: { background: '#fff8e1', border: '1px solid #febb02', color: '#856404', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
};
