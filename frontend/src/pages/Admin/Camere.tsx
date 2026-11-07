import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Proprietate { id: number; nume: string; oras: string; }
interface Camera {
  id: number; proprietateId: number; nume: string; descriere: string;
  tip: string; capacitate: number; pretPeNoapte: number; disponibila: boolean;
  ocupataPanaCand?: string;
  urmatoareaCheckIn?: string;
  urmatoareaCheckOut?: string;
}

const TIP_OPTIONS = ['SINGLE', 'DOUBLE', 'TWIN', 'SUITE'];

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

function StatusOcupare({ camera: c }: { camera: Camera }) {
  if (c.ocupataPanaCand) {
    return (
      <span style={{ background: '#f8d7da', color: '#721c24', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        🔴 Ocupată până pe {fmtData(c.ocupataPanaCand)}
      </span>
    );
  }
  if (c.urmatoareaCheckIn) {
    return (
      <span style={{ background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        🟡 Liberă · rezervată {fmtData(c.urmatoareaCheckIn)}–{fmtData(c.urmatoareaCheckOut!)}
      </span>
    );
  }
  return (
    <span style={{ background: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 }}>
      🟢 Liberă
    </span>
  );
}

const FORM_GOL: Omit<Camera, 'id'> = {
  proprietateId: 0, nume: '', descriere: '', tip: 'DOUBLE',
  capacitate: 2, pretPeNoapte: 200, disponibila: true,
};

export default function AdminCamere() {
  const [proprietati, setProprietati] = useState<Proprietate[]>([]);
  const [proprietateSelectata, setProprietateSelectata] = useState<number | null>(null);
  const [camere, setCamere] = useState<Camera[]>([]);
  const [form, setForm] = useState<Omit<Camera, 'id'>>(FORM_GOL);
  const [editId, setEditId] = useState<number | null>(null);
  const [aratFormular, setAratFormular] = useState(false);
  const [mesaj, setMesaj] = useState('');
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    api.get('/proprietati/toate').then(r => setProprietati(r.data));
  }, []);

  useEffect(() => {
    if (proprietateSelectata !== null) {
      api.get(`/camere?proprietateId=${proprietateSelectata}`).then(r => setCamere(r.data));
    }
  }, [proprietateSelectata]);

  const selecteazaProprietate = (id: number) => {
    setProprietateSelectata(id);
    setAratFormular(false);
    setEditId(null);
    setForm({ ...FORM_GOL, proprietateId: id });
    setMesaj(''); setEroare('');
  };

  const deschideAdauga = () => {
    setForm({ ...FORM_GOL, proprietateId: proprietateSelectata! });
    setEditId(null);
    setAratFormular(true);
    setMesaj(''); setEroare('');
  };

  const deschideEditeaza = (c: Camera) => {
    setForm({ proprietateId: c.proprietateId, nume: c.nume, descriere: c.descriere,
      tip: c.tip, capacitate: c.capacitate, pretPeNoapte: c.pretPeNoapte, disponibila: c.disponibila });
    setEditId(c.id);
    setAratFormular(true);
    setMesaj(''); setEroare('');
  };

  const salveaza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        const { data } = await api.put(`/camere/${editId}`, form);
        setCamere(prev => prev.map(c => c.id === editId ? data : c));
        setMesaj('Camera a fost actualizată.');
      } else {
        const { data } = await api.post('/camere', form);
        setCamere(prev => [...prev, data]);
        setMesaj('Camera a fost adăugată.');
      }
      setAratFormular(false);
      setEditId(null);
    } catch (e: any) {
      setEroare(e.response?.data?.eroare || e.response?.data?.message || 'Eroare la salvare');
    }
  };

  const sterge = async (id: number) => {
    if (!confirm('Ștergi această cameră? Acțiunea este ireversibilă.')) return;
    try {
      await api.delete(`/camere/${id}`);
      setCamere(prev => prev.filter(c => c.id !== id));
      setMesaj('Camera a fost ștearsă.');
    } catch (e: any) {
      setEroare(e.response?.data?.eroare || 'Nu se poate șterge (are rezervări active)');
    }
  };

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>🛏️ Gestionare Camere</h1>

      <div style={s.layout}>
        {/* Sidebar cu lista proprietatilor */}
        <div style={s.sidebar}>
          <h3 style={s.sideTitle}>Proprietăți</h3>
          {proprietati.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>Se încarcă...</p>}
          {proprietati.map(p => (
            <div
              key={p.id}
              onClick={() => selecteazaProprietate(p.id)}
              style={{
                ...s.propItem,
                background: proprietateSelectata === p.id ? '#003580' : '#f8f9fa',
                color: proprietateSelectata === p.id ? '#fff' : '#333',
              }}
            >
              <strong>{p.nume}</strong>
              <small style={{ display: 'block', opacity: 0.8 }}>{p.oras}</small>
            </div>
          ))}
        </div>

        {/* Continut principal: camere + formular */}
        <div style={s.main}>
          {proprietateSelectata === null ? (
            <div style={s.placeholder}>← Selectează o proprietate din stânga</div>
          ) : (
            <>
              {mesaj && <div style={s.msgOk}>{mesaj}</div>}
              {eroare && <div style={s.msgErr}>{eroare}</div>}

              <div style={s.actiuniRow}>
                <h2 style={s.subtitle}>
                  {proprietati.find(p => p.id === proprietateSelectata)?.nume} — {camere.length} camere
                </h2>
                <button onClick={deschideAdauga} style={s.addBtn}>+ Adaugă cameră</button>
              </div>

              {/* Formular adaugare / editare */}
              {aratFormular && (
                <div style={s.formCard}>
                  <h3 style={s.formTitle}>{editId !== null ? 'Editează camera' : 'Adaugă cameră nouă'}</h3>
                  <form onSubmit={salveaza} style={s.form}>
                    <div style={s.formRow}>
                      <div style={s.field}>
                        <label style={s.label}>Nume*</label>
                        <input style={s.input} value={form.nume}
                          onChange={e => setForm(f => ({ ...f, nume: e.target.value }))} required />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Tip*</label>
                        <select style={s.input} value={form.tip}
                          onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}>
                          {TIP_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={s.formRow}>
                      <div style={s.field}>
                        <label style={s.label}>Capacitate (persoane)*</label>
                        <input style={s.input} type="number" min={1} max={20} value={form.capacitate}
                          onChange={e => setForm(f => ({ ...f, capacitate: +e.target.value }))} required />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Preț/noapte (RON)*</label>
                        <input style={s.input} type="number" min={1} step="0.01" value={form.pretPeNoapte}
                          onChange={e => setForm(f => ({ ...f, pretPeNoapte: +e.target.value }))} required />
                      </div>
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Descriere</label>
                      <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }}
                        value={form.descriere}
                        onChange={e => setForm(f => ({ ...f, descriere: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" id="disp" checked={form.disponibila}
                        onChange={e => setForm(f => ({ ...f, disponibila: e.target.checked }))} />
                      <label htmlFor="disp" style={{ cursor: 'pointer' }}>Disponibilă</label>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                      <button type="submit" style={s.saveBtn}>
                        {editId !== null ? 'Salvează modificările' : 'Adaugă camera'}
                      </button>
                      <button type="button" onClick={() => { setAratFormular(false); setEditId(null); }} style={s.cancelBtn}>
                        Anulează
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tabel camere */}
              {camere.length === 0 ? (
                <p style={{ color: '#888', marginTop: '1rem' }}>Nicio cameră adăugată pentru această proprietate.</p>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Nume</th>
                        <th style={s.th}>Tip</th>
                        <th style={s.th}>Capacitate</th>
                        <th style={s.th}>Preț/noapte</th>
                        <th style={s.th}>Status ocupare</th>
                        <th style={s.th}>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camere.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={s.td}>
                            <strong>{c.nume}</strong>
                            {c.descriere && <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>{c.descriere}</p>}
                          </td>
                          <td style={s.td}><span style={s.tipBadge}>{c.tip}</span></td>
                          <td style={s.td}>{c.capacitate} pers.</td>
                          <td style={s.td}><strong>{c.pretPeNoapte} RON</strong></td>
                          <td style={s.td}>
                            <StatusOcupare camera={c} />
                          </td>
                          <td style={s.td}>
                            <button onClick={() => deschideEditeaza(c)} style={s.editBtn}>Editează</button>
                            <button onClick={() => sterge(c.id)} style={s.deleteBtn}>Șterge</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' },
  title: { color: '#003580', marginBottom: '1.5rem' },
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' },
  sidebar: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' },
  sideTitle: { margin: '0 0 0.8rem', color: '#003580', fontSize: '0.95rem' },
  propItem: { padding: '0.7rem 0.9rem', borderRadius: '6px', marginBottom: '0.4rem', cursor: 'pointer', transition: 'background 0.15s' },
  main: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', minHeight: '400px' },
  placeholder: { color: '#888', textAlign: 'center', padding: '4rem 1rem' },
  actiuniRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  subtitle: { margin: 0, color: '#003580', fontSize: '1.1rem' },
  addBtn: { background: '#003580', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 },
  msgOk: { background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #c3e6cb' },
  msgErr: { background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #f5c6cb' },
  formCard: { background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' },
  formTitle: { margin: '0 0 1rem', color: '#003580', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.85rem', color: '#555', fontWeight: 600 },
  input: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  saveBtn: { background: '#003580', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 },
  cancelBtn: { background: 'transparent', border: '1px solid #aaa', color: '#555', padding: '9px 20px', borderRadius: '4px', cursor: 'pointer' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#003580', color: '#fff' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.88rem' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: '0.88rem' },
  tipBadge: { background: '#e8f4fd', color: '#003580', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 },
  editBtn: { background: '#febb02', color: '#003580', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '0.8rem', fontWeight: 600 },
  deleteBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
};
