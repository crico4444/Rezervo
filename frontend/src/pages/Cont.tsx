import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChatModal from '../components/ChatModal';
import RatingModal from '../components/RatingModal';
import ProprietarRatingModal from '../components/ProprietarRatingModal';

interface Rezervare {
  id: number;
  numeProprietate: string;
  orasProprietate: string;
  taraProprietate: string;
  numeCamera: string;
  dataCheckIn: string;
  dataCheckOut: string;
  nrPersoane: number;
  pretTotal: number;
  status: 'PENDING' | 'CONFIRMATA' | 'IN_DESFASURARE' | 'ANULATA' | 'FINALIZATA';
  proprietateId: number;
  proprietarId?: number;
  numeProprietar?: string;
  imaginePrincipala?: string;
  imagineCamera?: string;
  tipProprietate?: string;
  stele?: number;
  ratingMediu?: number;
  numarRecenzii?: number;
}

// Configuratia vizuala a badge-ului pentru fiecare status de rezervare
const configStatus: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:        { label: '⏳ În așteptare', bg: '#fff3cd', color: '#856404' },
  CONFIRMATA:     { label: '✅ Confirmată',   bg: '#d4edda', color: '#155724' },
  IN_DESFASURARE: { label: '🏨 Check-in efectuat', bg: '#cce5ff', color: '#004085' },
  ANULATA:        { label: '❌ Anulată',      bg: '#f8d7da', color: '#721c24' },
  FINALIZATA:     { label: '✔ Finalizată',   bg: '#e2e3e5', color: '#383d41' },
};

// Data de azi folosita pentru conditii de anulare si recenzie
const azi = new Date().toISOString().split('T')[0];

export default function Cont() {
  const { user, logout, updateUser, isProprietar, isAdmin } = useAuth();
  const navigheaza = useNavigate();

  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [seIncarcaRez, setSeIncarcaRez] = useState(true);
  const [mesaj, setMesaj] = useState('');
  const [necitite, setNecitite] = useState<Record<number, number>>({});
  const [chatRezervareId, setChatRezervareId] = useState<number | null>(null);
  const [chatTitlu, setChatTitlu] = useState('');
  const [ratingProprietate, setRatingProprietate] = useState<{ id: number; nume: string } | null>(null);
  const [ratingProprietar, setRatingProprietar] = useState<{ id: number; nume: string } | null>(null);
  const [recenzate, setRecenzate] = useState<Set<number>>(new Set());
  const [recenzatiProprietari, setRecenzatiProprietari] = useState<Set<number>>(new Set());
  const [dejaRecenzatNume, setDejaRecenzatNume] = useState<string | null>(null);

  // Stari pentru sectiunea "Editează contul"
  const [editDeschis, setEditDeschis] = useState(false);
  const [formProfil, setFormProfil] = useState({ nume: user?.nume || '', prenume: user?.prenume || '', telefon: '' });
  const [formParola, setFormParola] = useState({ parolaActuala: '', parolaNoua: '', confirmaParola: '' });
  const [seIncarcaProfil, setSeIncarcaProfil] = useState(false);
  const [seIncarcaParola, setSeIncarcaParola] = useState(false);
  const [mesajProfil, setMesajProfil] = useState('');
  const [mesajParola, setMesajParola] = useState('');

  // Stari pentru fluxul "Devino proprietar"
  const [pasProprietar, setPasProprietar] = useState<'idle' | 'asteapta-cod'>('idle');
  const [cod, setCod] = useState('');
  const [seIncarcaProprietar, setSeIncarcaProprietar] = useState(false);
  const [eroareProprietar, setEroareProprietar] = useState('');
  const [mesajProprietar, setMesajProprietar] = useState('');
  // Banner de succes vizibil si dupa ce sectiunea CLIENT dispare din DOM
  const [upgradeSucees, setUpgradeSucees] = useState(false);

  // Stari pentru sectiunea "Sterge contul"
  const [stergereDeschisa, setStergereDeschisa] = useState(false);
  const [parolaStergere, setParolaStergere] = useState('');
  const [eroareStergere, setEroareStergere] = useState('');
  const [seIncarcaStergere, setSeIncarcaStergere] = useState(false);

  // La montare, incarca in paralel rezervarile, mesajele necitite si proprietatile deja recenzate
  useEffect(() => {
    if (!user) { navigheaza('/login'); return; }
    Promise.all([
      api.get('/rezervari/mele'),
      api.get('/mesaje/necitite'),
      api.get('/recenzii/recenzate-de-mine'),
      api.get('/recenzii-proprietari/recenzati-de-mine'),
    ]).then(([r, n, rec, recProp]) => {
      setRezervari(r.data);
      setNecitite(n.data);
      setRecenzate(new Set(rec.data));
      setRecenzatiProprietari(new Set(recProp.data));
    }).finally(() => setSeIncarcaRez(false));
  }, [user]);

  if (!user) return null;

  // Deconecteaza utilizatorul si redirectioneaza la pagina principala
  const laDeconectare = () => { logout(); navigheaza('/'); };

  // Salveaza modificarile de profil (nume, prenume, telefon) si actualizeaza contextul
  const salveazaProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeIncarcaProfil(true);
    setMesajProfil('');
    try {
      const { data } = await api.put('/utilizatori/profil', formProfil);
      updateUser({ email: data.email, nume: data.nume, prenume: data.prenume, rol: data.rol }, data.token);
      setMesajProfil('✅ Datele au fost actualizate.');
    } catch (e: any) {
      setMesajProfil('❌ ' + (e.response?.data?.eroare || 'Eroare la salvare'));
    } finally {
      setSeIncarcaProfil(false);
    }
  };

  // Trimite cererea de schimbare parola
  const schimbaParola = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesajParola('');
    if (formParola.parolaNoua !== formParola.confirmaParola) {
      setMesajParola('❌ Parolele noi nu coincid');
      return;
    }
    if (formParola.parolaNoua.length < 6) {
      setMesajParola('❌ Parola nouă trebuie să aibă cel puțin 6 caractere');
      return;
    }
    setSeIncarcaParola(true);
    try {
      const { data } = await api.put('/utilizatori/parola', {
        parolaActuala: formParola.parolaActuala,
        parolaNoua: formParola.parolaNoua,
      });
      setMesajParola('✅ ' + data.mesaj);
      setFormParola({ parolaActuala: '', parolaNoua: '', confirmaParola: '' });
    } catch (e: any) {
      setMesajParola('❌ ' + (e.response?.data?.eroare || 'Eroare la schimbarea parolei'));
    } finally {
      setSeIncarcaParola(false);
    }
  };

  // Anuleaza o rezervare ca si client si actualizeaza starea locala
  const anuleaza = async (id: number) => {
    if (!confirm('Ești sigur că vrei să anulezi această rezervare?')) return;
    try {
      await api.put(`/rezervari/${id}/anuleaza`);
      setRezervari(prev => prev.map(r => r.id === id ? { ...r, status: 'ANULATA' } : r));
      setMesaj('Rezervarea a fost anulată.');
    } catch (e: any) {
      setMesaj('❌ ' + (e.response?.data?.eroare || 'Eroare la anulare'));
    }
  };

  // Deschide fereastra de chat cu proprietarul pentru rezervarea selectata
  const deschideChat = (r: Rezervare) => {
    setChatRezervareId(r.id);
    setChatTitlu(`Chat cu proprietarul — ${r.numeProprietate}`);
  };

  // Confirma check-in-ul ca si client
  const confirmaCheckIn = async (id: number) => {
    try {
      await api.put(`/rezervari/${id}/confirma-check-in`);
      setRezervari(prev => prev.map(r => r.id === id ? { ...r, status: 'IN_DESFASURARE' } : r));
      setMesaj('✅ Check-in confirmat! Sejur plăcut!');
    } catch (e: any) {
      setMesaj('❌ ' + (e.response?.data?.eroare || 'Eroare la confirmarea check-in'));
    }
  };

  // Returneaza true daca rezervarea poate fi anulata (PENDING sau CONFIRMATA)
  const poateAnula = (r: Rezervare) => r.status === 'PENDING' || r.status === 'CONFIRMATA';

  // Returneaza true daca utilizatorul poate lasa recenzie
  // (rezervare confirmata/finalizata si check-out-ul a trecut)
  const poateRecenza = (r: Rezervare) =>
    (r.status === 'CONFIRMATA' || r.status === 'FINALIZATA') &&
    r.dataCheckOut < azi;

  // Returneaza true daca proprietatea a fost deja recenzata de utilizatorul curent
  const aDejaRecenzat = (r: Rezervare) => recenzate.has(r.proprietateId);

  // Returneaza true daca proprietarul poate fi evaluat si nu a fost deja evaluat
  const poateRecenzaProprietar = (r: Rezervare) =>
    r.proprietarId != null &&
    (r.status === 'CONFIRMATA' || r.status === 'FINALIZATA') &&
    r.dataCheckOut < azi &&
    !recenzatiProprietari.has(r.proprietarId);

  // --- Fluxul "Devino proprietar" ---

  // Pasul 1: solicita trimiterea codului pe email
  const solicitaCod = async () => {
    setSeIncarcaProprietar(true);
    setEroareProprietar('');
    try {
      const { data } = await api.post('/utilizatori/devino-proprietar');
      setMesajProprietar(data.mesaj);
      setPasProprietar('asteapta-cod');
    } catch (e: any) {
      setEroareProprietar(e.response?.data?.eroare || 'Eroare la trimiterea codului');
    } finally {
      setSeIncarcaProprietar(false);
    }
  };

  // Pasul 2: verifica codul si upgrades rolul la PROPRIETAR
  const confirmaCod = async () => {
    if (!cod.trim()) { setEroareProprietar('Introdu codul primit pe email'); return; }
    setSeIncarcaProprietar(true);
    setEroareProprietar('');
    try {
      const { data } = await api.post('/utilizatori/confirma-proprietar', { cod: cod.trim() });
      // Actualizeaza contextul cu noul token si rol PROPRIETAR
      updateUser({ email: data.email, nume: data.nume, prenume: data.prenume, rol: data.rol }, data.token);
      setUpgradeSucees(true);
    } catch (e: any) {
      setEroareProprietar(e.response?.data?.eroare || 'Cod incorect sau expirat');
    } finally {
      setSeIncarcaProprietar(false);
    }
  };

  // Sterge definitiv contul autentificat, dupa confirmarea parolei
  const stergeContul = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Ești absolut sigur? Contul și toate datele asociate (rezervări, mesaje, recenzii) vor fi șterse definitiv.')) return;
    setEroareStergere('');
    setSeIncarcaStergere(true);
    try {
      await api.delete('/utilizatori/mine', { data: { parola: parolaStergere } });
      logout();
      navigheaza('/');
    } catch (e: any) {
      setEroareStergere(e.response?.data?.eroare || 'Eroare la ștergerea contului');
    } finally {
      setSeIncarcaStergere(false);
    }
  };

  const esteProprietarSauAdmin = isProprietar() || isAdmin();

  return (
    <div style={s.wrap}>

      {/* Cardul de profil cu avatarul, numele, emailul si rolul utilizatorului */}
      <div style={s.profileCard}>
        <div style={s.avatar}>{user.nume.charAt(0).toUpperCase()}{user.prenume.charAt(0).toUpperCase()}</div>
        <h1 style={s.name}>{user.nume} {user.prenume}</h1>
        <p style={s.email}>{user.email}</p>
        <span style={{ ...s.rolBadge, background: user.rol === 'ADMIN' ? '#003580' : user.rol === 'PROPRIETAR' ? '#0a7c3e' : '#0071c2' }}>
          {user.rol}
        </span>
      </div>

      {/* Sectiunea de editare cont — expandabila */}
      <div style={ed.wrap}>
        <button
          onClick={() => {
            if (!editDeschis) {
              setFormProfil({ nume: user.nume, prenume: user.prenume, telefon: '' });
              setMesajProfil('');
              setMesajParola('');
            }
            setEditDeschis(v => !v);
          }}
          style={ed.toggle}
        >
          ✏️ Editează contul {editDeschis ? '▲' : '▼'}
        </button>

        {editDeschis && (
          <div style={ed.body}>

            {/* --- Date personale --- */}
            <div style={ed.bloc}>
              <h3 style={ed.blocTitle}>👤 Date personale</h3>
              <form onSubmit={salveazaProfil} style={ed.form}>
                <div style={ed.row}>
                  <div style={ed.field}>
                    <label style={ed.label}>Nume *</label>
                    <input
                      style={ed.input}
                      value={formProfil.nume}
                      onChange={e => setFormProfil(f => ({ ...f, nume: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={ed.field}>
                    <label style={ed.label}>Prenume *</label>
                    <input
                      style={ed.input}
                      value={formProfil.prenume}
                      onChange={e => setFormProfil(f => ({ ...f, prenume: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div style={ed.field}>
                  <label style={ed.label}>Telefon</label>
                  <input
                    style={{ ...ed.input, maxWidth: '220px' }}
                    type="tel"
                    placeholder="ex: 0722 123 456"
                    value={formProfil.telefon}
                    onChange={e => setFormProfil(f => ({ ...f, telefon: e.target.value }))}
                  />
                </div>
                {mesajProfil && (
                  <div style={mesajProfil.startsWith('✅') ? ed.ok : ed.err}>{mesajProfil}</div>
                )}
                <button type="submit" style={ed.btn} disabled={seIncarcaProfil}>
                  {seIncarcaProfil ? 'Se salvează...' : 'Salvează datele'}
                </button>
              </form>
            </div>

            <div style={ed.separator} />

            {/* --- Schimba parola --- */}
            <div style={ed.bloc}>
              <h3 style={ed.blocTitle}>🔒 Schimbă parola</h3>
              <form onSubmit={schimbaParola} style={ed.form}>
                <div style={ed.field}>
                  <label style={ed.label}>Parola actuală *</label>
                  <input
                    style={{ ...ed.input, maxWidth: '280px' }}
                    type="password"
                    value={formParola.parolaActuala}
                    onChange={e => setFormParola(f => ({ ...f, parolaActuala: e.target.value }))}
                    required
                  />
                </div>
                <div style={ed.row}>
                  <div style={ed.field}>
                    <label style={ed.label}>Parolă nouă * (min. 6 caractere)</label>
                    <input
                      style={ed.input}
                      type="password"
                      value={formParola.parolaNoua}
                      onChange={e => setFormParola(f => ({ ...f, parolaNoua: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={ed.field}>
                    <label style={ed.label}>Confirmă parola nouă *</label>
                    <input
                      style={ed.input}
                      type="password"
                      value={formParola.confirmaParola}
                      onChange={e => setFormParola(f => ({ ...f, confirmaParola: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                {mesajParola && (
                  <div style={mesajParola.startsWith('✅') ? ed.ok : ed.err}>{mesajParola}</div>
                )}
                <button type="submit" style={ed.btn} disabled={seIncarcaParola}>
                  {seIncarcaParola ? 'Se schimbă...' : 'Schimbă parola'}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>

      {/* Banner de succes dupa upgrade la PROPRIETAR */}
      {upgradeSucees && (
        <div style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', fontWeight: 500 }}>
          🎉 Felicitări! Contul tău a fost actualizat la rolul de <strong>PROPRIETAR</strong>. Poți acum să îți listezi cazările!
        </div>
      )}

      {/* Grila de navigare rapida — cardurile de proprietar se afiseaza doar pentru PROPRIETAR/ADMIN */}
      <div style={s.grid}>
        {esteProprietarSauAdmin && (
          <Link to="/cazarile-mele" style={s.navCard}>
            <span style={s.navIcon}>🏠</span>
            <strong style={s.navTitle}>Cazările mele</strong>
            <p style={s.navDesc}>Proprietățile tale și rezervările primite</p>
          </Link>
        )}
        {esteProprietarSauAdmin && (
          <Link to="/adauga-cazare" style={s.navCard}>
            <span style={s.navIcon}>➕</span>
            <strong style={s.navTitle}>Listează o cazare</strong>
            <p style={s.navDesc}>Adaugă o proprietate nouă spre aprobare</p>
          </Link>
        )}
        {user.rol === 'ADMIN' && (
          <Link to="/admin" style={{ ...s.navCard, borderColor: '#003580' }}>
            <span style={s.navIcon}>🛠️</span>
            <strong style={s.navTitle}>Panou admin</strong>
            <p style={s.navDesc}>Gestioneaza rezervari si proprietati</p>
          </Link>
        )}
      </div>

      {/* Sectiunea cu rezervarile clientului */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>🗓️ Rezervările mele</h2>

        {/* Mesaj de feedback dupa actiuni (anulare, erori) */}
        {mesaj && (
          <div style={{
            padding: '10px 14px', borderRadius: '6px', border: '1px solid',
            marginBottom: '1rem', fontSize: '0.9rem',
            borderColor: mesaj.startsWith('❌') ? '#f5c6cb' : '#c3e6cb',
            background: mesaj.startsWith('❌') ? '#f8d7da' : '#d4edda',
            color: mesaj.startsWith('❌') ? '#721c24' : '#155724',
          }}>
            {mesaj}
          </div>
        )}

        {seIncarcaRez ? (
          <p style={{ color: '#888' }}>Se încarcă rezervările...</p>
        ) : rezervari.length === 0 ? (
          <div style={s.empty}>
            <p>Nu ai nicio rezervare încă.</p>
            <Link to="/" style={s.exploreBtn}>Explorează cazări →</Link>
          </div>
        ) : (
          <div style={s.list}>
            {rezervari.map(r => {
              const cfg = configStatus[r.status] ?? configStatus.PENDING;
              const mesajeNoi = necitite[r.id] || 0;
              const poza = r.imagineCamera || r.imaginePrincipala || null;
              const TIPURI_CU_STELE = ['HOTEL', 'VILA'];
              const areStele = r.tipProprietate && TIPURI_CU_STELE.includes(r.tipProprietate) && (r.stele ?? 0) > 0;
              const sirStele = areStele ? '★'.repeat(r.stele!) + '☆'.repeat(5 - r.stele!) : null;
              return (
                <div key={r.id} style={s.card}>
                  {/* Layout orizontal: poza stanga, continut dreapta */}
                  <div style={s.cardInner}>

                    {/* Poza anunt */}
                    <Link to={`/proprietati/${r.proprietateId}`} style={s.imgLink}>
                      {poza ? (
                        <img src={poza} alt={r.numeProprietate} style={s.img} />
                      ) : (
                        <div style={s.imgPlaceholder}>🏨</div>
                      )}
                    </Link>

                    {/* Continut */}
                    <div style={s.cardContent}>

                      {/* Header: titlu + badge status */}
                      <div style={s.cardTop}>
                        <div>
                          <Link to={`/proprietati/${r.proprietateId}`} style={s.propNume}>
                            {r.numeProprietate}
                          </Link>
                          <p style={s.loc}>📍 {r.orasProprietate}, {r.taraProprietate}</p>
                          <div style={s.metaRand}>
                            {r.tipProprietate && (
                              <span style={s.tipBadge}>{r.tipProprietate}</span>
                            )}
                            {sirStele && <span style={s.stars}>{sirStele}</span>}
                            {r.ratingMediu != null && (
                              <span style={s.rating}>⭐ {r.ratingMediu.toFixed(1)} ({r.numarRecenzii})</span>
                            )}
                          </div>
                          <p style={s.numeCamera}>🛏️ {r.numeCamera}
                            {r.numeProprietar && <> &nbsp;·&nbsp; 👤 <strong>{r.numeProprietar}</strong></>}
                          </p>
                        </div>
                        <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Detaliile rezervarii */}
                      <div style={s.detalii}>
                        <div style={s.detaliiItem}>
                          <span style={s.detaliiLabel}>Check-in</span>
                          <strong>{r.dataCheckIn}</strong>
                        </div>
                        <div style={s.detaliiItem}>
                          <span style={s.detaliiLabel}>Check-out</span>
                          <strong>{r.dataCheckOut}</strong>
                        </div>
                        <div style={s.detaliiItem}>
                          <span style={s.detaliiLabel}>Persoane</span>
                          <strong>{r.nrPersoane}</strong>
                        </div>
                        <div style={s.detaliiItem}>
                          <span style={s.detaliiLabel}>Total plată</span>
                          <strong style={{ color: '#003580' }}>{r.pretTotal} RON</strong>
                        </div>
                      </div>

                      {/* Butoanele de actiune */}
                      <div style={s.cardActions}>
                        <Link to={`/proprietati/${r.proprietateId}`} style={s.viewBtn}>
                          Vezi proprietatea →
                        </Link>
                        {r.status !== 'ANULATA' && (
                          <button onClick={() => deschideChat(r)} style={s.chatBtn}>
                            💬 Chat cu proprietarul
                            {mesajeNoi > 0 && <span style={s.badge2}>{mesajeNoi}</span>}
                          </button>
                        )}
                        {r.status === 'CONFIRMATA' && r.dataCheckIn <= azi && (
                          <button onClick={() => confirmaCheckIn(r.id)} style={s.checkInBtn}>
                            🏨 Confirmă check-in
                          </button>
                        )}
                        {poateAnula(r) && (
                          <button onClick={() => anuleaza(r.id)} style={s.cancelBtn}>
                            Anulează rezervarea
                          </button>
                        )}
                        {poateRecenza(r) && (
                          <button
                            onClick={() => {
                              if (aDejaRecenzat(r)) setDejaRecenzatNume(r.numeProprietate);
                              else setRatingProprietate({ id: r.proprietateId, nume: r.numeProprietate });
                            }}
                            style={{ ...s.ratingBtn, opacity: aDejaRecenzat(r) ? 0.6 : 1 }}
                          >
                            {aDejaRecenzat(r) ? '✅ Recenzie trimisă' : '⭐ Recenzie cazare'}
                          </button>
                        )}
                        {poateRecenzaProprietar(r) && (
                          <button
                            onClick={() => setRatingProprietar({ id: r.proprietarId!, nume: r.numeProprietar || 'Proprietar' })}
                            style={{ ...s.ratingBtn, background: '#e8f4fd', borderColor: '#0071c2', color: '#003580' }}
                          >
                            👤 Evaluează proprietarul
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sectiunea "Devino proprietar" — vizibila doar pentru CLIENT */}
      {user.rol === 'CLIENT' && (
        <div style={dp.section}>
          <div style={dp.header}>
            <span style={dp.icon}>🏠</span>
            <div>
              <h2 style={dp.title}>Devino proprietar</h2>
              <p style={dp.desc}>
                Listează-ți cazările și gestionează rezervările primite.
                Vei continua să poți face și rezervări ca și client.
              </p>
            </div>
          </div>

          {pasProprietar === 'idle' ? (
            <>
              {eroareProprietar && <div style={dp.eroare}>{eroareProprietar}</div>}
              <button onClick={solicitaCod} style={dp.btn} disabled={seIncarcaProprietar}>
                {seIncarcaProprietar ? 'Se trimite...' : '📧 Trimite cod de verificare pe email'}
              </button>
            </>
          ) : (
            /* pasProprietar === 'asteapta-cod' — utilizatorul asteapta codul pe email */
            <div style={dp.codWrap}>
              {mesajProprietar && <div style={dp.info}>{mesajProprietar}</div>}
              {eroareProprietar && <div style={dp.eroare}>{eroareProprietar}</div>}
              <p style={dp.codHint}>Introdu codul de 6 cifre primit pe email:</p>
              <div style={dp.codRow}>
                <input
                  type="text"
                  maxLength={6}
                  value={cod}
                  onChange={e => setCod(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={dp.codInput}
                />
                <button onClick={confirmaCod} style={dp.btn} disabled={seIncarcaProprietar}>
                  {seIncarcaProprietar ? 'Se verifică...' : 'Confirmă'}
                </button>
              </div>
              <button
                onClick={() => { setPasProprietar('idle'); setCod(''); setEroareProprietar(''); }}
                style={dp.linkBtn}
              >
                ← Înapoi / Retrimite cod
              </button>
            </div>
          )}
        </div>
      )}

      <div style={s.footerActions}>
        <button onClick={laDeconectare} style={s.logoutBtn}>Deconectare</button>
        <button onClick={() => { setStergereDeschisa(v => !v); setEroareStergere(''); setParolaStergere(''); }} style={s.deleteToggleBtn}>
          🗑️ Șterge contul
        </button>
      </div>

      {stergereDeschisa && (
        <div style={dz.wrap}>
          <h3 style={dz.title}>⚠️ Șterge contul definitiv</h3>
          <p style={dz.desc}>
            Această acțiune este ireversibilă. Contul, rezervările, mesajele și recenziile tale vor fi șterse definitiv.
            {esteProprietarSauAdmin && ' Dacă ai proprietăți sau rezervări active, va trebui să le anulezi/ștergi mai întâi.'}
          </p>
          <form onSubmit={stergeContul} style={dz.form}>
            <input
              type="password"
              placeholder="Introdu parola pentru confirmare"
              value={parolaStergere}
              onChange={e => setParolaStergere(e.target.value)}
              style={dz.input}
              required
            />
            {eroareStergere && <div style={ed.err}>{eroareStergere}</div>}
            <button type="submit" style={dz.confirmBtn} disabled={seIncarcaStergere}>
              {seIncarcaStergere ? 'Se șterge...' : 'Șterge definitiv contul'}
            </button>
          </form>
        </div>
      )}

      {/* Modalul de chat, vizibil doar cand o rezervare este selectata */}
      {chatRezervareId !== null && (
        <ChatModal
          rezervareId={chatRezervareId}
          titlu={chatTitlu}
          onClose={() => setChatRezervareId(null)}
          onRead={() => setNecitite(prev => ({ ...prev, [chatRezervareId]: 0 }))}
        />
      )}

      {/* Popup de informare cand utilizatorul incearca sa recenzeze o proprietate deja recenzata */}
      {dejaRecenzatNume !== null && (
        <div style={sp.overlay} onClick={() => setDejaRecenzatNume(null)}>
          <div style={sp.modal} onClick={e => e.stopPropagation()}>
            <div style={sp.icon}>✅</div>
            <h3 style={sp.title}>Recenzie deja trimisă</h3>
            <p style={sp.desc}>Ai lăsat deja o recenzie pentru <strong>{dejaRecenzatNume}</strong>. Poți lăsa o singură recenzie per cazare.</p>
            <button onClick={() => setDejaRecenzatNume(null)} style={sp.btn}>Închide</button>
          </div>
        </div>
      )}

      {/* Modalul de recenzie pentru cazare */}
      {ratingProprietate !== null && (
        <RatingModal
          proprietateId={ratingProprietate.id}
          numeProprietate={ratingProprietate.nume}
          onClose={() => setRatingProprietate(null)}
          onSuccess={() => setRecenzate(prev => new Set(prev).add(ratingProprietate!.id))}
        />
      )}

      {/* Modalul de evaluare pentru proprietar */}
      {ratingProprietar !== null && (
        <ProprietarRatingModal
          proprietarId={ratingProprietar.id}
          numeProprietar={ratingProprietar.nume}
          onClose={() => setRatingProprietar(null)}
          onSuccess={() => setRecenzatiProprietari(prev => new Set(prev).add(ratingProprietar!.id))}
        />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  profileCard: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  avatar: { width: '70px', height: '70px', borderRadius: '50%', background: '#003580', color: '#fff', fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  name: { margin: '0 0 0.3rem', color: '#003580', fontSize: '1.4rem' },
  email: { margin: '0 0 0.7rem', color: '#666', fontSize: '0.95rem' },
  rolBadge: { color: '#fff', padding: '3px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  navCard: { display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.4rem', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  navIcon: { fontSize: '1.8rem' },
  navTitle: { color: '#003580', fontSize: '1rem' },
  navDesc: { margin: 0, color: '#888', fontSize: '0.83rem', lineHeight: 1.4 },
  section: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { margin: '0 0 1rem', color: '#003580', fontSize: '1.2rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#888' },
  exploreBtn: { display: 'inline-block', marginTop: '1rem', background: '#003580', color: '#fff', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' },
  cardInner: { display: 'flex', flexDirection: 'row' },
  imgLink: { flexShrink: 0, width: '180px', display: 'block', textDecoration: 'none' },
  img: { width: '180px', height: '100%', objectFit: 'cover', display: 'block', minHeight: '160px' },
  imgPlaceholder: { width: '180px', minHeight: '160px', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' },
  cardContent: { flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  propNume: { margin: 0, color: '#003580', fontSize: '1.05rem', fontWeight: 700, textDecoration: 'none', display: 'block' },
  loc: { margin: '2px 0 4px', color: '#666', fontSize: '0.85rem' },
  metaRand: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' },
  tipBadge: { background: '#003580', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px' },
  stars: { color: '#febb02', fontSize: '0.82rem' },
  rating: { color: '#555', fontSize: '0.82rem' },
  numeCamera: { margin: 0, color: '#555', fontSize: '0.85rem' },
  badge: { borderRadius: '12px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 },
  detalii: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: '#f8f9fa', borderRadius: '6px', padding: '0.8rem' },
  detaliiItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  detaliiLabel: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' },
  cardActions: { display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' },
  viewBtn: { color: '#0071c2', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' },
  chatBtn: { position: 'relative', background: '#f0f4ff', border: '1px solid #0071c2', color: '#003580', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
  badge2: { background: '#dc3545', color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
  checkInBtn: { background: '#0071c2', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 },
  cancelBtn: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  ratingBtn: { background: '#fff8e1', border: '1px solid #febb02', color: '#856404', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  logoutBtn: { background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '9px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  footerActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' },
  deleteToggleBtn: { background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' },
};

// Stiluri pentru sectiunea "Sterge contul" (danger zone)
const dz: Record<string, React.CSSProperties> = {
  wrap: { background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '1.4rem', marginTop: '1rem' },
  title: { margin: '0 0 0.5rem', color: '#721c24', fontSize: '1rem' },
  desc: { margin: '0 0 1rem', color: '#721c24', fontSize: '0.85rem', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '340px' },
  input: { padding: '9px 12px', border: '1px solid #dc3545', borderRadius: '4px', fontSize: '0.9rem' },
  confirmBtn: { alignSelf: 'flex-start', background: '#dc3545', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
};

// Stiluri pentru sectiunea "Editează contul"
const ed: Record<string, React.CSSProperties> = {
  wrap: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '1.5rem', overflow: 'hidden' },
  toggle: { width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '1rem 1.4rem', fontWeight: 700, fontSize: '0.95rem', color: '#003580', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  body: { padding: '0 1.4rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0' },
  bloc: { paddingTop: '1rem' },
  blocTitle: { margin: '0 0 1rem', color: '#003580', fontSize: '1rem', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.82rem', color: '#555', fontWeight: 600 },
  input: { padding: '8px 10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  btn: { alignSelf: 'flex-start', background: '#003580', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: '5px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  ok: { background: '#d4edda', color: '#155724', padding: '7px 12px', borderRadius: '5px', fontSize: '0.88rem', border: '1px solid #c3e6cb' },
  err: { background: '#f8d7da', color: '#721c24', padding: '7px 12px', borderRadius: '5px', fontSize: '0.88rem', border: '1px solid #f5c6cb' },
  separator: { borderTop: '1px solid #f0f0f0', margin: '1.2rem 0 0' },
};

// Stiluri pentru sectiunea "Devino proprietar"
const dp: Record<string, React.CSSProperties> = {
  section: { background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' },
  header: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.2rem' },
  icon: { fontSize: '2rem', flexShrink: 0 },
  title: { margin: '0 0 0.3rem', color: '#003580', fontSize: '1.1rem' },
  desc: { margin: 0, color: '#555', fontSize: '0.88rem', lineHeight: 1.5 },
  btn: { background: '#003580', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  eroare: { background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', border: '1px solid #f5c6cb', fontSize: '0.88rem' },
  info: { background: '#d4edda', color: '#155724', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.8rem', border: '1px solid #c3e6cb', fontSize: '0.88rem' },
  success: { background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: '8px', border: '1px solid #c3e6cb', fontWeight: 500 },
  codWrap: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  codHint: { margin: 0, color: '#444', fontSize: '0.9rem' },
  codRow: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  codInput: { width: '130px', padding: '10px 14px', border: '2px solid #003580', borderRadius: '6px', fontSize: '1.2rem', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 },
  linkBtn: { background: 'none', border: 'none', color: '#0071c2', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0, textAlign: 'left' },
};

const sp: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  icon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { margin: '0 0 0.8rem', color: '#003580', fontSize: '1.2rem' },
  desc: { color: '#555', lineHeight: 1.6, marginBottom: '1.2rem', fontSize: '0.95rem' },
  btn: { background: '#003580', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' },
};
