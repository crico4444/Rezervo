import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Eveniment {
  id: number;
  nume: string;
  descriere: string;
  oras: string;
  latitudine: number;
  longitudine: number;
  dataStart: string;
  dataEnd: string;
  ora: string;
  imagine: string;
  linkBilete: string;
  categorie: string;
}

const GOL: Omit<Eveniment, 'id'> = {
  nume: '', descriere: '', oras: '',
  latitudine: 0, longitudine: 0,
  dataStart: '', dataEnd: '',
  ora: '', imagine: '', linkBilete: '',
  categorie: 'CONCERT',
};

const CATEGORII = ['CONCERT', 'FESTIVAL', 'SPORT', 'CULTURAL', 'ALTELE'];

export default function AdminEvenimente() {
  const [evenimente, setEvenimente] = useState<Eveniment[]>([]);
  const [form, setForm] = useState<Omit<Eveniment, 'id'>>(GOL);
  const [editId, setEditId] = useState<number | null>(null);
  const [eroare, setEroare] = useState('');
  const [succes, setSucces] = useState('');
  const [arataSter, setArataSter] = useState<number | null>(null);
  const [fisierImagine, setFisierImagine] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [seIncarcaImagine, setSeIncarcaImagine] = useState(false);
  const [statusGeo, setStatusGeo] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const detecteazaCoordonate = async () => {
    if (!form.oras.trim()) { setEroare('Scrie mai întâi orașul.'); return; }
    setStatusGeo('loading'); setEroare('');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.oras + ', Romania')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'ro', 'User-Agent': 'RezervariApp/1.0' } }
      );
      const data = await r.json();
      if (!data.length) { setStatusGeo('err'); return; }
      setForm(f => ({ ...f, latitudine: parseFloat(data[0].lat), longitudine: parseFloat(data[0].lon) }));
      setStatusGeo('ok');
    } catch {
      setStatusGeo('err');
    }
  };

  useEffect(() => { incarca(); }, []);

  const incarca = () => {
    api.get('/evenimente').then(r => setEvenimente(r.data));
  };

  const resetForm = () => {
    setForm(GOL); setEditId(null); setEroare(''); setSucces('');
    setFisierImagine(null); setPreviewUrl(''); setStatusGeo('idle');
  };

  const laSelectImagine = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setEroare('Imaginea depășește 5 MB'); return; }
    setFisierImagine(f);
    setPreviewUrl(URL.createObjectURL(f));
    setEroare('');
  };

  const handleSalveaza = async () => {
    setEroare(''); setSucces('');
    if (!form.nume || !form.oras || !form.dataStart || !form.dataEnd) {
      setEroare('Completează câmpurile obligatorii: Nume, Oraș, Date.');
      return;
    }
    if (!form.latitudine || !form.longitudine) {
      setEroare('Apasă "Detectează automat din oraș" pentru a obține coordonatele GPS.');
      return;
    }
    if (form.dataEnd < form.dataStart) {
      setEroare('Data de sfârșit nu poate fi înainte de data de start.');
      return;
    }
    try {
      let urlImagine = form.imagine;
      if (fisierImagine) {
        setSeIncarcaImagine(true);
        const fd = new FormData();
        fd.append('file', fisierImagine);
        const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urlImagine = data.url;
        setSeIncarcaImagine(false);
      }
      const payload = { ...form, imagine: urlImagine };
      if (editId) {
        await api.put(`/evenimente/${editId}`, payload);
        setSucces('Eveniment actualizat.');
      } else {
        await api.post('/evenimente', payload);
        setSucces('Eveniment adăugat.');
      }
      resetForm();
      incarca();
    } catch {
      setSeIncarcaImagine(false);
      setEroare('A apărut o eroare. Verifică câmpurile.');
    }
  };

  const handleEditeaza = (ev: Eveniment) => {
    setEditId(ev.id);
    setForm({
      nume: ev.nume, descriere: ev.descriere ?? '', oras: ev.oras,
      latitudine: ev.latitudine, longitudine: ev.longitudine,
      dataStart: ev.dataStart, dataEnd: ev.dataEnd,
      ora: ev.ora ?? '', imagine: ev.imagine ?? '',
      linkBilete: ev.linkBilete ?? '', categorie: ev.categorie,
    });
    setFisierImagine(null);
    setPreviewUrl('');
    setStatusGeo(ev.latitudine ? 'ok' : 'idle');
    setEroare(''); setSucces('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSterge = async (id: number) => {
    await api.delete(`/evenimente/${id}`);
    setArataSter(null);
    incarca();
  };

  const set = (k: keyof typeof GOL, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={styles.container}>
      <h2 style={styles.titlu}>{editId ? 'Editează eveniment' : 'Adaugă eveniment'}</h2>

      <div style={styles.formCard}>
        <div style={styles.grid2}>
          <div style={styles.field}>
            <label style={styles.label}>Nume *</label>
            <input style={styles.input} value={form.nume} onChange={e => set('nume', e.target.value)} placeholder="Nume eveniment" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Categorie *</label>
            <select style={styles.input} value={form.categorie} onChange={e => set('categorie', e.target.value)}>
              {CATEGORII.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Oraș *</label>
            <input style={styles.input} value={form.oras} onChange={e => set('oras', e.target.value)} placeholder="Cluj-Napoca" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Oră eveniment</label>
            <input style={styles.input} type="time" value={form.ora} onChange={e => set('ora', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Data start *</label>
            <input style={styles.input} type="date" value={form.dataStart} onChange={e => set('dataStart', e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Data end *</label>
            <input style={styles.input} type="date" value={form.dataEnd} onChange={e => set('dataEnd', e.target.value)} />
          </div>
          <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <label style={styles.label}>Coordonate GPS</label>
            <div style={styles.geoRow}>
              <button type="button" onClick={detecteazaCoordonate} style={styles.btnGeo} disabled={statusGeo === 'loading'}>
                {statusGeo === 'loading' ? 'Se caută...' : '📍 Detectează automat din oraș'}
              </button>
              {statusGeo === 'ok' && (
                <span style={styles.geoOk}>
                  ✓ {form.latitudine.toFixed(5)}, {form.longitudine.toFixed(5)}
                </span>
              )}
              {statusGeo === 'err' && (
                <span style={styles.geoErr}>Nu s-au găsit coordonate. Verifică numele orașului.</span>
              )}
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Link bilete</label>
            <input style={styles.input} value={form.linkBilete} onChange={e => set('linkBilete', e.target.value)} placeholder="https://..." />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Imagine eveniment</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={laSelectImagine}
              style={styles.fileInput}
            />
            {(previewUrl || form.imagine) && (
              <div style={styles.previewWrap}>
                <img
                  src={previewUrl || form.imagine}
                  alt="preview"
                  style={styles.previewImg}
                />
                <button
                  type="button"
                  onClick={() => { setFisierImagine(null); setPreviewUrl(''); set('imagine', ''); }}
                  style={styles.removeBtn}
                >✕ Elimină</button>
              </div>
            )}
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Descriere</label>
          <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} value={form.descriere} onChange={e => set('descriere', e.target.value)} placeholder="Descriere eveniment..." />
        </div>

        {eroare && <p style={styles.eroare}>{eroare}</p>}
        {succes && <p style={styles.succes}>{succes}</p>}

        <div style={styles.actiuni}>
          <button onClick={handleSalveaza} style={styles.btnSalveaza} disabled={seIncarcaImagine}>
            {seIncarcaImagine ? 'Se încarcă imaginea...' : editId ? 'Salvează modificările' : 'Adaugă eveniment'}
          </button>
          {editId && (
            <button onClick={resetForm} style={styles.btnAnuleaza}>Anulează</button>
          )}
        </div>
      </div>

      <h2 style={{ ...styles.titlu, marginTop: '2rem' }}>Evenimente existente</h2>

      {evenimente.length === 0 ? (
        <p style={{ color: '#888' }}>Nu există evenimente.</p>
      ) : (
        <div style={styles.tabel}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nume</th>
                <th style={styles.th}>Categorie</th>
                <th style={styles.th}>Oraș</th>
                <th style={styles.th}>Perioadă</th>
                <th style={styles.th}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {evenimente.map(ev => (
                <tr key={ev.id} style={styles.tr}>
                  <td style={styles.td}>{ev.nume}</td>
                  <td style={styles.td}>{ev.categorie}</td>
                  <td style={styles.td}>{ev.oras}</td>
                  <td style={styles.td}>
                    {ev.dataStart === ev.dataEnd ? ev.dataStart : `${ev.dataStart} – ${ev.dataEnd}`}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEditeaza(ev)} style={styles.btnEdit}>Editează</button>
                    {arataSter === ev.id ? (
                      <>
                        <button onClick={() => handleSterge(ev.id)} style={styles.btnConfirmSter}>Confirmă</button>
                        <button onClick={() => setArataSter(null)} style={styles.btnAnuleaza}>Anulează</button>
                      </>
                    ) : (
                      <button onClick={() => setArataSter(ev.id)} style={styles.btnSter}>Șterge</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  titlu: { fontSize: '1.4rem', fontWeight: 700, color: '#003580', marginBottom: '1rem' },
  formCard: { background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#555' },
  input: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' },
  eroare: { color: '#d9534f', fontSize: '0.88rem', margin: '0.5rem 0 0' },
  succes: { color: '#28a745', fontSize: '0.88rem', margin: '0.5rem 0 0' },
  actiuni: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
  btnSalveaza: { background: '#003580', color: '#fff', border: 'none', padding: '9px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  btnAnuleaza: { background: '#fff', color: '#555', border: '1px solid #ccc', padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  tabel: { background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  thead: { background: '#003580' },
  th: { color: '#fff', padding: '10px 12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: '0.88rem', color: '#333' },
  btnEdit: { background: '#0071c2', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '6px' },
  btnSter: { background: '#d9534f', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  btnConfirmSter: { background: '#c0392b', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '6px' },
  geoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  btnGeo: { background: '#0071c2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  geoOk: { color: '#28a745', fontWeight: 600, fontSize: '0.88rem' },
  geoErr: { color: '#d9534f', fontSize: '0.88rem' },
  fileInput: { padding: '6px 0', fontSize: '0.9rem', cursor: 'pointer', width: '100%' },
  previewWrap: { marginTop: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  previewImg: { width: '160px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' },
  removeBtn: { background: 'transparent', border: '1px solid #ccc', color: '#888', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' },
};
