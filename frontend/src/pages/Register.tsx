import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Pas = 'formular' | 'verifica-email';

export default function Register() {
  const [pas, setPas] = useState<Pas>('formular');
  const [formular, setFormular] = useState({ nume: '', prenume: '', email: '', parola: '', telefon: '' });
  const [emailPentruVerificare, setEmailPentruVerificare] = useState('');
  const [cod, setCod] = useState('');
  const [eroare, setEroare] = useState('');
  const [seIncarca, setSeIncarca] = useState(false);
  const [mesajRetrimis, setMesajRetrimis] = useState('');
  const { login } = useAuth();
  const navigheaza = useNavigate();

  const setCamp = (camp: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormular(f => ({ ...f, [camp]: e.target.value }));

  const laSubmitFormular = async (e: FormEvent) => {
    e.preventDefault();
    setEroare('');
    setSeIncarca(true);
    try {
      const { data } = await api.post('/auth/register', formular);
      if (data.necesitaVerificare) {
        setEmailPentruVerificare(data.email);
        setPas('verifica-email');
      }
    } catch (err: any) {
      const mesaj = err.response?.data?.eroare || Object.values(err.response?.data || {}).join(', ') || 'Eroare la înregistrare';
      setEroare(mesaj);
    } finally {
      setSeIncarca(false);
    }
  };

  const laVerificareEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!cod.trim()) { setEroare('Introdu codul primit pe email'); return; }
    setEroare('');
    setSeIncarca(true);
    try {
      const { data } = await api.post('/auth/verifica-email', { email: emailPentruVerificare, cod: cod.trim() });
      login(data.token, { email: data.email, nume: data.nume, prenume: data.prenume, rol: data.rol });
      navigheaza('/');
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Cod incorect sau expirat');
    } finally {
      setSeIncarca(false);
    }
  };

  const retrimiteCode = async () => {
    setMesajRetrimis('');
    setEroare('');
    try {
      await api.post('/auth/retrimite-cod-email', { email: emailPentruVerificare });
      setMesajRetrimis('Un cod nou a fost trimis pe adresa ta de email.');
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la retrimitera codului');
    }
  };

  if (pas === 'verifica-email') {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>📧</div>
          <h2 style={styles.title}>Verifică emailul</h2>
          <p style={styles.subtitle}>
            Am trimis un cod de 6 cifre la adresa<br />
            <strong>{emailPentruVerificare}</strong>
          </p>

          {eroare && <div style={styles.error}>{eroare}</div>}
          {mesajRetrimis && <div style={styles.success}>{mesajRetrimis}</div>}

          <form onSubmit={laVerificareEmail} style={styles.form}>
            <div>
              <label style={styles.label}>Cod de verificare</label>
              <input
                type="text"
                maxLength={6}
                value={cod}
                onChange={e => setCod(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={styles.codInput}
                autoFocus
              />
            </div>
            <button type="submit" style={styles.btn} disabled={seIncarca}>
              {seIncarca ? 'Se verifică...' : 'Activează contul'}
            </button>
          </form>

          <div style={styles.retrimiteWrap}>
            <span style={styles.retrimiteText}>Nu ai primit codul?</span>
            <button onClick={retrimiteCode} style={styles.linkBtn}>Retrimite cod</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Cont nou</h2>
        {eroare && <div style={styles.error}>{eroare}</div>}
        <form onSubmit={laSubmitFormular} style={styles.form}>
          {[
            { label: 'Nume', camp: 'nume', type: 'text', required: true },
            { label: 'Prenume', camp: 'prenume', type: 'text', required: true },
            { label: 'Email', camp: 'email', type: 'email', required: true },
            { label: 'Parolă (min. 6 caractere)', camp: 'parola', type: 'password', required: true },
            { label: 'Telefon (opțional)', camp: 'telefon', type: 'tel', required: false },
          ].map(({ label, camp, type, required }) => (
            <div key={camp}>
              <label style={styles.label}>{label}</label>
              <input type={type} value={(formular as any)[camp]} onChange={setCamp(camp)}
                required={required} style={styles.input} />
            </div>
          ))}
          <button type="submit" style={styles.btn} disabled={seIncarca}>
            {seIncarca ? 'Se creează contul...' : 'Creează cont'}
          </button>
        </form>
        <p style={styles.footer}>
          Ai deja cont? <Link to="/login">Autentifică-te</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f5f5f5', padding: '2rem 0' },
  card: { background: '#fff', padding: '2.5rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  iconWrap: { fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' },
  title: { margin: '0 0 0.5rem', textAlign: 'center', color: '#003580', fontSize: '1.4rem' },
  subtitle: { margin: '0 0 1.5rem', textAlign: 'center', color: '#666', fontSize: '0.9rem', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#444', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' },
  codInput: { width: '100%', padding: '12px 14px', border: '2px solid #003580', borderRadius: '4px', fontSize: '1.4rem', letterSpacing: '0.4em', textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' },
  btn: { background: '#003580', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' },
  error: { background: '#fff0f0', border: '1px solid #f00', color: '#c00', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' },
  success: { background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' },
  footer: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' },
  retrimiteWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem' },
  retrimiteText: { fontSize: '0.85rem', color: '#666' },
  linkBtn: { background: 'none', border: 'none', color: '#0071c2', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 },
};
