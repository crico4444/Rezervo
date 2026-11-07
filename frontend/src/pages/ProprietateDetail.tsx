import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Componenta care afiseaza un criteriu de recenzie cu rating si un comentariu expandabil
function CriteriuRow({ emoji, label, val, comentariu }: { emoji: string; label: string; val: number; comentariu?: string }) {
  const [deschis, setDeschis] = useState(false);
  return (
    <div
      onClick={() => comentariu && setDeschis(d => !d)}
      style={{ background: '#f0f4ff', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: comentariu ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#555' }}>
        <span>{emoji} {label}</span>
        <span style={{ color: '#febb02', marginLeft: 'auto' }}>{'★'.repeat(val)}{'☆'.repeat(5 - val)}</span>
        {comentariu && <span style={{ fontSize: '0.8rem' }}>{deschis ? '▲' : '⚠️'}</span>}
      </div>
      {/* Comentariul detaliat apare doar daca utilizatorul apasa pe criteriu */}
      {deschis && comentariu && (
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#856404', background: '#fff3cd', borderRadius: '4px', padding: '4px 8px' }}>
          {comentariu}
        </p>
      )}
    </div>
  );
}

// Slider mare pentru poza principala + galeria proprietatii
function SliderPrincipal({ urls, onClickImagine }: { urls: string[]; onClickImagine: (url: string) => void }) {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) {
    return <div style={sp.placeholder}>🏨</div>;
  }
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length); };
  return (
    <div style={sp.wrap} onClick={() => onClickImagine(urls[idx])}>
      <img src={urls[idx]} alt="" style={sp.img} />
      {urls.length > 1 && (
        <>
          <button style={{ ...sp.arrow, left: '12px' }} onClick={prev}>‹</button>
          <button style={{ ...sp.arrow, right: '12px' }} onClick={next}>›</button>
          <div style={sp.counter}>{idx + 1} / {urls.length}</div>
          <div style={sp.dots}>
            {urls.map((_, i) => (
              <span
                key={i}
                style={{ ...sp.dot, background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)' }}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Slider simplu pentru imaginile unei camere
function SliderCamera({ imagini }: { imagini: { id: number; urlImagine: string }[] }) {
  const [idx, setIdx] = useState(0);
  if (imagini.length === 0) {
    return <div style={sl.placeholder}>🛏️</div>;
  }
  return (
    <div style={sl.wrap}>
      <img src={imagini[idx].urlImagine} alt="" style={sl.img} />
      {imagini.length > 1 && (
        <>
          <button style={{ ...sl.arrow, left: '6px' }} onClick={() => setIdx(i => (i - 1 + imagini.length) % imagini.length)}>‹</button>
          <button style={{ ...sl.arrow, right: '6px' }} onClick={() => setIdx(i => (i + 1) % imagini.length)}>›</button>
          <div style={sl.dots}>
            {imagini.map((_, i) => (
              <span key={i} style={{ ...sl.dot, background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)' }} onClick={() => setIdx(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componenta pentru selectarea unui rating 1-5 prin click pe stele
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span style={{ fontSize: '1.4rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(stea => (
        <span key={stea} onClick={() => onChange(stea)} style={{ color: stea <= value ? '#febb02' : '#ccc' }}>★</span>
      ))}
    </span>
  );
}

interface Proprietate {
  id: number; nume: string; descriere: string; adresa: string;
  oras: string; tara: string; tip: string; stele: number; imaginePrincipala?: string;
  ratingMediu?: number; numarRecenzii?: number;
  nrCamere?: number; capacitate?: number; pretPeNoapte?: number; cameraVirtualaId?: number;
  numeProprietar?: string; scorProprietar?: number; numarRecenziiProprietar?: number;
}
interface Camera {
  id: number; nume: string; tip: string; capacitate: number; pretPeNoapte: number; disponibila: boolean;
  disponibilaInPerioada?: boolean;
}
interface Recenzie {
  id: number; numeUtilizator: string; rating: number; comentariu: string; creatLa: string;
  curatenie?: number; locatie?: number; utilitati?: number; personal?: number; raportCalitatePret?: number;
}

export default function ProprietateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigheaza = useNavigate();

  const [proprietate, setProprietate] = useState<Proprietate | null>(null);
  const [camere, setCamere] = useState<Camera[]>([]);
  const [recenzii, setRecenzii] = useState<Recenzie[]>([]);
  const [imagini, setImagini] = useState<{ id: number; urlImagine: string }[]>([]);
  const [imaginiCamere, setImaginiCamere] = useState<Record<number, { id: number; urlImagine: string }[]>>({});
  const [imagineActiva, setImagineActiva] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [nrPersoane, setNrPersoane] = useState(1);
  const [mesaj, setMesaj] = useState('');

  const [poateRecenza, setPoateRecenza] = useState(false);
  const [formularRecenzie, setFormularRecenzie] = useState({
    curatenie: 5, locatie: 5, utilitati: 5, personal: 5, raportCalitatePret: 5,
    comentariuCuratenie: '', comentariuLocatie: '', comentariuUtilitati: '',
    comentariuPersonal: '', comentariuRaportCalitatePret: '', comentariu: '',
  });
  const [mesajRecenzie, setMesajRecenzie] = useState('');

  // La montare, incarca datele proprietatii, camerele si recenziile;
  // daca utilizatorul e autentificat, verifica si daca poate lasa recenzie
  useEffect(() => {
    api.get(`/proprietati/${id}`).then(r => setProprietate(r.data));
    api.get(`/camere?proprietateId=${id}`).then(r => setCamere(r.data));
    api.get(`/recenzii?proprietateId=${id}`).then(r => setRecenzii(r.data));
    api.get(`/imagini?proprietateId=${id}`).then(r => setImagini(r.data));
    api.get(`/imagini-camere?proprietateId=${id}`).then(r => {
      const grouped: Record<number, { id: number; urlImagine: string }[]> = {};
      for (const img of r.data) {
        if (!grouped[img.cameraId]) grouped[img.cameraId] = [];
        grouped[img.cameraId].push(img);
      }
      setImaginiCamere(grouped);
    });
    if (user) {
      api.get(`/recenzii/poate-recenza/${id}`).then(r => setPoateRecenza(r.data));
    }
  }, [id, user]);

  // Cauta camerele disponibile in intervalul de date selectat si actualizeaza lista
  const cautaCamere = async () => {
    if (!checkIn || !checkOut) return;
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const { data } = await api.get(`/camere?proprietateId=${id}&checkIn=${fmt(checkIn)}&checkOut=${fmt(checkOut)}`);
    setCamere(data);
  };

  // Actualizeaza un camp din formularul de recenzie
  const setCampRecenzie = (camp: string, valoare: any) =>
    setFormularRecenzie(f => ({ ...f, [camp]: valoare }));

  // Trimite recenzia la server si o adauga local in lista fara reincarcarea paginii
  const trimiteRecenzie = async () => {
    try {
      const { data } = await api.post('/recenzii', { ...formularRecenzie, proprietateId: Number(id) });
      setRecenzii(prev => [data, ...prev]);
      setPoateRecenza(false);
      setMesajRecenzie('✅ Recenzia ta a fost adaugata!');
    } catch (e: any) {
      setMesajRecenzie('❌ ' + (e.response?.data?.eroare || 'Eroare la trimitere'));
    }
  };

  // Creeaza o rezervare pentru camera selectata cu datele introduse;
  // daca utilizatorul nu e autentificat, redirectioneaza la login
  const rezerva = async (cameraId: number, _pretPeNoapte: number) => {
    if (!user) { navigheaza('/login'); return; }
    if (!checkIn || !checkOut) { setMesaj('Selectați datele de check-in și check-out'); return; }
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    try {
      await api.post('/rezervari', { cameraId, dataCheckIn: fmt(checkIn), dataCheckOut: fmt(checkOut), nrPersoane });
      setMesaj('✅ Rezervare efectuata cu succes!');
    } catch (e: any) {
      setMesaj('❌ ' + (e.response?.data?.eroare || 'Eroare la rezervare'));
    }
  };

  if (!proprietate) return <p style={{ textAlign: 'center', padding: '3rem' }}>Se încarcă...</p>;

  const areStele = (proprietate.tip === 'HOTEL' || proprietate.tip === 'VILA') && proprietate.stele > 0;
  const sirStele = areStele ? '★'.repeat(proprietate.stele) + '☆'.repeat(5 - proprietate.stele) : null;

  const queryHarta = encodeURIComponent(`${proprietate.adresa}, ${proprietate.oras}, ${proprietate.tara}`);
  const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${queryHarta}`;
  const urlEmbed = `https://maps.google.com/maps?q=${queryHarta}&output=embed&z=15`;

  const toateUrlurileImagini = [
    ...(proprietate.imaginePrincipala ? [proprietate.imaginePrincipala] : []),
    ...imagini.map(i => i.urlImagine),
  ];

  return (
    <div style={styles.wrap}>
      {/* Slider cu poza principala + galerie */}
      <SliderPrincipal urls={toateUrlurileImagini} onClickImagine={setImagineActiva} />

      {/* Lightbox */}
      {imagineActiva && (
        <div style={gl.overlay} onClick={() => setImagineActiva(null)}>
          <img src={imagineActiva} alt="" style={gl.lightboxImg} />
          <button style={gl.closeBtn} onClick={() => setImagineActiva(null)}>✕</button>
        </div>
      )}

      {/* Header: tipul, numele, locatia, stelele si ratingul mediu */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <span style={styles.tipBadge}>{proprietate.tip}</span>
          <h1 style={styles.title}>{proprietate.nume}</h1>
          <p style={styles.loc}>📍 {proprietate.adresa}, {proprietate.oras}, {proprietate.tara}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {sirStele && <span style={styles.stars} title="Clasificare oficiala">{sirStele}</span>}
            {proprietate.ratingMediu != null && (
              <a href="#recenzii" style={{ ...styles.ratingBadge, textDecoration: 'none' }}>
                ⭐ {proprietate.ratingMediu.toFixed(1)} / 5
                <span style={{ fontWeight: 400, marginLeft: '4px' }}>({proprietate.numarRecenzii} {proprietate.numarRecenzii === 1 ? 'recenzie' : 'recenzii'})</span>
              </a>
            )}
          </div>
          {proprietate.descriere && <p style={styles.desc}>{proprietate.descriere}</p>}
          {proprietate.numeProprietar && (
            <div style={prop.card}>
              <div style={prop.avatar}>{proprietate.numeProprietar.charAt(0).toUpperCase()}</div>
              <div>
                <div style={prop.label}>Proprietar</div>
                <div style={prop.nume}>{proprietate.numeProprietar}</div>
                {proprietate.scorProprietar != null ? (
                  <div style={prop.scor}>
                    <span style={prop.badge}>⭐ {proprietate.scorProprietar.toFixed(1)}</span>
                    <span style={prop.recenzii}>{proprietate.numarRecenziiProprietar} {proprietate.numarRecenziiProprietar === 1 ? 'recenzie' : 'recenzii'} primite</span>
                  </div>
                ) : (
                  <div style={prop.recenzii}>Nicio recenzie încă</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Harta Google Maps cu locatia proprietatii */}
      <div style={styles.section}>
        <h2>📍 Locație</h2>
        <p style={{ margin: '0 0 0.8rem', color: '#555', fontSize: '0.92rem' }}>
          {proprietate.adresa}, {proprietate.oras}, {proprietate.tara}
        </p>
        <div style={harta.wrap}>
          <iframe
            title="Locatie proprietate"
            src={urlEmbed}
            style={harta.iframe}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={urlGoogleMaps}
            target="_blank"
            rel="noopener noreferrer"
            style={harta.overlay}
            title="Deschide în Google Maps"
          />
        </div>
        <a
          href={urlGoogleMaps}
          target="_blank"
          rel="noopener noreferrer"
          style={harta.btn}
        >
          🗺️ Deschide în Google Maps
        </a>
      </div>

      {proprietate.tip === 'APARTAMENT' ? (
        /* Sectiunea de rezervare pentru apartamente */
        <div style={styles.section}>
          <h2>Rezervă apartamentul</h2>
          <div style={apt.infoRow}>
            <div style={apt.pretBox}>
              <span style={apt.pretVal}>{proprietate.pretPeNoapte} RON</span>
              <span style={apt.pretLabel}>per noapte</span>
            </div>
            <div style={apt.details}>
              {proprietate.nrCamere != null && <span>🏠 {proprietate.nrCamere} {proprietate.nrCamere === 1 ? 'cameră' : 'camere'}</span>}
              {proprietate.capacitate != null && <span>👥 max {proprietate.capacitate} persoane</span>}
            </div>
          </div>
          <div style={styles.dateRow}>
            <div>
              <label>Check-in: </label>
              <DatePicker selected={checkIn} onChange={(d: Date | null) => setCheckIn(d)} dateFormat="dd/MM/yyyy"
                minDate={new Date()} placeholderText="Selectează data" />
            </div>
            <div>
              <label>Check-out: </label>
              <DatePicker selected={checkOut} onChange={(d: Date | null) => setCheckOut(d)} dateFormat="dd/MM/yyyy"
                minDate={checkIn || new Date()} placeholderText="Selectează data" />
            </div>
            <div>
              <label>Persoane: </label>
              <input type="number" min={1} max={proprietate.capacitate || 20} value={nrPersoane}
                onChange={e => setNrPersoane(+e.target.value)} style={styles.nrInput} />
            </div>
          </div>
          <button
            onClick={() => proprietate.cameraVirtualaId && rezerva(proprietate.cameraVirtualaId, proprietate.pretPeNoapte || 0)}
            style={{ ...styles.rezervaBtn, padding: '12px 28px', fontSize: '1rem', marginTop: '1rem' }}
          >
            Rezervă apartamentul
          </button>
          {mesaj && <p style={{ marginTop: '1rem', color: mesaj.startsWith('✅') ? 'green' : 'red' }}>{mesaj}</p>}
        </div>
      ) : (
        <>
          {/* Selectorul de date pentru verificarea disponibilitatii camerelor */}
          <div style={styles.section}>
            <h2>Verifică disponibilitatea</h2>
            <div style={styles.dateRow}>
              <div>
                <label>Check-in: </label>
                <DatePicker selected={checkIn} onChange={(d: Date | null) => setCheckIn(d)} dateFormat="dd/MM/yyyy"
                  minDate={new Date()} placeholderText="Selectează data" />
              </div>
              <div>
                <label>Check-out: </label>
                <DatePicker selected={checkOut} onChange={(d: Date | null) => setCheckOut(d)} dateFormat="dd/MM/yyyy"
                  minDate={checkIn || new Date()} placeholderText="Selectează data" />
              </div>
              <div>
                <label>Persoane: </label>
                <input type="number" min={1} max={10} value={nrPersoane}
                  onChange={e => setNrPersoane(+e.target.value)} style={styles.nrInput} />
              </div>
              <button onClick={cautaCamere} style={styles.searchBtn}>Verifică</button>
            </div>
            {mesaj && <p style={{ marginTop: '1rem', color: mesaj.startsWith('✅') ? 'green' : 'red' }}>{mesaj}</p>}
          </div>

          {/* Grila de camere — toate camerele, cele ocupate apar cu gri */}
          <div style={styles.section}>
            <h2>Camere disponibile</h2>
            {camere.length === 0 ? (
              <p style={{ color: '#888' }}>Nu există camere.</p>
            ) : (
              <div style={styles.camereGrid}>
                {camere.map(c => {
                  const indisponibila = c.disponibilaInPerioada === false;
                  return (
                    <div key={c.id} style={{ ...styles.cameraCard, ...(indisponibila ? styles.cameraCardIndisponibila : {}) }}>
                      <div style={{ position: 'relative' }}>
                        <SliderCamera imagini={imaginiCamere[c.id] ?? []} />
                        {indisponibila && (
                          <div style={styles.cameraIndisponibilBadge}>Indisponibilă în perioada selectată</div>
                        )}
                      </div>
                      <h3 style={{ ...styles.cameraTitle, marginTop: '0.7rem', color: indisponibila ? '#999' : '#003580' }}>{c.nume}</h3>
                      <p style={{ color: indisponibila ? '#bbb' : undefined }}>Tip: <strong>{c.tip}</strong></p>
                      <p style={{ color: indisponibila ? '#bbb' : undefined }}>Capacitate: <strong>{c.capacitate} persoane</strong></p>
                      <p style={{ ...styles.pret, color: indisponibila ? '#bbb' : '#003580' }}>💰 {c.pretPeNoapte} RON / noapte</p>
                      {indisponibila ? (
                        <button disabled style={{ ...styles.rezervaBtn, background: '#ccc', cursor: 'not-allowed' }}>
                          Indisponibilă
                        </button>
                      ) : (
                        <button onClick={() => rezerva(c.id, c.pretPeNoapte)} style={styles.rezervaBtn}>
                          Rezervă acum
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Formularul de recenzie cu 5 criterii, afisibil doar daca utilizatorul are dreptul sa recenzeze */}
      {poateRecenza && (
        <div style={styles.section}>
          <h2>Lasă o recenzie</h2>
          {mesajRecenzie && (
            <p style={{ color: mesajRecenzie.startsWith('✅') ? 'green' : 'red', marginBottom: '1rem' }}>{mesajRecenzie}</p>
          )}
          {([
            { label: 'Curățenie', camp: 'curatenie', campComent: 'comentariuCuratenie' },
            { label: 'Locație', camp: 'locatie', campComent: 'comentariuLocatie' },
            { label: 'Utilități', camp: 'utilitati', campComent: 'comentariuUtilitati' },
            { label: 'Personal', camp: 'personal', campComent: 'comentariuPersonal' },
            { label: 'Raport calitate-preț', camp: 'raportCalitatePret', campComent: 'comentariuRaportCalitatePret' },
          ] as const).map(({ label, camp, campComent }) => (
            <div key={camp} style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ minWidth: '160px', fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                <StarRating
                  value={(formularRecenzie as any)[camp]}
                  onChange={v => setCampRecenzie(camp, v)}
                />
                <span style={{ fontSize: '0.85rem', color: '#888' }}>
                  {(formularRecenzie as any)[camp]}/5
                </span>
              </div>
              {/* Textarea pentru comentariu negativ apare doar la note de 3 sau mai mici */}
              {(formularRecenzie as any)[camp] <= 3 && (
                <textarea
                  placeholder={`Ce nu a fost în regulă la ${label.toLowerCase()}?`}
                  value={(formularRecenzie as any)[campComent]}
                  onChange={e => setCampRecenzie(campComent, e.target.value)}
                  rows={2}
                  style={{ ...styles.textarea, marginTop: '0.4rem', marginLeft: '176px' }}
                />
              )}
            </div>
          ))}
          <div style={{ marginTop: '0.8rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Comentariu general (opțional)</label>
            <textarea
              placeholder="Descrie experiența ta..."
              value={formularRecenzie.comentariu}
              onChange={e => setCampRecenzie('comentariu', e.target.value)}
              rows={3}
              style={{ ...styles.textarea, marginTop: '0.4rem' }}
            />
          </div>
          {/* Nota totala calculata ca medie a celor 5 criterii */}
          <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>
              Nota totală (medie):&nbsp;
              <strong style={{ color: '#003580', fontSize: '1rem' }}>
                {((formularRecenzie.curatenie + formularRecenzie.locatie + formularRecenzie.utilitati +
                    formularRecenzie.personal + formularRecenzie.raportCalitatePret) / 5).toFixed(1)} / 5
              </strong>
            </span>
            <button onClick={trimiteRecenzie} style={styles.rezervaBtn}>Trimite recenzia</button>
          </div>
        </div>
      )}

      {/* Lista recenziilor lasate de utilizatori pentru aceasta proprietate */}
      <div id="recenzii" style={styles.section}>
        <h2>⭐ Recenzii ({recenzii.length})</h2>
        {recenzii.length === 0 ? (
          <p style={{ color: '#888' }}>Nu există recenzii încă. Fii primul care lasă o recenzie!</p>
        ) : (
          recenzii.map(r => {
            // Parsam campul comentariu care contine general + comentarii per criteriu
            const linii = r.comentariu ? r.comentariu.split('\n').filter(Boolean) : [];
            const general = linii.find(l => l.startsWith('General:'))?.replace('General:', '').trim();
            const detalii = linii.filter(l => l.startsWith('['));

            return (
              <div key={r.id} style={styles.recenzieCard}>
                {/* Header recenzie: avatar, nume, data, nota */}
                <div style={styles.recenzieHeader}>
                  <div style={styles.avatar}>{r.numeUtilizator.charAt(0).toUpperCase()}</div>
                  <div>
                    <strong style={{ color: '#003580' }}>{r.numeUtilizator}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(r.creatLa).toLocaleDateString('ro-RO')}</div>
                  </div>
                  <span style={{ ...styles.ratingNum, marginLeft: 'auto' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.rating}/5</span>
                </div>

                {/* Comentariul general al recenziei */}
                {general && (
                  <p style={styles.comentariuGeneral}>💬 {general}</p>
                )}

                {/* Grila cu cele 5 criterii detaliate, fiecare expandabil */}
                {r.curatenie != null && (
                  <div style={styles.criterii}>
                    {([
                      { label: 'Curățenie',    emoji: '🧹', val: r.curatenie,           backendLabel: 'Curățenie' },
                      { label: 'Locație',       emoji: '📍', val: r.locatie,              backendLabel: 'Locație' },
                      { label: 'Utilități',    emoji: '🔌', val: r.utilitati,            backendLabel: 'Utilități' },
                      { label: 'Personal',      emoji: '👥', val: r.personal,             backendLabel: 'Personal' },
                      { label: 'Calitate/Preț', emoji: '💰', val: r.raportCalitatePret,   backendLabel: 'Raport calitate-preț' },
                    ] as {label:string;emoji:string;val?:number;backendLabel:string}[]).map(({ label, emoji, val, backendLabel }) => {
                      if (val == null) return null;
                      // Cautam comentariul pentru acest criteriu in campul comentariu parsata
                      const linie = detalii.find(d => d.startsWith(`[${backendLabel}]`));
                      const comentariu = linie ? linie.replace(/^\[.*?\]\s*/, '') : undefined;
                      return <CriteriuRow key={label} emoji={emoji} label={label} val={val} comentariu={comentariu} />;
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 2rem' },
  header: { marginBottom: '1.5rem', marginTop: '1.2rem' },
  headerInfo: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  tipBadge: { background: '#003580', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', width: 'fit-content' },
  title: { margin: 0, fontSize: '1.8rem', color: '#003580' },
  loc: { margin: 0, color: '#555' },
  stars: { margin: 0, color: '#febb02', fontSize: '1.2rem' },
  ratingBadge: { background: '#003580', color: '#fff', borderRadius: '6px', padding: '3px 10px', fontSize: '0.9rem', fontWeight: 700 },
  desc: { color: '#444', lineHeight: 1.6 },
  section: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  dateRow: { display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  nrInput: { width: '60px', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' },
  searchBtn: { background: '#febb02', border: 'none', color: '#003580', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' },
  camereGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  cameraCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  cameraCardIndisponibila: { border: '1px solid #d8d8d8', background: '#f9f9f9', opacity: 0.7 },
  cameraIndisponibilBadge: {
    position: 'absolute' as const, bottom: '8px', left: 0, right: 0, textAlign: 'center' as const,
    background: 'rgba(60,60,60,0.82)', color: '#fff',
    fontSize: '0.75rem', fontWeight: 700, padding: '4px 0', letterSpacing: '0.03em',
  },
  cameraTitle: { margin: 0, color: '#003580', fontSize: '1rem' },
  pret: { fontWeight: 700, color: '#003580', fontSize: '1.1rem' },
  rezervaBtn: { background: '#003580', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' },
  recenzieCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.88rem', boxSizing: 'border-box' as const, display: 'block' },
  recenzieHeader: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#003580', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  ratingNum: { background: '#003580', color: '#fff', borderRadius: '4px', padding: '3px 10px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' as const },
  comentariuGeneral: { margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: 1.5, background: '#f8f9fa', borderRadius: '6px', padding: '0.7rem 1rem', fontStyle: 'italic' },
  criterii: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' },
};

const sp: Record<string, React.CSSProperties> = {
  wrap: { position: 'relative', width: '100%', height: '420px', background: '#1a1a1a', overflow: 'hidden', cursor: 'zoom-in' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  placeholder: { width: '100%', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: '#f0f4ff' },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'background 0.2s' },
  counter: { position: 'absolute', top: '14px', right: '16px', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '20px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 600, zIndex: 2 },
  dots: { position: 'absolute', bottom: '14px', width: '100%', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 2 },
  dot: { width: '9px', height: '9px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.4)' },
};

const sl: Record<string, React.CSSProperties> = {
  wrap: { position: 'relative', width: '100%', height: '180px', borderRadius: '6px', overflow: 'hidden', background: '#f0f4ff' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  placeholder: { width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#f0f4ff', borderRadius: '6px' },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  dots: { position: 'absolute', bottom: '7px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' },
};

const harta: Record<string, React.CSSProperties> = {
  wrap: { position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '340px', border: '1px solid #e0e0e0' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  overlay: { position: 'absolute', inset: 0, zIndex: 1, cursor: 'pointer' },
  btn: {
    display: 'inline-block', marginTop: '0.8rem', background: '#003580', color: '#fff',
    padding: '8px 18px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
  },
};

const prop: Record<string, React.CSSProperties> = {
  card: { display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.8rem', background: '#f8f9ff', border: '1px solid #dde4f5', borderRadius: '8px', padding: '0.7rem 1rem' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: '#003580', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 },
  label: { fontSize: '0.72rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  nume: { fontWeight: 700, color: '#1a1a1a', fontSize: '0.95rem' },
  scor: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' },
  badge: { background: '#003580', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 700 },
  recenzii: { fontSize: '0.8rem', color: '#666' },
};

const apt: Record<string, React.CSSProperties> = {
  infoRow: { display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.2rem', flexWrap: 'wrap' },
  pretBox: { display: 'flex', flexDirection: 'column' },
  pretVal: { fontSize: '2rem', fontWeight: 700, color: '#003580', lineHeight: 1 },
  pretLabel: { fontSize: '0.85rem', color: '#666' },
  details: { display: 'flex', gap: '1.2rem', fontSize: '0.95rem', color: '#444', flexWrap: 'wrap' },
};

const gl: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lightboxImg: { maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' },
  closeBtn: { position: 'fixed', top: '1rem', right: '1.2rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 },
};
