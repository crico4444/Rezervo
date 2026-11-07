import { useState } from 'react';
import api from '../services/api';

interface Props {
  proprietarId: number;
  numeProprietar: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Componenta pentru selectarea unui rating cu efect hover pe stele
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [inHover, setInHover] = useState(0);
  return (
    <span style={{ fontSize: '2rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(stea => (
        <span
          key={stea}
          onClick={() => onChange(stea)}
          onMouseEnter={() => setInHover(stea)}
          onMouseLeave={() => setInHover(0)}
          style={{ color: stea <= (inHover || value) ? '#febb02' : '#ccc', transition: 'color 0.1s' }}
        >★</span>
      ))}
    </span>
  );
}

// Etichete textuale pentru fiecare valoare de rating 1-5
const eticheteRating: Record<number, string> = {
  1: 'Foarte slab', 2: 'Slab', 3: 'Satisfăcător', 4: 'Bun', 5: 'Excelent',
};

// Modal pentru evaluarea proprietarului dupa o rezervare finalizata sau confirmata
export default function ProprietarRatingModal({ proprietarId, numeProprietar, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comentariu, setComentariu] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [seTrimite, setSeTrimite] = useState(false);

  // Trimite evaluarea proprietarului la server; daca reuseste, apeleaza onSuccess si inchide modalul
  const trimite = async () => {
    setSeTrimite(true);
    setMesaj('');
    try {
      await api.post('/recenzii-proprietari', { proprietarId, rating, comentariu });
      onSuccess();
      onClose();
    } catch (e: any) {
      setMesaj(e.response?.data?.eroare || 'Eroare la trimiterea recenziei');
    } finally {
      setSeTrimite(false);
    }
  };

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        {/* Header cu titlul si butonul de inchidere */}
        <div style={s.header}>
          <span style={s.headerTitle}>👤 Evaluează proprietarul — {numeProprietar}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.body}>
          {/* Selectorul de stele si eticheta corespunzatoare notei */}
          <div style={s.ratingWrap}>
            <StarRating value={rating} onChange={setRating} />
            <span style={s.ratingLabel}>{eticheteRating[rating]}</span>
          </div>

          {/* Camp optional pentru comentariu despre comunicarea cu proprietarul */}
          <textarea
            placeholder="Comentariu (opțional) — cum a fost comunicarea cu proprietarul?"
            value={comentariu}
            onChange={e => setComentariu(e.target.value)}
            rows={4}
            style={s.textarea}
          />
          {mesaj && <p style={s.err}>{mesaj}</p>}

          {/* Butoane pentru anulare si trimitere */}
          <div style={s.footer}>
            <button onClick={onClose} style={s.cancelBtn}>Anulează</button>
            <button onClick={trimite} disabled={seTrimite} style={s.submitBtn}>
              {seTrimite ? 'Se trimite...' : 'Trimite evaluarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '10px', width: '460px', maxWidth: '96vw', boxShadow: '0 10px 50px rgba(0,0,0,0.25)' },
  header: { background: '#003580', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontWeight: 700, fontSize: '0.95rem' },
  closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  body: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  ratingWrap: { display: 'flex', alignItems: 'center', gap: '1rem' },
  ratingLabel: { fontSize: '1rem', fontWeight: 600, color: '#003580' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  err: { color: '#dc3545', fontSize: '0.88rem', margin: 0 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #ccc', color: '#666', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  submitBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' },
};
