import { useState } from 'react';
import api from '../services/api';

interface Props {
  proprietateId: number;
  numeProprietate: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Lista de criterii de evaluare cu numele campului din formular si campul pentru comentariu
const CRITERII = [
  { label: 'Curățenie',            camp: 'curatenie',          campComentariu: 'comentariuCuratenie' },
  { label: 'Locație',              camp: 'locatie',            campComentariu: 'comentariuLocatie' },
  { label: 'Utilități',           camp: 'utilitati',          campComentariu: 'comentariuUtilitati' },
  { label: 'Personal',             camp: 'personal',           campComentariu: 'comentariuPersonal' },
  { label: 'Raport calitate-preț', camp: 'raportCalitatePret', campComentariu: 'comentariuRaportCalitatePret' },
] as const;

// Componenta pentru selectarea unui rating 1-5 prin click pe stele
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span style={{ fontSize: '1.3rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(stea => (
        <span key={stea} onClick={() => onChange(stea)} style={{ color: stea <= value ? '#febb02' : '#ccc' }}>★</span>
      ))}
    </span>
  );
}

// Modal pentru lasarea unei recenzii detaliate cu 5 criterii si un comentariu general
export default function RatingModal({ proprietateId, numeProprietate, onClose, onSuccess }: Props) {
  const [formular, setFormular] = useState({
    curatenie: 5, locatie: 5, utilitati: 5, personal: 5, raportCalitatePret: 5,
    comentariuCuratenie: '', comentariuLocatie: '', comentariuUtilitati: '',
    comentariuPersonal: '', comentariuRaportCalitatePret: '', comentariu: '',
  });
  const [mesaj, setMesaj] = useState('');
  const [seTrimite, setSeTrimite] = useState(false);

  // Actualizeaza un camp al formularului in stare
  const setCamp = (camp: string, valoare: any) => setFormular(f => ({ ...f, [camp]: valoare }));

  // Calculeaza media aritmetica a celor 5 criterii pentru a afisa nota totala
  const notaMedie = ((formular.curatenie + formular.locatie + formular.utilitati + formular.personal + formular.raportCalitatePret) / 5).toFixed(1);

  // Trimite recenzia la server; daca reuseste, apeleaza onSuccess si inchide modalul
  const trimite = async () => {
    setSeTrimite(true);
    setMesaj('');
    try {
      await api.post('/recenzii', { ...formular, proprietateId });
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
          <span style={s.headerTitle}>⭐ Recenzie — {numeProprietate}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.body}>
          {/* Un rand per criteriu: eticheta, stele interactive, nota numerica */}
          {CRITERII.map(({ label, camp, campComentariu }) => (
            <div key={camp} style={s.criteriu}>
              <div style={s.criteriuRow}>
                <span style={s.criteriuLabel}>{label}</span>
                <StarRating value={(formular as any)[camp]} onChange={v => setCamp(camp, v)} />
                <span style={s.nota}>{(formular as any)[camp]}/5</span>
              </div>
              {/* Textarea pentru comentariu apare doar cand nota e 3 sau mai mica */}
              {(formular as any)[camp] <= 3 && (
                <textarea
                  placeholder={`Ce nu a fost în regulă la ${label.toLowerCase()}?`}
                  value={(formular as any)[campComentariu]}
                  onChange={e => setCamp(campComentariu, e.target.value)}
                  rows={2}
                  style={s.textarea}
                />
              )}
            </div>
          ))}

          {/* Camp optional pentru un comentariu general despre intreaga experienta */}
          <div style={{ marginTop: '0.8rem' }}>
            <label style={s.criteriuLabel}>Comentariu general (opțional)</label>
            <textarea
              placeholder="Descrie experiența ta..."
              value={formular.comentariu}
              onChange={e => setCamp('comentariu', e.target.value)}
              rows={3}
              style={{ ...s.textarea, marginTop: '0.4rem' }}
            />
          </div>

          {mesaj && <p style={s.err}>{mesaj}</p>}

          {/* Footer cu nota medie calculata si butonul de trimitere */}
          <div style={s.footer}>
            <span style={s.medie}>Nota medie: <strong style={{ color: '#003580' }}>{notaMedie} / 5</strong></span>
            <button onClick={trimite} disabled={seTrimite} style={s.submitBtn}>
              {seTrimite ? 'Se trimite...' : 'Trimite recenzia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '10px', width: '540px', maxWidth: '96vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 50px rgba(0,0,0,0.25)' },
  header: { background: '#003580', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: '0.95rem' },
  closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  body: { overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  criteriu: { marginBottom: '0.5rem' },
  criteriuRow: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  criteriuLabel: { minWidth: '160px', fontWeight: 600, fontSize: '0.88rem', color: '#333' },
  nota: { fontSize: '0.82rem', color: '#888' },
  textarea: { width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem', boxSizing: 'border-box' as const, display: 'block', fontFamily: 'inherit' },
  err: { color: '#dc3545', fontSize: '0.88rem', margin: '0.5rem 0 0' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #eee' },
  medie: { fontSize: '0.9rem', color: '#555' },
  submitBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' },
};
