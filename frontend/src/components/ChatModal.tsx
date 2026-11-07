import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Mesaj {
  id: number;
  expeditorEmail: string;
  numeExpeditor: string;
  continut: string;
  creatLa: string;
}

interface Props {
  rezervareId: number;
  titlu: string;
  onClose: () => void;
  onRead?: () => void;
}

// Fereastra de chat intre client si proprietar, cu reimprospatare automata la fiecare 4 secunde
export default function ChatModal({ rezervareId, titlu, onClose, onRead }: Props) {
  const { user } = useAuth();
  const [mesaje, setMesaje] = useState<Mesaj[]>([]);
  const [textMesaj, setTextMesaj] = useState('');
  const [seTrimite, setSeTrimite] = useState(false);
  const refJos = useRef<HTMLDivElement>(null);
  const refInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Incarca mesajele conversatiei; daca silentios=false, marcheaza si mesajele ca citite
  const incarca = async (silentios = false) => {
    try {
      const { data } = await api.get(`/mesaje/rezervare/${rezervareId}`);
      setMesaje(data);
      if (!silentios && onRead) onRead();
    } catch {}
  };

  // La deschiderea chat-ului, incarca mesajele si porneste polling-ul la 4 secunde
  useEffect(() => {
    incarca();
    refInterval.current = setInterval(() => incarca(true), 4000);
    return () => { if (refInterval.current) clearInterval(refInterval.current); };
  }, [rezervareId]);

  // Scroll automat la ultimul mesaj de fiecare data cand lista de mesaje se actualizeaza
  useEffect(() => {
    refJos.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesaje]);

  // Trimite mesajul curent si il adauga in lista locala fara a reincarca toate mesajele
  const trimite = async () => {
    if (!textMesaj.trim() || seTrimite) return;
    setSeTrimite(true);
    try {
      const { data } = await api.post('/mesaje', { rezervareId, continut: textMesaj.trim() });
      setMesaje(prev => [...prev, data]);
      setTextMesaj('');
    } finally {
      setSeTrimite(false);
    }
  };

  // Trimite mesajul la apasarea Enter (Shift+Enter = linie noua)
  const laTasta = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); trimite(); }
  };

  // Formateaza timestamp-ul unui mesaj in format romanesc zi/luna ora:minut
  const formateazaOra = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        {/* Header cu titlul conversatiei si butonul de inchidere */}
        <div style={s.header}>
          <span style={s.headerTitle}>💬 {titlu}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Lista de mesaje, fiecare aliniat stanga (al altora) sau dreapta (al meu) */}
        <div style={s.messages}>
          {mesaje.length === 0 && (
            <p style={s.empty}>Nicio conversație încă. Trimite primul mesaj!</p>
          )}
          {mesaje.map(m => {
            const eAlMeu = m.expeditorEmail === user?.email;
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: eAlMeu ? 'flex-end' : 'flex-start', marginBottom: '0.6rem' }}>
                <div style={{ ...s.bubble, ...(eAlMeu ? s.myBubble : s.theirBubble) }}>
                  {!eAlMeu && <div style={s.senderName}>{m.numeExpeditor}</div>}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.continut}</div>
                  <div style={s.time}>{formateazaOra(m.creatLa)}</div>
                </div>
              </div>
            );
          })}
          {/* Element invizibil folosit pentru scroll automat la baza listei */}
          <div ref={refJos} />
        </div>

        {/* Zona de introducere a mesajului nou */}
        <div style={s.inputRow}>
          <textarea
            value={textMesaj}
            onChange={e => setTextMesaj(e.target.value)}
            onKeyDown={laTasta}
            placeholder="Scrie un mesaj... (Enter = trimite, Shift+Enter = linie nouă)"
            rows={2}
            style={s.textarea}
          />
          <button onClick={trimite} disabled={!textMesaj.trim() || seTrimite} style={s.sendBtn}>
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: '10px', width: '500px', maxWidth: '96vw', height: '520px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 50px rgba(0,0,0,0.25)' },
  header: { background: '#003580', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: '0.95rem' },
  closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1, padding: '0 4px' },
  messages: { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: '2rem', fontSize: '0.88rem' },
  bubble: { maxWidth: '75%', padding: '8px 12px', borderRadius: '14px', fontSize: '0.88rem', lineHeight: 1.4 },
  myBubble: { background: '#003580', color: '#fff', borderBottomRightRadius: '3px' },
  theirBubble: { background: '#f0f2f5', color: '#222', borderBottomLeftRadius: '3px' },
  senderName: { fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px', opacity: 0.65 },
  time: { fontSize: '0.68rem', marginTop: '4px', opacity: 0.6, textAlign: 'right' },
  inputRow: { padding: '0.8rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 },
  textarea: { flex: 1, padding: '8px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.88rem', resize: 'none', fontFamily: 'inherit', outline: 'none' },
  sendBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },
};
