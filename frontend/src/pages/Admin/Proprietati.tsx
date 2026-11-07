import { useState, useEffect, type FormEvent } from 'react';
import api from '../../services/api';

interface Proprietate {
  id: number; nume: string; adresa: string; oras: string; tara: string;
  tip: string; stele: number; descriere?: string; imaginePrincipala?: string;
  numeProprietar?: string; scorProprietar?: number; numarRecenziiProprietar?: number;
  statusProprietate?: string;
}

const TIPURI_CU_STELE = ['HOTEL', 'VILA'];

// Valorile initiale ale formularului (folosite la resetare)
const formularGol = { nume: '', adresa: '', oras: '', tara: '', tip: 'HOTEL', stele: 3, descriere: '', imaginePrincipala: '' };

export default function AdminProprietati() {
  const [proprietati, setProprietati] = useState<Proprietate[]>([]);
  const [formular, setFormular] = useState(formularGol);
  const [idEditare, setIdEditare] = useState<number | null>(null);
  const [aratFormular, setAratFormular] = useState(false);

  // La montare, incarca toate proprietatile din sistem
  useEffect(() => { incarca(); }, []);

  const incarca = () => api.get('/proprietati/toate').then(r => setProprietati(r.data));

  // Returneaza handler de onChange care actualizeaza campul corespunzator din formular
  const setCamp = (camp: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormular(f => ({ ...f, [camp]: e.target.type === 'number' ? +e.target.value : e.target.value }));

  // Trimite formularul la server: creeaza sau editeaza proprietatea in functie de idEditare
  const laSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (idEditare) {
      await api.put(`/proprietati/${idEditare}`, formular);
    } else {
      await api.post('/proprietati', formular);
    }
    setFormular(formularGol); setIdEditare(null); setAratFormular(false);
    incarca();
  };

  // Populeaza formularul cu datele proprietatii selectate pentru editare
  const incepeEditare = (p: Proprietate) => {
    setFormular({ nume: p.nume, adresa: p.adresa, oras: p.oras, tara: p.tara, tip: p.tip, stele: p.stele, descriere: p.descriere || '', imaginePrincipala: p.imaginePrincipala || '' });
    setIdEditare(p.id);
    setAratFormular(true);
  };

  // Sterge o proprietate dupa confirmare si reincarca lista
  const sterge = async (id: number) => {
    if (!confirm('Stergi proprietatea?')) return;
    await api.delete(`/proprietati/${id}`);
    incarca();
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏨 Gestionare Proprietăți</h1>
        {/* Toggling formularului de adaugare/editare */}
        <button onClick={() => { setAratFormular(!aratFormular); setIdEditare(null); setFormular(formularGol); }} style={styles.addBtn}>
          {aratFormular ? '✕ Anulează' : '+ Adaugă proprietate'}
        </button>
      </div>

      {/* Formularul de creare/editare, vizibil doar cand aratFormular este true */}
      {aratFormular && (
        <form onSubmit={laSubmit} style={styles.form}>
          <h3>{idEditare ? 'Editează proprietatea' : 'Proprietate nouă'}</h3>
          <div style={styles.formGrid}>
            {[
              { label: 'Nume', camp: 'nume', type: 'text' },
              { label: 'Adresă', camp: 'adresa', type: 'text' },
              { label: 'Oraș', camp: 'oras', type: 'text' },
              { label: 'Țară', camp: 'tara', type: 'text' },
              { label: 'URL imagine', camp: 'imaginePrincipala', type: 'text' },
            ].map(({ label, camp, type }) => (
              <div key={camp}>
                <label style={styles.label}>{label}</label>
                <input type={type} value={(formular as any)[camp]} onChange={setCamp(camp)} required={camp !== 'imaginePrincipala'} style={styles.input} />
              </div>
            ))}
            <div>
              <label style={styles.label}>Tip</label>
              <select value={formular.tip} onChange={setCamp('tip')} style={styles.input}>
                {['HOTEL','APARTAMENT','VILA','HOSTEL'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {TIPURI_CU_STELE.includes(formular.tip) && (
              <div>
                <label style={styles.label}>Stele</label>
                <select value={formular.stele} onChange={setCamp('stele')} style={styles.input}>
                  {[1,2,3,4,5].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label style={styles.label}>Descriere</label>
            <textarea value={formular.descriere} onChange={setCamp('descriere')} rows={3} style={{ ...styles.input, width: '100%' }} />
          </div>
          <button type="submit" style={styles.submitBtn}>{idEditare ? 'Salvează modificările' : 'Creează proprietatea'}</button>
        </form>
      )}

      {/* Tabelul cu toate proprietatile din sistem */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.th}>
            <th style={styles.thCell}>Nume</th>
            <th style={styles.thCell}>Locație</th>
            <th style={styles.thCell}>Tip</th>
            <th style={styles.thCell}>Stele</th>
            <th style={styles.thCell}>Proprietar</th>
            <th style={styles.thCell}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {proprietati.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>{p.nume}</td>
              <td style={styles.td}>{p.oras}, {p.tara}</td>
              <td style={styles.td}>{p.tip}</td>
              <td style={styles.td}>
                {(p.tip === 'HOTEL' || p.tip === 'VILA') && p.stele ? '★'.repeat(p.stele) : '—'}
              </td>
              <td style={styles.td}>
                {p.numeProprietar ? (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.numeProprietar}</div>
                    {p.scorProprietar != null ? (
                      <div style={{ fontSize: '0.78rem', color: '#555' }}>
                        ⭐ {p.scorProprietar.toFixed(1)} · {p.numarRecenziiProprietar} rec.
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#aaa' }}>fără recenzii</div>
                    )}
                  </div>
                ) : '—'}
              </td>
              <td style={styles.td}>
                <button onClick={() => incepeEditare(p)} style={{ ...styles.actionBtn, background: '#0071c2' }}>✏️ Edit</button>
                <button onClick={() => sterge(p.id)} style={{ ...styles.actionBtn, background: '#d9534f' }}>🗑️ Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#003580' },
  addBtn: { background: '#febb02', border: 'none', color: '#003580', padding: '10px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' },
  form: { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#444' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box' },
  submitBtn: { background: '#003580', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th: { background: '#003580', color: '#fff' },
  thCell: { padding: '10px 14px', textAlign: 'left', fontWeight: 600 },
  td: { padding: '10px 14px' },
  actionBtn: { color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.85rem' },
};
