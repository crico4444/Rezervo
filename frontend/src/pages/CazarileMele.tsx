import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChatModal from '../components/ChatModal';

interface Proprietate {
  id: number; nume: string; adresa: string; oras: string; tara: string;
  tip: string; stele: number | null; descriere?: string; imaginePrincipala?: string;
  statusProprietate: 'PENDING' | 'ACTIVA' | 'RESPINSA';
  nrCamere?: number; capacitate?: number; pretPeNoapte?: number;
}

interface Oras { id: number; nume: string; judet: string; }

const TIPURI_CU_STELE_P = ['HOTEL', 'VILA'];

function ModalEditareProprietate({
  proprietate, onClose, onSalvat, onSters,
}: {
  proprietate: Proprietate;
  onClose: () => void;
  onSalvat: (p: Proprietate) => void;
  onSters: (id: number) => void;
}) {
  const [form, setForm] = useState({
    nume: proprietate.nume,
    adresa: proprietate.adresa || '',
    oras: proprietate.oras,
    tara: proprietate.tara || 'Romania',
    tip: proprietate.tip,
    stele: proprietate.stele ?? 0,
    descriere: proprietate.descriere || '',
    imaginePrincipala: proprietate.imaginePrincipala || '',
    nrCamere: proprietate.nrCamere ?? 1,
    capacitate: proprietate.capacitate ?? 3,
    pretPeNoapte: proprietate.pretPeNoapte ?? 150,
  });
  const [orase, setOrase] = useState<Oras[]>([]);
  const [fisier, setFisier] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(proprietate.imaginePrincipala || '');
  const [seIncarcaImg, setSeIncarcaImg] = useState(false);
  const [mesaj, setMesaj] = useState('');
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    api.get('/orase').then(r => setOrase(r.data));
  }, []);

  const setCamp = (camp: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? +e.target.value : e.target.value;
    setForm(f => ({ ...f, [camp]: val }));
  };

  const laSelectFisier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setEroare('Imaginea depășește 5 MB'); return; }
    setFisier(f);
    setPreviewUrl(URL.createObjectURL(f));
    setEroare('');
  };

  const salveaza = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare(''); setMesaj('');
    try {
      let urlImagine = form.imaginePrincipala;
      if (fisier) {
        setSeIncarcaImg(true);
        const fd = new FormData();
        fd.append('file', fisier);
        const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urlImagine = data.url;
        setSeIncarcaImg(false);
      }
      const payload: Record<string, unknown> = { ...form, imaginePrincipala: urlImagine, stele: TIPURI_CU_STELE_P.includes(form.tip) ? form.stele : null };
      if (form.tip !== 'APARTAMENT') { delete payload.nrCamere; delete payload.capacitate; delete payload.pretPeNoapte; }
      const { data } = await api.put(`/proprietati/${proprietate.id}/ale-mele`, payload);
      setMesaj('✅ Modificările au fost salvate.');
      onSalvat(data);
    } catch (err: any) {
      setSeIncarcaImg(false);
      setEroare(err.response?.data?.eroare || 'Eroare la salvare');
    }
  };

  const sterge = async () => {
    if (!confirm('Ești sigur că vrei să ștergi această proprietate? Acțiunea este ireversibilă.')) return;
    try {
      await api.delete(`/proprietati/${proprietate.id}/ale-mele`);
      onSters(proprietate.id);
      onClose();
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la ștergere');
    }
  };

  return (
    <div style={me.overlay} onClick={onClose}>
      <div style={me.modal} onClick={e => e.stopPropagation()}>
        <div style={me.header}>
          <h2 style={me.title}>✏️ Editează — {proprietate.nume}</h2>
          <button onClick={onClose} style={me.closeBtn}>✕</button>
        </div>

        {mesaj && <div style={me.msgOk}>{mesaj}</div>}
        {eroare && <div style={me.msgErr}>{eroare}</div>}

        <form onSubmit={salveaza}>
          <div style={me.grid}>
            <div style={me.field}>
              <label style={me.label}>Nume *</label>
              <input style={me.input} value={form.nume} onChange={setCamp('nume')} required />
            </div>
            <div style={me.field}>
              <label style={me.label}>Adresă *</label>
              <input style={me.input} value={form.adresa} onChange={setCamp('adresa')} required />
            </div>
            <div style={me.field}>
              <label style={me.label}>Oraș *</label>
              <select style={me.input} value={form.oras} onChange={setCamp('oras')} required>
                <option value="">-- Selectează --</option>
                {orase.map(o => <option key={o.id} value={o.nume}>{o.nume} ({o.judet})</option>)}
              </select>
            </div>
            <div style={me.field}>
              <label style={me.label}>Tip *</label>
              <select style={me.input} value={form.tip} onChange={setCamp('tip')}>
                {['HOTEL', 'APARTAMENT', 'VILA', 'HOSTEL'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {TIPURI_CU_STELE_P.includes(form.tip) && (
              <div style={me.field}>
                <label style={me.label}>Stele</label>
                <select style={me.input} value={form.stele} onChange={setCamp('stele')}>
                  <option value={0}>Fără clasificare</option>
                  {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} stele</option>)}
                </select>
              </div>
            )}
          </div>
          {form.tip === 'APARTAMENT' && (
            <div style={{ ...me.grid, marginBottom: '0.7rem' }}>
              <div style={me.field}>
                <label style={me.label}>Număr camere</label>
                <input style={me.input} type="number" min={1} max={20} value={form.nrCamere} onChange={setCamp('nrCamere')} />
              </div>
              <div style={me.field}>
                <label style={me.label}>Capacitate max. pers.</label>
                <input style={me.input} type="number" min={3} max={30} value={form.capacitate} onChange={setCamp('capacitate')} />
              </div>
              <div style={me.field}>
                <label style={me.label}>Preț/noapte (RON)</label>
                <input style={me.input} type="number" min={1} step="0.01" value={form.pretPeNoapte} onChange={setCamp('pretPeNoapte')} />
              </div>
            </div>
          )}
          <div style={{ ...me.field, marginBottom: '0.7rem' }}>
            <label style={me.label}>Descriere</label>
            <textarea style={{ ...me.input, resize: 'vertical' }} rows={3} value={form.descriere} onChange={setCamp('descriere')} />
          </div>
          <div style={{ ...me.field, marginBottom: '1rem' }}>
            <label style={me.label}>Imagine principală</label>
            {previewUrl && <img src={previewUrl} alt="" style={me.preview} />}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={laSelectFisier} style={{ marginTop: '0.4rem', fontSize: '0.85rem' }} />
          </div>

          <div style={me.btnRow}>
            <button type="submit" style={me.saveBtn} disabled={seIncarcaImg}>
              {seIncarcaImg ? 'Se încarcă...' : 'Salvează modificările'}
            </button>
            <button type="button" onClick={onClose} style={me.cancelBtn}>Anulează</button>
          </div>
        </form>

        <div style={me.separator} />
        <div style={me.dangerZone}>
          <span style={me.dangerLabel}>Zonă periculoasă</span>
          <button onClick={sterge} style={me.deleteBtn}>🗑️ Șterge proprietatea</button>
        </div>
      </div>
    </div>
  );
}
interface Rezervare {
  id: number; numeCamera: string; numeProprietate: string;
  numeUtilizator: string; emailUtilizator: string;
  dataCheckIn: string; dataCheckOut: string;
  nrPersoane: number; pretTotal: number; status: string;
}
interface Camera {
  id: number; proprietateId: number; nume: string; descriere: string;
  tip: string; capacitate: number; pretPeNoapte: number; disponibila: boolean;
  ocupataPanaCand?: string;
  urmatoareaCheckIn?: string;
  urmatoareaCheckOut?: string;
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

function StatusOcupare({ c }: { c: Camera }) {
  if (c.ocupataPanaCand) {
    return <span style={ocup.rosu}>🔴 Ocupată până pe {fmtData(c.ocupataPanaCand)}</span>;
  }
  if (c.urmatoareaCheckIn) {
    return <span style={ocup.galben}>🟡 Liberă · rezervată {fmtData(c.urmatoareaCheckIn)}–{fmtData(c.urmatoareaCheckOut!)}</span>;
  }
  return <span style={ocup.verde}>🟢 Liberă</span>;
}

interface Imagine { id: number; urlImagine: string; }

function ModalPoze({ proprietate, onClose }: { proprietate: Proprietate; onClose: () => void }) {
  const [imagini, setImagini] = useState<Imagine[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    api.get(`/imagini?proprietateId=${proprietate.id}`).then(r => setImagini(r.data));
  }, [proprietate.id]);

  const laSelectFisier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setEroare('Imaginea depășește 5 MB'); return; }
    setEroare(''); setSeIncarca(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const { data: upload } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: img } = await api.post('/imagini', { proprietateId: proprietate.id, urlImagine: upload.url });
      setImagini(prev => [...prev, img]);
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la upload');
    } finally {
      setSeIncarca(false);
      e.target.value = '';
    }
  };

  const sterge = async (id: number) => {
    if (!confirm('Ștergi această imagine?')) return;
    try {
      await api.delete(`/imagini/${id}`);
      setImagini(prev => prev.filter(i => i.id !== id));
    } catch {
      setEroare('Eroare la ștergere');
    }
  };

  return (
    <div style={mc.overlay} onClick={onClose}>
      <div style={mc.modal} onClick={e => e.stopPropagation()}>
        <div style={mc.header}>
          <h2 style={mc.title}>📷 Galerie — {proprietate.nume}</h2>
          <button onClick={onClose} style={mc.closeBtn}>✕</button>
        </div>
        {eroare && <div style={mc.msgErr}>{eroare}</div>}
        <label style={pz.uploadBtn}>
          {seIncarca ? 'Se încarcă...' : '+ Adaugă imagine'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={laSelectFisier} disabled={seIncarca} style={{ display: 'none' }} />
        </label>
        {imagini.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '1rem 0' }}>Nicio imagine adăugată încă.</p>
        ) : (
          <div style={pz.grid}>
            {imagini.map(img => (
              <div key={img.id} style={pz.item}>
                <img src={img.urlImagine} alt="" style={pz.img} />
                <button onClick={() => sterge(img.id)} style={pz.delBtn}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TIP_OPTIONS = ['SINGLE', 'DOUBLE', 'TWIN', 'SUITE'];
const FORM_GOL: Omit<Camera, 'id'> = {
  proprietateId: 0, nume: '', descriere: '', tip: 'DOUBLE',
  capacitate: 2, pretPeNoapte: 200, disponibila: true,
};

interface ImagineCamera { id: number; urlImagine: string; }

function SectiunePozeCamera({ cameraId }: { cameraId: number }) {
  const [imagini, setImagini] = useState<ImagineCamera[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    api.get(`/imagini-camere?cameraId=${cameraId}`).then(r => setImagini(r.data));
  }, [cameraId]);

  const laSelectFisier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imagini.length >= 5) { setEroare('Maxim 5 poze per cameră'); return; }
    if (f.size > 5 * 1024 * 1024) { setEroare('Imaginea depășește 5 MB'); return; }
    setEroare(''); setSeIncarca(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const { data: upload } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: img } = await api.post('/imagini-camere', { cameraId, urlImagine: upload.url });
      setImagini(prev => [...prev, img]);
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la upload');
    } finally {
      setSeIncarca(false);
      e.target.value = '';
    }
  };

  const sterge = async (id: number) => {
    if (!confirm('Ștergi această poză?')) return;
    await api.delete(`/imagini-camere/${id}`);
    setImagini(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={pzc.wrap}>
      <div style={pzc.header}>
        <span style={pzc.label}>📷 Poze cameră ({imagini.length}/5)</span>
        {imagini.length < 5 && (
          <label style={pzc.uploadBtn}>
            {seIncarca ? 'Se încarcă...' : '+ Adaugă poză'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={laSelectFisier} disabled={seIncarca} style={{ display: 'none' }} />
          </label>
        )}
      </div>
      {eroare && <div style={pzc.eroare}>{eroare}</div>}
      {imagini.length > 0 && (
        <div style={pzc.grid}>
          {imagini.map(img => (
            <div key={img.id} style={pzc.item}>
              <img src={img.urlImagine} alt="" style={pzc.img} />
              <button onClick={() => sterge(img.id)} style={pzc.delBtn}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Culorile badge-urilor pentru fiecare status de rezervare (folosite in TabelRezervari)
const culoriStatus: Record<string, string> = {
  PENDING: '#febb02', CONFIRMATA: '#28a745', ANULATA: '#dc3545', FINALIZATA: '#6c757d',
};

// Tabel cu rezervarile primite; primeste datele si callback-urile din componenta parinte
function TabelRezervari({
  rezervari, necitite, onAnuleaza, onChat,
}: {
  rezervari: Rezervare[];
  necitite: Record<number, number>;
  onAnuleaza: (id: number) => void;
  onChat: (r: Rezervare) => void;
}) {
  return (
    <table style={styles.table}>
      <thead>
        <tr style={styles.thead}>
          <th style={styles.th}>Client</th>
          <th style={styles.th}>Cazare / Cameră</th>
          <th style={styles.th}>Perioadă</th>
          <th style={styles.th}>Persoane</th>
          <th style={styles.th}>Total</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        {rezervari.map(r => {
          const mesajeNoi = necitite[r.id] || 0;
          return (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>
                <strong>{r.numeUtilizator}</strong><br />
                <small style={{ color: '#888' }}>{r.emailUtilizator}</small>
              </td>
              <td style={styles.td}>
                <strong>{r.numeProprietate}</strong><br />
                <small>{r.numeCamera}</small>
              </td>
              <td style={styles.td}>{r.dataCheckIn} → {r.dataCheckOut}</td>
              <td style={styles.td}>{r.nrPersoane}</td>
              <td style={styles.td}><strong>{r.pretTotal} RON</strong></td>
              <td style={styles.td}>
                <span style={{
                  background: culoriStatus[r.status] || '#888',
                  color: '#fff', padding: '3px 9px', borderRadius: '10px',
                  fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {r.status}
                </span>
              </td>
              <td style={styles.td}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {r.status !== 'ANULATA' && r.status !== 'FINALIZATA' && (
                    <button onClick={() => onAnuleaza(r.id)} style={{ ...styles.actionBtn, background: '#dc3545' }}>
                      ✕ Anulează
                    </button>
                  )}
                  {r.status !== 'ANULATA' && (
                    <button onClick={() => onChat(r)} style={styles.chatBtn}>
                      💬
                      {mesajeNoi > 0 && (
                        <span style={styles.notifBadge}>{mesajeNoi}</span>
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ModalCamere({
  proprietate,
  onClose,
}: {
  proprietate: Proprietate;
  onClose: () => void;
}) {
  const [camere, setCamere] = useState<Camera[]>([]);
  const [form, setForm] = useState<Omit<Camera, 'id'>>({ ...FORM_GOL, proprietateId: proprietate.id });
  const [editId, setEditId] = useState<number | null>(null);
  const [aratForm, setAratForm] = useState(false);
  const [mesaj, setMesaj] = useState('');
  const [eroare, setEroare] = useState('');
  const [cameraPozeId, setCameraPozeId] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/camere?proprietateId=${proprietate.id}`).then(r => setCamere(r.data));
  }, [proprietate.id]);

  const deschideAdauga = () => {
    setForm({ ...FORM_GOL, proprietateId: proprietate.id });
    setEditId(null); setAratForm(true); setMesaj(''); setEroare(''); setCameraPozeId(null);
  };

  const deschideEditeaza = (c: Camera) => {
    setForm({ proprietateId: c.proprietateId, nume: c.nume, descriere: c.descriere,
      tip: c.tip, capacitate: c.capacitate, pretPeNoapte: c.pretPeNoapte, disponibila: c.disponibila });
    setEditId(c.id); setAratForm(true); setMesaj(''); setEroare(''); setCameraPozeId(c.id);
  };

  const salveaza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        const { data } = await api.put(`/camere/${editId}`, form);
        setCamere(prev => prev.map(c => c.id === editId ? data : c));
        setMesaj('Camera a fost actualizată.');
        setCameraPozeId(editId);
      } else {
        const { data } = await api.post('/camere', form);
        setCamere(prev => [...prev, data]);
        setMesaj('Camera adăugată! Poți adăuga poze mai jos.');
        setCameraPozeId(data.id);
      }
      setAratForm(false); setEditId(null);
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la salvare');
    }
  };

  const sterge = async (id: number) => {
    if (!confirm('Ștergi această cameră?')) return;
    try {
      await api.delete(`/camere/${id}`);
      setCamere(prev => prev.filter(c => c.id !== id));
      setMesaj('Camera a fost ștearsă.');
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Nu se poate șterge');
    }
  };

  return (
    <div style={mc.overlay} onClick={onClose}>
      <div style={mc.modal} onClick={e => e.stopPropagation()}>
        <div style={mc.header}>
          <h2 style={mc.title}>🛏️ Camere — {proprietate.nume}</h2>
          <button onClick={onClose} style={mc.closeBtn}>✕</button>
        </div>

        {mesaj && <div style={mc.msgOk}>{mesaj}</div>}
        {eroare && <div style={mc.msgErr}>{eroare}</div>}

        <button onClick={deschideAdauga} style={mc.addBtn}>+ Adaugă cameră nouă</button>

        {aratForm && (
          <div style={mc.formCard}>
            <h3 style={{ margin: '0 0 0.8rem', color: '#003580', fontSize: '0.95rem' }}>
              {editId !== null ? 'Editează camera' : 'Cameră nouă'}
            </h3>
            <form onSubmit={salveaza} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={mc.formRow}>
                <div style={mc.field}>
                  <label style={mc.label}>Nume*</label>
                  <input style={mc.input} value={form.nume}
                    onChange={e => setForm(f => ({ ...f, nume: e.target.value }))} required />
                </div>
                <div style={mc.field}>
                  <label style={mc.label}>Tip*</label>
                  <select style={mc.input} value={form.tip}
                    onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}>
                    {TIP_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={mc.formRow}>
                <div style={mc.field}>
                  <label style={mc.label}>Capacitate</label>
                  <input style={mc.input} type="number" min={1} max={20} value={form.capacitate}
                    onChange={e => setForm(f => ({ ...f, capacitate: +e.target.value }))} required />
                </div>
                <div style={mc.field}>
                  <label style={mc.label}>Preț/noapte (RON)</label>
                  <input style={mc.input} type="number" min={1} step="0.01" value={form.pretPeNoapte}
                    onChange={e => setForm(f => ({ ...f, pretPeNoapte: +e.target.value }))} required />
                </div>
              </div>
              <div style={mc.field}>
                <label style={mc.label}>Descriere</label>
                <input style={mc.input} value={form.descriere}
                  onChange={e => setForm(f => ({ ...f, descriere: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" id="dispMod" checked={form.disponibila}
                  onChange={e => setForm(f => ({ ...f, disponibila: e.target.checked }))} />
                <label htmlFor="dispMod" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Disponibilă</label>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="submit" style={mc.saveBtn}>
                  {editId !== null ? 'Salvează' : 'Adaugă'}
                </button>
                <button type="button" onClick={() => { setAratForm(false); setEditId(null); }} style={mc.cancelBtn}>
                  Anulează
                </button>
              </div>
            </form>
          </div>
        )}

        {camere.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '1rem 0' }}>
            Nicio cameră adăugată încă. Adaugă prima cameră!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem' }}>
            {camere.map(c => (
              <div key={c.id} style={mc.cameraRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                    <strong>{c.nume}</strong>
                    <span style={mc.tipTag}>{c.tip}</span>
                    <StatusOcupare c={c} />
                  </div>
                  <span style={{ color: '#888', fontSize: '0.82rem' }}>
                    {c.capacitate} pers. · {c.pretPeNoapte} RON/noapte
                    {c.descriere && ` · ${c.descriere}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => deschideEditeaza(c)} style={mc.editBtn}>Editează</button>
                  <button onClick={() => sterge(c.id)} style={mc.deleteBtn}>Șterge</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cameraPozeId !== null && (
          <SectiunePozeCamera key={cameraPozeId} cameraId={cameraPozeId} />
        )}
      </div>
    </div>
  );
}

export default function CazarileMele() {
  const [proprietati, setProprietati] = useState<Proprietate[]>([]);
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [seIncarca, setSeIncarca] = useState(true);
  const [mesaj, setMesaj] = useState('');
  const [proprietateEditare, setProprietateEditare] = useState<Proprietate | null>(null);
  const [necitite, setNecitite] = useState<Record<number, number>>({});
  const [chatRezervareId, setChatRezervareId] = useState<number | null>(null);
  const [chatTitlu, setChatTitlu] = useState('');
  const [proprietateCamere, setProprietateCamere] = useState<Proprietate | null>(null);
  const [proprietatePoze, setProprietatePoze] = useState<Proprietate | null>(null);

  // La montarea componentei, incarca in paralel proprietatile, rezervarile si mesajele necitite
  useEffect(() => {
    Promise.all([
      api.get('/proprietati/ale-mele'),
      api.get('/rezervari/pentru-cazarile-mele'),
      api.get('/mesaje/necitite'),
    ]).then(([p, r, n]) => {
      setProprietati(p.data);
      setRezervari(r.data);
      setNecitite(n.data);
      setSeIncarca(false);
    }).catch(() => setSeIncarca(false));
  }, []);

  // Anuleaza o rezervare ca proprietar si actualizeaza lista locala
  const anuleazaRezervare = async (id: number) => {
    if (!confirm('Ești sigur că vrei să anulezi această rezervare?')) return;
    try {
      await api.put(`/rezervari/${id}/anuleaza-proprietar`);
      setRezervari(prev => prev.map(r => r.id === id ? { ...r, status: 'ANULATA' } : r));
      setMesaj('Rezervare anulată.');
    } catch (e: any) {
      setMesaj('❌ ' + (e.response?.data?.eroare || 'Eroare la anulare'));
    }
  };

  // Deschide fereastra de chat pentru rezervarea selectata
  const deschideChat = (r: Rezervare) => {
    setChatRezervareId(r.id);
    setChatTitlu(`Chat cu ${r.numeUtilizator} — ${r.numeProprietate}`);
  };

  // Reseteaza contorul de mesaje necitite pentru o rezervare dupa ce chat-ul este deschis
  const laChatCitit = (rezervareId: number) => {
    setNecitite(prev => ({ ...prev, [rezervareId]: 0 }));
  };

  // Afisam doar rezervarile care nu sunt anulate
  const rezervariActive = rezervari.filter(r => r.status !== 'ANULATA');

  if (seIncarca) return <p style={{ textAlign: 'center', padding: '3rem' }}>Se încarcă...</p>;

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>🏠 Cazările mele</h1>
        <Link to="/adauga-cazare" style={styles.addBtn}>+ Adaugă cazare nouă</Link>
      </div>

      {mesaj && <div style={styles.msgBox}>{mesaj}</div>}

      {/* Lista proprietatilor detinute de utilizatorul curent */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Proprietățile mele ({proprietati.length})</h2>
        {proprietati.length === 0 ? (
          <p style={styles.empty}>Nu ai adăugat nicio cazare încă. <Link to="/adauga-cazare">Adaugă prima ta cazare!</Link></p>
        ) : (
          <div style={styles.propGrid}>
            {proprietati.map(p => (
              <div key={p.id} style={styles.propCard}>
                <div style={styles.propHeader}>
                  <h3 style={styles.propNume}>{p.nume}</h3>
                </div>
                <p style={styles.propInfo}>
                  📍 {p.oras} · {p.tip}
                  {(p.tip === 'HOTEL' || p.tip === 'VILA') && p.stele ? ` · ${'★'.repeat(p.stele)}` : ''}
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <Link to={`/proprietati/${p.id}`} style={styles.viewLink}>Vezi pe site →</Link>
                  {p.statusProprietate === 'ACTIVA' && (
                    <>
                      {p.tip !== 'APARTAMENT' && (
                        <button onClick={() => setProprietateCamere(p)} style={styles.camereBtn}>
                          🛏️ Camere
                        </button>
                      )}
                      <button onClick={() => setProprietatePoze(p)} style={styles.pozeBtn}>
                        📷 Poze
                      </button>
                    </>
                  )}
                  <button onClick={() => setProprietateEditare(p)} style={styles.editProprBtn}>
                    ✏️ Editează
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabelul cu rezervarile primite pe toate proprietatile proprietarului */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Rezervări primite ({rezervariActive.length})</h2>
        {rezervariActive.length === 0 ? (
          <p style={styles.empty}>Nicio rezervare încă.</p>
        ) : (
          <TabelRezervari
            rezervari={rezervariActive}
            necitite={necitite}
            onAnuleaza={anuleazaRezervare}
            onChat={deschideChat}
          />
        )}
      </div>

      {/* Modalul de chat, vizibil doar cand o rezervare este selectata */}
      {chatRezervareId !== null && (
        <ChatModal
          rezervareId={chatRezervareId}
          titlu={chatTitlu}
          onClose={() => setChatRezervareId(null)}
          onRead={() => laChatCitit(chatRezervareId)}
        />
      )}

      {proprietateCamere !== null && (
        <ModalCamere
          proprietate={proprietateCamere}
          onClose={() => setProprietateCamere(null)}
        />
      )}

      {proprietatePoze !== null && (
        <ModalPoze
          proprietate={proprietatePoze}
          onClose={() => setProprietatePoze(null)}
        />
      )}

      {proprietateEditare !== null && (
        <ModalEditareProprietate
          proprietate={proprietateEditare}
          onClose={() => setProprietateEditare(null)}
          onSalvat={updated => {
            setProprietati(prev => prev.map(p => p.id === updated.id ? updated : p));
            setMesaj('✅ Proprietatea a fost actualizată.');
          }}
          onSters={id => {
            setProprietati(prev => prev.filter(p => p.id !== id));
            setMesaj('Proprietatea a fost ștearsă.');
          }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#003580', fontSize: '1.8rem' },
  addBtn: { background: '#febb02', color: '#003580', padding: '10px 18px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' },
  msgBox: { background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #c3e6cb' },
  section: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { margin: '0 0 1rem', color: '#003580', fontSize: '1.1rem' },
  empty: { color: '#888', margin: 0 },
  propGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  propCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  propHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  propNume: { margin: 0, color: '#003580', fontSize: '1rem', flex: 1 },
  statusBadge: { borderRadius: '12px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  propInfo: { margin: 0, color: '#666', fontSize: '0.9rem' },
  viewLink: { color: '#0071c2', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 600 },
  camereBtn: { background: '#f0f4ff', border: '1px solid #0071c2', color: '#003580', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  pozeBtn: { background: '#fff8e1', border: '1px solid #febb02', color: '#856404', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  editProprBtn: { background: '#f0f4ff', border: '1px solid #003580', color: '#003580', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#003580', color: '#fff' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.88rem' },
  td: { padding: '10px 12px', fontSize: '0.88rem', verticalAlign: 'middle' },
  actionBtn: { color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  chatBtn: { position: 'relative', background: '#f0f4ff', border: '1px solid #0071c2', color: '#003580', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 },
  notifBadge: { position: 'absolute', top: '-6px', right: '-6px', background: '#dc3545', color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
};

const mc: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.8rem', width: '100%', maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { margin: 0, color: '#003580', fontSize: '1.15rem' },
  closeBtn: { background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
  addBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', marginBottom: '1rem' },
  msgOk: { background: '#d4edda', color: '#155724', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', border: '1px solid #c3e6cb', fontSize: '0.88rem' },
  msgErr: { background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', border: '1px solid #f5c6cb', fontSize: '0.88rem' },
  formCard: { background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '3px' },
  label: { fontSize: '0.82rem', color: '#555', fontWeight: 600 },
  input: { padding: '7px 9px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' },
  saveBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #aaa', color: '#555', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem' },
  cameraRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', border: '1px solid #e0e0e0', borderRadius: '6px', gap: '0.5rem' },
  tipTag: { background: '#e8f4fd', color: '#003580', padding: '2px 7px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, marginLeft: '6px' },
  editBtn: { background: '#febb02', color: '#003580', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  deleteBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' },
};

const pz: Record<string, React.CSSProperties> = {
  uploadBtn: { display: 'inline-block', background: '#003580', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem', marginTop: '0.4rem' },
  item: { position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e0e0e0' },
  img: { width: '100%', height: '100px', objectFit: 'cover', display: 'block' },
  delBtn: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,53,69,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

const me: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.8rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' },
  title: { margin: 0, color: '#003580', fontSize: '1.1rem' },
  closeBtn: { background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '3px' },
  label: { fontSize: '0.82rem', color: '#555', fontWeight: 600 },
  input: { padding: '7px 9px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', width: '100%', boxSizing: 'border-box' },
  preview: { width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e0e0e0', marginBottom: '0.3rem' },
  btnRow: { display: 'flex', gap: '0.7rem', marginBottom: '0' },
  saveBtn: { background: '#003580', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #aaa', color: '#555', padding: '9px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem' },
  separator: { borderTop: '1px solid #e0e0e0', margin: '1.2rem 0 1rem' },
  dangerZone: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '0.8rem 1rem' },
  dangerLabel: { fontSize: '0.85rem', fontWeight: 700, color: '#721c24' },
  deleteBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  msgOk: { background: '#d4edda', color: '#155724', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', fontSize: '0.88rem' },
  msgErr: { background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', fontSize: '0.88rem' },
};

const pzc: Record<string, React.CSSProperties> = {
  wrap: { marginTop: '1rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
  label: { fontSize: '0.88rem', fontWeight: 700, color: '#003580' },
  uploadBtn: { display: 'inline-block', background: '#0071c2', color: '#fff', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  eroare: { background: '#f8d7da', color: '#721c24', padding: '6px 10px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '0.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' },
  item: { position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e0e0e0' },
  img: { width: '100%', height: '80px', objectFit: 'cover', display: 'block' },
  delBtn: { position: 'absolute', top: '3px', right: '3px', background: 'rgba(220,53,69,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

const ocup: Record<string, React.CSSProperties> = {
  rosu:   { background: '#f8d7da', color: '#721c24', padding: '2px 7px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
  galben: { background: '#fff3cd', color: '#856404', padding: '2px 7px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
  verde:  { background: '#d4edda', color: '#155724', padding: '2px 7px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
};
