import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificareDropdown from './NotificareDropdown';

export default function Navbar() {
  const { user, logout, isAdmin, isProprietar } = useAuth();
  const navigheaza = useNavigate();

  // Deconecteaza utilizatorul si redirectioneaza la pagina principala
  const laDeconectare = () => {
    logout();
    navigheaza('/');
  };

  // Verifica daca utilizatorul poate gestiona cazari (proprietar sau admin)
  const poateListaCazare = user && (isProprietar() || isAdmin());

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Rezervo</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Acasă</Link>
        <Link to="/evenimente" style={styles.link}>Evenimente</Link>
        {user ? (
          <>
            <Link to="/cont" style={styles.link}>Contul meu</Link>
            {poateListaCazare && (
              <Link to="/adauga-cazare" style={styles.listBtn}>+ Listează cazare</Link>
            )}
            {isAdmin() && <Link to="/admin" style={styles.link}>Admin</Link>}
            {isAdmin() && <Link to="/admin/evenimente" style={styles.link}>Evenimente admin</Link>}
            <span style={styles.userInfo}>{user.nume} ({user.rol})</span>
            <NotificareDropdown />
            <button onClick={laDeconectare} style={styles.btn}>Deconectare</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Autentificare</Link>
            <Link to="/register" style={styles.btnLink}>Înregistrare</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: '60px', background: '#003580', color: '#fff',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem' },
  links: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '0.95rem' },
  btnLink: {
    color: '#003580', background: '#febb02', padding: '6px 14px',
    borderRadius: '4px', textDecoration: 'none', fontWeight: 600,
  },
  listBtn: {
    color: '#003580', background: '#febb02', padding: '5px 12px',
    borderRadius: '4px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
  },
  btn: {
    background: 'transparent', border: '1px solid #fff', color: '#fff',
    padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
  },
  userInfo: { fontSize: '0.85rem', opacity: 0.85 },
};
