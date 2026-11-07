import { useState, useRef, useEffect } from 'react';
import { useNotificari, type Notificare } from '../context/NotificareContext';

export default function NotificareDropdown() {
  const { notificari, necititeCount, marcheazaCitita, marcheazaToateCitite } = useNotificari();
  const [deschis, setDeschis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Inchide dropdown-ul la click in afara
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDeschis(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const laClickNotificare = (n: Notificare) => {
    if (!n.citita) marcheazaCitita(n.id);
  };

  const formatData = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ro-RO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Butonul clopot */}
      <button
        onClick={() => setDeschis(v => !v)}
        style={styles.bell}
        title="Notificări"
        aria-label="Notificări"
      >
        🔔
        {necititeCount > 0 && (
          <span style={styles.badge}>{necititeCount > 99 ? '99+' : necititeCount}</span>
        )}
      </button>

      {/* Dropdown-ul cu notificari */}
      {deschis && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notificări</span>
            {necititeCount > 0 && (
              <button
                onClick={marcheazaToateCitite}
                style={styles.toateCititeBtn}
              >
                Toate citite
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={styles.lista}>
            {notificari.length === 0 ? (
              <div style={styles.gol}>Nu ai notificări</div>
            ) : (
              notificari.map(n => (
                <div
                  key={n.id}
                  onClick={() => laClickNotificare(n)}
                  style={{
                    ...styles.item,
                    background: n.citita ? '#fff' : '#eef4ff',
                    cursor: n.citita ? 'default' : 'pointer',
                  }}
                >
                  <div style={styles.itemTitlu}>
                    {!n.citita && <span style={styles.punct} />}
                    <strong>{n.titlu}</strong>
                  </div>
                  <div style={styles.itemContinut}>{n.continut}</div>
                  <div style={styles.itemData}>{formatData(n.creatLa)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bell: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.3rem',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '6px',
    lineHeight: 1,
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#e63946',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    lineHeight: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '360px',
    maxHeight: '480px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    background: '#f8f9fa',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#003580',
  },
  toateCititeBtn: {
    background: 'none',
    border: 'none',
    color: '#003580',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
  lista: {
    overflowY: 'auto',
    maxHeight: '420px',
  },
  gol: {
    padding: '24px',
    textAlign: 'center',
    color: '#999',
    fontSize: '0.9rem',
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.15s',
  },
  itemTitlu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    fontSize: '0.9rem',
    color: '#222',
  },
  punct: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#003580',
    flexShrink: 0,
  },
  itemContinut: {
    fontSize: '0.82rem',
    color: '#555',
    lineHeight: 1.4,
    marginBottom: '4px',
  },
  itemData: {
    fontSize: '0.75rem',
    color: '#aaa',
  },
};
