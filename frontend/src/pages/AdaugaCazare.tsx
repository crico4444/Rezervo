import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Oras { id: number; nume: string; judet: string; }

const TIPURI_CU_STELE = ['HOTEL', 'VILA'];

const formularGol = {
  nume: '', adresa: '', oras: '', tara: 'Romania',
  tip: 'HOTEL', stele: 3, descriere: '', imaginePrincipala: '',
  nrCamere: 1, capacitate: 3, pretPeNoapte: 150,
  latitudine: '', longitudine: '',
};

export default function AdaugaCazare() {
  const [formular, setFormular] = useState(formularGol);
  const [orase, setOrase] = useState<Oras[]>([]);
  const [mesaj, setMesaj] = useState('');
  const [eroare, setEroare] = useState('');
  const [fisier, setFisier] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [seIncarcaImagine, setSeIncarcaImagine] = useState(false);
  const navigheaza = useNavigate();

  // Incarca lista de orase din Romania de la server pentru dropdown
  useEffect(() => {
    api.get('/orase').then(r => setOrase(r.data));
  }, []);

  // Returneaza un handler de onChange care actualizeaza campul specificat din formular;
  // daca inputul este de tip number, converteste valoarea la numar intreg
  const setCamp = (camp: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormular(f => ({ ...f, [camp]: e.target.type === 'number' ? +e.target.value : e.target.value }));

  const laSelectFisier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setEroare('Imaginea depășește 5 MB'); return; }
    setFisier(f);
    setPreviewUrl(URL.createObjectURL(f));
    setEroare('');
  };

  const laSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEroare(''); setMesaj('');
    try {
      let urlImagine = formular.imaginePrincipala;
      if (fisier) {
        setSeIncarcaImagine(true);
        const fd = new FormData();
        fd.append('file', fisier);
        const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urlImagine = data.url;
        setSeIncarcaImagine(false);
      }
      const payload: Record<string, unknown> = {
        ...formular,
        imaginePrincipala: urlImagine,
        tip: formular.tip as string,
        latitudine: formular.latitudine !== '' ? parseFloat(String(formular.latitudine)) : null,
        longitudine: formular.longitudine !== '' ? parseFloat(String(formular.longitudine)) : null,
      };
      if (formular.tip !== 'APARTAMENT') {
        delete payload.nrCamere;
        delete payload.capacitate;
        delete payload.pretPeNoapte;
      }
      if (!TIPURI_CU_STELE.includes(formular.tip)) payload.stele = null;
      await api.post('/proprietati', payload);
      setMesaj('✅ Cazarea ta a fost trimisă spre aprobare! Vei fi notificat când adminul o aprobă.');
      setTimeout(() => navigheaza('/cazarile-mele'), 3000);
    } catch (err: any) {
      setSeIncarcaImagine(false);
      setEroare(err.response?.data?.eroare || 'Eroare la trimiterea cazării');
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏠 Listează-ți cazarea</h1>
        <p style={styles.subtitle}>
          Completează formularul de mai jos. Cazarea va fi revizuită de administratori și publicată în cel mai scurt timp.
        </p>

        {mesaj && <div style={styles.success}>{mesaj}</div>}
        {eroare && <div style={styles.error}>{eroare}</div>}

        <form onSubmit={laSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Numele cazării *</label>
              <input type="text" value={formular.nume} onChange={setCamp('nume')} required style={styles.input} placeholder="ex: Vila Muntilor" />
            </div>
            <div>
              <label style={styles.label}>Adresă *</label>
              <input type="text" value={formular.adresa} onChange={setCamp('adresa')} required style={styles.input} placeholder="Strada, nr." />
            </div>
            <div>
              <label style={styles.label}>Oraș *</label>
              <select value={formular.oras} onChange={setCamp('oras')} required style={styles.input}>
                <option value="">-- Selectează orașul --</option>
                {orase.map(o => (
                  <option key={o.id} value={o.nume}>{o.nume} ({o.judet})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Țară *</label>
              <input type="text" value={formular.tara} onChange={setCamp('tara')} required style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Tip cazare *</label>
              <select value={formular.tip} onChange={setCamp('tip')} style={styles.input}>
                {['HOTEL', 'APARTAMENT', 'VILA', 'HOSTEL'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {TIPURI_CU_STELE.includes(formular.tip) && (
              <div>
                <label style={styles.label}>Clasificare (stele)</label>
                <select value={formular.stele} onChange={setCamp('stele')} style={styles.input}>
                  <option value={0}>Fără clasificare</option>
                  {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} stele</option>)}
                </select>
              </div>
            )}
            {formular.tip === 'APARTAMENT' && (
              <>
                <div>
                  <label style={styles.label}>Număr camere *</label>
                  <input type="number" min={1} max={20} value={formular.nrCamere}
                    onChange={setCamp('nrCamere')} required style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Capacitate max. persoane *</label>
                  <input type="number" min={3} max={30} value={formular.capacitate}
                    onChange={setCamp('capacitate')} required style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Preț per noapte (RON) *</label>
                  <input type="number" min={1} step="0.01" value={formular.pretPeNoapte}
                    onChange={setCamp('pretPeNoapte')} required style={styles.input} />
                </div>
              </>
            )}
            <div>
              <label style={styles.label}>Latitudine (GPS, opțional)</label>
              <input type="number" step="0.0000001" value={formular.latitudine}
                onChange={setCamp('latitudine')} style={styles.input} placeholder="ex: 46.7712" />
            </div>
            <div>
              <label style={styles.label}>Longitudine (GPS, opțional)</label>
              <input type="number" step="0.0000001" value={formular.longitudine}
                onChange={setCamp('longitudine')} style={styles.input} placeholder="ex: 23.6236" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Imagine principală</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={laSelectFisier}
                style={styles.fileInput}
              />
              {previewUrl && (
                <div style={styles.previewWrap}>
                  <img src={previewUrl} alt="preview" style={styles.previewImg} />
                  <button
                    type="button"
                    onClick={() => { setFisier(null); setPreviewUrl(''); }}
                    style={styles.removeBtn}
                  >✕ Elimină</button>
                </div>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Descriere</label>
              <textarea value={formular.descriere} onChange={setCamp('descriere')} rows={4}
                style={{ ...styles.input, resize: 'vertical' }}
                placeholder="Descrie cazarea ta: facilități, locație, ce o face specială..." />
            </div>
          </div>

          <div style={styles.notice}>
            ℹ️ După trimitere, cazarea va fi verificată de administratori. Vei putea vedea statusul în pagina <strong>Cazările mele</strong>.
          </div>

          <div style={styles.btnRow}>
            <button type="button" onClick={() => navigheaza(-1)} style={styles.cancelBtn}>Anulează</button>
            <button type="submit" style={styles.submitBtn} disabled={seIncarcaImagine}>
              {seIncarcaImagine ? 'Se încarcă imaginea...' : 'Trimite spre aprobare'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '80vh', background: '#f5f5f5', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '700px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', alignSelf: 'flex-start' },
  title: { margin: '0 0 0.5rem', color: '#003580', fontSize: '1.6rem' },
  subtitle: { color: '#666', margin: '0 0 1.5rem', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#444', marginBottom: '4px' },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', boxSizing: 'border-box' },
  notice: { background: '#f0f4ff', border: '1px solid #c0d0f0', borderRadius: '6px', padding: '0.8rem 1rem', fontSize: '0.88rem', color: '#334', marginBottom: '1.2rem' },
  btnRow: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  cancelBtn: { background: '#eee', border: 'none', color: '#444', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  submitBtn: { background: '#003580', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' },
  success: { background: '#f0fff4', border: '1px solid #4caf50', color: '#2e7d32', padding: '12px', borderRadius: '6px', marginBottom: '1rem' },
  error: { background: '#fff0f0', border: '1px solid #f00', color: '#c00', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' },
  fileInput: { width: '100%', padding: '8px 0', fontSize: '0.9rem', cursor: 'pointer' },
  previewWrap: { marginTop: '0.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' },
  previewImg: { width: '160px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' },
  removeBtn: { background: 'transparent', border: '1px solid #ccc', color: '#888', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' },
};
