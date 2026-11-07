import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProprietateInAsteptare {
  proprietateId: number;
  numeProprietate: string;
}

// Modal care apare o singura data pe sesiune si aminteste utilizatorului sa lase recenzii
// pentru proprietatile la care a stat si nu a lasat inca o recenzie
export default function RecenzieReminderModal() {
  const { user } = useAuth();
  const navigheaza = useNavigate();
  const [inAsteptare, setInAsteptare] = useState<ProprietateInAsteptare[]>([]);
  const [index, setIndex] = useState(0);
  const [vizibil, setVizibil] = useState(false);

  // La autentificare, verifica daca exista proprietati nerecenzate si afiseaza modalul o singura data per sesiune
  useEffect(() => {
    if (!user) return;
    // Cheia de sesiune previne aparitia repetata a modalului in aceeasi sesiune browser
    const cheie = `recenzie_reminder_${user.email}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(cheie)) return;

    api.get('/recenzii/de-recenzat').then(({ data }) => {
      if (data.length > 0) {
        setInAsteptare(data);
        setVizibil(true);
        sessionStorage.setItem(cheie, '1');
      }
    }).catch(() => {});
  }, [user]);

  // Nu randezi nimic daca modalul nu este vizibil sau nu exista proprietati
  if (!vizibil || inAsteptare.length === 0) return null;

  const curent = inAsteptare[index];

  // Inchide modalul si navigheaza la pagina proprietatii pentru a lasa recenzia
  const mergi = () => {
    setVizibil(false);
    navigheaza(`/proprietati/${curent.proprietateId}`);
  };

  // Trece la urmatoarea proprietate nerecenzata sau inchide modalul daca nu mai sunt
  const urmatoarea = () => {
    if (index + 1 < inAsteptare.length) setIndex(i => i + 1);
    else setVizibil(false);
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.icon}>⭐</div>
        <h2 style={s.title}>Cum a fost sejurul?</h2>
        <p style={s.desc}>
          Ai stat recent la <strong>{curent.numeProprietate}</strong>.
          <br />Lasă o recenzie și ajută alți călători!
        </p>
        {inAsteptare.length > 1 && (
          <p style={s.counter}>{index + 1} din {inAsteptare.length} cazări nerecenzate</p>
        )}
        <div style={s.btns}>
          <button onClick={mergi} style={s.primaryBtn}>
            ⭐ Lasă o recenzie
          </button>
          <button onClick={urmatoarea} style={s.secondaryBtn}>
            {index + 1 < inAsteptare.length ? 'Mai târziu →' : 'Închide'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease' },
  icon: { fontSize: '3rem', marginBottom: '0.5rem' },
  title: { margin: '0 0 0.8rem', color: '#003580', fontSize: '1.4rem' },
  desc: { color: '#555', lineHeight: 1.6, marginBottom: '0.5rem' },
  counter: { color: '#888', fontSize: '0.85rem', margin: '0 0 1rem' },
  btns: { display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '1.2rem' },
  primaryBtn: { background: '#003580', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  secondaryBtn: { background: 'transparent', color: '#888', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
};
